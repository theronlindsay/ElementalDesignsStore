<script lang="ts">
	import { Button } from '$lib';
	
	export let item: {
		id: string;
		name: string;
		price: number;
		quantity: number;
		image?: string;
		variant?: string;
	};
	
	export let onUpdateQuantity: (id: string, quantity: number) => void;
	export let onRemove: (id: string) => void;
	
	function increaseQuantity() {
		onUpdateQuantity(item.id, item.quantity + 1);
	}
	
	function decreaseQuantity() {
		if (item.quantity > 1) {
			onUpdateQuantity(item.id, item.quantity - 1);
		}
	}
	
	$: subtotal = item.price * item.quantity;
</script>

<div class="cart-item theme-glass">
	<div class="item-image">
		{#if item.image}
			<img src={item.image} alt={item.name} />
		{:else}
			<div class="image-placeholder">
				<i class="fas fa-image"></i>
			</div>
		{/if}
	</div>
	
	<div class="item-details">
		<h3 class="item-name">{item.name}</h3>
		{#if item.variant}
			<p class="item-variant">{item.variant}</p>
		{/if}
		<p class="item-price">${item.price.toFixed(2)}</p>
	</div>
	
	<div class="item-quantity">
		<Button variant="ghost" size="sm" onclick={decreaseQuantity} ariaLabel="Decrease quantity">
			<i class="fas fa-minus"></i>
		</Button>
		<span class="quantity-value">{item.quantity}</span>
		<Button variant="ghost" size="sm" onclick={increaseQuantity} ariaLabel="Increase quantity">
			<i class="fas fa-plus"></i>
		</Button>
	</div>
	
	<div class="item-subtotal">
		<p class="subtotal-amount">${subtotal.toFixed(2)}</p>
	</div>
	
	<div class="item-actions">
		<Button variant="ghost" size="sm" onclick={() => onRemove(item.id)} ariaLabel="Remove item">
			<i class="fas fa-trash"></i>
		</Button>
	</div>
</div>

<style lang="scss">
	.cart-item {
		display: grid;
		grid-template-columns: 80px 1fr auto auto auto;
		gap: 1.5rem;
		align-items: center;
		padding: 1.5rem;
		margin-bottom: 1rem;
		transition: all 0.3s ease;
		
		&:hover {
			transform: translateY(-2px);
			box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
		}
	}
	
	.item-image {
		width: 80px;
		height: 80px;
		border-radius: 8px;
		overflow: hidden;
		
		img {
			width: 100%;
			height: 100%;
			object-fit: cover;
		}
	}
	
	.image-placeholder {
		width: 100%;
		height: 100%;
		background: linear-gradient(135deg, var(--border-primary) 0%, var(--border-secondary) 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--muted-2);
		font-size: 1.5rem;
	}
	
	.item-details {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}
	
	.item-name {
		color: var(--text-primary);
		font-size: 1.1rem;
		font-weight: 600;
		margin: 0;
	}
	
	.item-variant {
		color: var(--muted);
		font-size: 0.9rem;
		margin: 0;
	}
	
	.item-price {
		color: var(--accent);
		font-weight: 600;
		margin: 0;
	}
	
	.item-unit-price {
		color: var(--muted-2);
		font-size: 0.85rem;
		margin: 0;
		font-style: italic;
	}
	
	.item-quantity {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	
	.quantity-value {
		color: var(--text-primary);
		font-weight: 600;
		min-width: 2rem;
		text-align: center;
		font-size: 1.1rem;
	}
	
	.item-subtotal {
		min-width: 100px;
		text-align: right;
	}
	
	.subtotal-amount {
		color: var(--text-primary);
		font-size: 1.2rem;
		font-weight: 700;
		margin: 0;
	}
	
	.item-actions {
		display: flex;
		align-items: center;
	}
	
	@media (max-width: 768px) {
		.cart-item {
			grid-template-columns: 60px 1fr;
			gap: 1rem;
			
			.item-quantity,
			.item-subtotal {
				grid-column: 2;
			}
			
			.item-actions {
				grid-column: 2;
				justify-content: flex-end;
			}
		}
	}
</style>
