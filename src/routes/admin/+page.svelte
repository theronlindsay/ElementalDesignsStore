<script>
	import { resolve } from '$app/paths';
</script>

<svelte:head>
	<title>Admin Dashboard - Elemental Designs</title>
</svelte:head>

<div class="admin-dashboard">
	<header class="dashboard-header">
		<h2>Dashboard</h2>
		<p>Choose a section to manage your store content and settings.</p>
	</header>

	<section class="stats-grid" aria-label="Admin dashboard navigation">

		<a class="stat-card" href={resolve('/admin/events')}>
			<div class="stat-icon" aria-hidden="true"><i class="fas fa-calendar-alt"></i></div>
			<div class="stat-info">
				<p class="stat-label">Events</p>
				<p class="stat-description">Edit event listings and schedules.</p>
			</div>
			<i class="fas fa-arrow-right" aria-hidden="true"></i>
		</a>

		<a class="stat-card" href={resolve('/admin/about')}>
			<div class="stat-icon" aria-hidden="true"><i class="fas fa-address-card"></i></div>
			<div class="stat-info">
				<p class="stat-label">About</p>
				<p class="stat-description">Update your brand story section.</p>
			</div>
			<i class="fas fa-arrow-right" aria-hidden="true"></i>
		</a>

		<a class="stat-card" href={resolve('/admin/past-work')}>
			<div class="stat-icon" aria-hidden="true"><i class="fas fa-images"></i></div>
			<div class="stat-info">
				<p class="stat-label">Past work</p>
				<p class="stat-description">Gallery of custom pieces—images and optional details.</p>
			</div>
			<i class="fas fa-arrow-right" aria-hidden="true"></i>
		</a>

		<a class="stat-card" href={resolve('/admin/branding')}>
			<div class="stat-icon" aria-hidden="true"><i class="fas fa-palette"></i></div>
			<div class="stat-info">
				<p class="stat-label">Branding</p>
				<p class="stat-description">Control logos, colors, and identity assets.</p>
			</div>
			<i class="fas fa-arrow-right" aria-hidden="true"></i>
		</a>

		<a class="stat-card" href={resolve('/admin/featured')}>
			<div class="stat-icon" aria-hidden="true"><i class="fas fa-star"></i></div>
			<div class="stat-info">
				<p class="stat-label">Featured</p>
				<p class="stat-description">Choose hero featured item cards for the homepage.</p>
			</div>
			<i class="fas fa-arrow-right" aria-hidden="true"></i>
		</a>

		<a class="stat-card" href={resolve('/admin/item-filters')}>
			<div class="stat-icon" aria-hidden="true"><i class="fas fa-filter"></i></div>
			<div class="stat-info">
				<p class="stat-label">Item Filters</p>
				<p class="stat-description">Configure storefront search and filtering.</p>
			</div>
			<i class="fas fa-arrow-right" aria-hidden="true"></i>
		</a>

		<a class="stat-card" href={resolve('/admin/navbar')}>
			<div class="stat-icon" aria-hidden="true"><i class="fas fa-compass"></i></div>
			<div class="stat-info">
				<p class="stat-label">Navbar</p>
				<p class="stat-description">Arrange primary navigation links.</p>
			</div>
			<i class="fas fa-arrow-right" aria-hidden="true"></i>
		</a>

		<a class="stat-card" href={resolve('/admin/footer')}>
			<div class="stat-icon" aria-hidden="true"><i class="fas fa-columns"></i></div>
			<div class="stat-info">
				<p class="stat-label">Footer</p>
				<p class="stat-description">Edit footer columns, icons, links, and order.</p>
			</div>
			<i class="fas fa-arrow-right" aria-hidden="true"></i>
		</a>

		<a class="stat-card" href={resolve('/admin/storefront')}>
			<div class="stat-icon" aria-hidden="true"><i class="fas fa-store"></i></div>
			<div class="stat-info">
				<p class="stat-label">Storefront</p>
				<p class="stat-description">Tune homepage and storefront settings.</p>
			</div>
			<i class="fas fa-arrow-right" aria-hidden="true"></i>
		</a>

		<a class="stat-card" href={resolve('/admin/policies')}>
			<div class="stat-icon" aria-hidden="true"><i class="fas fa-file-contract"></i></div>
			<div class="stat-info">
				<p class="stat-label">Policies</p>
				<p class="stat-description">Edit shipping, return, and legal policies.</p>
			</div>
			<i class="fas fa-arrow-right" aria-hidden="true"></i>
		</a>

		<a class="stat-card" href={resolve('/admin/testimonials')}>
			<div class="stat-icon" aria-hidden="true"><i class="fas fa-comment-dots"></i></div>
			<div class="stat-info">
				<p class="stat-label">Testimonials</p>
				<p class="stat-description">Manage customer testimonial content.</p>
			</div>
			<i class="fas fa-arrow-right" aria-hidden="true"></i>
		</a>

		<a class="stat-card" href={resolve('/admin/coupons')}>
			<div class="stat-icon" aria-hidden="true"><i class="fas fa-ticket-alt"></i></div>
			<div class="stat-info">
				<p class="stat-label">Coupons</p>
				<p class="stat-description">Create and manage discount codes.</p>
			</div>
			<i class="fas fa-arrow-right" aria-hidden="true"></i>
		</a>
	</section>
</div>

<style lang="scss">
	.admin-dashboard {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.dashboard-header {
		h2 {
			color: var(--text-primary);
			margin: 0;
			font-size: clamp(1.5rem, 2.4vw, 2rem);
		}

		p {
			margin: 0.4rem 0 0;
			color: var(--muted);
		}
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
		text-decoration: none;
		border: 1px solid var(--panel-border);
		border-radius: 16px;
		background: linear-gradient(180deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%),
			var(--panel-bg, var(--nav-bg));
		transition: all 0.3s ease;
		color: var(--text-primary);
		
		&:hover {
			transform: translateY(-2px);
			box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
			border-color: var(--accent);
		}

		i:last-child {
			color: white;
			font-size: 0.95rem;
		}
	}
	
	.stat-icon {
		width: 60px;
		height: 60px;
		background: linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%);
		border-radius: 14px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.5rem;
		color: white;
		flex-shrink: 0;
	}
	
	.stat-info {
		flex: 1;
		min-width: 0;
	}
	
	.stat-label {
		color: var(--text-primary);
		font-size: 1rem;
		font-weight: 700;
		margin: 0;
	}
	
	.stat-description {
		color: var(--muted);
		font-size: 0.9rem;
		line-height: 1.4;
		margin: 0.35rem 0 0;
	}
	
	@media (max-width: 768px) {
		.stats-grid {
			grid-template-columns: 1fr;
		}

		.stat-card {
			padding: 1.2rem;
			gap: 1rem;
		}

		.stat-icon {
			width: 52px;
			height: 52px;
			font-size: 1.2rem;
		}
	}
</style>
