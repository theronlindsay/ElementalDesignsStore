<script lang="ts">
	import { onMount } from 'svelte';
	// import '../app.scss';
	import { Button } from '$lib';

	// Navbar Routes
	export let items = [
		{ id: 'home', label: 'Home', href: '/', active: true },
		{ id: 'chainmail', label: 'Chainmail', href: '/chainmail', active: false },
		{ id: 'nsfw', label: 'NSFW', href: '/nsfw', active: false },
		{ id: 'laser', label: 'Laser Engraving', href: '/laser', active: false },
		{ id: 'about', label: 'About', href: '/about', active: false }, 
		{ id: 'faq', label: 'FAQ', href: '/faq', active: false},
		{ id: 'examplePage', label: 'example', href: '/productPage', active: true},
	];

	let activeItem = items.find(item => item.active)?.id || items[0]?.id;
	let visuallyActiveItem = activeItem; // Separate state for visual boldness
	let selectorElement: HTMLDivElement;
	let navElement: HTMLElement;
	let itemElements: { [key: string]: HTMLAnchorElement } = {};
	
	// Add state for dropdown menus
	let showAccountMenu = false;

	// Responsive state management
	let screenWidth = 0;
	let isMobileMenuOpen = false;
	let isMobileMode = false;
	let isWrappedMode = false;

	// Breakpoints
	const MOBILE_BREAKPOINT = 450;
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
	function moveSelector(targetId: string) {
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

					<button class="mobile-menu-toggle" on:click={toggleMobileMenu} aria-label="Toggle menu">
						<i class="fas {isMobileMenuOpen ? 'fa-times' : 'fa-bars'}"></i>
					</button>
					
					<!-- Mobile Actions (always visible) -->
					<div class="mobile-actions">
						<Button class="btn mobile-action" ariaLabel="Search Products">
							<i class="fas fa-search"></i>
						</Button>
						<Button class="btn mobile-action" ariaLabel="User Account">
							<i class="fas fa-user"></i>
						</Button>
						<Button class="btn mobile-action" ariaLabel="Shopping Cart">
							<i class="fas fa-shopping-cart"></i>
						</Button>
					</div>
				</div>
			</div>
			
			<!-- Mobile Menu (collapsible) -->
			{#if isMobileMenuOpen}
				<div class="mobile-menu">
					{#each items as item}
						<a
							bind:this={itemElements[item.id]}
							href={item.href}
							class="nav-item mobile-nav-item {visuallyActiveItem === item.id ? 'active' : ''}"
							on:click={() => {
								handleItemClick(item.id);
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
				
				{#each items as item}
					<a
						bind:this={itemElements[item.id]}
						href={item.href}
						class="nav-item {visuallyActiveItem === item.id ? 'active' : ''}"
						on:click={() => handleItemClick(item.id)}
					>
						{item.label}
					</a>
				{/each}
			</div>
				
			<!-- Divider -->
			<div class="nav-divider">
				<i class="fas fa-grip-lines-vertical"></i>
			</div>
			
			<!-- Search and Actions (together) -->
			<div class="nav-search-container">
				<div class="nav-search-box">
					<input type="text" placeholder="Search..." />
					<button class="nav-search-btn" aria-label="Search Products">
						<i class="fas fa-search"></i>
					</button>
				</div>
				
				<!-- Navigation Actions -->
				<div class="nav-actions">
					<!-- Account Menu -->
					<Button class="btn"
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
					</Button>

					<!-- Shopping Cart -->
					<a href="/cart" style="text-decoration: none;">
						<Button class="btn">
							<i class="fas fa-shopping-cart"></i>
							<span>Cart</span>
						</Button>
					</a>
				</div>
			</div>
		{/if}
	</div>
</nav>

<style lang="scss">
	/*
	 * BREAKPOINTS (defined in script section):
	 * MOBILE_BREAKPOINT = 400px  - Mobile menu mode
	 * WRAP_BREAKPOINT = 936px    - Search bar wraps to second row
	 */
	
	// SCSS Variables for breakpoints
	$mobile-breakpoint: 450px;
	$wrap-breakpoint: 936px;

	/* Debug indicator */
	.debug-indicator {
		position: fixed;
		top: 10px;
		right: 10px;
		background: rgba(0, 0, 0, 0.8);
		color: #fff;
		padding: 8px 12px;
		border-radius: 8px;
		font-family: monospace;
		font-size: 12px;
		z-index: 9999;
		display: flex;
		flex-direction: column;
		gap: 4px;
		border: 1px solid var(--accent);
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
	}

	.mode-label {
		font-weight: bold;
		padding: 2px 6px;
		border-radius: 4px;
	}

	.mode-label.mobile {
		background: #ef4444;
		color: #fff;
	}

	.mode-label.tablet {
		background: #f59e0b;
		color: #fff;
	}

	.mode-label.desktop {
		background: #10b981;
		color: #fff;
	}

	.screen-width {
		color: var(--muted);
		font-size: 11px;
	}

	/* Navbar layout */
	.navbar {
		position: sticky; // ✨ Sticks to top when scrolling
		top: 0; // 📌 Position at top of viewport
		z-index: 1000; // 🔝 Ensures it stays above other content
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 1rem;
		font-family: system-ui, -apple-system, sans-serif;
		width: fit-content;
		max-width: 85vw;
		margin: 0 auto;
		background: transparent;
	}

	/* container */
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
		min-width: min-content;
	}

	/* common panel helper to DRY-up repeated backgrounds/borders */
	.nav-search-box,
	.mobile-nav-item,
	.mobile-menu,
	.dropdown-menu {
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
	}

	/* selector (accented moving highlight) */
	.selector {
		position: absolute;
		top: 0;
		left: 0;
		height: 100%;
		background: linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%);
		border-radius: 12px;
		transition: all 0.4s cubic-bezier(0.68,-0.55,0.265,1.55);
		z-index: 1;
		box-shadow: 0 2px 10px rgba(167,139,250,0.4);
	}

	/* nav items */
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
	}

	.nav-item:hover { color: #f3f4f6; transform: translateY(-1px); }
	.nav-item.active { color: #fff; font-weight: 700; }
	.nav-item:focus { outline: none; }

	/* logos */
	.logo-link { display:flex; align-items:center; gap:8px; text-decoration:none; color:#f3f4f6; font-weight:700; transition:all .2s ease; white-space:nowrap }
	.logo-link:hover { color: var(--accent); transform: translateY(-1px) }

	.nav-divider { display:flex; align-items:center; color:#64748b; padding:0 16px; font-size:16px; opacity:.6; transition:padding 0.3s ease }

	.nav-actions { display:flex; align-items:center; gap:8px; margin-left:8px; transition:gap 0.3s ease, margin-left 0.3s ease }

	/* search */
	.nav-search-container { position:relative; display:flex; align-items:center; gap:8px; transition:gap 0.3s ease }
	.nav-search-box { display:flex; overflow:hidden; transition:all .3s ease; min-width:200px; padding:0 }
	.nav-search-box:focus-within { box-shadow:0 0 0 2px rgba(167,139,250,0.2); border-color:var(--accent) }
	.nav-search-box input { flex:1; padding:8px 12px; background:transparent; border:none; color:#e8e4f3; outline:none; font-size:13px; transition:padding 0.3s ease, font-size 0.3s ease }
	.nav-search-box input::placeholder { color:var(--muted-2) }
	.nav-search-btn { background:transparent; border:none; color:var(--muted-2); padding:8px 12px; cursor:pointer; transition:all .2s }
	.nav-search-btn:hover { color:var(--accent) }

	/* dropdown */
	.dropdown-menu { position:absolute; left:50%; margin-left:-90px; top:100%; min-width:180px; padding:8px; box-shadow:0 20px 25px -5px rgba(0,0,0,.5); z-index:50; margin-top:8px }
	.dropdown-menu a { display:block; color:var(--muted); text-decoration:none; padding:8px 12px; border-radius:6px; transition:all .2s; font-size:13px }
	.dropdown-menu a:hover { color:var(--accent); background:rgba(167,139,250,0.1) }

	@keyframes slideDown { from{opacity:0; transform:translateY(-10px)} to{opacity:1; transform:translateY(0)} }
	@keyframes bounce-in { 0%{ transform: translateX(var(--target-x,0)) scale(.8)} 50%{ transform: translateX(var(--target-x,0)) scale(1.05)} 100%{ transform: translateX(var(--target-x,0)) scale(1)} }

	.navbar-container::before { content:''; position:absolute; inset:-1px; background:linear-gradient(45deg, rgba(167,139,250,0.1), transparent, rgba(167,139,250,0.1)); border-radius:25px; z-index:-1 }

	/* mobile */
	.mobile-header { display:flex; justify-content:space-between; align-items:center; width:100%; padding:8px }
	.mobile-menu-toggle { display:flex; align-items:center; justify-content:center; background:transparent; border:1px solid var(--panel-border); color:var(--muted); padding:8px; border-radius:10px; cursor:pointer; font-size:16px; transition:all .2s; margin-right:10px }
	.mobile-menu-toggle:hover { border-color:var(--accent); color:var(--accent) }
	.mobile-actions { display:flex; gap:8px }
	.mobile-menu { position:absolute; top:100%; left:0; right:0; border-radius:0 0 12px 12px; z-index:100; padding:16px; animation:slideDown .3s ease-out }
	.mobile-nav-item { display:block !important; width:100%; margin-bottom:8px; text-align:left; padding:12px 16px !important; border-radius:8px !important; border:1px solid transparent; text-decoration:none }
	.mobile-nav-item:hover { background:rgba(167,139,250,0.1); border-color:var(--accent) }
	.mobile-nav-item.active { background:rgba(167,139,250,0.2); border-color:var(--accent) }

	/* layout mode tweaks */
	.navbar-container.mobile-mode { flex-direction:column; padding:8px; border-radius:16px; position:relative }

	/* ============================================
	   RESPONSIVE BREAKPOINTS
	   ============================================ */
	
	/* Wrapped Mode: ≤$wrap-breakpoint */
	@media (max-width: $wrap-breakpoint){ 
		.navbar { padding: 0.6rem; max-width: fit-content }
		.navbar-container { 
			padding: 1.5em; 
			gap: 3px; 
			width: min-content;
			flex-wrap: wrap;
		}
		.nav-items-wrapper { gap: 3px }
		.nav-item { padding: 0.4rem; font-size: 13px }
		.nav-divider { display: none }
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
		}
		.nav-search-box input { padding: 7px 10px; font-size: 12px; width: 200px }
		.nav-actions { gap: 6px; margin-left: 6px }
		.logo { margin-right:12px }
	}
	
	/* Mobile Mode: ≤$mobile-breakpoint */
	@media (max-width: $mobile-breakpoint){ 
		.navbar { padding: 0.4rem;  max-width: 98vw}
		.navbar-container { padding: 3px; gap: 2px; width: 80vw; }
	}

</style>