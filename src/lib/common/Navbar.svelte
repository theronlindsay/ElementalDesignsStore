<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { Button } from '$lib';
	import { goto } from '$app/navigation';

	// ============================================
	// TYPES & INTERFACES
	// ============================================
	interface NavItem {
		id: string;
		label: string;
		href: string;
		icon?: string;
		action?: () => void; // For non-navigation items
		dropdown?: { label: string; href: string }[];
	}

	// ============================================
	// COMPONENT PROPS & STATE
	// ============================================
	// Navigation items - can include route links, actions, and dropdown menus
	let { items = [
		{ id: 'home', label: 'Home', href: '/', icon: undefined },
		{ id: 'jewelry', label: 'Jewelry', href: '/search#jewelry' },
		{ id: 'armor', label: 'Armor', href: '/search#armor' },
		{ id: 'laser', label: 'Laser Engraving', href: '/search#laser' },
		{ id: 'more', label: 'More', href: '/search#more' },
		{ id: 'about', label: 'About', href: '/about' },
		{ id: 'account', label: 'Account', href: '#', action: () => {} }, // Dropdown, no navigation
		{ id: 'cart', label: 'Cart', href: '/cart', action: () => goto('/cart') }, // Custom action
	] as NavItem[] } = $props();

	// Reactive state variables (Svelte 5 $state rune)
	let activeItem = $state(items.find(item => item.href === '/')?.id || items[0]?.id);
	let visuallyActiveItem = $state<string>(''); // Delayed boldness for animation smoothness
	let selectorElement = $state<HTMLDivElement>();
	let navElement = $state<HTMLElement>();
	let searchContainerElement = $state<HTMLDivElement>(); // Reference to search box
	let itemElements: { [key: string]: HTMLAnchorElement | HTMLButtonElement } = {};

	// Responsive layout state
	let screenWidth = $state(0);
	let isMobileMode = $state(false);
	let isWrappedMode = $state(false);
	let isMobileMenuOpen = $state(false);

	// Interactive state
	let showAccountMenu = $state(false);
	let isAccountMenuSticky = $state(false); // Stays open when clicked
	let isHoveringOverMenu = $state(false); // Track hovering over the dropdown
	let hasActiveSearch = $state(false); // Track if a search query is active
	let searchInput = $state('');
	// ============================================
	// CONSTANTS
	// ============================================
	const MOBILE_BREAKPOINT = 450;
	const WRAP_BREAKPOINT = 980;

	// ============================================
	// EFFECTS: Sync state with page changes
	// ============================================
	// Update search input from URL query parameter
	$effect(() => {
		searchInput = page.url.searchParams.get('q') || '';
		hasActiveSearch = !!searchInput;
	});

	// Update active item based on current URL path/hash
	$effect(() => {
		const currentPath = page.url.pathname;
		const currentHash = page.url.hash;
		const searchQuery = page.url.searchParams.get('q');

		let matchedItemId: string | null = null;

		// If on search route with a query parameter, don't highlight any nav item
		// (the search box will be highlighted via hasActiveSearch instead)
		if (currentPath === '/search' && searchQuery) {
			matchedItemId = null;
		}
		// Check if on any account route
		else if (currentPath.startsWith('/account')) {
			matchedItemId = 'account';
		} else {
			// Match other nav items
			for (const item of items) {
				// Exact path match
				if (item.href === currentPath) {
					matchedItemId = item.id;
					break;
				}

				// Path + hash match (for search routes with hash navigation)
				if (item.href === currentPath + currentHash) {
					matchedItemId = item.id;
					break;
				}

				// Nested route match (e.g., /search for /search/results)
				if (currentPath.startsWith(item.href) && item.href !== '/') {
					matchedItemId = item.id;
				}
			}
		}

		// Update active item if we found a match
		if (matchedItemId) {
			activeItem = matchedItemId;
			visuallyActiveItem = matchedItemId;
			setTimeout(() => moveSelector(matchedItemId!), 50);
		}
	});

	// ============================================
	// COMPUTED & REACTIVE VALUES
	// ============================================
	// Update responsive layout based on screen width
	$effect(() => {
		isMobileMode = screenWidth <= MOBILE_BREAKPOINT;
		isWrappedMode = screenWidth > MOBILE_BREAKPOINT && screenWidth <= WRAP_BREAKPOINT;
		
		// Only hide selector in mobile mode, keep it visible in wrapped mode
		if (selectorElement && isMobileMode) {
			selectorElement.style.display = 'none';
		} else if (selectorElement) {
			selectorElement.style.display = '';
		}
		
		// Reposition selector when layout changes
		if (!isMobileMode && activeItem) {
			setTimeout(() => moveSelector(activeItem), 50);
		}
	});

	// ============================================
	// FUNCTIONS
	// ============================================
	// Helper to find item by ID
	function getItem(id: string): NavItem | undefined {
		return items.find(item => item.id === id);
	}

	// Animate selector to target nav item position
	function moveSelector(targetId: string) {
		if (!selectorElement || !itemElements[targetId]) return;

		const targetElement = itemElements[targetId];
		const wrapperElement = selectorElement.parentElement;
		if (!wrapperElement) return;

		const wrapperRect = wrapperElement.getBoundingClientRect();
		const targetRect = targetElement.getBoundingClientRect();

		// Calculate position relative to wrapper with smooth animation
		const offsetX = targetRect.left - wrapperRect.left;
		const offsetY = targetRect.top - wrapperRect.top;
		const width = targetRect.width;
		const height = targetRect.height;

		// In wrapped mode, selector needs to move with items on different rows
		selectorElement.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
		selectorElement.style.width = `${width}px`;
		selectorElement.style.height = `${height}px`;
	}

	// Handle navigation item click
	function handleItemClick(itemId: string, item: NavItem) {
		// Update active state immediately for all items
		activeItem = itemId;
		moveSelector(itemId);

		// Delay visual boldness to sync with animation (400ms cubic-bezier)
		setTimeout(() => {
			visuallyActiveItem = itemId;
		}, 300);

		// If item has a custom action (e.g., cart button navigation), run it after selector updates
		if (item.action) {
			item.action();
		}
	}

	// Handle search form submission
	function handleSearch(event: Event) {
		event.preventDefault();
		const query = searchInput.trim();

		if (query) {
			// Use goto for SPA navigation or window.location for full navigation
			goto(`/search?q=${encodeURIComponent(query)}`);
		}
	}

	// Handle search input keypress (Enter key)
	function handleSearchKeypress(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			handleSearch(event as Event);
		}
	}

	// Toggle mobile menu visibility
	function toggleMobileMenu() {
		isMobileMenuOpen = !isMobileMenuOpen;
	}

	// ============================================
	// LIFECYCLE
	// ============================================
	onMount(() => {
		// Initialize responsive layout
		screenWidth = window.innerWidth;

		// Position selector on active item after render
		setTimeout(() => {
			moveSelector(activeItem);
			visuallyActiveItem = activeItem;
		}, 50);

		// Handle window resize events
		const handleResize = () => {
			screenWidth = window.innerWidth;

			// Close mobile menu when resizing to desktop
			if (!isMobileMode) {
				isMobileMenuOpen = false;
			}

			// Update selector position
			setTimeout(() => moveSelector(activeItem), 100);
		};

		// Close sticky account menu when clicking outside
		const handleDocumentClick = (event: MouseEvent) => {
			const accountButton = itemElements['account'];
			const target = event.target as Node;
			
			// If sticky menu is open and click is outside the account button/menu, close it
			if (isAccountMenuSticky && accountButton && !accountButton.contains(target)) {
				isAccountMenuSticky = false;
				showAccountMenu = false;
			}
		};

		window.addEventListener('resize', handleResize);
		document.addEventListener('click', handleDocumentClick);
		
		return () => {
			window.removeEventListener('resize', handleResize);
			document.removeEventListener('click', handleDocumentClick);
		};
	});
</script>

<!-- Debug indicator -->
<!-- <div class="debug-indicator">
	{#if isMobileMode}
		<span class="mode-label mobile">Mobile Mode (≤{MOBILE_BREAKPOINT}px)</span>
	{:else if isWrappedMode}
		<span class="mode-label tablet">Wrapped Mode (≤{WRAP_BREAKPOINT}px)</span>
	{:else}
		<span class="mode-label desktop">Desktop Mode (>{WRAP_BREAKPOINT}px)</span>
	{/if}
	<span class="screen-width">Screen: {screenWidth}px</span>
</div> -->

<nav class="navbar" bind:this={navElement}>
	<div class="navbar-container" class:mobile-mode={isMobileMode} class:wrapped-mode={isWrappedMode}>
		
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

					<button class="mobile-menu-toggle" onclick={toggleMobileMenu} aria-label="Toggle menu">
						<i class="fas {isMobileMenuOpen ? 'fa-times' : 'fa-bars'}"></i>
					</button>
					
					<!-- Mobile Actions (always visible) -->
					<div class="mobile-actions">
						<!-- Search button -->
						<button 
							class="btn mobile-action" 
							type="button"
							aria-label="Search Products"
							onclick={() => {
								// Focus search input or toggle search visibility
								const searchInput = document.querySelector('.nav-search-box input') as HTMLInputElement;
								if (searchInput) searchInput.focus();
							}}
						>
							<i class="fas fa-search"></i>
						</button>
						
						<!-- Account button -->
						<button 
							class="btn mobile-action" 
							type="button"
							aria-label="User Account"
							onclick={() => goto('/account/profile')}
						>
							<i class="fas fa-user"></i>
						</button>
						
						<!-- Cart button -->
						<button 
							class="btn mobile-action" 
							type="button"
							aria-label="Shopping Cart"
							onclick={() => goto('/cart')}
						>
							<i class="fas fa-shopping-cart"></i>
						</button>
					</div>
				</div>
			</div>
			
			<!-- Mobile Menu (collapsible) -->
			{#if isMobileMenuOpen}
				<div class="mobile-menu">
					{#each items.filter(item => item.id !== 'account' && item.id !== 'cart') as item}
						<a
							bind:this={itemElements[item.id]}
							href={item.href}
							class="nav-item mobile-nav-item {visuallyActiveItem === item.id ? 'active' : ''}"
							onclick={(e) => {
								// Don't prevent default - let SvelteKit handle navigation
								handleItemClick(item.id, item);
								isMobileMenuOpen = false;
							}}
						>
							{item.label}
						</a>
					{/each}
				</div>
			{/if}
		{:else}
			<!-- Desktop Layout -->
			
			<!-- Nav Items Section (with selector) -->
			<div class="nav-items-wrapper">
				<div 
					class="selector" 
					bind:this={selectorElement}
				></div>
				
				{#each items.filter(item => item.id !== 'account' && item.id !== 'cart') as item}
					<a
						bind:this={itemElements[item.id]}
						href={item.href}
						class="nav-item {visuallyActiveItem === item.id ? 'active' : ''}"
						onclick={(e) => {
							// Don't prevent default - let navigation happen naturally
							handleItemClick(item.id, item);
						}}
					>
						{item.label}
					</a>
				{/each}

				<!-- Search Bar Section - Inside wrapper so selector can highlight it -->
				<div class="nav-divider">
					<i class="fas fa-grip-lines-vertical"></i>
				</div>

				<div class="nav-search-container {hasActiveSearch ? 'active' : ''}" bind:this={searchContainerElement}>
					<form class="nav-search-box" onsubmit={handleSearch}>
						<input 
							type="text" 
							placeholder="Search products..." 
							bind:value={searchInput}
							onkeypress={handleSearchKeypress}
						/>
						<button type="submit" class="nav-search-btn" aria-label="Search Products">
							<i class="fas fa-search"></i>
						</button>
					</form>
				</div>
			</div>

			<!-- Action Items (Account & Cart) -->
			<div class="nav-actions">
				<!-- Account Dropdown Container with unified hitbox -->
				<div
					class="account-dropdown-container"
					role="presentation"
					onmouseenter={() => {
						if (!isAccountMenuSticky) showAccountMenu = true;
						isHoveringOverMenu = true;
					}}
					onmouseleave={() => {
						isHoveringOverMenu = false;
						if (!isAccountMenuSticky) showAccountMenu = false;
					}}
				>
					<button
						bind:this={itemElements['account']}
						class="nav-item nav-action-btn {(visuallyActiveItem === 'account' || showAccountMenu || isHoveringOverMenu) ? 'active' : ''}"
						onclick={() => {
							const item = getItem('account');
							if (item) {
								handleItemClick('account', item);
								// Toggle sticky mode on click
								isAccountMenuSticky = !isAccountMenuSticky;
								showAccountMenu = isAccountMenuSticky;
							}
						}}
						type="button"
						aria-label="Account Menu"
					>
						<i class="fas fa-user"></i>
						<span>Account</span>
					</button>


					<div 
						class="dropdown-menu account-menu {(showAccountMenu || isHoveringOverMenu) ? 'visible' : ''}"
						role="menu"
						tabindex="-1"
					>
						<a href="/account/login" role="menuitem" onclick={(e) => {
							// If not sticky, keep menu visible for better UX
							if (!isAccountMenuSticky) {
								e.preventDefault();
								goto('/account/login');
								showAccountMenu = false;
								isHoveringOverMenu = false;
							}
						}}>Login</a>
						<a href="/account/register" role="menuitem" onclick={(e) => {
							if (!isAccountMenuSticky) {
								e.preventDefault();
								goto('/account/register');
								showAccountMenu = false;
								isHoveringOverMenu = false;
							}
						}}>Register</a>
						<a href="/account/profile" role="menuitem" onclick={(e) => {
							if (!isAccountMenuSticky) {
								e.preventDefault();
								goto('/account/profile');
								showAccountMenu = false;
								isHoveringOverMenu = false;
							}
						}}>My Profile</a>
						<a href="/account/orders" role="menuitem" onclick={(e) => {
							if (!isAccountMenuSticky) {
								e.preventDefault();
								goto('/account/orders');
								showAccountMenu = false;
								isHoveringOverMenu = false;
							}
						}}>My Orders</a>
					</div>
				</div>				<!-- Shopping Cart Button -->
				<button
					bind:this={itemElements['cart']}
					class="nav-item nav-action-btn {visuallyActiveItem === 'cart' ? 'active' : ''}"
					onclick={() => {
						const item = getItem('cart');
						if (item) handleItemClick('cart', item);
					}}
					type="button"
					aria-label="Shopping Cart"
				>
					<i class="fas fa-shopping-cart"></i>
					<span>Cart</span>
				</button>
			</div>
		{/if}
	</div>
</nav>

<style lang="scss">
	// ============================================
	// SCSS VARIABLES & BREAKPOINTS
	// ============================================
	$mobile-breakpoint: 450px;
	$wrap-breakpoint: 936px;
	// ============================================
	// MAIN NAVBAR LAYOUT
	// ============================================
	.navbar {
		position: sticky;
		top: 0;
		z-index: 1000;
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 1rem;
		width: fit-content;
		max-width: 85vw;
		margin: 0 auto;
		background: transparent;
		font-family: system-ui, -apple-system, sans-serif;
	}

	.navbar-container {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-wrap: nowrap;
		background: var(--nav-bg);
		border-radius: 25px;
		padding: 6px;
		gap: 4px;
		box-shadow: var(--glass-shadow);
		backdrop-filter: blur(20px);
		border: 1px solid #3d3650;
		transition: padding 0.3s ease, gap 0.3s ease, border-radius 0.3s ease;
		width: fit-content;

		&::before {
			content: '';
			position: absolute;
			inset: -1px;
			background: linear-gradient(45deg, rgba(167, 139, 250, 0.1), transparent, rgba(167, 139, 250, 0.1));
			border-radius: 25px;
			z-index: -1;
		}
	}

	.navbar-container.mobile-mode {
		flex-direction: column;
		padding: 8px;
		border-radius: 16px;
	}

	// ============================================
	// NAV ITEMS & SELECTOR
	// ============================================
	.nav-items-wrapper {
		position: relative;
		display: flex;
		align-items: center;
		gap: 4px;
	}

	/* Animated selector background that follows active item */
	.selector {
		position: absolute;
		top: 0;
		left: 0;
		height: 100%;
		background: linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%);
		border-radius: 12px;
		transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
		z-index: 1;
		box-shadow: 0 2px 10px rgba(167, 139, 250, 0.4);
	}

	.nav-item {
		position: relative;
		z-index: 2;
		background: none;
		border: none;
		color: var(--muted);
		padding: 0.5rem;
		border-radius: 20px;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		white-space: nowrap;
		min-width: fit-content;
		text-decoration: none;
		display: inline-block;

		&:hover {
			color: #f3f4f6;
			transform: translateY(-1px);
		}

		&.active {
			color: #fff;
			font-weight: 700;
		}

		&:focus {
			outline: none;
		}
	}

	.nav-action-btn {
		position: relative;
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
	}

	// ============================================
	// SEARCH & DIVIDERS
	// ============================================
	.nav-divider {
		display: flex;
		align-items: center;
		color: #64748b;
		padding: 0 16px;
		font-size: 16px;
		opacity: 0.6;
		transition: padding 0.3s ease;
	}

	.nav-search-container {
		position: relative;
		display: flex;
		align-items: center;
		gap: 8px;
		transition: gap 0.3s ease;

		&.active .nav-search-box {
			box-shadow: 0 0 0 2px rgba(167, 139, 250, 0.3);
			border-color: var(--accent);
		}
	}

	.nav-search-box {
		display: flex;
		overflow: hidden;
		transition: all 0.3s ease;
		min-width: 200px;
		padding: 0;
		background: var(--panel-bg);
		border: 1px solid var(--panel-border);
		border-radius: 12px;
		backdrop-filter: blur(10px);

		&:focus-within {
			box-shadow: 0 0 0 2px rgba(167, 139, 250, 0.2);
			border-color: var(--accent);
		}

		input {
			flex: 1;
			padding: 8px 12px;
			background: transparent;
			border: none;
			color: #e8e4f3;
			outline: none;
			font-size: 13px;

			&::placeholder {
				color: var(--muted-2);
			}
		}
	}

	.nav-search-btn {
		background: transparent;
		border: none;
		color: var(--muted-2);
		padding: 8px 12px;
		cursor: pointer;
		transition: all 0.2s;

		&:hover {
			color: var(--accent);
		}
	}

	.nav-actions {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-left: 8px;
	}

	// ============================================
	// LOGOS & LINKS
	// ============================================
	.logo-link {
		display: flex;
		align-items: center;
		gap: 8px;
		text-decoration: none;
		color: #f3f4f6;
		font-weight: 700;
		transition: all 0.2s ease;
		white-space: nowrap;

		&:hover {
			color: var(--accent);
			transform: translateY(-1px);
		}
	}

	// ============================================
	// DROPDOWN MENUS
	// ============================================
	.account-dropdown-container {
		position: relative;
		display: inline-block;
		/* Extend hover area downward to cover gap between button and menu */
		padding-bottom: 8px;
		margin-bottom: -8px;
	}

	.dropdown-menu {
		position: absolute;
		left: 50%;
		margin-left: -90px;
		top: 100%;
		min-width: 180px;
		padding: 8px;
		margin-top: 0;
		background: var(--panel-bg);
		border: 1px solid var(--panel-border);
		border-radius: 12px;
		backdrop-filter: blur(10px);
		box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
		z-index: 50;
		opacity: 0;
		visibility: hidden;
		transform: translateY(-10px);
		transition: opacity 0.3s ease-out, visibility 0.3s ease-out, transform 0.3s ease-out;
		pointer-events: none;

		&.visible {
			opacity: 1;
			visibility: visible;
			transform: translateY(0);
			pointer-events: auto;
		}

		a {
			display: block;
			color: var(--muted);
			text-decoration: none;
			padding: 8px 12px;
			border-radius: 6px;
			transition: all 0.2s;
			font-size: 13px;
			cursor: pointer;

			&:hover {
				color: var(--accent);
				background: rgba(167, 139, 250, 0.1);
			}
		}
	}

	// ============================================
	// MOBILE LAYOUT
	// ============================================
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
		border: 1px solid var(--panel-border);
		color: var(--muted);
		padding: 8px;
		border-radius: 10px;
		cursor: pointer;
		font-size: 16px;
		transition: all 0.2s;
		margin-right: 10px;

		&:hover {
			border-color: var(--accent);
			color: var(--accent);
		}
	}

	.mobile-actions {
		display: flex;
		gap: 8px;
	}

	.mobile-menu {
		position: absolute;
		top: 100%;
		left: 0;
		right: 0;
		background: var(--panel-bg);
		border: 1px solid var(--panel-border);
		border-radius: 0 0 12px 12px;
		backdrop-filter: blur(10px);
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
		border: 1px solid transparent;
		text-decoration: none;
		color: var(--muted) !important;
		font-weight: 600;
		font-size: 14px;
		transition: all 0.2s ease;

		&:hover {
			background: rgba(167, 139, 250, 0.1);
			border-color: var(--accent);
			color: #f3f4f6 !important;
			transform: translateY(-1px);
		}

		&.active {
			background: rgba(167, 139, 250, 0.2);
			border-color: var(--accent);
			color: #fff !important;
			font-weight: 700;
		}
	}

	// ============================================
	// ANIMATIONS
	// ============================================
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

	// ============================================
	// RESPONSIVE BREAKPOINTS
	// ============================================
	/* Wrapped layout: Search bar wraps to second row, compact items */
	@media (max-width: $wrap-breakpoint) {
		.navbar {
			padding: 0.6rem;
			max-width: fit-content;
		}

		.navbar-container {
			padding: 1.5em;
			gap: 3px;
			width: min-content;
			flex-wrap: wrap;
		}

		.nav-items-wrapper {
			gap: 3px;
		}

		.nav-item {
			padding: 0.4rem;
			font-size: 13px;
		}

		.nav-divider {
			display: none;
		}

		.nav-search-container {
			order: 10;
			width: fit-content;
			display: flex;
			justify-content: center;
			margin-top: 4px;
			gap: 6px;
		}

		.nav-search-box {
			min-width: auto;
			width: fit-content;

			input {
				padding: 7px 10px;
				font-size: 12px;
				width: 200px;
			}
		}

		.nav-actions {
			gap: 6px;
			margin-left: 6px;
		}
	}

	/* Mobile layout: Hamburger menu, vertical layout */
	@media (max-width: $mobile-breakpoint) {
		.navbar {
			padding: 0.4rem;
			max-width: 98vw;
		}

		.navbar-container {
			padding: 3px;
			gap: 2px;
			width: 80vw;
		}
	}


</style>