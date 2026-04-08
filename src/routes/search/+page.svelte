<script>
	import { onMount, untrack } from 'svelte';
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import ItemCard from '$lib/common/ItemCard.svelte';

	let { data } = $props();
	let storeConfig = $derived(data.storeConfig || { searchFilterTags: [] });
	let filterConfig = $derived(
		storeConfig.itemFilterConfig || {
			primaryCategories: [],
			tagGroups: [],
			categoryMappings: [],
			universalFilters: { tagGroupIds: [], subcategoryTags: [], extraTags: [] }
		}
	);
	let universalFilters = $derived(
		filterConfig.universalFilters || { tagGroupIds: [], subcategoryTags: [], extraTags: [] }
	);
	let hasPrimaryCategories = $derived(filterConfig.primaryCategories?.length > 0);

	// Active category state - defaults to 'all' to show all items
	let activeCategory = $state('all');

	// Search query from URL parameter
	let currentSearchParams = $derived(page.url.searchParams);
	let searchQuery = $derived(currentSearchParams.get('q') || '');

	// Local search input for mobile
	let mobileSearchInput = $state('');
	let searchInputElement = $state(undefined);

	// Track if data has been loaded
	let dataLoaded = $state(false);
	/** @type {Record<string, any>} */
	let allCategoriesData = $state({});
	/** @type {Array<{primary: any, variants: any[]}>} */
	let primariesWithVariants = $state([]);

	// Filter state
	let minPrice = $state(0);
	let maxPrice = $state(999999);
	let minRating = $state(0);
	let sortBy = $state('name');
	let showFilters = $state(true);
	let activeTags = $state([]);
	const MOBILE_FILTER_BREAKPOINT = 768;

	// Auto-detect the active primary category from the current activeTags.
	// The navbar already handles navigation (e.g. /search?tags=jewelry),
	// so we just match against primary category tagKeys.
	let matchedPrimaryCat = $derived.by(() => {
		if (!hasPrimaryCategories || activeTags.length === 0) return null;
		return (
			filterConfig.primaryCategories.find((c) =>
				activeTags.some((t) => t.toLowerCase() === c.tagKey?.toLowerCase())
			) ?? null
		);
	});

	let selectedPrimaryMapping = $derived(
		matchedPrimaryCat
			? filterConfig.categoryMappings?.find((m) => m.primaryCategoryId === matchedPrimaryCat.id)
			: null
	);

	// Merge universal + category-specific tag group IDs, deduped
	let activeTagGroups = $derived.by(() => {
		const universalIds = universalFilters.tagGroupIds || [];
		const categoryIds = selectedPrimaryMapping?.tagGroupIds || [];
		const allIds = [...new Set([...universalIds, ...categoryIds])];
		if (allIds.length === 0) return [];
		return (filterConfig.tagGroups || []).filter((g) => allIds.includes(g.id));
	});

	// Merge universal + category-specific subcategory tags
	let allSubcategoryTags = $derived.by(() => {
		const universalSubs = universalFilters.subcategoryTags || [];
		const categorySubs = selectedPrimaryMapping?.subcategoryTags || [];
		return [...new Set([...universalSubs, ...categorySubs])];
	});

	// Merge universal + category-specific extra tags
	let allExtraTags = $derived.by(() => {
		const universalExtra = universalFilters.extraTags || [];
		const categoryExtra = selectedPrimaryMapping?.extraTags || [];
		return [...new Set([...universalExtra, ...categoryExtra])];
	});

	function toggleTag(tag, groupId = null) {
		const lower = tag.toLowerCase();

		if (activeTags.includes(lower)) {
			activeTags = activeTags.filter((t) => t !== lower);
			return;
		}

		// If the tag belongs to a single-select group, deselect other tags from that group
		if (groupId) {
			const group = activeTagGroups.find((g) => g.id === groupId);
			if (group?.selectionMode === 'single') {
				const groupTagSet = new Set((group.tags || []).map((t) => t.toLowerCase()));
				activeTags = [...activeTags.filter((t) => !groupTagSet.has(t)), lower];
				return;
			}
		}

		activeTags = [...activeTags, lower];
	}

	function resetFilters() {
		minPrice = 0;
		maxPrice = 999999;
		minRating = 0;
		activeTags = [];
		sortBy = 'name';
		if (searchQuery) {
			goto(resolve('/search'));
		}
	}

	// Sync tags FROM URL params TO local state (one-way: URL → state).
	// All reads of local state are untracked so that clicking filter buttons
	// (which mutate activeTags) does NOT re-trigger this effect.
	$effect(() => {
		const tagsParam = currentSearchParams.get('tags');

		if (tagsParam !== null) {
			const paramTags = tagsParam
				.split(',')
				.map((t) => t.trim().toLowerCase())
				.filter(Boolean);

			const currentTags = untrack(() => activeTags);
			const tagsChanged =
				paramTags.length !== currentTags.length || !paramTags.every((t) => currentTags.includes(t));

			if (tagsChanged) {
				minPrice = 0;
				maxPrice = 999999;
				minRating = 0;
				sortBy = 'name';
				activeTags = paramTags;
			}
		} else {
			untrack(() => {
				if (activeTags.length > 0) {
					resetFilters();
				}
			});
		}
	});

	// Load data once on mount
	onMount(() => {
		showFilters = window.innerWidth > MOBILE_FILTER_BREAKPOINT;

		const handleResize = () => {
			if (window.innerWidth <= MOBILE_FILTER_BREAKPOINT) {
				showFilters = false;
			}
		};

		window.addEventListener('resize', handleResize);

		// Load all categories data once
		data.allCategoriesPromise
			.then((loadedData) => {
				console.log('Categories data loaded:', loadedData);
				allCategoriesData = loadedData;
				// Build the primaries with variants structure from all items
				primariesWithVariants = buildPrimariesWithVariants(loadedData);
				console.log('primariesWithVariants populated:', primariesWithVariants);
				dataLoaded = true;
			})
			.catch((err) => {
				console.error('Error loading categories:', err);
				dataLoaded = false;
			});

		return () => {
			window.removeEventListener('resize', handleResize);
		};
	});

	// Extract price from Square item
	function getItemPrice(item) {
		try {
			const variation = item.itemData?.variations?.[0];
			const price = variation?.itemVariationData?.priceMoney?.amount || 0;
			return Number(price) / 100;
		} catch {
			return 0;
		}
	}

	// Get item rating from custom attributes
	function getItemRating(item) {
		return item.customAttributeValues?.rating?.numberValue || 0;
	}

	// Get item category/type from Square categories
	function getItemType(item, categories = []) {
		const categoryId = item.itemData?.categoryId;

		// First try to find subcategory match
		if (categoryId && categories.length > 0) {
			const category = categories.find((cat) => cat.id === categoryId);
			if (category?.categoryData?.name) {
				return category.categoryData.name;
			}
		}

		// If no subcategory match, check if item belongs to a primary category
		if (categoryId) {
			// Check which primary category this item belongs to based on where we found it
			for (const [, data] of Object.entries(allCategoriesData)) {
				if (data?.itemIds?.has?.(item.id)) {
					return data.name;
				}
			}
		}

		const customType = item.customAttributeValues?.product_type?.stringValue;
		if (customType) return customType;

		return 'Uncategorized';
	}

	// Check if an item is a primary item (HAS primary attribute set to true)
	function hasPrimaryVariation(item) {
		const customAttributes = item.customAttributeValues || {};
		const primaryAttr = Object.values(customAttributes).find(attr => attr?.name === 'primary');
		const result = primaryAttr?.booleanValue === true;
		if (!result && item.id) {
			console.log(`hasPrimaryVariation(${item.id}):`, result, 'primaryAttr:', primaryAttr);
		}
		return result;
	}

	// Check if an item is a variant (does NOT have primary attribute set to true)
	function hasVariation(item) {
		const customAttributes = item.customAttributeValues || {};
		const primaryAttr = Object.values(customAttributes).find(attr => attr?.name === 'primary');
		const result = primaryAttr?.booleanValue !== true;
		if (result && item.id) {
			console.log(`hasVariation(${item.id}):`, result, 'primaryAttr:', primaryAttr);
		}
		return result;
	}

	// Get the primaryid from an item's custom attributes
	function getPrimaryId(item) {
		const customAttributes = item.customAttributeValues || {};
		const primaryIdAttr = Object.values(customAttributes).find(attr => attr?.name === 'primaryid');
		const id = primaryIdAttr?.stringValue || null;
		if (item.id) {
			console.log(`getPrimaryId(${item.id}):`, id, 'primaryIdAttr:', primaryIdAttr);
		}
		return id;
	}

	// Build a 2D list of primaries with their variants
	function buildPrimariesWithVariants(categoriesData) {
		// Get ALL items (from the 'all' category which contains everything)
		const allItems = categoriesData?.all?.items || [];
		console.log('Total items loaded:', allItems.length);
		console.log('All items:', allItems);

		// Create a map of primary items by ID
		const primaryMap = {};
		allItems.forEach(item => {
			if (hasPrimaryVariation(item)) {
				primaryMap[item.id] = item;
			}
		});
		console.log('Primary items found:', Object.keys(primaryMap).length);
		console.log('Primary Map:', primaryMap);

		// For each variant item, group it with its primary using the variant's primaryid
		const groupedByPrimary = {};
		allItems.forEach(item => {
			if (hasVariation(item)) {
				const primaryId = getPrimaryId(item);
				console.log(`Variant item: ${item.id}, primaryid: ${primaryId}`);
				if (primaryId && primaryMap[primaryId]) {
					if (!groupedByPrimary[primaryId]) {
						groupedByPrimary[primaryId] = {
							primary: primaryMap[primaryId],
							variants: []
						};
					}
					groupedByPrimary[primaryId].variants.push(item);
					console.log(`Added variant ${item.id} to primary ${primaryId}`);
				} else {
					console.log(`No matching primary found for variant ${item.id} with primaryid ${primaryId}`);
				}
			}
		});

		// Convert to array and return
		const result = Object.values(groupedByPrimary);
		console.log('Final grouped result:', result);
		console.log('Total primary-variant groups:', result.length);
		return result;
	}

	// Resolve an item's category names from Square category IDs
	function getItemCategoryNames(item) {
		const itemCategoryIds = item.itemData?.categories?.map((c) => c.id) || [];
		if (item.itemData?.categoryId && !itemCategoryIds.includes(item.itemData.categoryId)) {
			itemCategoryIds.push(item.itemData.categoryId);
		}
		const names = [];
		itemCategoryIds.forEach((id) => {
			for (const [, data] of Object.entries(allCategoriesData)) {
				if (data.categoryId === id) {
					names.push(data.name.toLowerCase());
				}
				if (data.subcategories) {
					const subcat = data.subcategories.find((sc) => sc.id === id);
					if (subcat?.categoryData?.name) {
						names.push(subcat.categoryData.name.toLowerCase());
					}
				}
			}
		});
		return names;
	}

	// Filter items based on current filter state
	function filterItems(items) {
		if (!items || items.length === 0) return [];

		// Pre-compute: partition activeTags into per-group buckets and loose tags.
		// Groups are ANDed together; within a group, mode decides AND vs OR.
		const groupBuckets = []; // { mode, tags: [active tags in this group] }
		const looseTags = [];
		const groupTagSets = activeTagGroups.map((g) => ({
			id: g.id,
			mode: g.mode || 'or',
			tagSet: new Set((g.tags || []).map((t) => t.toLowerCase()))
		}));

		for (const tag of activeTags) {
			const lower = tag.toLowerCase();
			const owningGroup = groupTagSets.find((g) => g.tagSet.has(lower));
			if (owningGroup) {
				let bucket = groupBuckets.find((b) => b.id === owningGroup.id);
				if (!bucket) {
					bucket = { id: owningGroup.id, mode: owningGroup.mode, tags: [] };
					groupBuckets.push(bucket);
				}
				bucket.tags.push(lower);
			} else {
				looseTags.push(lower);
			}
		}

		let filtered = items.filter((item) => {
			if (item.type !== 'ITEM') return false;

			const price = getItemPrice(item);
			const rating = getItemRating(item);

			if (searchQuery) {
				const query = searchQuery.toLowerCase();
				const name = (item.itemData?.name || '').toLowerCase();
				const description = (item.itemData?.description || '').toLowerCase();
				if (!name.includes(query) && !description.includes(query)) {
					return false;
				}
			}

			if (price < minPrice || price > maxPrice) return false;
			if (rating < minRating) return false;

			if (activeTags.length > 0) {
				const itemNames = getItemCategoryNames(item);

				// Loose tags (primary category, subcategory, extra): OR logic
				if (looseTags.length > 0) {
					if (!looseTags.some((t) => itemNames.includes(t))) return false;
				}

				// Per-group filtering – all groups must pass
				for (const bucket of groupBuckets) {
					if (bucket.mode === 'and') {
						if (!bucket.tags.every((t) => itemNames.includes(t))) return false;
					} else {
						if (!bucket.tags.some((t) => itemNames.includes(t))) return false;
					}
				}
			}

			// Only show primary items
			if (!hasPrimaryVariation(item)) {
				return false;
			}

			return true;
		});

		// Sort items
		filtered.sort((a, b) => {
			switch (sortBy) {
				case 'name':
					return (a.itemData?.name || '').localeCompare(b.itemData?.name || '');
				case 'price-low':
					return getItemPrice(a) - getItemPrice(b);
				case 'price-high':
					return getItemPrice(b) - getItemPrice(a);
				case 'rating':
					return getItemRating(b) - getItemRating(a);
				default:
					return 0;
			}
		});

		return filtered;
	}

	function formatPrice(price) {
		return `$${price.toFixed(2)}`;
	}

	// Handle mobile search submission
	function handleMobileSearch() {
		if (mobileSearchInput.trim()) {
			goto(resolve(`/search?q=${encodeURIComponent(mobileSearchInput.trim())}`));
		}
	}

	// Handle Enter key in mobile search input
	function handleSearchKeypress(e) {
		if (e.key === 'Enter') {
			handleMobileSearch();
		}
	}
</script>

<div class="search-page">
	{#if !dataLoaded}
		<!-- Loading state - shown immediately on initial page load -->
		<div class="page-header">
			<h1>Loading Collection...</h1>
			<p class="subtitle">Please wait while we load our products</p>
		</div>

		<div class="loading-container">
			<div class="loading-spinner">
				<div class="spinner"></div>
				<p>Loading products...</p>
			</div>
		</div>
	{:else if activeCategory === 'all' || allCategoriesData[activeCategory]}
		{@const currentCategoryData =
			activeCategory === 'all'
				? {
						name: 'All Products',
						items: Object.values(allCategoriesData).flatMap((cat) => cat.items || []),
						subcategories: Object.values(allCategoriesData).flatMap(
							(cat) => cat.subcategories || []
						),
						success: true
					}
				: allCategoriesData[activeCategory]}
		<div class="page-header">
			{#if searchQuery}
				<div class="search-header">
					<div>
						<h1>Search Results for "{searchQuery}"</h1>
						<p class="subtitle">
							{#if activeCategory === 'all'}
								Showing results from all categories
							{:else}
								Showing results in {currentCategoryData.name} Collection
							{/if}
						</p>
					</div>
					<button class="clear-search" onclick={() => goto(resolve('/search#all'))}>
						Clear Search
					</button>
				</div>
			{:else}
				<h1>{currentCategoryData.name}</h1>
				<p class="subtitle">
					{#if activeCategory === 'all'}
						Browse our entire collection
					{:else}
						Browse our selection of {currentCategoryData.name.toLowerCase()}
					{/if}
				</p>
			{/if}
		</div>

		<!-- Mobile Search Bar -->
		<div class="mobile-search-bar">
			<input
				bind:this={searchInputElement}
				bind:value={mobileSearchInput}
				type="search"
				placeholder="Search products..."
				onkeypress={handleSearchKeypress}
				class="mobile-search-input"
			/>
			<button class="mobile-search-btn" onclick={handleMobileSearch} aria-label="Search">
				<i class="fas fa-search"></i>
			</button>
		</div>

		<div class="search-container">
			<!-- Sidebar Filters -->
			<aside class="filters-sidebar" class:collapsed={!showFilters}>
				<div class="filters-header">
					<h2>Filters</h2>
					<button
						class="toggle-filters"
						aria-label={showFilters ? 'Collapse filters' : 'Expand filters'}
						onclick={() => (showFilters = !showFilters)}
					>
						{showFilters ? '←' : '→'}
					</button>
				</div>

				{#if showFilters}
					{#if allSubcategoryTags.length > 0}
						<div class="filter-section">
							<h3>Subcategory</h3>
							<div class="type-filters tags-container">
								{#each allSubcategoryTags as tag (tag)}
									<button
										class="type-button tag-button"
										class:active={activeTags.includes(tag)}
										onclick={() => toggleTag(tag)}
									>
										{tag}
									</button>
								{/each}
							</div>
						</div>
					{/if}

					{#if activeTagGroups.length > 0}
						{#each activeTagGroups as group (group.id)}
							<div class="filter-section">
								<h3>{group.label}</h3>
								<div class="type-filters tags-container">
									{#each group.tags as tag (tag)}
										<button
											class="type-button tag-button"
											class:active={activeTags.includes(tag)}
											onclick={() => toggleTag(tag, group.id)}
										>
											{tag}
										</button>
									{/each}
								</div>
							</div>
						{/each}
					{/if}

					{#if allExtraTags.length > 0}
						<div class="filter-section">
							<h3>More Filters</h3>
							<div class="type-filters tags-container">
								{#each allExtraTags as tag (tag)}
									<button
										class="type-button tag-button"
										class:active={activeTags.includes(tag)}
										onclick={() => toggleTag(tag)}
									>
										{tag}
									</button>
								{/each}
							</div>
						</div>
					{/if}

					{#if !matchedPrimaryCat && storeConfig.searchFilterTags && storeConfig.searchFilterTags.length > 0}
						<div class="filter-section">
							<h3>Tags</h3>
							<div class="type-filters tags-container">
								{#each storeConfig.searchFilterTags as tag (tag)}
									<button
										class="type-button tag-button"
										class:active={activeTags.includes(tag)}
										onclick={() => toggleTag(tag)}
									>
										{tag}
									</button>
								{/each}
							</div>
						</div>
					{/if}

					<div class="filter-section">
						<h3>Price Range</h3>
						<div class="price-inputs">
							<div class="input-group">
								<label for="min-price">Min</label>
								<input id="min-price" type="number" bind:value={minPrice} min="0" step="10" />
							</div>
							<span class="range-separator">-</span>
							<div class="input-group">
								<label for="max-price">Max</label>
								<input id="max-price" type="number" bind:value={maxPrice} min="0" step="10" />
							</div>
						</div>
						<input
							type="range"
							bind:value={maxPrice}
							min="0"
							max="999999"
							step="10"
							class="price-slider"
						/>
					</div>

					<div class="filter-section">
						<h3>Minimum Rating</h3>
						<div class="rating-filter">
							{#each [0, 1, 2, 3, 4, 5] as rating (rating)}
								<button
									class="rating-button"
									class:active={minRating === rating}
									onclick={() => (minRating = rating)}
								>
									{rating}★{rating > 0 ? '+' : ''}
								</button>
							{/each}
						</div>
					</div>

					<div class="filter-section">
						<h3>Sort By</h3>
						<select bind:value={sortBy} class="sort-select">
							<option value="name">Name</option>
							<option value="price-low">Price: Low to High</option>
							<option value="price-high">Price: High to Low</option>
							<option value="rating">Highest Rated</option>
						</select>
					</div>

					<button class="reset-button" onclick={resetFilters}> Reset All Filters </button>
				{/if}
			</aside>

			<!-- Main Content -->
			<main class="search-content">
				{#key activeCategory + searchQuery}
					{@const itemsToFilter = searchQuery
						? Object.values(allCategoriesData).flatMap((cat) => cat.items || [])
						: currentCategoryData.items}
					{@const filtered = filterItems(itemsToFilter)}

					<div class="results-header">
						<p class="results-count">
							{filtered.length}
							{filtered.length === 1 ? 'item' : 'items'} found
						</p>

						<button class="mobile-filter-toggle" onclick={() => (showFilters = !showFilters)}>
							<span>🔍</span> Filters
						</button>
					</div>

					{#if !currentCategoryData.success}
						<div class="error-message">
							<p>⚠️ Unable to load items</p>
							<p class="error-detail">{currentCategoryData.error || 'Please try again later'}</p>
						</div>
					{:else if filtered.length === 0}
						<div class="no-results">
							{#if searchQuery}
								<p>No results found for "{searchQuery}"</p>
								<p class="no-results-help">Try adjusting your search or browse our categories</p>
								<button
									onclick={() => {
										if (activeCategory === 'jewelry') {
											goto(resolve('/search#jewelry'));
											return;
										}
										if (activeCategory === 'armor') {
											goto(resolve('/search#armor'));
											return;
										}
										if (activeCategory === 'laser') {
											goto(resolve('/search#laser'));
											return;
										}
										if (activeCategory === 'more') {
											goto(resolve('/search#more'));
											return;
										}
										goto(resolve('/search#all'));
									}}>Clear Search</button
								>
							{:else}
								<p>No items match your filters</p>
								<button onclick={resetFilters}>Clear Filters</button>
							{/if}
						</div>
					{:else}
						<div class="product-grid">
							{#each filtered as item (item.id)}
								{@const itemData = item.itemData || {}}
								{@const itemPrice = getItemPrice(item)}
								{@const itemRating = getItemRating(item)}
								{@const itemType = getItemType(item, currentCategoryData.subcategories)}

								<a href={resolve(`/item/${item.id}`)} class="product-card-link">
									<ItemCard 
										{item} 
										{itemData} 
										{itemPrice} 
										{itemRating} 
										{itemType} 
										{formatPrice}
									/>
								</a>
							{/each}
						</div>
					{/if}
				{/key}
			</main>
		</div>
	{:else}
		<!-- Error state -->
		<div class="error-message">
			<p>⚠️ Category not found</p>
			<p class="error-detail">The requested category could not be loaded.</p>
		</div>
	{/if}
</div>

<style lang="scss">
	@use 'sass:color';
	@use '../../lib/theme-vars.scss' as *;

	.search-page {
		min-height: 100vh;
		padding: clamp(0.75rem, 2.5vw, $spacing-xl);
	}

	.page-header {
		max-width: $desktop-breakpoint;
		margin: 0 auto $spacing-2xl;
		text-align: center;

		h1 {
			color: $accent-primary;
			font-size: 3rem;
			margin: 0 0 $spacing-md;
			text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
		}

		.subtitle {
			color: $text-muted;
			font-size: 1.1rem;
			margin: 0;
		}

		.search-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			gap: $spacing-lg;

			> div {
				flex: 1;
				text-align: left;
			}

			.clear-search {
				background: $accent-primary;
				color: white;
				border: none;
				padding: $spacing-sm $spacing-lg;
				border-radius: $radius-sm;
				cursor: pointer;
				font-size: 0.95rem;
				font-weight: 500;
				white-space: nowrap;
				transition: all $transition-fast ease;

				&:hover {
					transform: translateY(-2px);
					box-shadow: $shadow-md;
				}

				&:active {
					transform: translateY(0);
				}
			}
		}
	}

	/* Mobile Search Bar */
	.mobile-search-bar {
		display: none;
		max-width: $desktop-breakpoint;
		margin: 0 auto $spacing-lg;
		flex-direction: row;
		gap: $spacing-md;

		@media (max-width: $tablet-breakpoint) {
			display: flex;
		}

		.mobile-search-input {
			flex: 1;
			background: $bg-secondary;
			border: 1px solid $border-secondary;
			color: $text-secondary;
			padding: $spacing-md $spacing-lg;
			border-radius: $radius-lg;
			outline: none;
			font-size: 1rem;
			transition: all $transition-fast;

			&:focus {
				border-color: $accent-primary;
				box-shadow: 0 0 0 3px rgba(167, 139, 250, 0.1);
			}

			&::placeholder {
				color: $text-muted;
			}
		}

		.mobile-search-btn {
			background: $accent-primary;
			border: none;
			color: white;
			padding: $spacing-md $spacing-lg;
			border-radius: $radius-lg;
			cursor: pointer;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 1.1rem;
			transition: all $transition-fast;
			white-space: nowrap;

			&:hover {
				background: color.adjust($accent-primary, $lightness: 10%);
				transform: translateY(-2px);
				box-shadow: $shadow-md;
			}

			&:active {
				transform: translateY(0);
			}
		}
	}

	.search-container {
		display: flex;
		gap: $spacing-xl;
		max-width: $desktop-breakpoint;
		margin: 0 auto;
		min-width: 0;
	}

	/* Filters Sidebar */
	.filters-sidebar {
		flex-shrink: 0;
		width: 280px;
		max-width: 100%;
		background: $bg-panel;
		border: 1px solid $border-secondary;
		border-radius: $radius-lg;
		padding: $spacing-lg;
		height: fit-content;
		position: sticky;
		top: $spacing-xl;
		backdrop-filter: blur(10px);
		transition: all $transition-normal;

		&.collapsed {
			width: 60px;
			padding: $spacing-md;

			.filters-header h2 {
				display: none;
			}
		}

		.filters-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: $spacing-lg;

			h2 {
				color: $text-primary;
				font-size: 1.5rem;
				margin: 0;
			}

			.toggle-filters {
				background: transparent;
				border: 1px solid $border-secondary;
				color: $text-secondary;
				padding: $spacing-xs $spacing-sm;
				border-radius: $radius-sm;
				cursor: pointer;
				transition: all $transition-fast;

				&:hover {
					border-color: $accent-primary;
					color: $accent-primary;
				}
			}
		}
	}

	.filter-section {
		margin-bottom: $spacing-xl;

		h3 {
			color: $text-secondary;
			font-size: 1rem;
			margin: 0 0 $spacing-md;
			font-weight: 600;
		}
	}

	.type-filters {
		display: flex;
		flex-direction: column;
		gap: $spacing-xs;
	}

	.type-button {
		background: transparent;
		border: 1px solid $border-secondary;
		color: $text-muted;
		padding: $spacing-sm $spacing-md;
		border-radius: $radius-sm;
		cursor: pointer;
		text-align: left;
		transition: all $transition-fast;
		font-size: 0.9rem;

		&:hover {
			border-color: $accent-primary;
			color: $text-secondary;
		}

		&.active {
			background: $accent-primary;
			border-color: $accent-primary;
			color: white;
			font-weight: 600;
		}
	}

	.price-inputs {
		display: flex;
		align-items: flex-end;
		gap: $spacing-sm;
		margin-bottom: $spacing-sm;
		max-width: 100%;

		.input-group {
			flex: 1;
			display: flex;
			flex-direction: column;
			gap: $spacing-xs;

			label {
				color: $text-muted-2;
				font-size: 0.85rem;
			}

			input[type='number'] {
				background: $bg-secondary;
				border: 1px solid $border-secondary;
				color: $text-secondary;
				padding: $spacing-sm;
				border-radius: $radius-sm;
				outline: none;
				width: 100%;
				min-width: 0;

				&:focus {
					border-color: $accent-primary;
				}
			}
		}

		.range-separator {
			color: $text-muted-2;
			padding-bottom: $spacing-sm;
		}
	}

	.price-slider {
		width: 100%;
		height: 6px;
		background: $bg-secondary;
		border-radius: $radius-sm;
		outline: none;
		appearance: none;
		-webkit-appearance: none;

		&::-webkit-slider-thumb {
			-webkit-appearance: none;
			appearance: none;
			width: 18px;
			height: 18px;
			background: $accent-primary;
			border-radius: 50%;
			cursor: pointer;
		}

		&::-moz-range-thumb {
			width: 18px;
			height: 18px;
			background: $accent-primary;
			border-radius: 50%;
			cursor: pointer;
			border: none;
		}
	}

	.rating-filter {
		display: flex;
		flex-wrap: wrap;
		gap: $spacing-xs;
	}

	.rating-button {
		background: transparent;
		border: 1px solid $border-secondary;
		color: $text-muted;
		padding: $spacing-xs $spacing-sm;
		border-radius: $radius-sm;
		cursor: pointer;
		transition: all $transition-fast;
		font-size: 0.9rem;

		&:hover {
			border-color: $accent-primary;
			color: $text-secondary;
		}

		&.active {
			background: $accent-primary;
			border-color: $accent-primary;
			color: white;
		}
	}

	.sort-select {
		width: 100%;
		background: $bg-secondary;
		border: 1px solid $border-secondary;
		color: $text-secondary;
		padding: $spacing-sm;
		border-radius: $radius-sm;
		outline: none;
		cursor: pointer;

		&:focus {
			border-color: $accent-primary;
		}
	}

	.reset-button {
		width: 100%;
		background: transparent;
		border: 1px solid $border-accent;
		color: $text-muted;
		padding: $spacing-sm;
		border-radius: $radius-sm;
		cursor: pointer;
		transition: all $transition-fast;
		font-weight: 600;

		&:hover {
			border-color: $accent-primary;
			color: $accent-primary;
			background: rgba(167, 139, 250, 0.1);
		}
	}

	/* Main Content */
	.search-content {
		flex: 1;
		min-width: 0;
	}

	.results-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: $spacing-lg;

		.results-count {
			color: $text-muted;
			font-size: 1rem;
			margin: 0;
		}

		.mobile-filter-toggle {
			display: none;
			background: $accent-primary;
			border: none;
			color: white;
			padding: $spacing-sm $spacing-md;
			border-radius: $radius-sm;
			cursor: pointer;
			font-weight: 600;
			gap: $spacing-xs;
			align-items: center;

			@media (max-width: $tablet-breakpoint) {
				display: flex;
			}
		}
	}

	.product-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
		gap: $spacing-lg;
	}

	.product-card-link {
		text-decoration: none;
		color: inherit;
		display: flex;
		height: 100%;
		position: relative;
		z-index: 1;
		width: -moz-available;
		width: -webkit-fill-available;
	}

	/* Loading State */
	.loading-container {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 400px;
		padding: $spacing-3xl;
	}

	.loading-spinner {
		text-align: center;

		.spinner {
			width: 60px;
			height: 60px;
			margin: 0 auto $spacing-lg;
			border: 4px solid $border-secondary;
			border-top-color: $accent-primary;
			border-radius: 50%;
			animation: spin 1s linear infinite;
		}

		p {
			color: $text-secondary;
			font-size: 1.1rem;
			margin: 0;
		}
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}

	.error-message,
	.no-results {
		text-align: center;
		padding: $spacing-3xl;
		background: $bg-panel;
		border: 1px solid $border-secondary;
		border-radius: $radius-lg;

		p {
			color: $text-secondary;
			font-size: 1.1rem;
			margin: $spacing-md 0;
		}
	}

	.error-message {
		.error-detail {
			color: $text-muted-2;
			font-size: 0.9rem;
		}
	}

	.no-results {
		.no-results-help {
			color: $text-muted;
			font-size: 0.95rem;
			margin: $spacing-xs 0 0;
		}

		button {
			background: $accent-primary;
			border: none;
			color: white;
			padding: $spacing-sm $spacing-lg;
			border-radius: $radius-sm;
			cursor: pointer;
			font-weight: 600;
			margin-top: $spacing-md;

			&:hover {
				background: $accent-secondary;
			}
		}
	}

	/* Responsive Design */
	@media (max-width: $tablet-breakpoint) {
		.search-page {
			padding: $spacing-md;
		}

		.page-header h1 {
			font-size: 2rem;
		}

		.search-container {
			flex-direction: column;
			gap: $spacing-md;
		}

		.filters-sidebar {
			position: static;
			width: auto;

			&.collapsed {
				display: none;
			}
		}

		.price-inputs {
			align-items: stretch;
		}

		.product-grid {
			grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
			gap: $spacing-md;
		}
	}

	@media (max-width: $mobile-breakpoint) {
		.product-grid {
			grid-template-columns: 1fr;
		}
	}
</style>