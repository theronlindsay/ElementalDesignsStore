<script lang="ts">
	//importing PageData library
	import type { PageData } from './$types';
	import { cart } from '$lib/cart/cartStore';
	// this is saying, let data
	// Destructures 'data' from props and uses TypeScript to assert that the props object contains a 'data' property of type PageData
	let { data }: { data: PageData } = $props();
	
	// Filter state
	let selectedType = $state('All');
	let minPrice = $state(0);
	let maxPrice = $state(999999);
	let minRating = $state(0);
	let sortBy = $state<'name' | 'price-low' | 'price-high' | 'rating'>('name');
	let showFilters = $state(true);
	
	// Mock function to extract price from Square item
	// You'll need to adjust this based on actual Square item structure
	function getItemPrice(item: any): number {
		try {
			// Square items have variations with pricing
			const variation = item.itemData?.variations?.[0];
			const price = variation?.itemVariationData?.priceMoney?.amount || 0;
			return Number(price) / 100; // Convert cents to dollars
		} catch {
			return 0;
		}
	}
	
	// Mock function to get item rating (you may need to store this separately)
	function getItemRating(item: any): number {
		// This would come from your own database or custom attributes
		// For now, returning a placeholder
		return item.customAttributeValues?.rating?.numberValue || 0;
	}
	
	// Function to get jewelry type from item
	// Pass categories to look up the actual category name
	function getJewelryType(item: any, categories: any[] = []): string {
		// First, try to get the actual category from Square
		const categoryId = item.itemData?.categoryId;
		
		// Debug logging - let's see what we're working with
		console.log('=== Checking item ===');
		console.log('Item name:', item.itemData?.name);
		console.log('Item categoryId:', categoryId);
		console.log('Categories array length:', categories.length);
		
		if (categories.length > 0) {
			console.log('First few categories:', categories.slice(0, 3).map(c => ({
				id: c.id,
				name: c.categoryData?.name,
				hasParent: !!c.categoryData?.parentCategory
			})));
		}
		
		if (categoryId && categories.length > 0) {
			const category = categories.find((cat: any) => cat.id === categoryId);
			console.log('Found category match:', category?.categoryData?.name || 'NOT FOUND');
			
			if (category?.categoryData?.name) {
				return category.categoryData.name;
			} else {
				// Debug: category not found
				console.log('❌ Category not found for ID:', categoryId);
				console.log('All category IDs:', categories.map(c => c.id));
			}
		}
		
		// Fallback to custom attribute if exists
		const customType = item.customAttributeValues?.jewelry_type?.stringValue;
		if (customType) return customType;
		
		// Last resort: try to infer from name/description
		const name = item.itemData?.name?.toLowerCase() || '';
		if (name.includes('earring') || name.includes('ear cuff')) return 'Earrings & Ear Cuffs';
		if (name.includes('necklace') || name.includes('choker')) return 'Necklaces & Chokers';
		if (name.includes('bracelet')) return 'Bracelets';
		if (name.includes('ring')) return 'Rings';
		if (name.includes('anklet')) return 'Anklets';
		if (name.includes('body chain')) return 'Body Chains';
		if (name.includes('waist chain') || name.includes('belly chain')) return 'Waist Chains';
		if (name.includes('headdress') || name.includes('head chain')) return 'Headdresses';
		if (name.includes('face chain')) return 'Face Chains';
		if (name.includes('gauntlet')) return 'Gauntlets';
		if (name.includes('harness')) return 'Harnesses';
		if (name.includes('garter')) return 'Garters';
		if (name.includes('arm band') || name.includes('armband')) return 'Arm Bands';
		
		// If no category found, return "Uncategorized" instead of assuming
		console.log('⚠️ Returning Uncategorized for:', item.itemData?.name);
		return 'Uncategorized';
	}
	
	// Filtered and sorted items - now derived from the resolved promise data
	let filteredItems = $derived.by(() => {
		// We'll handle the filtering in the template after the promise resolves
		return [];
	});
	
	// Function to filter items from resolved data
	function filterItems(items: any[], categories: any[] = []) {
		if (!items || items.length === 0) return [];
		
		let filtered = items.filter((item: any) => {
			// Ensure item is actually a catalog ITEM type (not IMAGE or other types)
			if (item.type !== 'ITEM') {
				console.log('Filtering out non-ITEM:', item.type, item.id);
				return false;
			}
			
			const price = getItemPrice(item);
			const rating = getItemRating(item);
			const type = getJewelryType(item, categories);
			
			// Type filter
			if (selectedType !== 'All' && type !== selectedType) return false;
			
			// Price filter
			if (price < minPrice || price > maxPrice) return false;
			
			// Rating filter
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
		maxPrice = 1000;
		minRating = 0;
		sortBy = 'name';
	}

	function handleClick() {
    	console.log('Button clicked!');
  	}
</script>

<div class="jewelry-page">
	<div class="page-header">
		<h1>Jewelry Collection</h1>
		<p class="subtitle">Handcrafted chainmail jewelry and unique pieces</p>
	</div>
	
	<div class="jewelry-container">
		<!-- Sidebar Filters -->
		<aside class="filters-sidebar" class:collapsed={!showFilters}>
			<div class="filters-header">
				<h2>Filters</h2>
				<button class="toggle-filters" onclick={() => showFilters = !showFilters}>
					{showFilters ? '←' : '→'}
				</button>
			</div>
			
			{#if showFilters}
				<div class="filter-section">
					<h3>Jewelry Type</h3>
					<div class="type-filters">
						{#await data.itemsPromise then itemsData}
							{@const categoryNames = (itemsData.categories || []).map((cat: any) => cat.categoryData?.name).filter(Boolean)}
							{@const jewelryTypes = ['All', ...categoryNames]}
							{#each jewelryTypes as type}
								<button 
									class="type-button"
									class:active={selectedType === type}
									onclick={() => selectedType = type}
								>
									{type}
								</button>
							{/each}
						{/await}
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
				
				<button class="reset-button" onclick={handleClick}>
					ResedadaFilters
				</button>
			{/if}
		</aside>
		
		<!-- Main Content -->
		<main class="jewelry-content">
			<!-- Use Svelte 5 await block to handle promise-based loading -->
			{#await data.itemsPromise}
				<!-- Loading state - shown immediately while data loads -->
				<div class="loading-container">
					<div class="loading-spinner">
						<div class="spinner"></div>
						<p>Loading jewelry collection...</p>
					</div>
				</div>
			{:then itemsData}
				<!-- Data loaded successfully -->
				{@const filtered = filterItems(itemsData.items, itemsData.categories)}
				
				<div class="results-header">
					<p class="results-count">
						{filtered.length} {filtered.length === 1 ? 'item' : 'items'} found
					</p>
					
					<button class="mobile-filter-toggle" onclick={() => showFilters = !showFilters}>
						<span>🔍</span> Filters
					</button>
				</div>
				
				{#if !itemsData.success}
					<div class="error-message">
						<p>⚠️ Unable to load jewelry items</p>
						<p class="error-detail">{itemsData.error || 'Please try again later'}</p>
					</div>
				{:else if filtered.length === 0}
					<div class="no-results">
						<p>No items match your filters</p>
						<button onclick={resetFilters}>Clear Filters</button>
					</div>
				{:else}
					<div class="jewelry-grid">
						{#each filtered as item (item.id)}
							{@const itemData = (item as any).itemData || {}}
							{@const itemPrice = getItemPrice(item)}
							{@const itemRating = getItemRating(item)}
							{@const itemType = getJewelryType(item, itemsData.categories)}
							
							<article class="jewelry-card">
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
											<span>📿</span>
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
			{:catch error}
				<!-- Error state - shown if promise rejects -->
				<div class="error-message">
					<p>⚠️ Unable to load jewelry items</p>
					<p class="error-detail">{error?.message || 'Please try again later'}</p>
				</div>
			{/await}
		</main>
	</div>
</div>

<style lang="scss">
	$bg-primary: #1a1625;
	$bg-secondary: #2a2438;
	$bg-panel: rgba(26, 22, 37, 0.6);
	
	$border-primary: #3d3650;
	$border-secondary: #4a4560;
	$border-accent: #6b5d7a;
	
	$text-primary: #f3f4f6;
	$text-secondary: #e8e4f3;
	$text-muted: #d1d5db;
	$text-muted-2: #9ca3af;
	$text-muted-3: #94a3b8;
	
	$accent-primary: #a78bfa;
	$accent-secondary: #8b5cf6;
	
	$spacing-xs: 0.25rem;
	$spacing-sm: 0.5rem;
	$spacing-md: 1rem;
	$spacing-lg: 1.5rem;
	$spacing-xl: 2rem;
	$spacing-2xl: 3rem;
	$spacing-3xl: 4rem;
	
	$radius-sm: 6px;
	$radius-md: 8px;
	$radius-lg: 12px;
	
	$shadow-accent-sm: 0 10px 25px -5px rgba(167, 139, 250, 0.2);
	
	$transition-fast: 0.18s ease;
	$transition-normal: 0.3s ease;
	
	$mobile-breakpoint: 400px;
	$tablet-breakpoint: 768px;
	$desktop-breakpoint: 1200px;
	
	.jewelry-page {
		min-height: 100vh;
		// background: $bg-primary;
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
	}
	
	.jewelry-container {
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
	.jewelry-content {
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
	
	.jewelry-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
		gap: $spacing-lg;
	}
	
	.jewelry-card {
		background: $bg-panel;
		border: 1px solid $border-secondary;
		border-radius: $radius-lg;
		overflow: hidden;
		backdrop-filter: blur(10px);
		transition: all $transition-normal;
		
		// --- VVV ADD THIS LINE VVV ---
		pointer-events: none;

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
			font-size: 4rem;
			background: linear-gradient(135deg, $border-primary 0%, $border-secondary 100%);
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
		
		// --- VVV ADD THESE TWO LINES VVV ---
		z-index: 999;

		// --- VVV ADD THIS LINE VVV ---
		pointer-events: auto;

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
		.jewelry-page {
			padding: $spacing-md;
		}
		
		.page-header h1 {
			font-size: 2rem;
		}
		
		.jewelry-container {
			flex-direction: column;
		}
		
		.filters-sidebar {
			position: static;
			width: 100%;
			
			&.collapsed {
				display: none;
			}
		}
		
		.jewelry-grid {
			grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
			gap: $spacing-md;
		}
	}
	
	@media (max-width: $mobile-breakpoint) {
		.jewelry-grid {
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
