<script>
	import ItemCard from '$lib/common/ItemCard.svelte';

	let { data } = $props();

	// Extract item details from Square data (cast to any to handle custom properties)
	let item = $state(data.item);
	let variants = $state(data.variants || []);
	let selectedImage = $state('');

	// Watch for data changes and update item/variants and reset page state
	$effect(() => {
		item = data.item;
		variants = data.variants || [];
		selectedImage = '';
	});

	// Initialize selected image from the item's images
	$effect(() => {
		if (item?.imageUrls?.[0]) {
			selectedImage = item.imageUrls[0];
		}
	});

	// Extract price from Square item
	function getItemPrice() {
		try {
			/** @type {any} */
			const variation = item?.itemData?.variations?.[0];
			const price = variation?.itemVariationData?.priceMoney?.amount || 0;
			return Number(price) / 100;
		} catch {
			return 0;
		}
	}

	// Get item rating from custom attributes
	function getItemRating() {
		const rating = item?.customAttributeValues?.rating?.numberValue;
		return typeof rating === 'number' ? rating : 0;
	}

	function formatPrice(price) {
		return `$${price.toFixed(2)}`;
	}

	function selectImage(img) {
		selectedImage = img;
	}

	// Get price for a variant
	function getVariantPrice(variant) {
		try {
			const variation = variant?.itemData?.variations?.[0];
			const price = variation?.itemVariationData?.priceMoney?.amount || 0;
			return Number(price) / 100;
		} catch {
			return 0;
		}
	}

	// Get rating for a variant
	function getVariantRating(variant) {
		const rating = variant?.customAttributeValues?.rating?.numberValue;
		return typeof rating === 'number' ? rating : 0;
	}

	// Get type for a variant
	function getVariantType(variant) {
		const customType = variant?.customAttributeValues?.product_type?.stringValue;
		if (customType) return customType;
		return variant?.itemData?.name || 'Variant';
	}
</script>

<div class="elemental-store">
	<!-- Main Product Section -->
	<section class="hero">
		<div class="hero-content image-left">
			<!-- Product Image Gallery -->
			<div class="search-panel">
				<div class="product-gallery">
					<div class="main-image">
						{#if selectedImage}
							<img src={selectedImage} alt={item?.itemData?.name || 'Product'} />
						{:else if item?.itemData?.imageIds?.[0]}
							<div class="placeholder-image">
								<span>🖼️</span>
								<small>Image ID: {item.itemData.imageIds[0]}</small>
							</div>
						{:else}
							<div class="placeholder-image">
								<span>📦</span>
							</div>
						{/if}
					</div>
					<div class="thumbnail-row">
						{#if item?.imageUrls && item.imageUrls.length > 0}
							{#each item.imageUrls as img (img)}
								<button
									class="thumbnail-btn"
									class:selected={selectedImage === img}
									onclick={() => selectImage(img)}
									aria-label="Select image"
								>
									<img
										src={img}
										alt="Product thumbnail"
									/>
								</button>
							{/each}
						{/if}
					</div>

				</div>
			</div>

			<!-- Product Details -->
			<div class="product-info">
				<h2 class="hero-title">{item?.itemData?.name || 'Product'}</h2>
				{#if item?.itemData?.description}
					<p class="hero-subtitle">{item.itemData.description}</p>
				{/if}

				<h3 style="color: var(--accent); margin-bottom: var(--nav-gap);">
					{formatPrice(getItemPrice())}
				</h3>

				{#if getItemRating() > 0}
					<p style="color: var(--text-muted); margin-bottom: var(--nav-gap);">
						⭐ {getItemRating().toFixed(1)} / 5.0
					</p>
				{/if}

				<div class="hero-actions">
					<button class="btn-primary">Add to Cart</button>
          <!-- <button class="btn-secondary">Add to Wishlist</button> -->
				</div>
			</div>
		</div>
	</section>

	<!-- Variants Section -->
	{#if variants.length > 0}
		<section class="variants-section-wrapper">
			<h2 class="variants-title">Available Variants</h2>
			<div class="variants-grid">
				{#each variants as variant (variant.id)}
					<a href={`/item/${variant.id}`} class="product-card-link">
						<ItemCard 
							item={variant}
							itemData={variant.itemData || {}}
							itemPrice={getVariantPrice(variant)}
							itemRating={getVariantRating(variant)}
							itemType={item?.itemData?.name || 'Primary'}
							{formatPrice}
						/>
					</a>
				{/each}
			</div>
		</section>
	{/if}

	<!-- Details Section -->
	{#if item?.itemData?.description || item?.customAttributeValues?.details?.stringValue}
		<section class="content-grid">
			<div class="events-section">
				<h3>Product Details</h3>
				{#if item?.customAttributeValues?.details?.stringValue}
					<p style="color: var(--muted); line-height: 1.6;">
						{item.customAttributeValues.details.stringValue}
					</p>
				{:else if item?.itemData?.description}
					<p style="color: var(--muted); line-height: 1.6;">
						{item.itemData.description}
					</p>
				{/if}
			</div>

			{#if item?.customAttributeValues?.care_instructions?.stringValue}
				<div class="custom-orders">
					<h3>Care Instructions</h3>
					<p>
						{item.customAttributeValues.care_instructions.stringValue}
					</p>
				</div>
			{/if}
		</section>
	{/if}

	<!-- Product Categories Grid -->
	<section class="categories-grid">
		<div class="category-item">
			<div class="category-image"></div>
			<h4>Jewelry</h4>
		</div>

		<div class="category-item">
			<div class="category-image"></div>
			<h4>Armor</h4>
		</div>

		<div class="category-item">
			<div class="category-image"></div>
			<h4>Laser Engraving</h4>
		</div>

		<div class="category-item">
			<div class="category-image"></div>
			<h4>More</h4>
		</div>
	</section>
</div>

<style>
	/* ======== Left-Side Image Gallery ======== */

	.image-left {
		grid-template-columns: 1fr 1.5fr; /* images left, info right */
	}

	/* Quick fallback that doesn't depend on grid behavior */
	.search-panel {
		margin-right: 2rem;
	}

	.product-gallery {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--nav-gap);
	}

	.main-image {
		width: 100%;
		border-radius: 10px;
		overflow: hidden;
		border: 1px solid var(--border-primary);
		box-shadow: var(--glass-shadow);

		img {
			width: 100%;
			height: auto;
			object-fit: cover;
			transition: transform 0.3s ease;
		}

		img:hover {
			transform: scale(1.02);
		}
	}

	.placeholder-image {
		width: 100%;
		height: 400px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
		font-size: 4rem;
		background: linear-gradient(135deg, var(--border-primary) 0%, var(--border-secondary) 100%);

		small {
			font-size: 0.75rem;
			margin-top: var(--nav-gap);
			color: var(--text-muted);
		}
	}

	.thumbnail-row {
		display: flex;
		justify-content: center;
		flex-wrap: wrap;
		gap: 0.75rem;
		margin-top: var(--nav-gap);
	}

	.thumbnail-btn {
		background: none;
		border: 2px solid var(--border-secondary);
		padding: 0;
		border-radius: var(--nav-gap);
		cursor: pointer;
		transition: all 0.3s ease;
		overflow: hidden;
		width: 80px;
		height: 80px;

		img {
			width: 100%;
			height: 100%;
			object-fit: cover;
			opacity: 0.6;
			transition: opacity 0.3s ease;
		}

		&:hover img {
			opacity: 1;
			transform: translateY(-2px);
		}

		&.selected {
			border-color: var(--accent);
			box-shadow: var(--shadow-accent-sm);

			img {
				opacity: 1;
			}
		}
	}

	/* ======== Variants Section ======== */
	.variants-section-wrapper {
		max-width: var(--desktop-breakpoint);
		margin: var(--nav-gap) auto;
		padding: var(--nav-gap) 2rem;
		border-top: 1px solid var(--border-secondary);
	}

	.variants-title {
		color: var(--accent-primary);
		font-size: 1.5rem;
		margin-bottom: var(--nav-gap);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.variants-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
		gap: 1.5rem;
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

	/* ======== Responsive Adjustments ======== */
	@media (max-width: 768px) {
		.image-left {
			grid-template-columns: 1fr;
		}

		/* If layout stacks on mobile, remove the right margin there */
		.search-panel {
			margin-right: 0;
		}

		.thumbnail-btn {
			width: 60px;
			height: 60px;
		}
	}
</style>