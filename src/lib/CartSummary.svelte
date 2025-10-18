<script lang="ts">
	import { Button } from '$lib';
	
	export let subtotal: number;
	export let shipping: number = 0;
	export let tax: number = 0;
	
	$: total = subtotal + shipping + tax;
</script>

<div class="cart-summary theme-glass">
	<h2 class="summary-title">Order Summary</h2>
	
	<div class="summary-line">
		<span class="summary-label">Subtotal</span>
		<span class="summary-value">${subtotal.toFixed(2)}</span>
	</div>
	
	<div class="summary-line">
		<span class="summary-label">Shipping</span>
		<span class="summary-value">
			{#if shipping === 0}
				<span class="free-badge">FREE</span>
			{:else}
				${shipping.toFixed(2)}
			{/if}
		</span>
	</div>
	
	<div class="summary-line">
		<span class="summary-label">Tax</span>
		<span class="summary-value">${tax.toFixed(2)}</span>
	</div>
	
	<div class="summary-divider"></div>
	
	<div class="summary-line total">
		<span class="summary-label">Total</span>
		<span class="summary-value">${total.toFixed(2)}</span>
	</div>
	
	<div class="summary-actions">
		<Button variant="primary" className="checkout-btn">
			<i class="fas fa-lock"></i>
			<span>Proceed to Checkout</span>
		</Button>
		
		<a href="/" class="continue-shopping">
			<i class="fas fa-arrow-left"></i>
			Continue Shopping
		</a>
	</div>

    <!-- Trust Badges -->
    <div class="trust-badges">
        <div class="trust-badge">
            <i class="fas fa-lock"></i>
            <span>Secure Checkout</span>
        </div>
        <div class="trust-badge">
            <i class="fas fa-truck"></i>
            <span>Free Shipping $50+</span>
        </div>
        <div class="trust-badge">
            <i class="fas fa-undo"></i>
            <span>30-Day Returns</span>
        </div>
    </div>
</div>



<style lang="scss">
	.cart-summary {
		padding: 2rem;
		position: sticky;
		top: 6rem;
	}
	
	.summary-title {
		color: var(--text-primary);
		font-size: 1.5rem;
		font-weight: 700;
		margin: 0 0 1.5rem 0;
	}
	
	.summary-line {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
		
		&.total {
			font-size: 1.3rem;
			font-weight: 700;
			margin-top: 1rem;
			
			.summary-label,
			.summary-value {
				color: var(--text-primary);
			}
		}
	}
	
	.summary-label {
		color: var(--muted);
		font-size: 1rem;
	}
	
	.summary-value {
		color: var(--text-primary);
		font-weight: 600;
		font-size: 1.1rem;
	}
	
	.free-badge {
		background: var(--accent);
		color: white;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		font-size: 0.8rem;
		font-weight: 700;
	}
	
	.summary-divider {
		height: 1px;
		background: var(--border-primary);
		margin: 1rem 0;
	}
	
	.summary-actions {
		margin-top: 2rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	
	:global(.checkout-btn) {
		width: 100%;
        padding: 1.25rem 1rem;
		justify-content: center;
	}
	
	.continue-shopping {
		color: var(--muted);
		text-decoration: none;
		text-align: center;
		padding: 0.75rem;
		transition: all 0.3s ease;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		
		&:hover {
			color: var(--accent);
		}
	}

    .trust-badges {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		margin-top: 1.5rem;
		padding: 1rem;
        margin-top: 4em;
		background: rgba(42, 36, 56, 0.3);
		border-radius: 12px;
		border: 1px solid var(--border-primary);
	}
	
	.trust-badge {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		color: var(--muted);
		font-size: 0.9rem;
		
		i {
			color: var(--accent);
			font-size: 1rem;
		}
	}
	
</style>
