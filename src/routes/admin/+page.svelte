<svelte:head>
	<title>Admin Dashboard - Elemental Designs</title>
</svelte:head>

<div class="admin-dashboard">
	<!-- Quick Stats -->
	<div class="stats-grid">
		<div class="stat-card theme-glass">
			<div class="stat-icon">
				<i class="fas fa-shopping-cart"></i>
			</div>
			<div class="stat-info">
				<p class="stat-label">Total Orders</p>
				<h3 class="stat-value">127</h3>
			</div>
		</div>
		
		<div class="stat-card theme-glass">
			<div class="stat-icon">
				<i class="fas fa-box"></i>
			</div>
			<div class="stat-info">
				<p class="stat-label">Products</p>
				<h3 class="stat-value">45</h3>
			</div>
		</div>
		
		<div class="stat-card theme-glass">
			<div class="stat-icon">
				<i class="fas fa-dollar-sign"></i>
			</div>
			<div class="stat-info">
				<p class="stat-label">Revenue</p>
				<h3 class="stat-value">$12,450</h3>
			</div>
		</div>
		
		<div class="stat-card theme-glass">
			<div class="stat-icon">
				<i class="fas fa-users"></i>
			</div>
			<div class="stat-info">
				<p class="stat-label">Customers</p>
				<h3 class="stat-value">89</h3>
			</div>
		</div>
	</div>
</div>

<style lang="scss">
	.admin-dashboard {
		width: 100%;
	}
	
	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1.5rem;
	}
	
	.stat-card {
		padding: 1.5rem;
		display: flex;
		align-items: center;
		gap: 1.5rem;
		transition: all 0.3s ease;
		
		&:hover {
			transform: translateY(-2px);
			box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
		}
	}
	
	.stat-icon {
		width: 60px;
		height: 60px;
		background: linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%);
		border-radius: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.5rem;
		color: white;
	}
	
	.stat-info {
		flex: 1;
	}
	
	.stat-label {
		color: var(--muted);
		font-size: 0.9rem;
		margin: 0 0 0.5rem 0;
	}
	
	.stat-value {
		color: var(--text-primary);
		font-size: 2rem;
		font-weight: 700;
		margin: 0;
	}
	
	@media (max-width: 768px) {
		.stats-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
