<svelte:head>
	<title>Coupons - Admin</title>
</svelte:head>

<div class="admin-page">
    <h1>Coupons</h1>
	<div class="page-header">
		<div class="header-left">
			<h2 class="page-subtitle">Create and manage discount codes</h2>
		</div>
		<button class="btn-primary">
			<i class="fas fa-plus"></i>
			New Coupon
		</button>
	</div>
	
	<div class="content-placeholder theme-glass">
		<i class="fas fa-ticket-alt" style="font-size: 4rem; color: var(--muted-2);"></i>
		<h3>Coupon Management</h3>
		<p>Create promotional codes and track their usage...</p>
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
	
	.btn-primary {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1.5rem;
		background: linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%);
		color: white;
		border: none;
		border-radius: 12px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
		
		&:hover {
			transform: translateY(-2px);
			box-shadow: 0 8px 20px rgba(167, 139, 250, 0.4);
		}
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
