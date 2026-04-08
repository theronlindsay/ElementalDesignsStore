<script>
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import OrderModal from './OrderModal.svelte';
	import defaultLogo from '$lib/assets/LogoTextAbove.png';

	// Navbar Routes
	let { branding = null, links = [] } = $props();

	// Map incoming links and append fixed required links
	let baseItems = $derived([
		...links.map((link) => ({ ...link, active: false })),
		{ id: 'cart', label: 'Cart', href: '/cart', active: false }
	]);

	let items = $state([]);
	$effect(() => {
		// Only sync from baseItems if our local array is empty or length changed
		if (items.length !== baseItems.length) {
			items = [...baseItems];
		}
	});

	let logoSrc = $derived(branding?.logoPrimaryUrl || defaultLogo);
	let logoAlt = $derived(branding?.logoAlt || 'Elemental Designs Logo');

	let activeItem = $state(null);
	let visuallyActiveItem = $state(null); // Separate state for visual boldness
	let selectorElement = $state(null);
	let navElement;
	let itemElements = $state({});

	$effect(() => {
		if (activeItem !== null) {
			return;
		}

		const initialActiveItem = items.find((item) => item.active)?.id || items[0]?.id || null;
		activeItem = initialActiveItem;
		visuallyActiveItem = initialActiveItem;
	});

	// Search State
	let searchInput = $state('');

	function handleSearch(e) {
		if (e) e.preventDefault();
		if (searchInput.trim()) {
			goto(resolve(`/search?q=${encodeURIComponent(searchInput.trim())}`));
		}
	}

	function handleSearchKeypress(e) {
		if (e.key === 'Enter') {
			handleSearch(e);
		}
	}

	// Order Modal state
	let isOrderModalOpen = $state(false);

	// Search state - reactive to URL changes
	let isSearchActive = $state(false); // Track if we're on a search results page
	let currentPath = $derived(page.url.pathname);
	let currentHash = $derived(page.url.hash);
	let currentSearchParams = $derived(page.url.searchParams);

	$effect(() => {
		const urlQuery = currentSearchParams.get('q') || '';
		isSearchActive = currentPath === '/search' && urlQuery.length > 0;
	});

	// Update active item based on current URL
	$effect(() => {
		let matchedItemId = null;

		// Special case: if on /search with a text query, don't highlight any nav item
		const isSearchWithQuery = currentPath === '/search' && currentSearchParams.has('q');

		if (isSearchWithQuery) {
			// Search bar owns the highlight state; clear nav-item selector/active styles.
			visuallyActiveItem = null;
			activeItem = null;
			items = items.map((item) => ({ ...item, active: false }));
			return;
		}

		// Build the full URL (path + query + hash) for comparison
		const currentSearch = currentSearchParams.toString();
		const currentFullUrl = currentPath + (currentSearch ? '?' + currentSearch : '') + currentHash;

		for (const item of items) {
			// Full URL match (handles /search?tags=jewelry style links)
			if (item.href === currentFullUrl) {
				matchedItemId = item.id;
				break;
			}

			// Exact path match
			if (item.href === currentPath) {
				matchedItemId = item.id;
				break;
			}

			// Path + hash match
			if (item.href === currentPath + currentHash) {
				matchedItemId = item.id;
				break;
			}

			// Prefix match for nested routes
			if (currentPath.startsWith(item.href) && item.href !== '/' && !item.href.includes('?')) {
				matchedItemId = item.id;
			}
		}

		if (matchedItemId) {
			if (matchedItemId !== activeItem) {
				activeItem = matchedItemId;
				items = items.map((item) => ({
					...item,
					active: item.id === matchedItemId
				}));
			}
			visuallyActiveItem = matchedItemId;
			// Always reposition after navigation — layout may have shifted
			setTimeout(() => moveSelector(matchedItemId), 100);
		} else if (!matchedItemId && !isSearchWithQuery && visuallyActiveItem !== null) {
			visuallyActiveItem = null;
			items = items.map((item) => ({
				...item,
				active: false
			}));
		}
	});

	// Responsive state management
	let screenWidth = $state(0);
	let isMobileMenuOpen = $state(false);
	let isMobileMode = $state(false);
	let isWrappedMode = $state(false);

	// Breakpoints
	const MOBILE_BREAKPOINT = 566;
	const WRAP_BREAKPOINT = 980;

	// Update layout based on screen size
	function updateResponsiveLayout() {
		isMobileMode = screenWidth <= MOBILE_BREAKPOINT;
		isWrappedMode = screenWidth > MOBILE_BREAKPOINT && screenWidth <= WRAP_BREAKPOINT;
	}

	// Toggle mobile menu
	function toggleMobileMenu() {
		isMobileMenuOpen = !isMobileMenuOpen;
	}

	// Function to move the selector to the active item
	function moveSelector(targetId) {
		if (!selectorElement || !itemElements[targetId]) return;

		const targetElement = itemElements[targetId];
		const wrapperElement = selectorElement.parentElement;
		if (!wrapperElement) return;

		const wrapperRect = wrapperElement.getBoundingClientRect();
		const targetRect = targetElement.getBoundingClientRect();

		// Calculate position relative to the wrapper
		const offsetX = targetRect.left - wrapperRect.left;
		const width = targetRect.width;

		// Apply the transform with bounce animation
		selectorElement.style.transform = `translateX(${offsetX}px)`;
		selectorElement.style.width = `${width}px`;
	}

	// Handle item click
	function handleItemClick(itemId) {
		activeItem = itemId;
		moveSelector(itemId);

		// Delay the visual boldness change until near the end of animation (300ms out of 400ms)
		setTimeout(() => {
			visuallyActiveItem = itemId;
		}, 300);

		// Update items array
		items = items.map((item) => ({
			...item,
			active: item.id === itemId
		}));
	}

	// Handle custom order click - opens modal instead of navigating
	function handleCustomOrderClick(e) {
		e.preventDefault();
		isOrderModalOpen = true;
		handleItemClick('custom');
	}

	// Handle OrderModal save
	function handleOrderModalSave() {
		isOrderModalOpen = false;
	}

	// Handle OrderModal cancel
	function handleOrderModalCancel() {
		isOrderModalOpen = false;
	}

	// Initialize selector position and responsive behavior
	onMount(() => {
		// Set initial screen width
		screenWidth = window.innerWidth;
		updateResponsiveLayout();

		setTimeout(() => {
			// Only move selector and set visual state if there's an active item
			if (visuallyActiveItem !== null && itemElements[visuallyActiveItem]) {
				moveSelector(visuallyActiveItem);
			}
		}, 50);

		// Handle window resize
		const handleResize = () => {
			screenWidth = window.innerWidth;
			updateResponsiveLayout();

			// Close mobile menu on resize to larger screen
			if (!isMobileMode) {
				isMobileMenuOpen = false;
			}

			// Update selector position if we have an active item
			if (visuallyActiveItem !== null) {
				setTimeout(() => moveSelector(visuallyActiveItem), 100);
			}
		};

		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
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
			<div
				class="mobile-header"
				dir="ltr"
				style="display: grid; grid-template-columns: auto minmax(0, 1fr) auto; grid-template-areas: 'menu logo cart' 'search search search'; align-items: center; row-gap: 0.45rem; column-gap: 0.25rem; width: 100%; box-sizing: border-box;"
			>
				<div class="mobile-header-start">
					<button class="mobile-menu-toggle" onclick={toggleMobileMenu} aria-label="Toggle menu">
						<i class="fas {isMobileMenuOpen ? 'fa-times' : 'fa-bars'}" aria-hidden="true"></i>
					</button>
				</div>

				<div class="mobile-logo">
					<a href={resolve('/')} class="logo-link" aria-label="Elemental Designs Home">
						<div class="logo">
							<img src={logoSrc} alt={logoAlt} class="mobile-logo-img" />
						</div>
					</a>
				</div>

				<div class="mobile-header-end">
					<!-- <a href={resolve('/search')} class="mobile-action-btn" aria-label="Search Products">
						<i class="fas fa-search"></i>
					</a> -->
					<a href={resolve('/cart')} class="mobile-action-btn" aria-label="Shopping Cart">
						<i class="fas fa-shopping-cart" aria-hidden="true"></i>
					</a>
				</div>

				<div class="mobile-search-row">
					<form class="mobile-search-box {isSearchActive ? 'active' : ''}" onsubmit={handleSearch}>
						<input
							type="text"
							placeholder="Search products..."
							bind:value={searchInput}
							onkeypress={handleSearchKeypress}
						/>
						<button type="submit" class="mobile-search-btn" aria-label="Search Products">
							<i class="fas fa-search"></i>
						</button>
					</form>
				</div>
			</div>

			<!-- Mobile Menu (collapsible) -->
			{#if isMobileMenuOpen}
				<div class="mobile-menu">
					{#each items as item (item.id)}
						{#if item.id === 'custom'}
							<!-- Mobile Custom Orders: Open Modal Instead of Navigate -->
							<button
								class="nav-item mobile-nav-item {visuallyActiveItem === item.id ? 'active' : ''}"
								onclick={() => {
									handleCustomOrderClick({ preventDefault: () => {} });
									isMobileMenuOpen = false;
								}}
							>
								{item.label}
							</button>
						{:else}
							<a
								bind:this={itemElements[item.id]}
								href={resolve(/** @type {any} */ (item.href))}
								class="nav-item mobile-nav-item {visuallyActiveItem === item.id ? 'active' : ''}"
								onclick={() => {
									handleItemClick(item.id);
									isMobileMenuOpen = false;
								}}
							>
								{item.label}
							</a>
						{/if}
					{/each}
				</div>
			{/if}
		{:else}
			<!-- Desktop Layout -->
			<a href={resolve('/')} class="desktop-logo-link" aria-label="Elemental Designs Home">
				<img src={logoSrc} alt={logoAlt} class="desktop-logo-img" />
			</a>

			<div class="desktop-nav-content">
				<!-- Nav Items Section (with selector) -->
				<div class="nav-items-wrapper">
					<div class="selector {isSearchActive ? 'hidden' : ''}" bind:this={selectorElement}></div>

					{#each items.filter((item) => item.id !== 'cart') as item (item.id)}
						{#if item.id === 'custom'}
							<!-- Custom Orders: Open Modal Instead of Navigate -->
							<button
								bind:this={itemElements[item.id]}
								class="nav-item {visuallyActiveItem === item.id ? 'active' : ''}"
								onclick={handleCustomOrderClick}
							>
								{item.label}
							</button>
						{:else}
							<a
								bind:this={itemElements[item.id]}
								href={resolve(/** @type {any} */ (item.href))}
								class="nav-item {visuallyActiveItem === item.id ? 'active' : ''}"
								onclick={() => handleItemClick(item.id)}
							>
								{item.label}
							</a>
						{/if}
					{/each}
				</div>

				<!-- Divider -->
				<div class="nav-divider">
					<i class="fas fa-grip-lines-vertical"></i>
				</div>

				<!-- Search and Actions (together) -->
				<div class="nav-search-container">
					<form class="nav-search-box {isSearchActive ? 'active' : ''}" onsubmit={handleSearch}>
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

					<!-- Navigation Actions -->
					<div class="nav-actions">	

						<!-- Shopping Cart -->
						<a
							bind:this={itemElements['cart']}
							href={resolve('/cart')}
							class="nav-item {visuallyActiveItem === 'cart' ? 'active' : ''}"
							onclick={() => handleItemClick('cart')}
						>
							<i class="fas fa-shopping-cart"></i>
							<span>Cart</span>
						</a>
					</div>
				</div>
			</div>
		{/if}
	</div>
</nav>

<!-- Order Modal -->
<OrderModal
	isOpen={isOrderModalOpen}
	onSave={handleOrderModalSave}
	onCancel={handleOrderModalCancel}
/>

<style lang="scss">
	/*
	 * BREAKPOINTS (defined in script section):
	 * MOBILE_BREAKPOINT = 566px  - Mobile menu mode
	 * WRAP_BREAKPOINT = 936px    - Search bar wraps to second row
	 */

	// SCSS Variables for breakpoints
	$mobile-breakpoint: 566px;
	$wrap-breakpoint: 936px;

	/* Debug indicator */

	/* Navbar layout */
	.navbar {
		position: sticky; // ✨ Sticks to top when scrolling
		top: 0; // 📌 Position at top of viewport
		z-index: 1000; // 🔝 Ensures it stays above other content
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 0;
		font-family:
			system-ui,
			-apple-system,
			sans-serif;
		width: 100%;
		max-width: 100vw;
		margin: 0 auto 0.5rem;
		background: transparent;
		box-sizing: border-box;
	}

	/* container */
	.navbar-container {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: flex-start;
		flex-wrap: nowrap;
		background: var(--nav-bg);
		border-radius: 0 0 14px 14px;
		padding: 1.2rem 1rem;
		gap: 4px;
		box-shadow: var(--glass-shadow);
		backdrop-filter: blur(20px);
		border: 1px solid #3d3650;
		transition:
			padding 0.3s ease,
			gap 0.3s ease,
			border-radius 0.3s ease;
		width: 100%;
		max-width: 100%;
		min-width: 0;
		box-sizing: border-box;
		margin-bottom: 0.6rem;
	}

	/* common panel helper to DRY-up repeated backgrounds/borders */
	.mobile-nav-item,
	.mobile-menu {
		background: var(--panel-bg);
		border: 1px solid var(--panel-border);
		border-radius: 12px;
		backdrop-filter: blur(10px);
	}

	/* nav items wrapper - contains items and selector */
	.nav-items-wrapper {
		position: relative;
		display: flex;
		align-items: center;
		gap: 4px;
		transition: gap 0.3s ease;
		min-width: 0;
		flex-wrap: wrap;
	}

	/* selector (accented moving highlight) */
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

	.selector.hidden {
		opacity: 0;
		pointer-events: none;
	}

	/* nav items */
	.nav-item {
		position: relative;
		z-index: 2;
		background: none;
		border: none;
		color: var(--muted);
		padding: 0.55rem 0.6rem;
		border-radius: 20px;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		white-space: nowrap;
		min-width: 0;
		text-decoration: none;
		display: inline-block;
	}

	.nav-item:hover {
		color: #f3f4f6;
		transform: translateY(-1px);
	}
	.nav-item.active {
		color: #fff;
		font-weight: 700;
	}
	.nav-item:focus {
		outline: none;
	}

	/* logos */
	.logo-link {
		display: flex;
		align-items: center;
		gap: 8px;
		text-decoration: none;
		color: #f3f4f6;
		font-weight: 700;
		transition: all 0.2s ease;
		white-space: nowrap;
	}
	.logo-link:hover {
		color: var(--accent);
		transform: translateY(-1px);
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

	.navbar-container::before {
		content: '';
		position: absolute;
		inset: -1px;
		background: linear-gradient(
			45deg,
			rgba(167, 139, 250, 0.1),
			transparent,
			rgba(167, 139, 250, 0.1)
		);
		border-radius: 0 0 14px 14px;
		z-index: -1;
	}

	.desktop-logo-link {
		display: flex;
		align-items: center;
		margin-right: 0;
		text-decoration: none;
		flex: 0 0 auto;
	}

	.desktop-nav-content {
		flex: 1 1 auto;
		min-width: 0;
		max-width: min(1000px, 100%);
		margin: 0 auto;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
	}

	.desktop-logo-img {
		display: block;
		height: 92px;
		width: auto;
		max-width: min(440px, 36vw);
	}

	/* Desktop Search and Actions */
	.nav-divider {
		color: var(--muted-2);
		margin: 0 0.5rem;
		opacity: 0.5;
	}

	.nav-search-container {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		min-width: 0;
	}

	.nav-search-box {
		position: relative;
		isolation: isolate;
		display: flex;
		align-items: center;
		background: rgba(0, 0, 0, 0.2);
		border: 1px solid var(--panel-border);
		border-radius: 20px;
		padding: 4px 12px;
		transition: all 0.3s ease;

		/* Selector-like halo for the whole search box when in use */
		&::before {
			content: '';
			position: absolute;
			inset: -2px;
			border-radius: 22px;
			background: linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%);
			opacity: 0;
			transform: scaleX(0.35);
			transform-origin: left center;
			transition:
				opacity 0.25s ease,
				transform 0.35s cubic-bezier(0.22, 0.61, 0.36, 1);
			z-index: 0;
			pointer-events: none;
		}

		&:focus-within,
		&.active {
			background: var(--bg-primary);
			border-color: var(--accent);
			box-shadow:
				0 0 0 2px rgba(167, 139, 250, 0.2),
				0 6px 16px rgba(0, 0, 0, 0.2);
		}

		&:focus-within::before,
		&.active::before {
			opacity: 0.95;
			transform: scaleX(1);
		}

		input {
			position: relative;
			z-index: 1;
			background: transparent;
			border: none;
			color: var(--text-primary);
			font-size: 13px;
			padding: 4px;
			width: 140px;
			transition: width 0.3s ease;

			&:focus {
				outline: none;
				width: 180px;
			}

			&::placeholder {
				color: var(--muted);
			}
		}
	}

	.nav-search-btn {
		position: relative;
		z-index: 1;
		background: transparent;
		border: none;
		color: var(--muted);
		cursor: pointer;
		padding: 4px;
		transition: color 0.2s;

		&:hover {
			color: var(--accent);
		}
	}

	.nav-actions {
		display: flex;
		align-items: center;
		gap: 4px;
	}

	.dropdown-menu {
		position: absolute;
		top: calc(100% + 8px);
		right: 0;
		background: var(--nav-bg);
		border: 1px solid var(--panel-border);
		border-radius: 12px;
		padding: 8px;
		display: flex;
		flex-direction: column;
		gap: 4px;
		min-width: 150px;
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(20px);
		z-index: 100;
		animation: slideDown 0.2s ease-out;

		a {
			color: var(--muted);
			text-decoration: none;
			padding: 8px 12px;
			border-radius: 6px;
			font-size: 13px;
			font-weight: 500;
			transition: all 0.2s;
			text-align: left;

			&:hover {
				background: rgba(167, 139, 250, 0.1);
				color: var(--accent);
			}
		}
	}

	/* mobile — grid + inline style so menu / logo / cart stay one row (survives flex-wrap from wider breakpoints) */
	.navbar-container.mobile-mode .mobile-header {
		display: grid !important;
		grid-template-columns: auto minmax(0, 1fr) auto !important;
		grid-template-areas:
			'menu logo cart'
			'search search search' !important;
		align-items: center !important;
		row-gap: 0.55rem !important;
		column-gap: 0.25rem !important;
		width: 100% !important;
		padding: 10px 4px 12px !important;
		box-sizing: border-box !important;
		direction: ltr !important;
	}

	.mobile-header-start {
		grid-area: menu;
		display: flex;
		align-items: center;
		justify-self: start;
	}

	.mobile-header-end {
		grid-area: cart;
		display: flex;
		align-items: center;
		justify-self: end;
		gap: 8px;
	}

	.mobile-logo {
		grid-area: logo;
		justify-self: stretch;
		place-self: center;
		min-width: 0;
		width: 100%;
		max-width: 100%;
		display: flex;
		justify-content: center;
		align-items: center;

		.logo {
			width: 100%;
			margin-right: 0;
			display: flex;
			justify-content: center;
		}
	}

	.mobile-logo .logo-link {
		width: 100%;
		justify-content: center;
		min-width: 0;
		max-width: 100%;
	}

	.mobile-logo-img {
		display: block;
		width: auto;
		max-width: min(380px, calc(100% - 0.25rem));
		max-height: 100px;
		height: auto;
		margin: 0;
	}

	.mobile-search-row {
		grid-area: search;
		width: 100%;
		display: flex;
		justify-content: center;
	}

	.mobile-search-box {
		display: flex;
		align-items: center;
		width: min(100%, 380px);
		background: rgba(0, 0, 0, 0.22);
		border: 1px solid var(--panel-border);
		border-radius: 14px;
		padding: 0.35rem 0.7rem;
		box-sizing: border-box;
		transition: border-color 0.2s ease, box-shadow 0.2s ease;

		&:focus-within,
		&.active {
			border-color: var(--accent);
			box-shadow: 0 0 0 2px rgba(167, 139, 250, 0.2);
		}

		input {
			flex: 1 1 auto;
			min-width: 0;
			background: transparent;
			border: none;
			color: var(--text-primary);
			font-size: 0.95rem;
			padding: 0.2rem 0.25rem;
			outline: none;

			&::placeholder {
				color: var(--muted);
			}
		}
	}

	.mobile-search-btn {
		background: transparent;
		border: none;
		color: var(--muted);
		cursor: pointer;
		padding: 0.25rem;
		font-size: 1rem;
		line-height: 1;
		transition: color 0.2s ease;

		&:hover {
			color: var(--accent);
		}
	}

	.mobile-menu-toggle {
		display: flex;
		align-items: center;
		justify-content: center;
		background: transparent;
		border: 1px solid var(--panel-border);
		color: var(--muted);
		min-width: 2rem;
		min-height: 2rem;
		width: 2rem;
		height: 2rem;
		padding: 0;
		border-radius: 10px;
		cursor: pointer;
		font-size: 1.05rem;
		line-height: 1;
		transition: all 0.2s;
		flex-shrink: 0;
	}
	.mobile-menu-toggle:hover {
		border-color: var(--accent);
		color: var(--accent);
	}
	.mobile-actions {
		display: flex;
		gap: 8px;
	}

	.mobile-action-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		background: transparent;
		border: 1px solid var(--panel-border);
		color: var(--muted);
		min-width: 2rem;
		min-height: 2rem;
		width: 2rem;
		height: 2rem;
		padding: 0;
		border-radius: 10px;
		cursor: pointer;
		font-size: 1.05rem;
		line-height: 1;
		transition: all 0.2s;
		text-decoration: none;
		flex-shrink: 0;
	}
	.mobile-action-btn:hover {
		border-color: var(--accent);
		color: var(--accent);
	}
	.mobile-menu {
		position: absolute;
		top: 100%;
		left: 0;
		right: 0;
		border-radius: 0 0 12px 12px;
		z-index: 100;
		padding: 12px;
		animation: slideDown 0.3s ease-out;
		background: rgba(30, 27, 50, 0.8);
		backdrop-filter: blur(10px);
		border: 1px solid rgba(167, 139, 250, 0.2);
		border-top: none;
		overflow: hidden;
		box-sizing: border-box;
	}
	.mobile-nav-item {
		display: block !important;
		width: 100%;
		margin-bottom: 8px;
		text-align: left;
		padding: 12px 12px !important;
		border-radius: 8px !important;
		border: 1px solid transparent;
		text-decoration: none;
		box-sizing: border-box;
	}
	.mobile-nav-item:hover {
		background: rgba(167, 139, 250, 0.1);
		border-color: var(--accent);
	}
	.mobile-nav-item.active {
		background: rgba(167, 139, 250, 0.2);
		border-color: var(--accent);
	}
	.mobile-account-btn {
		position: relative;
		background: transparent !important;
		border: 1px solid transparent !important;
	}
	.mobile-account-btn:hover {
		background: rgba(167, 139, 250, 0.1) !important;
		border-color: var(--accent) !important;
	}
	.mobile-account-menu {
		position: static;
		background: rgba(167, 139, 250, 0.05);
		border: 1px solid rgba(167, 139, 250, 0.2);
		border-radius: 6px;
		margin-top: 8px;
		padding: 4px;
		box-shadow: none;
		left: auto;
		min-width: auto;
		margin-left: 0;
	}
	.mobile-account-menu a {
		display: block;
		color: var(--muted);
		text-decoration: none;
		padding: 8px 12px;
		border-radius: 4px;
		transition: all 0.2s;
		font-size: 13px;
		border: 1px solid transparent;
	}
	.mobile-account-menu a:hover {
		color: var(--accent);
		background: rgba(167, 139, 250, 0.15);
		border-color: var(--accent);
	}

	/* layout mode tweaks */
	.navbar-container.mobile-mode {
		flex-direction: column;
		flex-wrap: nowrap;
		padding: 12px 10px 14px;
		border-radius: 0 0 12px 12px;
		position: relative;
	}

	/* ============================================
	   RESPONSIVE BREAKPOINTS
	   ============================================ */

	/* Wrapped Mode: ≤$wrap-breakpoint */
	@media (max-width: $wrap-breakpoint) {
		.navbar {
			padding: 0;
			max-width: 100vw;
		}
		.navbar-container {
			padding: 1.15rem 0.85rem 1.2rem;
			gap: 3px;
			width: 100%;
			flex-wrap: nowrap;
			flex-direction: column;
			align-items: stretch;
		}
		.desktop-logo-img {
			height: 84px;
			max-width: min(400px, 40vw);
		}
		.desktop-logo-link {
			align-self: center;
			margin-right: 0;
			margin-bottom: 0.55rem;
		}
		.desktop-nav-content {
			width: 100%;
			max-width: none;
			margin: 0;
			justify-content: center;
			flex-wrap: wrap;
			gap: 0.55rem;
		}
		.nav-items-wrapper {
			gap: 3px;
		}
		.nav-item {
			padding: 0.4rem;
			font-size: 13px;
		}
		.logo {
			margin-right: 12px;
		}

		/* Keep search/cart grouped and centered under the top logo row. */
		.nav-search-container {
			flex: 0 0 auto;
			justify-content: center;
		}
	}

	/* Mobile Mode: ≤$mobile-breakpoint */
	@media (max-width: $mobile-breakpoint) {
		.navbar {
			padding: 0;
			max-width: 100vw;
		}
		.navbar-container {
			padding: 8px 6px 10px;
			gap: 2px;
			width: 100%;
			border-radius: 0 0 12px 12px;
			margin-bottom: 0.9rem;
		}
		.navbar-container::before {
			border-radius: 0 0 12px 12px;
		}
		.desktop-logo-link {
			display: none;
		}
		.desktop-nav-content {
			display: contents;
		}

		/* Mobile navbar icon buttons: large touch targets until very narrow screens */
		.mobile-menu-toggle,
		.mobile-action-btn {
			min-width: 4em;
			min-height: 4em;
			width: 4em;
			height: 4em;
		}

		.mobile-menu-toggle i,
		.mobile-action-btn i {
			font-size: 1.8em;
			line-height: 1;
		}
	}

	@media (max-width: 360px) {
		.mobile-menu-toggle,
		.mobile-action-btn {
			min-width: 2em;
			min-height: 2em;
			width: 2em;
			height: 2em;
		}

		.mobile-menu-toggle i,
		.mobile-action-btn i {
			font-size: 0.9em;
		}
	}
</style>
