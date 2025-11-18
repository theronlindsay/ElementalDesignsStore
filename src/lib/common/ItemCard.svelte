<script lang="ts">
	import { cart } from '$lib/cart/cartStore';

	interface Props {
		item: any;
		itemData: any;
		itemPrice: number;
		itemRating: number;
		itemType: string;
		formatPrice: (price: number) => string;
	}

	let { item, itemData, itemPrice, itemRating, itemType, formatPrice }: Props = $props();

	function handleAddToCart(e: MouseEvent) {
		e.preventDefault();
		e.stopPropagation();
		console.log('--- ADD TO CART CLICKED ---');
		console.log('ITEM ID:', item.id);
		cart.addItem(item.id);
	}
</script>

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
			
			<button class="add-to-cart-btn" onclick={handleAddToCart}>
				Add to Cart
			</button>
		</div>
	</div>
</article>

<style lang="scss">
	@use '$lib/app.scss' as *;

	.product-card {
		background: $bg-panel;
		border: 1px solid $border-secondary;
		border-radius: $radius-lg;
		overflow: hidden;
		backdrop-filter: blur(10px);
		transition: all $transition-normal;
		width: inherit;
		margin: 0.75rem;

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
		position: relative;
		z-index: 10;

		&:hover {
			background: $accent-secondary;
			transform: translateY(-2px);
		}
	}
</style>
