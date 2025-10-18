<svelte:head>
	<title>Orders - Admin</title>
</svelte:head>

<div class="admin-page">
    <h1>Orders</h1>
	<div class="page-header">
		<div class="header-left">
			<h2 class="page-subtitle">View and manage customer orders</h2>
		</div>
	</div>
	
	<div class="content-placeholder theme-glass">
		<i class="fas fa-shopping-bag" style="font-size: 4rem; color: var(--muted-2);"></i>
		<h3>Order Management</h3>
		<p>Order tracking and fulfillment features coming soon...</p>
	</div>
</div>

<style lang="scss">
	.admin-page {
		width: 100%;
	}
	
	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
		gap: 1rem;
		flex-wrap: wrap;
	}
	
	.header-left {
		flex: 1;
		min-width: 200px;
	}
	
	.page-subtitle {
		color: var(--muted);
		font-size: 1rem;
		font-weight: 500;
		margin: 0;
	}
	
	.content-placeholder {
		padding: 4rem 2rem;
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		
		h3 {
			color: var(--text-primary);
			font-size: 1.5rem;
			margin: 0;
		}
		
		p {
			color: var(--muted);
			margin: 0;
		}
	}
</style>
