<script>
	import { resolve } from '$app/paths';
	import { EventCard, TestimonialCard, TaggedGrid } from '$lib';
	import OrderModal from '$lib/common/OrderModal.svelte';
	import { normalizeBrandingContent, splitBrandingParagraphs } from '$lib/branding';

	import defaultLogo from '$lib/assets/LogoTextAbove.png';
	import defaultEarringsImg from '$lib/assets/steppingstone_earrings_pride_6color.png';
	import defaultChokerImg from '$lib/assets/laughingskulls_choker_drape_rose_red_zoom.png';
	let { data } = $props();
	let branding = $derived(normalizeBrandingContent(data.branding));
	let heroDescriptionParagraphs = $derived(splitBrandingParagraphs(branding.homeHeroDescription));

	// Load data from server
	let events = $derived(data.events || []);
	let testimonials = $derived(data.testimonials || []);
	let storeConfig = $derived(data.storeConfig || { taggedGrids: [] });

	// Order modal state
	let showOrderModal = $state(false);

	// Print events on page load
	$effect(() => {
		console.log('Events loaded:', events);
	});

	// Filter for upcoming events only

	function getEventEndDate(e) {
		if (e.days && e.days.length > 0) {
			const maxDateStr = [...e.days].sort(
				(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
			)[0].date;
			return new Date(maxDateStr.includes('T') ? maxDateStr : `${maxDateStr}T23:59:59`);
		}
		const dateStr = e.date || '';
		return new Date(dateStr.includes('T') ? dateStr : `${dateStr}T23:59:59`);
	}

	function getEventStartDate(e) {
		if (e.days && e.days.length > 0) {
			const minDateStr = [...e.days].sort(
				(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
			)[0].date;
			return new Date(minDateStr.includes('T') ? minDateStr : `${minDateStr}T12:00:00`);
		}
		const dateStr = e.date || '';
		return new Date(dateStr.includes('T') ? dateStr : `${dateStr}T12:00:00`);
	}

	// Compute upcoming events reactively
	let upcomingEvents = $derived(
		(events || [])
			.filter((e) => getEventEndDate(e) >= new Date())
			.sort((a, b) => getEventStartDate(a).getTime() - getEventStartDate(b).getTime())
			.slice(0, 3)
	);

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
			<a href={resolve('/')} class="logo-link" aria-label="Elemental Designs Home">
				<div class="logo">
					<img
						src={branding.logoPrimaryUrl || defaultLogo}
						alt={branding.logoAlt}
						style="max-width: 500px; display: block"
					/>
				</div>
			</a>
			<p class="hero-title">{branding.homeHeroTitle}</p>
			<div class="hero-description">
				{#each heroDescriptionParagraphs as paragraph, index (index)}
					<p>{paragraph}</p>
				{/each}
			</div>

			<!-- <div class="hero-actions">
				<button class="btn-primary">Shop Now</button>
				<button class="btn-secondary">Custom Orders</button>
			</div> -->
		</div>

		<div class="hero-panels">
			<div class="hero-image-stack">
				<img
					src={branding.homeHeroImageOneUrl || defaultEarringsImg}
					alt="Homepage hero visual one"
					class="hero-image"
				/>
				<img
					src={branding.homeHeroImageTwoUrl || defaultChokerImg}
					alt="Homepage hero visual two"
					class="hero-image"
				/>
			</div>
		</div>
	</div>
</section>

<!-- Product Categories Grid -->
<!-- <CategoryGrid /> -->

<!-- Content Grid -->
<div class="content-grid">
	<!-- Tagged Grids -->
	{#each storeConfig.taggedGrids as grid (grid.id)}
		<TaggedGrid
			title={grid.title}
			allowedTags={grid.allowedTags}
			deniedTags={grid.deniedTags}
			maxRows={grid.maxRows}
		/>
	{/each}

	<!-- Events Section -->
	<section class="events-section" id="events-schedule">
		<h3>{branding.eventsSectionTitle}</h3>

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
			<h3>{branding.testimonialsSectionTitle}</h3>
			<div class="testimonials-list">
				{#each testimonials as testimonial (testimonial.id || testimonial._id)}
					<TestimonialCard {testimonial} editable={false} />
				{/each}
			</div>
		</section>
	{/if}

	<div class="hgrid">
		<!-- Custom Orders Section -->
		<section class="custom-orders">
			<h2>{branding.customOrdersTitle}</h2>
			<p>{branding.customOrdersBody}</p>

			<div class="custom-actions">
				<button class="btn-custom" onclick={openOrderModal}
					>{branding.customOrdersPrimaryCta}</button
				>
				<button class="btn-past-work">{branding.customOrdersSecondaryCta}</button>
			</div>
		</section>

		<section class="newsletter-signup">
			<h2>{branding.newsletterTitle}</h2>

			<input type="email" placeholder={branding.newsletterEmailPlaceholder} />
			<button class="btn-signup">{branding.newsletterButtonLabel}</button>
			<small>{branding.newsletterDisclaimer}</small>
		</section>
	</div>
</div>

<OrderModal isOpen={showOrderModal} onSave={handleOrderSubmit} onCancel={closeOrderModal} />
