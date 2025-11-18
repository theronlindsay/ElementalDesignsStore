<script lang="ts">
	import { Button } from '$lib';
	import { goto } from '$app/navigation';
</script>

<div class="empty-cart">
	<div class="empty-icon">
		<i class="fas fa-shopping-cart"></i>
	</div>
	<h2 class="empty-title">Your cart is empty</h2>
	<p class="empty-description">
		Looks like you haven't added anything to your cart yet.
		Browse our collection and discover unique handcrafted pieces.
	</p>
	<Button variant="primary" onclick={() => goto('/')}>
		<i class="fas fa-shopping-bag"></i>
		<span>Start Shopping</span>
	</Button>
</div>

<style lang="scss">
	.empty-cart {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		padding: 4rem 2rem;
		min-height: 400px;
	}
	
	.empty-icon {
		width: 120px;
		height: 120px;
		background: linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		font-size: 3rem;
		margin-bottom: 2rem;
		opacity: 0.8;
	}
	
	.empty-title {
		color: var(--text-primary);
		font-size: 2rem;
		font-weight: 700;
		margin: 0 0 1rem 0;
	}
	
	.empty-description {
		color: var(--muted);
		font-size: 1.1rem;
		line-height: 1.6;
		max-width: 500px;
		margin: 0 0 2rem 0;
	}
</style>
