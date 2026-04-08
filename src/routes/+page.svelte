<script>
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import { EventCard, TestimonialCard, TaggedGrid, SectionCarousel } from '$lib';
	import OrderModal from '$lib/common/OrderModal.svelte';
	import { normalizeBrandingContent, splitBrandingParagraphs } from '$lib/branding';
	let { data } = $props();
	let branding = $derived(normalizeBrandingContent(data.branding));
	let heroDescriptionParagraphs = $derived(splitBrandingParagraphs(branding.homeHeroDescription));
	let featuredItemIds = $derived((branding.featuredItemIds || []).filter(Boolean));
	let featuredItems = $state([]);
	let useFeaturedCarousel = $state(false);

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

	function formatPrice(amount) {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD'
		}).format(amount || 0);
	}

	onMount(() => {
		const updateHeroFeaturedLayout = () => {
			useFeaturedCarousel = window.innerWidth < 980;
		};

		async function loadFeaturedItems() {
			if (featuredItemIds.length === 0) {
				featuredItems = [];
				return;
			}

			try {
				const response = await fetch('/api/items');
				if (!response.ok) {
					featuredItems = [];
					return;
				}
				const payload = await response.json();
				const map = payload?.itemsMap || {};
				featuredItems = featuredItemIds
					.map((id) => map[id])
					.filter(Boolean);
			} catch (error) {
				console.error('Failed to load featured hero items', error);
				featuredItems = [];
			}
		}

		updateHeroFeaturedLayout();
		loadFeaturedItems();
		window.addEventListener('resize', updateHeroFeaturedLayout);
		return () => window.removeEventListener('resize', updateHeroFeaturedLayout);
	});
</script>

<!-- Hero Section: images column first so they sit left of copy above the mobile breakpoint -->
<section class="hero">
	<div class="hero-content hero-content--home">
		<div class="hero-panels">
			{#if featuredItems.length > 0}
				{#if useFeaturedCarousel}
					<SectionCarousel ariaLabel="Featured products" minSlideWidth={210} maxSlideWidth={280}>
						{#snippet children()}
							{#each featuredItems as item (item.id)}
								<div class="carousel-slide">
									<a class="hero-feature-card" href={resolve(`/item/${item.id}`)}>
										<div class="hero-feature-image-wrap">
											{#if item.imageUrl}
												<img src={item.imageUrl} alt={item.name} class="hero-feature-image" />
											{:else}
												<div class="hero-feature-image hero-feature-image--placeholder">No image</div>
											{/if}
										</div>
										<div class="hero-feature-meta">
											<h3>{item.name}</h3>
											<p>{formatPrice(item.price)}</p>
										</div>
									</a>
								</div>
							{/each}
						{/snippet}
					</SectionCarousel>
				{:else}
					<div class="hero-feature-grid">
						{#each featuredItems as item (item.id)}
							<a class="hero-feature-card" href={resolve(`/item/${item.id}`)}>
								<div class="hero-feature-image-wrap">
									{#if item.imageUrl}
										<img src={item.imageUrl} alt={item.name} class="hero-feature-image" />
									{:else}
										<div class="hero-feature-image hero-feature-image--placeholder">No image</div>
									{/if}
								</div>
								<div class="hero-feature-meta">
									<h3>{item.name}</h3>
									<p>{formatPrice(item.price)}</p>
								</div>
							</a>
						{/each}
					</div>
				{/if}
			{/if}
		</div>

		<div class="hero-main">
			<p class="hero-title">{branding.homeHeroTitle}</p>
			<div class="hero-description">
				{#each heroDescriptionParagraphs as paragraph, index (index)}
					<p>{paragraph}</p>
				{/each}
			</div>

			<p class="hero-past-work-cta">
				<a href={resolve('/past-work')} class="hero-past-work-link">Past work gallery</a>
			</p>
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
			<SectionCarousel ariaLabel="Upcoming events" minSlideWidth={300}>
				{#snippet children()}
					{#each upcomingEvents as event (event.id)}
						<div class="carousel-slide">
							<EventCard {event} editable={false} />
						</div>
					{/each}
				{/snippet}
			</SectionCarousel>
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
			<SectionCarousel
				ariaLabel="Customer testimonials"
				minSlideWidth={240}
				maxSlideWidth={360}
			>
				{#snippet children()}
					{#each testimonials as testimonial (testimonial.id || testimonial._id)}
						<div class="carousel-slide">
							<TestimonialCard {testimonial} editable={false} />
						</div>
					{/each}
				{/snippet}
			</SectionCarousel>
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
				<a class="btn-past-work" href={resolve('/past-work')}>{branding.customOrdersSecondaryCta}</a>
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
