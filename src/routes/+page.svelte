<script>
	import { derived } from 'svelte/store';
	import { EventCard, CategoryGrid, TestimonialCard } from '$lib';
	import OrderModal from '$lib/common/OrderModal.svelte';

	import logo from '$lib/assets/LogoTextAbove.png';
	let { data } = $props();
	
	// Load events and testimonials from server
	let events = $state(data.events || []);
	let testimonials = $state(data.testimonials || []);
	// Order modal state
	let showOrderModal = $state(false);
	
	// Print events on page load
	$effect(() => {
		console.log('Events loaded:', events);
	});
	
	// Filter for upcoming events only

	// Compute upcoming events reactively
	let upcomingEvents = $derived((events || [])
		.filter((e) => new Date(e.date) >= new Date())
		.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
		.slice(0, 3));
	
	// Handle order submission
	function handleOrderSubmit(orderData) {
		console.log('Order submitted:', orderData);
		
		// TODO: Send order data to server
		// For now, just close the modal and show a success message
		showOrderModal = false;
		alert('Thank you for your order request! We will contact you soon at ' + orderData.email);
	}
	
	// Open order modal
	function openOrderModal() {
		showOrderModal = true;
	}
	
	// Close order modal
	function closeOrderModal() {
		showOrderModal = false;
	}
</script>
    
<!-- Hero Section -->
<section class="hero">
	<div class="hero-content">
		<div class="hero-main">
			<a href="/" class="logo-link" aria-label="Elemental Designs Home">
					<div class="logo">
						<img src={logo} alt="Logo" style="max-width: 500px; display: block"/>
					</div>
				</a>
			<p class="hero-title">Handcrafted Chainmail and Laser-Engraved Gifts</p>
			<p class="hero-description">
				Explore our unique collection of handcrafted jewelry and personalized gifts.
				Each piece is carefully crafted with attention to detail and quality.
			</p>
			
			<!-- <div class="hero-actions">
				<button class="btn-primary">Shop Now</button>
				<button class="btn-secondary">Custom Orders</button>
			</div> -->
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
<!-- <CategoryGrid /> -->

<!-- Content Grid -->
<div class="content-grid">
	<!-- Events Section -->
	<section class="events-section" id="events-schedule">
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

	<!-- Testimonials Section -->
	{#if testimonials.length > 0}
	<section class="testimonials-section" id="testimonials">
		<h3>Customer Testimonials</h3>
		<div class="testimonials-list">
			{#each testimonials as testimonial (testimonial.id || testimonial._id)}
				<TestimonialCard {testimonial} editable={false} />
			{/each}
		</div>
	</section>
	{/if}

	<div class ="hgrid">

		<!-- Custom Orders Section -->
		<section class="custom-orders">
			<h2>Custom orders</h2>
			<p>Have something specific in mind? We create custom chainmail and laser-engraved pieces tailored to your vision. From personalized jewelry to unique gifts.</p>
			
			
			<div class="custom-actions">
				<button class="btn-custom" onclick={openOrderModal}>Start a custom request</button>
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

<OrderModal
	isOpen={showOrderModal}
	onSave={handleOrderSubmit}
	onCancel={closeOrderModal}
	/>


