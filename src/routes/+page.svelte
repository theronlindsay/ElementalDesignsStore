<script lang="ts">
	import { EventCard, CategoryGrid } from '$lib';
	
	let showAccountMenu = false;
	let showMainMenus = {};
	
	// Mock events data (in production, this would be fetched from API/database)
	// This should match the events created in admin panel
	let events = [
		{
			id: '1',
			title: 'Renaissance Fair 2025',
			description: 'Join us for a spectacular Renaissance fair featuring chainmail demonstrations, medieval crafts, and artisan vendors.',
			date: '2026-06-15',
			location: 'Heritage Park, Portland',
			image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800',
			link: 'https://example.com/renaissance-fair'
		},
		{
			id: '2',
			title: 'Maker Faire Summer Edition',
			description: 'Discover unique handcrafted items, watch live demonstrations of laser engraving, and meet local artisans.',
			date: '2026-07-20',
			location: 'Downtown Convention Center',
			image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
			link: 'https://example.com/maker-faire'
		}
	];
	
	// Filter for upcoming events only
	let upcomingEvents = $derived(
		events
			.filter(e => new Date(e.date) >= new Date())
			.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
			.slice(0, 3) // Show max 3 events on homepage
	);
</script>
    
<!-- Hero Section -->
<section class="hero">
	<div class="hero-content">
		<div class="hero-main">
			<a href="/" class="logo-link" aria-label="Elemental Designs Home">
					<div class="logo">
						<img src="/src/lib/assets/LogoTextAbove.png" alt="Logo" style="max-width: 500px; display: block"/>
					</div>
				</a>
			<p class="hero-title">Handcrafted Chainmail and Laser-Engraved Gifts</p>
			<p class="hero-description">
				Explore our unique collection of handcrafted jewelry and personalized gifts.
				Each piece is carefully crafted with attention to detail and quality.
			</p>
			
			<div class="hero-actions">
				<button class="btn-primary">Shop Now</button>
				<button class="btn-secondary">Custom Orders</button>
			</div>
		</div>
		
		<div class="hero-panels">
			<div class="search-panel">
				<div class="product-images">
					<div class="product-placeholder"></div>
					<div class="product-placeholder"></div>
				</div>
			</div>
		</div>
	</div>
</section>


<!-- Product Categories Grid -->
<CategoryGrid />

<!-- Content Grid -->
<div class="content-grid">
	<!-- Events Section -->
	<section class="events-section">
		<h3>Upcoming Events</h3>
		
		{#if upcomingEvents.length > 0}
			<div class="events-list">
				{#each upcomingEvents as event (event.id)}
					<EventCard {event} editable={false} />
				{/each}
			</div>
		{:else}
			<div class="no-events">
				<p>No upcoming events at this time. Check back soon!</p>
			</div>
		{/if}
	</section>

	<div class ="hgrid">

		<!-- Custom Orders Section -->
		<section class="custom-orders">
			<h2>Custom orders</h2>
			<p>Have something specific in mind? We create custom chainmail and laser-engraved pieces tailored to your vision. From personalized jewelry to unique gifts.</p>
			
			<div class="custom-actions">
				<button class="btn-custom">Start a custom request</button>
				<button class="btn-past-work">See past work</button>
			</div>
		</section>

		<section class="newsletter-signup">
			<h2>Sign up for our newsletter:</h2>

			<input type="email" placeholder="Enter your email" />
			<button class="btn-signup">Get updates</button>
			<small>No pop-ups. We only email about shows and launches.</small>
		</section>
	</div>
</div>


