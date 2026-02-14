<script>
	import { CartItem, CartSummary, EmptyCart, Button } from '$lib';
	import { cart } from '$lib/cart/cartStore';
	import { onMount } from 'svelte';
	
	// SVELTE 5 RUNES:
	// $state - Creates reactive state (replaces 'let' for reactive variables)
	// $derived - Creates computed/derived values (replaces $: reactive statements)
	// $effect - Runs side effects when dependencies change (replaces $: for side effects)
	
	// Subscribe to cart store and transform it with Square item data
	let cartStoreItems = $state([]);
	let cartItems = $state([]);
	let itemsMap = $state({});
	let isDataReady = $state(false);
	
	// Subscribe to cart store on mount
	let unsubscribe = null;
	
	$effect(() => {
		// Subscribe to cart store and update cartStoreItems whenever it changes
		unsubscribe = cart.subscribe((items) => {
			cartStoreItems = items;
		});
		
		return () => {
			if (unsubscribe) unsubscribe();
		};
	});
	
	// Load itemsMap from client-side fetch (non-blocking)
	// This allows the page to render instantly while data streams in
	onMount(async () => {
		try {
			const response = await fetch('/api/items');
			if (response.ok) {
				const data = await response.json();
				itemsMap = data.itemsMap;
				isDataReady = true;
			}
		} catch (error) {
			console.error('Failed to load items:', error);
		}
	});
	
	// Map store items to include Square data whenever cartStoreItems or itemsMap changes
	$effect(() => {
		cartItems = cartStoreItems.map((cartItem) => {
			const squareData = itemsMap?.[cartItem.id];
			
			return {
				id: cartItem.id,
				name: squareData?.name || `Item ${cartItem.id}`,
				price: squareData?.price || 0,
				quantity: cartItem.quantity,
				variant: squareData?.category || '',
				image: squareData?.imageUrl
			};
		});
	});

    //This is the variable to be updated when the users region is detected
    let taxRate = 0;
	
	// Cart functions - these update the cart store
	function updateQuantity(id, quantity) {
		cart.updateQuantity(id, quantity);
	}
	
	function removeItem(id, quantity) {
		console.log('Removing item:', id);
		cart.removeItem(id);
	}
	
	function clearCart() {
		if (confirm('Are you sure you want to clear your cart?')) {
			cart.clearCart();
		}
	}
	
	// $derived rune: Creates computed values that automatically recalculate
	// These replace the old $: reactive declarations
	// They only recalculate when their dependencies (cartItems) change
	let subtotal = $derived(
		cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
	);
	
	let tax = $derived(subtotal * taxRate); // calculate tax - depends on subtotal
	
	let shipping = $derived(subtotal > 50 ? 0 : 5.99); // Free shipping over $50
	
	let itemCount = $derived(
		cartItems.reduce((sum, item) => sum + item.quantity, 0)
	);

</script>

<main class="cart-page">
	<!-- Page Header -->
	<section class="cart-header">
		<div class="header-container">
			<h1 class="hero-title">Shopping Cart</h1>
			<p class="hero-subtitle">
				{#if itemCount > 0}
					{itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart
				{:else}
					Your cart is empty
				{/if}
			</p>
		</div>
	</section>

	<!-- Cart Content -->
	<section class="cart-content">
		<div class="cart-container">
			{#if cartStoreItems.length > 0}
				<!-- Cart with data streaming in -->
				<div class="cart-layout">
					<!-- Cart Items Section -->
					<div class="cart-items-section">
						<div class="section-header">
							<h2 class="section-title">Cart Items</h2>
                            <!-- Clear Cart -->
							<Button variant="ghost" size="sm" onclick={clearCart}>
								<i class="fas fa-trash-alt"></i>
								<span>Clear Cart</span>
							</Button>
						</div>
						
						<!-- Dynamically adds CartItem.svelte components, passing in item object -->
						<div class="cart-items-list">
							{#each cartItems as item (item.id)}
								{#if isDataReady && item.name && item.name !== `Item ${item.id}`}
									<!-- Fully loaded item -->
									<CartItem 
										{item}
										onUpdateQuantity={updateQuantity}
										onRemove={removeItem}
									/>
								{:else}
									<!-- Skeleton loader while data streams in -->
									<div class="skeleton-loader">
										<div class="skeleton skeleton-image"></div>
										<div class="skeleton-content">
											<div class="skeleton skeleton-title"></div>
											<div class="skeleton skeleton-text"></div>
											<div class="skeleton skeleton-text short"></div>
										</div>
									</div>
								{/if}
							{/each}
						</div>						<!-- Promo Code Section -->
						<div class="promo-section theme-glass">
							<h3 class="promo-title">Have a promo code?</h3>
							<div class="promo-input-group">
								<input 
									type="text" 
									placeholder="Enter promo code" 
									class="promo-input"
								/>
								<Button variant="default">Apply</Button>
							</div>
						</div>
					</div>
					
					<!-- Cart Summary Section -->
					<aside class="cart-summary-section">
						{#if isDataReady}
							<CartSummary 
								{subtotal}
								{shipping}
								{tax}
							/>
						{:else}
							<div class="skeleton-summary">
								<div class="skeleton skeleton-line"></div>
								<div class="skeleton skeleton-line"></div>
								<div class="skeleton skeleton-line"></div>
								<div class="skeleton skeleton-line"></div>
							</div>
						{/if}
					</aside>
				</div>
			{:else}
				<EmptyCart />
			{/if}
		</div>
	</section>
</main>

<style lang="scss">
	.cart-page {
		padding-top: 0;
		margin-top: -1rem;
	}
	
	.cart-header {
		padding: 1.5rem 2rem 2rem;
		text-align: center;
		border-bottom: 1px solid var(--border-primary);
	}
	
	.header-container {
		max-width: 1200px;
		margin: 0 auto;
	}
	
	.cart-content {
		padding: 3rem 2rem;
	}
	
	.cart-container {
		max-width: 1200px;
		margin: 0 auto;
	}
	
	.cart-layout {
		display: grid;
		grid-template-columns: 1fr 400px;
		gap: 2rem;
		align-items: start;
	}
	
	.cart-items-section {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}
	
	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}
	
	.section-title {
		color: var(--text-primary);
		font-size: 1.5rem;
		font-weight: 700;
		margin: 0;
	}
	
	.cart-items-list {
		display: flex;
		flex-direction: column;
	}
	
	.promo-section {
		padding: 1.5rem;
		margin-top: 1rem;
	}
	
	.promo-title {
		color: var(--text-primary);
		font-size: 1.1rem;
		font-weight: 600;
		margin: 0 0 1rem 0;
	}
	
	.promo-input-group {
		display: flex;
		gap: 0.5rem;
	}
	
	.promo-input {
		flex: 1;
		padding: 0.75rem;
		background: var(--bg-secondary);
		border: 1px solid var(--border-secondary);
		border-radius: 8px;
		color: var(--text-secondary);
		font-size: 0.95rem;
		outline: none;
		transition: all 0.3s ease;
		
		&:focus {
			border-color: var(--accent);
			box-shadow: 0 0 0 3px rgba(167, 139, 250, 0.1);
		}
		
		&::placeholder {
			color: var(--muted-2);
		}
	}
	
	
	@media (max-width: 968px) {
		.cart-layout {
			grid-template-columns: 1fr;
		}
		
		.cart-summary-section {
			:global(.cart-summary) {
				position: static;
			}
		}
	}
	
	@media (max-width: 768px) {
		.cart-header {
			padding: 1rem 1rem 1.5rem;
		}
		
		.cart-content {
			padding: 2rem 1rem;
		}
		
		.section-header {
			flex-direction: column;
			align-items: flex-start;
			gap: 1rem;
		}
		
		.promo-input-group {
			flex-direction: column;
		}
	}
	
	/* Skeleton Loader Styles */
	@keyframes shimmer {
		0% {
			background-position: -1000px 0;
		}
		100% {
			background-position: 1000px 0;
		}
	}
	
	.skeleton-loader {
		display: flex;
		gap: 1rem;
		padding: 1rem;
		background: var(--bg-panel);
		border: 1px solid var(--border-secondary);
		border-radius: 8px;
		margin-bottom: 1rem;
		animation: shimmer 2s infinite;
	}
	
	.skeleton-image {
		width: 100px;
		height: 100px;
		border-radius: 4px;
		flex-shrink: 0;
	}
	
	.skeleton-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}
	
	.skeleton {
		background: linear-gradient(
			90deg,
			var(--bg-secondary) 25%,
			var(--bg-tertiary) 50%,
			var(--bg-secondary) 75%
		);
		background-size: 1000px 100%;
		animation: shimmer 2s infinite;
		border-radius: 4px;
	}
	
	.skeleton-title {
		height: 1.2rem;
		width: 80%;
	}
	
	.skeleton-text {
		height: 1rem;
		width: 100%;
	}
	
	.skeleton-text.short {
		width: 60%;
	}
	
	.skeleton-line {
		height: 1.2rem;
		margin-bottom: 0.75rem;
	}
	
	.skeleton-summary {
		padding: 1rem;
		background: var(--bg-panel);
		border: 1px solid var(--border-secondary);
		border-radius: 8px;
	}
</style>
