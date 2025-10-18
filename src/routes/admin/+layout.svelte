<script lang="ts">
	import { AdminSidebar } from '$lib';
	import { enhance } from '$app/forms';
	import { Button } from '$lib';
	
	let sidebarOpen = false;
</script>

<div class="admin-layout">
	<AdminSidebar bind:isOpen={sidebarOpen} />
	
	<div class="admin-content">
		<!-- Top Bar -->
		<header class="admin-topbar">
			<div class="topbar-content">
				<h1 class="page-title">
					<slot name="title">Admin Panel</slot>
				</h1>
				
				<form method="POST" action="/admin?/logout" use:enhance class="logout-form">
					<Button variant="ghost" type="submit">
						<i class="fas fa-sign-out-alt"></i>
						<span>Logout</span>
					</Button>
				</form>
			</div>
		</header>
		
		<!-- Page Content -->
		<main class="admin-main">
			<slot />
		</main>
	</div>
</div>

<style lang="scss">
	$sidebar-width: 280px;
	$mobile-breakpoint: 768px;
	
	.admin-layout {
		display: flex;
		min-height: 100vh;
		max-width: 100vw;
		overflow-x: hidden;
		background: var(--bg-primary);
	}
	
	.admin-content {
		flex: 1;
		margin-left: $sidebar-width;
		display: flex;
		flex-direction: column;
		transition: margin-left 0.3s ease;
		min-width: 0; // Allows flex item to shrink below content size
		width: calc(100vw - $sidebar-width); // Ensure content doesn't exceed viewport
		
		@media (max-width: $mobile-breakpoint) {
			margin-left: 0;
			width: 100vw;
		}
	}
	
	.admin-topbar {
		position: sticky;
		top: 0;
		z-index: 100;
		background: var(--nav-bg);
		border-bottom: 1px solid var(--panel-border);
		backdrop-filter: blur(20px);
		padding: 1rem 2rem;
		
		@media (max-width: $mobile-breakpoint) {
			padding: 1rem 1rem 1rem 4.5rem;
		}
	}
	
	.topbar-content {
		display: flex;
		justify-content: space-between;
		align-items: center;
		max-width: 100%;
		gap: 1rem;
		flex-wrap: wrap;
	}
	
	.page-title {
		color: var(--text-primary);
		font-size: 1.5rem;
		font-weight: 700;
		margin: 0;
		
		@media (max-width: $mobile-breakpoint) {
			font-size: 1.25rem;
		}
	}
	
	.logout-form {
		display: flex;
	}
	
	.admin-main {
		flex: 1;
		padding: 2rem;
		max-width: 100%;
		overflow-x: hidden;
		box-sizing: border-box;
		
		@media (max-width: $mobile-breakpoint) {
			padding: 1.5rem 1rem;
		}
	}
</style>
