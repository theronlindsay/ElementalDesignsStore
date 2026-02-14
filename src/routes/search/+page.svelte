<script>

	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import ItemCard from '$lib/common/ItemCard.svelte';
	
	let { data } = $props();
	
	// Active category state - defaults to 'all' to show all items
	let activeCategory = $state('all');
	
	// Search query from URL parameter
	let searchQuery = $derived($page.url.searchParams.get('q') || '');
	
	// Local search input for mobile
	let mobileSearchInput = $state('');
	let searchInputElement = $state(undefined);
	
	// Track if data has been loaded
	let dataLoaded = $state(false);
	let allCategoriesData = $state({});
	
	// Filter state
	let selectedType = $state('All');
	let minPrice = $state(0);
	let maxPrice = $state(999999);
	let minRating = $state(0);
	let sortBy = $state('name');
	let showFilters = $state(true);
	
	// Available categories
	const categories = [
		{ name: 'Jewelry', slug: 'jewelry', icon: '💎' },
		{ name: 'Armor', slug: 'armor', icon: '🛡️' },
		{ name: 'Laser Cut Items', slug: 'laser', icon: '✨' },
		{ name: 'Other Products', slug: 'more', icon: '📦' }
	];
	
	// Get all subcategories across all loaded categories
	let allSubcategories = $derived.by(() => {
		if (!dataLoaded) return [];
		
		const subcats = [];
		const seenNames = new Set();
		
		// First add main category names
		Object.entries(allCategoriesData).forEach(([slug, data]) => {
			const mainCategory = categories.find(c => c.slug === slug);
			if (mainCategory && data?.name && !seenNames.has(data.name)) {
				seenNames.add(data.name);
				subcats.push({ name: data.name, categorySlug: slug });
			}
		});
		
		// Then add all unique subcategories from all loaded categories
		Object.entries(allCategoriesData).forEach(([slug, data]) => {
			if (data?.subcategories) {
				data.subcategories.forEach((subcat) => {
					const name = subcat.categoryData?.name;
					if (name && !seenNames.has(name)) {
						seenNames.add(name);
						subcats.push({ name, categorySlug: slug });
					}
				});
			}
		});
		
		return subcats.sort((a, b) => a.name.localeCompare(b.name));
	});
	
	// Load data once on mount
	onMount(() => {
		// Set initial category from hash
		const updateCategoryFromHash = () => {
			const hash = window.location.hash.slice(1); // Remove the #
			if (hash && categories.some(cat => cat.slug === hash)) {
				activeCategory = hash;
				resetFilters();
			} else if (!hash) {
				activeCategory = 'all'; // Default to all if no hash
				resetFilters();
			}
		};
		
		// Set initial category
		updateCategoryFromHash();
		
		// Listen for hash changes (when user clicks navbar links)
		const handleHashChange = () => {
			updateCategoryFromHash();
		};
		
		window.addEventListener('hashchange', handleHashChange);
		
		// Load all categories data once
		data.allCategoriesPromise.then(loadedData => {
			allCategoriesData = loadedData;
			dataLoaded = true;
		}).catch(err => {
			console.error('Error loading categories:', err);
			dataLoaded = false;
		});
		
		return () => {
			window.removeEventListener('hashchange', handleHashChange);
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
			for (const [slug, data] of Object.entries(allCategoriesData)) {
				if (data?.itemIds?.has?.(item.id)) {
					return data.name;
				}
			}
		}
		
		const customType = item.customAttributeValues?.product_type?.stringValue;
		if (customType) return customType;
		
		return 'Uncategorized';
	}
	
	// Filter items based on current filter state
	function filterItems(items, categories = []) {
		if (!items || items.length === 0) return [];
		
		let filtered = items.filter((item) => {
			if (item.type !== 'ITEM') return false;
			
			const price = getItemPrice(item);
			const rating = getItemRating(item);
			const type = getItemType(item, categories);
			
			// Apply search query filter if present
			if (searchQuery) {
				const query = searchQuery.toLowerCase();
				const name = (item.itemData?.name || '').toLowerCase();
				const description = (item.itemData?.description || '').toLowerCase();
				
				if (!name.includes(query) && !description.includes(query)) {
					return false;
				}
			}
			
			if (selectedType !== 'All' && type !== selectedType) return false;
			if (price < minPrice || price > maxPrice) return false;
			if (rating < minRating) return false;
			
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
	
	function resetFilters() {
		selectedType = 'All';
		minPrice = 0;
		maxPrice = 999999;
		minRating = 0;
		sortBy = 'name';
	}
	
	// Handle mobile search submission
	function handleMobileSearch() {
		if (mobileSearchInput.trim()) {
			goto(`/search?q=${encodeURIComponent(mobileSearchInput.trim())}`);
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
		{@const currentCategoryData = activeCategory === 'all' 
			? { 
				name: 'All Products',
				items: Object.values(allCategoriesData).flatMap((cat) => cat.items || []),
				subcategories: Object.values(allCategoriesData).flatMap((cat) => cat.subcategories || []),
				success: true
			}
			: allCategoriesData[activeCategory]
		}
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
					<button class="clear-search" onclick={() => goto('/search#all')}>
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
						<button class="toggle-filters" onclick={() => showFilters = !showFilters}>
							{showFilters ? '←' : '→'}
						</button>
					</div>
					
					{#if showFilters}
						{@const categoryNames = searchQuery 
							? allSubcategories.map(s => s.name)
							: (currentCategoryData.subcategories || []).map((cat) => cat.categoryData?.name).filter(Boolean)
						}
						{@const productTypes = ['All', ...categoryNames]}
						<div class="filter-section">
							<h3>Type</h3>
							<div class="type-filters">
								{#each productTypes as type}
									<button 
										class="type-button"
										class:active={selectedType === type}
										onclick={() => selectedType = type}
									>
										{type}
									</button>
								{/each}
							</div>
						</div>
						
						<div class="filter-section">
							<h3>Price Range</h3>
							<div class="price-inputs">
								<div class="input-group">
									<label for="min-price">Min</label>
									<input 
										id="min-price"
										type="number" 
										bind:value={minPrice} 
										min="0" 
										step="10"
									/>
								</div>
								<span class="range-separator">-</span>
								<div class="input-group">
									<label for="max-price">Max</label>
									<input 
										id="max-price"
										type="number" 
										bind:value={maxPrice} 
										min="0" 
										step="10"
									/>
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
								{#each [0, 1, 2, 3, 4, 5] as rating}
									<button 
										class="rating-button"
										class:active={minRating === rating}
										onclick={() => minRating = rating}
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
						
						<button class="reset-button" onclick={resetFilters}>
							Reset All Filters
						</button>
					{/if}
				</aside>
				
				<!-- Main Content -->
				<main class="search-content">
					{#key activeCategory + searchQuery}
						{@const itemsToFilter = searchQuery 
							? Object.values(allCategoriesData).flatMap((cat) => cat.items || [])
							: currentCategoryData.items
						}
						{@const subcatsToUse = searchQuery
							? Object.values(allCategoriesData).flatMap((cat) => cat.subcategories || [])
							: currentCategoryData.subcategories
						}
						{@const filtered = filterItems(itemsToFilter, subcatsToUse)}
						
						<div class="results-header">
							<p class="results-count">
								{filtered.length} {filtered.length === 1 ? 'item' : 'items'} found
							</p>
							
							<button class="mobile-filter-toggle" onclick={() => showFilters = !showFilters}>
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
								<button onclick={() => goto('/search#' + activeCategory)}>Clear Search</button>
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
								
								<a href="/item/{item.id}" class="product-card-link">
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
	
    @import '$lib/app.scss';
	
	.search-page {
		min-height: 100vh;
		padding: $spacing-xl;
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
				background: lighten($accent-primary, 10%);
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
	}
	
	/* Filters Sidebar */
	.filters-sidebar {
		flex-shrink: 0;
		width: 280px;
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
		max-width: fit-content;
		
		.input-group {
			flex: 1;
			display: flex;
			flex-direction: column;
			gap: $spacing-xs;
			
			label {
				color: $text-muted-2;
				font-size: 0.85rem;
			}
			
			input[type="number"] {
				background: $bg-secondary;
				border: 1px solid $border-secondary;
				color: $text-secondary;
				padding: $spacing-sm;
				border-radius: $radius-sm;
				outline: none;
				max-width: fit-content;
				width: 7em;
				
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
		width: -webkit-fill-available
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
	
	.error-message, .no-results {
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
		}
		
		.filters-sidebar {
			position: static;
			width: 100%;
			
			&.collapsed {
				display: none;
			}
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
		
		.card-footer {
			flex-direction: column;
			align-items: stretch;
		}
		
		.add-to-cart-btn {
			width: 100%;
		}
	}
</style>
