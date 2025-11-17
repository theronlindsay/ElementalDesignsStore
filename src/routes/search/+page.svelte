<script lang="ts">
	import type { PageData } from './$types';
	import { cart } from '$lib/cart/cartStore';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	
	let { data }: { data: PageData } = $props();
	
	// Active category state - defaults to 'jewelry'
	let activeCategory = $state<string>('jewelry');
	
	// Search query from URL parameter
	let searchQuery = $derived($page.url.searchParams.get('q') || '');
	
	// Track if data has been loaded
	let dataLoaded = $state(false);
	let allCategoriesData = $state<any>({});
	
	// Filter state
	let selectedType = $state('All');
	let minPrice = $state(0);
	let maxPrice = $state(999999);
	let minRating = $state(0);
	let sortBy = $state<'name' | 'price-low' | 'price-high' | 'rating'>('name');
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
		
		const subcats: Array<{ name: string; categorySlug: string }> = [];
		const seenNames = new Set<string>();
		
		// First add main category names
		Object.entries(allCategoriesData).forEach(([slug, data]: [string, any]) => {
			const mainCategory = categories.find(c => c.slug === slug);
			if (mainCategory && data?.name && !seenNames.has(data.name)) {
				seenNames.add(data.name);
				subcats.push({ name: data.name, categorySlug: slug });
			}
		});
		
		// Then add all unique subcategories from all loaded categories
		Object.entries(allCategoriesData).forEach(([slug, data]: [string, any]) => {
			if (data?.subcategories) {
				data.subcategories.forEach((subcat: any) => {
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
	function getItemPrice(item: any): number {
		try {
			const variation = item.itemData?.variations?.[0];
			const price = variation?.itemVariationData?.priceMoney?.amount || 0;
			return Number(price) / 100;
		} catch {
			return 0;
		}
	}
	
	// Get item rating from custom attributes
	function getItemRating(item: any): number {
		return item.customAttributeValues?.rating?.numberValue || 0;
	}
	
	// Get item category/type from Square categories
	function getItemType(item: any, categories: any[] = []): string {
		const categoryId = item.itemData?.categoryId;
		
		// First try to find subcategory match
		if (categoryId && categories.length > 0) {
			const category = categories.find((cat: any) => cat.id === categoryId);
			if (category?.categoryData?.name) {
				return category.categoryData.name;
			}
		}
		
		// If no subcategory match, check if item belongs to a primary category
		if (categoryId) {
			// Check which primary category this item belongs to based on where we found it
			for (const [slug, data] of Object.entries(allCategoriesData)) {
				if ((data as any)?.itemIds?.has?.(item.id)) {
					return (data as any).name;
				}
			}
		}
		
		const customType = item.customAttributeValues?.product_type?.stringValue;
		if (customType) return customType;
		
		return 'Uncategorized';
	}
	
	// Filter items based on current filter state
	function filterItems(items: any[], categories: any[] = []) {
		if (!items || items.length === 0) return [];
		
		let filtered = items.filter((item: any) => {
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
		filtered.sort((a: any, b: any) => {
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
	
	function formatPrice(price: number): string {
		return `$${price.toFixed(2)}`;
	}
	
	function resetFilters() {
		selectedType = 'All';
		minPrice = 0;
		maxPrice = 999999;
		minRating = 0;
		sortBy = 'name';
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
	{:else if allCategoriesData[activeCategory]}
		{@const currentCategoryData = allCategoriesData[activeCategory]}
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
					<button class="clear-search" onclick={() => goto('/search#' + activeCategory)}>
						Clear Search
					</button>
				</div>
			{:else}
				<h1>{currentCategoryData.name} Collection</h1>
				<p class="subtitle">Browse our selection of {currentCategoryData.name.toLowerCase()}</p>
			{/if}
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
							: (currentCategoryData.subcategories || []).map((cat: any) => cat.categoryData?.name).filter(Boolean)
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
							? Object.values(allCategoriesData).flatMap((cat: any) => cat.items || [])
							: currentCategoryData.items
						}
						{@const subcatsToUse = searchQuery
							? Object.values(allCategoriesData).flatMap((cat: any) => cat.subcategories || [])
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
								{@const itemData = (item as any).itemData || {}}
								{@const itemPrice = getItemPrice(item)}
								{@const itemRating = getItemRating(item)}
								{@const itemType = getItemType(item, currentCategoryData.subcategories)}
								
								<article class="product-card">
									<div class="card-image">
										{#if item.imageUrls?.length > 0}
											<img src={item.imageUrls[0]} alt={itemData.name} />
										{:else if itemData.imageIds?.[0]}
											<div class="placeholder-image">
												<span>🖼️</span>
												<small>Image ID: {itemData.imageIds[0]}</small>
											</div>
										{:else}
											<div class="placeholder-image">
												<span>📦</span>
											</div>
										{/if}
										
										<div class="card-badge">
											{itemType}
										</div>
									</div>
									
									<div class="card-content">
										<h3 class="item-name">{itemData.name || 'Untitled Item'}</h3>
										
										{#if itemData.description}
											<p class="item-description">
												{itemData.description.slice(0, 100)}{itemData.description.length > 100 ? '...' : ''}
											</p>
										{/if}
										
										<div class="card-footer">
											<div class="price-rating">
												<span class="item-price">{formatPrice(itemPrice)}</span>
												{#if itemRating > 0}
													<span class="item-rating">
														⭐ {itemRating.toFixed(1)}
													</span>
												{/if}
											</div>
											
											<button
												class="add-to-cart-btn"
												onclick={() => {
													console.log('--- ADD TO CART CLICKED ---');
													console.log('ITEM ID:', item.id);
													cart.addItem(item.id);
												}}
											>
												Add to Cart
											</button>
										</div>
									</div>
								</article>
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
	@use '$lib/app.scss' as *;
	
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
					background: lighten($accent-primary, 10%);
					transform: translateY(-2px);
					box-shadow: $shadow-md;
				}
				
				&:active {
					transform: translateY(0);
				}
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
	
	.product-card {
		background: $bg-panel;
		border: 1px solid $border-secondary;
		border-radius: $radius-lg;
		overflow: hidden;
		backdrop-filter: blur(10px);
		transition: all $transition-normal;
		
		&:hover {
			transform: translateY(-4px);
			border-color: $accent-primary;
			box-shadow: $shadow-accent-sm;
		}
	}
	
	.card-image {
		position: relative;
		width: 100%;
		height: 280px;
		background: $bg-secondary;
		overflow: hidden;
		
		img {
			width: 100%;
			height: 100%;
			object-fit: cover;
		}
		
		.placeholder-image {
			width: 100%;
			height: 100%;
			display: flex;
			align-items: center;
			justify-content: center;
			flex-direction: column;
			font-size: 4rem;
			background: linear-gradient(135deg, $border-primary 0%, $border-secondary 100%);
			
			small {
				font-size: 0.75rem;
				margin-top: $spacing-sm;
			}
		}
		
		.card-badge {
			position: absolute;
			top: $spacing-sm;
			right: $spacing-sm;
			background: rgba(167, 139, 250, 0.9);
			color: white;
			padding: $spacing-xs $spacing-sm;
			border-radius: $radius-sm;
			font-size: 0.75rem;
			font-weight: 600;
			backdrop-filter: blur(10px);
		}
	}
	
	.card-content {
		padding: $spacing-md;
	}
	
	.item-name {
		color: $text-primary;
		font-size: 1.1rem;
		margin: 0 0 $spacing-sm;
		font-weight: 600;
	}
	
	.item-description {
		color: $text-muted-3;
		font-size: 0.9rem;
		line-height: 1.4;
		margin: 0 0 $spacing-md;
	}
	
	.card-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: $spacing-md;
	}
	
	.price-rating {
		display: flex;
		flex-direction: column;
		gap: $spacing-xs;
	}
	
	.item-price {
		color: $accent-primary;
		font-size: 1.25rem;
		font-weight: 700;
	}
	
	.item-rating {
		color: $text-muted-2;
		font-size: 0.85rem;
	}
	
	.add-to-cart-btn {
		background: $accent-primary;
		border: none;
		color: white;
		padding: $spacing-sm $spacing-md;
		border-radius: $radius-sm;
		cursor: pointer;
		font-weight: 600;
		transition: all $transition-fast;
		white-space: nowrap;
		
		&:hover {
			background: $accent-secondary;
			transform: translateY(-2px);
		}
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
