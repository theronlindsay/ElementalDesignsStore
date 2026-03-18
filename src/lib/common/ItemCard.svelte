<script>
	import { onDestroy } from 'svelte';
	import { cart } from '$lib/cart/cartStore';

	let { item, itemData, itemPrice, itemRating, itemType, formatPrice } = $props();
	let addToCartState = $state('idle');
	let loadingTimer;
	let successTimer;

	// Keep the loading state visible long enough for the spinner animation to read clearly.
	const MIN_LOADING_MS = 700;
	const SUCCESS_MS = 1150;

	function clearAnimationTimers() {
		if (loadingTimer) {
			clearTimeout(loadingTimer);
			loadingTimer = undefined;
		}

		if (successTimer) {
			clearTimeout(successTimer);
			successTimer = undefined;
		}
	}

	function handleAddToCart(e) {
		e.preventDefault();
		e.stopPropagation();

		if (addToCartState !== 'idle') {
			return;
		}

		clearAnimationTimers();
		addToCartState = 'loading';
		console.log('--- ADD TO CART CLICKED ---');
		console.log('ITEM ID:', item.id);

		try {
			cart.addItem(item.id);

			loadingTimer = setTimeout(() => {
				addToCartState = 'success';

				successTimer = setTimeout(() => {
					addToCartState = 'idle';
					successTimer = undefined;
				}, SUCCESS_MS);

				loadingTimer = undefined;
			}, MIN_LOADING_MS);
		} catch (error) {
			console.error('Failed to add item to cart:', error);
			addToCartState = 'idle';
		}
	}

	onDestroy(() => {
		clearAnimationTimers();
	});
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

			<button
				class="add-to-cart-btn"
				class:is-loading={addToCartState === 'loading'}
				class:is-success={addToCartState === 'success'}
				onclick={handleAddToCart}
				disabled={addToCartState !== 'idle'}
				aria-live="polite"
			>
				<span class="btn-content">
					<span class="status-icon" aria-hidden="true">
						<span class="spinner"></span>
						<svg class="check-icon" viewBox="0 0 24 24" focusable="false">
							<path d="M5 13l4 4L19 7"></path>
						</svg>
					</span>
					<span class="btn-label">
						{addToCartState === 'idle'
							? 'Add to Cart'
							: addToCartState === 'loading'
								? 'Adding...'
								: 'Added'}
					</span>
				</span>
			</button>
		</div>
	</div>
</article>

<style lang="scss">
	@use '$lib/theme-vars.scss' as *;

	.product-card {
		background: $bg-panel;
		border: 1px solid $border-secondary;
		border-radius: $radius-lg;
		overflow: hidden;
		backdrop-filter: blur(10px);
		transition: all $transition-normal;
		width: inherit;
		padding: 1px;
		margin: 0.1rem;

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
		min-width: 140px;
		overflow: hidden;
		display: inline-flex;
		align-items: center;
		justify-content: center;

		&:hover {
			background: $accent-secondary;
			transform: translateY(-2px);
		}

		&:disabled {
			cursor: default;
		}
	}

	.btn-content {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: $spacing-sm;
	}

	.status-icon {
		position: relative;
		width: 0;
		height: 18px;
		opacity: 0;
		transform: scale(0.75);
		transition:
			width $transition-fast,
			opacity $transition-fast,
			transform $transition-fast;
	}

	.add-to-cart-btn.is-loading .status-icon,
	.add-to-cart-btn.is-success .status-icon {
		width: 18px;
		opacity: 1;
		transform: scale(1);
	}

	.spinner,
	.check-icon {
		position: absolute;
		top: 0;
		left: 0;
		width: 18px;
		height: 18px;
	}

	.spinner {
		border: 2px solid rgba(255, 255, 255, 0.35);
		border-top-color: white;
		border-radius: 50%;
		opacity: 0;
	}

	.check-icon {
		opacity: 0;
		transform: scale(0.7);
	}

	.check-icon path {
		fill: none;
		stroke: white;
		stroke-width: 3;
		stroke-linecap: round;
		stroke-linejoin: round;
		stroke-dasharray: 22;
		stroke-dashoffset: 22;
	}

	.add-to-cart-btn.is-loading {
		background: linear-gradient(120deg, $accent-primary, $accent-secondary, $accent-primary);
		background-size: 200% 100%;
		animation: btnShimmer 1s ease infinite;
	}

	.add-to-cart-btn.is-loading .spinner {
		opacity: 1;
		animation: spin 0.75s linear infinite;
	}

	.add-to-cart-btn.is-success {
		background: linear-gradient(135deg, #34a275, #2d8b66);
		transform: translateY(-1px);
		box-shadow: 0 6px 14px rgba(52, 162, 117, 0.35);
	}

	.add-to-cart-btn.is-success .spinner {
		opacity: 0;
		animation: none;
	}

	.add-to-cart-btn.is-success .check-icon {
		opacity: 1;
		transform: scale(1);
		transition: transform $transition-fast;
	}

	.add-to-cart-btn.is-success .check-icon path {
		animation: drawCheck 0.35s ease forwards;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	@keyframes drawCheck {
		to {
			stroke-dashoffset: 0;
		}
	}

	@keyframes btnShimmer {
		0% {
			background-position: 0% 50%;
		}

		100% {
			background-position: 100% 50%;
		}
	}
</style>
