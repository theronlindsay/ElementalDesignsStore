<script lang="ts">
	import { onMount } from 'svelte';

	// Props for customization
	export let items = [
		{ id: 'home', label: 'Home', active: true },
		{ id: 'chainmail', label: 'Chainmail', active: false },
		{ id: 'nsfw', label: 'NSFW', active: false },
		{ id: 'laser', label: 'Laser Engraving', active: false },
		{ id: 'about', label: 'About', active: false }, 
		{ id: 'faq', label: 'FAQ', active: false},
	];

	let activeItem = items.find(item => item.active)?.id || items[0]?.id;
	let visuallyActiveItem = activeItem; // Separate state for visual boldness
	let selectorElement: HTMLDivElement;
	let navElement: HTMLElement;
	let itemElements: { [key: string]: HTMLButtonElement } = {};
	
	// Add state for dropdown menus
	let showAccountMenu = false;

	// Responsive state management
	let screenWidth = 0;
	let isMobileMenuOpen = false;
	let isTabletMode = false;
	let isMobileMode = false;

	// Breakpoints
	const TABLET_BREAKPOINT = 900; // Extended tablet mode to replace compact mode
	const MOBILE_BREAKPOINT = 580;

	// Update layout based on screen size
	function updateResponsiveLayout() {
		isTabletMode = screenWidth <= TABLET_BREAKPOINT && screenWidth > MOBILE_BREAKPOINT;
		isMobileMode = screenWidth <= MOBILE_BREAKPOINT;
	}

	// Toggle mobile menu
	function toggleMobileMenu() {
		isMobileMenuOpen = !isMobileMenuOpen;
	}

	// Function to move the selector to the active item
	function moveSelector(targetId: string) {
		if (!selectorElement || !itemElements[targetId]) return;

		const targetElement = itemElements[targetId];
		const containerRect = navElement.querySelector('.navbar-container')!.getBoundingClientRect();
		const targetRect = targetElement.getBoundingClientRect();
		
		// Calculate position relative to the navbar container, accounting for container padding
		const offsetX = targetRect.left - containerRect.left - 6; // Subtract container padding
		const width = targetRect.width;

		// Apply the transform with bounce animation
		selectorElement.style.transform = `translateX(${offsetX}px)`;
		selectorElement.style.width = `${width}px`;
	}

	// Handle item click
	function handleItemClick(itemId: string) {
		activeItem = itemId;
		moveSelector(itemId);
		
		// Delay the visual boldness change until near the end of animation (300ms out of 400ms)
		setTimeout(() => {
			visuallyActiveItem = itemId;
		}, 300);
		
		// Update items array
		items = items.map(item => ({
			...item,
			active: item.id === itemId
		}));
	}

	// Initialize selector position and responsive behavior
	onMount(() => {
		// Set initial screen width
		screenWidth = window.innerWidth;
		updateResponsiveLayout();

		setTimeout(() => {
			moveSelector(activeItem);
			// Set initial visual state without delay
			visuallyActiveItem = activeItem;
		}, 50);
		
		// Handle window resize
		const handleResize = () => {
			screenWidth = window.innerWidth;
			updateResponsiveLayout();
			
			// Close mobile menu on resize to larger screen
			if (!isMobileMode) {
				isMobileMenuOpen = false;
			}
			
			// Update selector position
			setTimeout(() => moveSelector(activeItem), 100);
		};
		
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	});
</script>

<nav class="navbar" bind:this={navElement}>
	<div class="navbar-container" class:tablet-mode={isTabletMode} class:mobile-mode={isMobileMode}>
		
		{#if isMobileMode}
			<!-- Mobile Layout with Hamburger Menu -->
			<div class="mobile-header" style="display: flex; flex-direction: column">

				<div class="mobile-logo">
					<a href="/" class="logo-link" aria-label="Elemental Designs Home">
						<div class="logo">
				    		<img src="/src/lib/assets/LogoTransparent.png" alt="Logo" style="max-width: 200px; display: block"/>
						</div>
					</a>
			    </div>

				<div style="display: flex; flex-direction:row; margin: 1em">

					<button class="mobile-menu-toggle" on:click={toggleMobileMenu} aria-label="Toggle menu">
						<i class="fas {isMobileMenuOpen ? 'fa-times' : 'fa-bars'}"></i>
					</button>
					
					<!-- Mobile Actions (always visible) -->
					<div class="mobile-actions">
						<button class="nav-action-btn mobile-action" aria-label="Search Products">
							<i class="fas fa-search"></i>
						</button>
						<button class="nav-action-btn mobile-action" aria-label="User Account">
							<i class="fas fa-user"></i>
						</button>
						<button class="nav-action-btn mobile-action" aria-label="Shopping Cart">
							<i class="fas fa-shopping-cart"></i>
						</button>
					</div>
				</div>
			</div>
			
			<!-- Mobile Menu (collapsible) -->
			{#if isMobileMenuOpen}
				<div class="mobile-menu">
					{#each items as item}
						<button
							bind:this={itemElements[item.id]}
							class="nav-item mobile-nav-item {visuallyActiveItem === item.id ? 'active' : ''}"
							on:click={() => {
								handleItemClick(item.id);
								isMobileMenuOpen = false;
							}}
						>
							{item.label}
						</button>
					{/each}
				</div>
			{/if}
		
		{:else if isTabletMode}
			<!-- Tablet Layout - Two Sections -->
			<div class="tablet-layout">
				<!-- Logo Row -->
				<div class="tablet-logo-section">
					<a href="/" class="logo-link" aria-label="Elemental Designs Home">
						<div class="logo">
				    		<img src="/src/lib/assets/LogoTransparent.png" alt="Logo" style="max-width: 200px; display: block"/>
						</div>
					</a>
				</div>
				
				<!-- Top Row: Navigation Items -->
				<div class="tablet-nav-section">
					<div 
						class="selector tablet-selector" 
						bind:this={selectorElement}
					></div>
					{#each items as item}
						<button
							bind:this={itemElements[item.id]}
							class="nav-item tablet-nav-item {visuallyActiveItem === item.id ? 'active' : ''}"
							on:click={() => handleItemClick(item.id)}
						>
							{item.label}
						</button>
					{/each}
				</div>
				
				<!-- Bottom Row: Actions -->
				<div class="tablet-actions-section">
					<!-- Search -->
					<div class="nav-search-container">
						<div class="nav-search-box tablet-search">
							<input type="text" placeholder="Search..." />
							<button class="nav-search-btn" aria-label="Search Products">
								<i class="fas fa-search"></i>
							</button>
						</div>
					</div>
					
					<!-- Account & Cart -->
					<button class="nav-action-btn tablet-action" 
						on:mouseenter={() => showAccountMenu = true}
						on:mouseleave={() => showAccountMenu = false}>
						<i class="fas fa-user"></i>
						<span>Account</span>
						{#if showAccountMenu}
							<div class="dropdown-menu account-menu">
								<a href="#login">Login</a>
								<a href="#register">Register</a>
								<a href="#profile">My Profile</a>
								<a href="#orders">My Orders</a>
							</div>
						{/if}
					</button>
					
					<button class="nav-action-btn tablet-action">
						<i class="fas fa-shopping-cart"></i>
						<span>Cart</span>
					</button>
				</div>
			</div>
		
		{:else}
			<!-- Desktop Layout - Single Row -->
				
				
				<div 
					class="selector" 
					bind:this={selectorElement}
				></div>
				
				{#each items as item}
					<button
						bind:this={itemElements[item.id]}
						class="nav-item {visuallyActiveItem === item.id ? 'active' : ''}"
						on:click={() => handleItemClick(item.id)}
					>
						{item.label}
					</button>
				{/each}
				
				<!-- Divider -->
				<div class="nav-divider">
					<i class="fas fa-grip-lines-vertical"></i>
				</div>
				
				<!-- Navigation Actions -->
				<div class="nav-actions">
					<!-- Search -->
					<div class="nav-search-container">
						<div class="nav-search-box">
							<input type="text" placeholder="Search..." />
							<button class="nav-search-btn" aria-label="Search Products">
								<i class="fas fa-search"></i>
							</button>
						</div>
					</div>
					
					<!-- Account Menu -->
					<button class="nav-action-btn" 
						on:mouseenter={() => showAccountMenu = true}
						on:mouseleave={() => showAccountMenu = false}>
						<i class="fas fa-user"></i>
						<span>Account</span>
						{#if showAccountMenu}
							<div class="dropdown-menu account-menu">
								<a href="#login">Login</a>
								<a href="#register">Register</a>
								<a href="#profile">My Profile</a>
								<a href="#orders">My Orders</a>
							</div>
						{/if}
					</button>
					
					<!-- Shopping Cart -->
					<button class="nav-action-btn">
						<i class="fas fa-shopping-cart"></i>
						<span>Cart</span>
					</button>
				</div>
		{/if}
	</div>
</nav>

<style>
	.navbar {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 1rem;
		font-family: system-ui, -apple-system, sans-serif;
		width: 100%;
		max-width: 85vw;
		margin: 0 auto;
	}

	.navbar-container {
		position: relative;
		display: flex;
		align-items: center;
		background: rgba(30, 41, 59, 0.8);
		border-radius: 25px;
		padding: 6px;
		gap: 4px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
		backdrop-filter: blur(20px);
		border: 1px solid #334155;
	}

	.selector {
		position: absolute;
		top: 6px;
		left: 6px;
		height: calc(100% - 12px);
		background: linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%);
		border-radius: 20px;
		transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
		z-index: 1;
		box-shadow: 0 2px 10px rgba(56, 189, 248, 0.4);
	}

	.nav-item {
		position: relative;
		z-index: 2;
		background: none;
		border: none;
		color: #cbd5e1;
		padding: 12px 20px;
		border-radius: 20px;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		white-space: nowrap;
		min-width: fit-content;
	}

	.nav-item:hover {
		color: #f1f5f9;
		transform: translateY(-1px);
	}

	.nav-item.active {
		color: #ffffff;
		font-weight: 700;
	}

	.nav-item:focus {
		outline: none;
	}

	/* Logo Styles */
	.logo-link {
		display: flex;
		align-items: center;
		gap: 8px;
		text-decoration: none;
		color: #f1f5f9;
		font-weight: 700;
		transition: all 0.2s ease;
		white-space: nowrap;
	}

	.logo-link:hover {
		color: #38bdf8;
		transform: translateY(-1px);
	}

	.logo-link i {
		font-size: 20px;
		color: #ef4444;
	}

	.logo-text {
		font-size: 16px;
		font-weight: 800;
		background: linear-gradient(45deg, #38bdf8, #ef4444);
		-webkit-background-clip: text;
		background-clip: text;
		-webkit-text-fill-color: transparent;
	}

	/* Desktop Logo */
	.desktop-logo {
		margin-right: 20px;
	}

	/* Mobile Logo */
	.mobile-logo {
		flex: 1;
		display: flex;
		justify-content: center;
	}

	.mobile-logo .logo-text {
		font-size: 14px;
		font-weight: 800;
	}

	/* Tablet Logo */
	.tablet-logo-section {
		display: flex;
		justify-content: center;
		padding: 8px 0;
		border-bottom: 1px solid rgba(51, 65, 85, 0.3);
		margin-bottom: 8px;
	}

	.tablet-logo .logo-text {
		font-size: 18px;
	}

	.tablet-logo i {
		font-size: 22px;
	}

	/* Divider */
	.nav-divider {
		display: flex;
		align-items: center;
		color: #64748b;
		padding: 0 16px;
		font-size: 16px;
		opacity: 0.6;
	}

	/* Navigation Actions */
	.nav-actions {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-left: 8px;
	}

	/* Search Box */
	.nav-search-container {
		position: relative;
	}

	.nav-search-box {
		display: flex;
		background: rgba(15, 23, 42, 0.6);
		border: 1px solid #475569;
		border-radius: 15px;
		overflow: hidden;
		transition: all 0.3s ease;
		min-width: 200px;
	}

	.nav-search-box:focus-within {
		border-color: #38bdf8;
		box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.2);
	}

	.nav-search-box input {
		flex: 1;
		padding: 8px 12px;
		background: transparent;
		border: none;
		color: #e2e8f0;
		outline: none;
		font-size: 13px;
	}

	.nav-search-box input::placeholder {
		color: #94a3b8;
	}

	.nav-search-btn {
		background: transparent;
		border: none;
		color: #94a3b8;
		padding: 8px 12px;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.nav-search-btn:hover {
		color: #38bdf8;
	}

	/* Action Buttons */
	.nav-action-btn {
		display: flex;
		align-items: center;
		gap: 6px;
		background: transparent;
		border: 1px solid #475569;
		color: #cbd5e1;
		padding: 8px 12px;
		border-radius: 15px;
		cursor: pointer;
		transition: all 0.3s ease;
		position: relative;
		white-space: nowrap;
		font-size: 13px;
		font-weight: 500;
	}

	.nav-action-btn:hover {
		border-color: #38bdf8;
		background: rgba(56, 189, 248, 0.1);
		color: #f1f5f9;
	}

	.nav-action-btn i {
		font-size: 12px;
	}

	/* Dropdown Menu */
	.dropdown-menu {
		position: absolute;
		left: 50%;
		margin-left: -90px; /* Half of min-width (180px / 2) to center */
		top: 100%;
		background: #0f172a;
		border: 1px solid #334155;
		border-radius: 8px;
		min-width: 180px;
		box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
		z-index: 50;
		padding: 8px;
		animation: slideDown 0.2s ease-out;
		margin-top: 8px;
	}

	.dropdown-menu a {
		display: block;
		color: #cbd5e1;
		text-decoration: none;
		padding: 8px 12px;
		border-radius: 6px;
		transition: all 0.2s ease;
		font-size: 13px;
	}

	.dropdown-menu a:hover {
		color: #38bdf8;
		background: rgba(56, 189, 248, 0.1);
	}

	@keyframes slideDown {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* Add subtle glow effect */
	.navbar-container::before {
		content: '';
		position: absolute;
		inset: -1px;
		background: linear-gradient(45deg, rgba(220, 38, 38, 0.1), transparent, rgba(220, 38, 38, 0.1));
		border-radius: 25px;
		z-index: -1;
	}

	/* Enhanced animations for liquid glass effect */
	@keyframes bounce-in {
		0% {
			transform: translateX(var(--target-x, 0)) scale(0.8);
		}
		50% {
			transform: translateX(var(--target-x, 0)) scale(1.05);
		}
		100% {
			transform: translateX(var(--target-x, 0)) scale(1);
		}
	}

	/* Mobile Layout Styles */
	.mobile-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
		padding: 8px;
	}

	.mobile-menu-toggle {
		display: flex;
		align-items: center;
		justify-content: center;
		background: transparent;
		border: 1px solid #475569;
		color: #cbd5e1;
		padding: 8px;
		border-radius: 10px;
		cursor: pointer;
		font-size: 16px;
		transition: all 0.2s ease;
		margin-right: 10px;
	}

	.mobile-menu-toggle:hover {
		border-color: #38bdf8;
		color: #38bdf8;
	}

	.mobile-actions {
		display: flex;
		gap: 8px;
	}

	.mobile-action {
		padding: 8px 10px !important;
		font-size: 14px;
	}

	.mobile-menu {
		position: absolute;
		top: 100%;
		left: 0;
		right: 0;
		background: rgba(15, 23, 42, 0.95);
		border: 1px solid #334155;
		border-radius: 0 0 12px 12px;
		backdrop-filter: blur(20px);
		z-index: 100;
		padding: 16px;
		animation: slideDown 0.3s ease-out;
	}

	.mobile-nav-item {
		display: block !important;
		width: 100%;
		margin-bottom: 8px;
		text-align: left;
		padding: 12px 16px !important;
		border-radius: 8px !important;
		background: rgba(30, 41, 59, 0.6);
		border: 1px solid transparent;
	}

	.mobile-nav-item:hover {
		background: rgba(56, 189, 248, 0.1);
		border-color: #38bdf8;
	}

	.mobile-nav-item.active {
		background: rgba(56, 189, 248, 0.2);
		border-color: #38bdf8;
	}

	/* Tablet Layout Styles */
	.tablet-layout {
		display: flex;
		flex-direction: column;
		width: 100%;
		gap: 12px;
		padding: 8px;
	}

	.tablet-nav-section {
		position: relative;
		display: flex;
		align-items: center;
		gap: 4px;
		justify-content: center;
		background: rgba(30, 41, 59, 0.6);
		border-radius: 15px;
		padding: 6px;
		min-height: 48px;
	}

	.tablet-selector {
		position: absolute;
		top: 6px;
		left: 6px;
		height: calc(100% - 12px);
		background: linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%);
		border-radius: 12px;
		transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
		z-index: 1;
		box-shadow: 0 2px 10px rgba(56, 189, 248, 0.4);
	}

	.tablet-nav-item {
		padding: 10px 16px !important;
		font-size: 13px !important;
		z-index: 2;
		position: relative;
	}

	.tablet-actions-section {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 12px;
		background: rgba(30, 41, 59, 0.4);
		border-radius: 15px;
		padding: 8px 16px;
		min-height: 48px;
	}

	.tablet-search {
		min-width: 200px;
	}

	.tablet-action {
		padding: 10px 16px;
		font-size: 13px;
	}

	/* Layout Mode Classes */
	.navbar-container.tablet-mode {
		flex-direction: column;
		padding: 12px;
		border-radius: 20px;
		min-height: auto;
	}

	.navbar-container.mobile-mode {
		flex-direction: column;
		padding: 8px;
		border-radius: 16px;
		position: relative;
	}

	/* Responsive design */
	@media (max-width: 768px) {
		.navbar-container {
			gap: 2px;
			padding: 4px;
		}
		
		.nav-item {
			padding: 10px 16px;
			font-size: 13px;
		}
		
		.selector {
			top: 4px;
			left: 4px;
			height: calc(100% - 8px);
		}
	}

	@media (max-width: 480px) {
		.nav-item {
			padding: 8px 12px;
			font-size: 12px;
		}
	}

	/* Additional responsive design for new elements */
	@media (max-width: 1024px) {
		.nav-search-box {
			min-width: 150px;
		}
		
		.nav-action-btn span {
			display: none;
		}
	}

	@media (max-width: 768px) {
		.nav-actions {
			gap: 4px;
		}
		
		.nav-search-box {
			min-width: 120px;
		}
		
		.nav-divider {
			padding: 0 8px;
		}
	}

	@media (max-width: 480px) {
		.nav-actions {
			position: relative;
		}
		
		.nav-search-box {
			min-width: 100px;
		}
		
		.nav-action-btn {
			padding: 6px 8px;
			font-size: 12px;
		}
	}

	@media (max-width: 320px) {
		.nav-divider {
			padding: 0 4px;
			font-size: 14px;
		}
		
		.nav-search-box {
			min-width: 80px;
		}
		
		.nav-search-box input {
			padding: 6px 8px;
			font-size: 12px;
		}
		
		.nav-action-btn {
			padding: 4px 6px;
		}
		
		.mobile-logo .logo-text {
			font-size: 12px;
		}
		
		.mobile-logo .logo-link i {
			font-size: 16px;
		}
	}

	/* Logo responsive adjustments */
	@media (max-width: 1024px) {
		.desktop-logo {
			margin-right: 16px;
		}
		
		.desktop-logo .logo-text {
			font-size: 15px;
		}
	}

	@media (max-width: 900px) {
		.desktop-logo {
			margin-right: 12px;
		}
		
		.desktop-logo .logo-text {
			display: none;
		}
		
		.desktop-logo .logo-link i {
			font-size: 24px;
		}
	}
</style>