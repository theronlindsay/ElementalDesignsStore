<script lang="ts">
	import { CartItem, CartSummary, EmptyCart, Button } from '$lib';
	
	// SVELTE 5 RUNES:
	// $state - Creates reactive state (replaces 'let' for reactive variables)
	// $derived - Creates computed/derived values (replaces $: reactive statements)
	// $effect - Runs side effects when dependencies change (replaces $: for side effects)
	
	// $state rune: Creates reactive state that automatically triggers updates
	// When cartItems changes, the UI re-renders automatically
    // This should be left empty when done testing
	/*let cartItems = $state([
		{
			id: '1',
			name: 'Byzantine Chainmail Bracelet',
			price: 45.00,
			quantity: 1,
			variant: 'Silver, Medium'
		},
		{
			id: '2',
			name: 'Laser Engraved Wooden Box',
			price: 32.00,
			quantity: 2,
			variant: 'Walnut, Custom Text'
		},
		{
			id: '3',
			name: 'European 4-in-1 Necklace',
			price: 78.00,
			quantity: 1,
			variant: 'Bronze'
		}
	]);*/

	let cartItems = $state([
		{
			id: '1',
			name: 'thing 1',
			price: 2,
			quantity: 4,
			variant: ''
		}
	]);

    //This is the variable to be updated when the users region is detected
    let taxRate = 0;
	
	// Cart functions - these update the $state, triggering automatic re-renders
	function updateQuantity(id: string, quantity: number) {
		cartItems = cartItems.map(item => 
			item.id === id ? { ...item, quantity } : item
		);
	}
	
	function removeItem(id: string, quantity: number) {
		console.log('Removing item:', id);
		const newItems = cartItems.filter(item => item.id !== id);
		cartItems = newItems;
	}
	
	function clearCart() {
		if (confirm('Are you sure you want to clear your cart?')) {
			cartItems = [];
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
	
	// Optional: $effect rune for side effects (like logging, localStorage, etc.)
	// This runs whenever its dependencies change
	// Example: Save cart to localStorage whenever it changes
	// $effect(() => {
	// 	localStorage.setItem('cart', JSON.stringify(cartItems));
	// 	console.log('Cart updated:', cartItems);
	// });
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
			{#if cartItems.length > 0}
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
							{#each cartItems as item (item.id, item.quantity)}
								<CartItem 
									{item}
									onUpdateQuantity={updateQuantity}
									onRemove={removeItem}
								/>
							{/each}
						</div>
						
						<!-- Promo Code Section -->
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
						<CartSummary 
							{subtotal}
							{shipping}
							{tax}
						/>
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
</style>
