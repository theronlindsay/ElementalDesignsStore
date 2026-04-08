<script>
	import { resolve } from '$app/paths';
	import { page } from '$app/state';

	let { isOpen = $bindable(false) } = $props();

	// Navigation items
	const navItems = [
		{ route: '/admin', href: resolve('/admin'), icon: 'fa-chart-line', label: 'Dashboard' },
		{
			route: '/admin/events',
			href: resolve('/admin/events'),
			icon: 'fa-calendar-alt',
			label: 'Events'
		},
		{
			route: '/admin/about',
			href: resolve('/admin/about'),
			icon: 'fa-address-card',
			label: 'About'
		},
		{
			route: '/admin/past-work',
			href: resolve('/admin/past-work'),
			icon: 'fa-images',
			label: 'Past work'
		},
		{
			route: '/admin/branding',
			href: resolve('/admin/branding'),
			icon: 'fa-palette',
			label: 'Branding'
		},
		{
			route: '/admin/featured',
			href: resolve('/admin/featured'),
			icon: 'fa-star',
			label: 'Featured'
		},
		{
			route: '/admin/item-filters',
			href: resolve('/admin/item-filters'),
			icon: 'fa-filter',
			label: 'Item Search & Filtering'
		},
		{ route: '/admin/navbar', href: resolve('/admin/navbar'), icon: 'fa-compass', label: 'Navbar' },
		{
			route: '/admin/footer',
			href: resolve('/admin/footer'),
			icon: 'fa-columns',
			label: 'Footer'
		},
		{
			route: '/admin/storefront',
			href: resolve('/admin/storefront'),
			icon: 'fa-store',
			label: 'Storefront'
		},
		{
			route: '/admin/policies',
			href: resolve('/admin/policies'),
			icon: 'fa-file-contract',
			label: 'Policy'
		},
		{
			route: '/admin/testimonials',
			href: resolve('/admin/testimonials'),
			icon: 'fa-start-alt',
			label: 'Testimonials'
		}
	];

	function toggleSidebar() {
		isOpen = !isOpen;
	}

	function closeSidebar() {
		isOpen = false;
	}

	// Track current route path reactively via $app/state
	let currentPath = $derived(page.url.pathname);

	// Check if route is active
	function isActive(href) {
		if (href === '/admin') {
			return currentPath === '/admin';
		}
		return currentPath.startsWith(href);
	}
</script>

<!-- Mobile Toggle Button -->
<button class="sidebar-toggle" onclick={toggleSidebar} aria-label="Toggle sidebar">
	<i class="fas {isOpen ? 'fa-times' : 'fa-bars'}"></i>
</button>

<!-- Overlay for mobile -->
{#if isOpen}
	<div
		class="sidebar-overlay"
		onclick={closeSidebar}
		onkeydown={(e) => e.key === 'Escape' && closeSidebar()}
		role="button"
		tabindex="0"
	></div>
{/if}

<!-- Sidebar -->
<aside class="admin-sidebar {isOpen ? 'open' : ''}" class:open={isOpen}>
	<!-- Sidebar Header -->
	<div class="sidebar-header">
		<div class="logo-container">
			<i class="fas fa-shield-alt"></i>
		</div>
		<h2 class="sidebar-title">Admin Panel</h2>
	</div>

	<!-- Navigation -->
	<nav class="sidebar-nav">
		{#each navItems as item (item.route)}
			<a
				href={resolve(/** @type {any} */ (item.route))}
				class="nav-link"
				class:active={isActive(item.route)}
				onclick={closeSidebar}
			>
				<i class="fas {item.icon}"></i>
				<span>{item.label}</span>
			</a>
		{/each}
	</nav>

	<!-- Sidebar Footer -->
	<div class="sidebar-footer">
		<div class="user-info">
			<div class="user-avatar">
				<i class="fas fa-user"></i>
			</div>
			<div class="user-details">
				<p class="user-name">Admin User</p>
				<p class="user-role">Administrator</p>
			</div>
		</div>
	</div>
</aside>

<style lang="scss">
	$sidebar-width: 280px;
	$mobile-breakpoint: 768px;

	/* Mobile Toggle Button */
	.sidebar-toggle {
		display: none;
		position: fixed;
		top: 1rem;
		left: 1rem;
		z-index: 1001;
		width: 48px;
		height: 48px;
		background: var(--nav-bg);
		border: 1px solid var(--panel-border);
		border-radius: 12px;
		color: var(--text-primary);
		font-size: 1.25rem;
		cursor: pointer;
		transition: all 0.3s ease;
		backdrop-filter: blur(20px);

		&:hover {
			border-color: var(--accent);
			color: var(--accent);
		}

		@media (max-width: $mobile-breakpoint) {
			display: flex;
			align-items: center;
			justify-content: center;
		}
	}

	/* Mobile Overlay */
	.sidebar-overlay {
		display: none;

		@media (max-width: $mobile-breakpoint) {
			display: block;
			position: fixed;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			background: rgba(0, 0, 0, 0.5);
			z-index: 999;
			backdrop-filter: blur(4px);
		}
	}

	/* Sidebar */
	.admin-sidebar {
		position: fixed;
		top: 0;
		left: 0;
		height: 100vh;
		width: $sidebar-width;
		background: var(--nav-bg);
		border-right: 1px solid var(--panel-border);
		display: flex;
		flex-direction: column;
		z-index: 1000;
		transition: transform 0.3s ease;
		backdrop-filter: blur(20px);

		@media (max-width: $mobile-breakpoint) {
			transform: translateX(-100%);
			box-shadow: 4px 0 12px rgba(0, 0, 0, 0.3);

			&.open {
				transform: translateX(0);
			}
		}
	}

	/* Sidebar Header */
	.sidebar-header {
		padding: 2rem 1.5rem;
		border-bottom: 1px solid var(--panel-border);
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.logo-container {
		width: 48px;
		height: 48px;
		background: linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%);
		border-radius: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.5rem;
		color: white;
		flex-shrink: 0;
	}

	.sidebar-title {
		color: var(--text-primary);
		font-size: 1.25rem;
		font-weight: 700;
		margin: 0;
	}

	/* Navigation */
	.sidebar-nav {
		flex: 1;
		padding: 1.5rem 1rem;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;

		/* Custom scrollbar */
		&::-webkit-scrollbar {
			width: 6px;
		}

		&::-webkit-scrollbar-track {
			background: transparent;
		}

		&::-webkit-scrollbar-thumb {
			background: var(--border-primary);
			border-radius: 3px;
		}

		&::-webkit-scrollbar-thumb:hover {
			background: var(--accent);
		}
	}

	.nav-link {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 0.875rem 1rem;
		color: var(--muted);
		text-decoration: none;
		border-radius: 10px;
		transition: all 0.2s ease;
		font-weight: 500;

		i {
			font-size: 1.1rem;
			width: 20px;
			text-align: center;
		}

		&:hover {
			background: rgba(167, 139, 250, 0.1);
			color: var(--text-primary);
		}

		&.active {
			background: linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%);
			color: white;
			font-weight: 600;
			box-shadow: 0 4px 12px rgba(167, 139, 250, 0.3);
		}
	}

	/* Sidebar Footer */
	.sidebar-footer {
		padding: 1.5rem;
		border-top: 1px solid var(--panel-border);
	}

	.user-info {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.user-avatar {
		width: 40px;
		height: 40px;
		background: var(--border-primary);
		border-radius: 10px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--muted);
		flex-shrink: 0;
	}

	.user-details {
		flex: 1;
		min-width: 0;
	}

	.user-name {
		color: var(--text-primary);
		font-weight: 600;
		font-size: 0.9rem;
		margin: 0 0 0.25rem 0;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.user-role {
		color: var(--muted-2);
		font-size: 0.8rem;
		margin: 0;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
</style>
