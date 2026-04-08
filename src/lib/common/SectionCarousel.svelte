<script>
	/** @type {import('svelte').Snippet} */
	let {
		children,
		ariaLabel = 'Carousel',
		/** Minimum slide width (px); we fit as many full slides as the viewport allows, up to the item count. */
		minSlideWidth = 260,
		/** When set, each slide is at most this wide; extra columns are used on wide viewports when possible. */
		maxSlideWidth = undefined
	} = $props();

	/** @type {HTMLDivElement | undefined} */
	let viewport = $state(undefined);
	let canPrev = $state(false);
	let canNext = $state(false);
	/** Computed flex-basis for each slide; 0 until measured. */
	let slideBasisPx = $state(0);

	function getGapPx() {
		if (!viewport) return 16;
		const track = viewport.querySelector('.carousel-track');
		if (!track) return 16;
		const g = getComputedStyle(track).gap;
		return Number.parseFloat(g) || 16;
	}

	function syncScrollState() {
		const vp = viewport;
		if (!vp) return;
		canPrev = vp.scrollLeft > 4;
		canNext = vp.scrollLeft < vp.scrollWidth - vp.clientWidth - 4;
	}

	function updateSlideLayout() {
		const vp = viewport;
		if (!vp) return;
		const track = vp.querySelector('.carousel-track');
		if (!track) return;
		const slides = track.querySelectorAll(':scope > .carousel-slide');
		const slideCount = slides.length;
		if (slideCount === 0) {
			slideBasisPx = 0;
			return;
		}
		const w = vp.clientWidth;
		if (w <= 0) return;
		const gap = getGapPx();
		const maxColumnsByMin = Math.max(1, Math.floor((w + gap) / (minSlideWidth + gap)));
		let columns = Math.min(slideCount, maxColumnsByMin);
		let share = (w - (columns - 1) * gap) / columns;

		while (
			maxSlideWidth != null &&
			maxSlideWidth > 0 &&
			share > maxSlideWidth &&
			columns < slideCount
		) {
			const next = columns + 1;
			const nextShare = (w - (next - 1) * gap) / next;
			if (nextShare < minSlideWidth) break;
			columns = next;
			share = nextShare;
		}

		slideBasisPx =
			maxSlideWidth != null && maxSlideWidth > 0 ? Math.min(share, maxSlideWidth) : share;
	}

	function scrollOffsetForIndex(index) {
		const vp = viewport;
		if (!vp) return 0;
		const slides = vp.querySelectorAll('.carousel-slide');
		const gap = getGapPx();
		let left = 0;
		for (let j = 0; j < index && j < slides.length; j++) {
			left += slides[j].offsetWidth + gap;
		}
		return left;
	}

	/** Index of slide whose start is nearest to current scroll (for arrow stepping) */
	function currentIndexFromScroll() {
		const vp = viewport;
		if (!vp) return 0;
		const slides = [...vp.querySelectorAll('.carousel-slide')];
		if (slides.length === 0) return 0;
		const gap = getGapPx();
		const target = vp.scrollLeft + 2;
		let acc = 0;
		for (let i = 0; i < slides.length; i++) {
			const w = slides[i].offsetWidth;
			if (acc + w > target) return i;
			acc += w + gap;
		}
		return slides.length - 1;
	}

	function goPrev() {
		const i = currentIndexFromScroll();
		if (i <= 0) return;
		viewport?.scrollTo({ left: scrollOffsetForIndex(i - 1), behavior: 'smooth' });
	}

	function goNext() {
		const vp = viewport;
		if (!vp) return;
		const slides = vp.querySelectorAll('.carousel-slide');
		const i = currentIndexFromScroll();
		if (i >= slides.length - 1) return;
		viewport?.scrollTo({ left: scrollOffsetForIndex(i + 1), behavior: 'smooth' });
	}

	$effect(() => {
		if (!viewport) return;
		minSlideWidth;
		maxSlideWidth;

		const vp = viewport;
		const track = vp.querySelector('.carousel-track');
		if (!track) return;

		const run = () => {
			updateSlideLayout();
			syncScrollState();
		};

		const onScroll = () => syncScrollState();
		vp.addEventListener('scroll', onScroll, { passive: true });

		const ro = new ResizeObserver(run);
		ro.observe(vp);
		ro.observe(track);

		const mo = new MutationObserver(run);
		mo.observe(track, { childList: true });

		queueMicrotask(run);
		requestAnimationFrame(run);

		return () => {
			vp.removeEventListener('scroll', onScroll);
			ro.disconnect();
			mo.disconnect();
		};
	});
</script>

<div class="section-carousel" role="region" aria-roledescription="carousel" aria-label={ariaLabel}>
	<button
		type="button"
		class="carousel-arrow prev"
		aria-label="Previous item"
		disabled={!canPrev}
		onclick={goPrev}
	>
		<i class="fas fa-chevron-left" aria-hidden="true"></i>
	</button>

	<div
		class="carousel-viewport"
		bind:this={viewport}
		style:--carousel-slide-basis={slideBasisPx > 0 ? `${slideBasisPx}px` : null}
	>
		<div class="carousel-track">
			{@render children()}
		</div>
	</div>

	<button
		type="button"
		class="carousel-arrow next"
		aria-label="Next item"
		disabled={!canNext}
		onclick={goNext}
	>
		<i class="fas fa-chevron-right" aria-hidden="true"></i>
	</button>
</div>

<style lang="scss">
	.section-carousel {
		/* Viewport inset = 90% of arrow width → ~10% of each arrow overlaps cards */
		--carousel-arrow-w: 2.25rem;
		--carousel-edge-pad: 0;
		--carousel-viewport-inline-margin: calc(0.9 * var(--carousel-arrow-w));
		--carousel-track-inline-margin: 0;
		--carousel-scroll-padding-inline: var(--carousel-viewport-inline-margin);
		--carousel-arrow-bg: var(--nav-bg);
		--carousel-arrow-border: var(--panel-border);
		--carousel-arrow-color: var(--muted);
		--carousel-arrow-hover-color: var(--accent);
		--carousel-arrow-hover-border: var(--accent);
		position: relative;
		margin-top: 0.5rem;
		width: 100%;
		min-width: 0;

		@media (max-width: 768px) {
			--carousel-arrow-w: 2.5rem;
		}
	}

	.carousel-viewport {
		container-type: inline-size;
		container-name: section-carousel;
		overflow-x: auto;
		overflow-y: hidden;
		scroll-snap-type: x mandatory;
		scroll-behavior: smooth;
		-webkit-overflow-scrolling: touch;
		scrollbar-width: thin;
		margin-inline: var(--carousel-viewport-inline-margin);
		scroll-padding-inline: var(--carousel-scroll-padding-inline);
		min-width: 0;
	}

	.carousel-track {
		display: flex;
		align-items: stretch;
		gap: 1rem;
		min-width: min-content;
		margin-inline: var(--carousel-track-inline-margin);
		/* Breathing room above the horizontal scrollbar */
		padding-bottom: clamp(0.45rem, 1.1vw, 0.75rem);
	}

	:global(.carousel-slide) {
		/* Width set via --carousel-slide-basis so full slides fit with no clipping; fallback one column. */
		flex: 0 0 var(--carousel-slide-basis, 100cqi);
		width: var(--carousel-slide-basis, 100cqi);
		max-width: var(--carousel-slide-basis, 100cqi);
		min-width: 0;
		scroll-snap-align: start;
		scroll-snap-stop: always;
		box-sizing: border-box;
	}

	:global(.carousel-slide > *) {
		min-width: 0;
		max-width: 100%;
	}

	:global(.carousel-slide .event-card),
	:global(.carousel-slide .testimonial-card) {
		margin-bottom: 0;
		break-inside: unset;
		height: 100%;
	}

	.carousel-arrow {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		z-index: 2;
		width: var(--carousel-arrow-w);
		height: var(--carousel-arrow-w);
		border-radius: 10px;
		border: 1px solid var(--carousel-arrow-border);
		background: var(--carousel-arrow-bg);
		color: var(--carousel-arrow-color);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: var(--glass-shadow);
		transition:
			color 0.2s ease,
			border-color 0.2s ease,
			opacity 0.2s ease,
			box-shadow 0.2s ease,
			transform 0.2s ease;

		&:hover:not(:disabled) {
			color: var(--carousel-arrow-hover-color);
			border-color: var(--carousel-arrow-hover-border);
		}

		&:disabled {
			opacity: 0.35;
			cursor: not-allowed;
		}

		@media (max-width: 768px) {
			--carousel-arrow-glass-bg: color-mix(in srgb, var(--nav-bg) 78%, transparent);
			z-index: 4;
			border-radius: 12px;
			border-color: color-mix(in srgb, var(--panel-border) 85%, rgba(255, 255, 255, 0.14));
			background: var(--carousel-arrow-glass-bg);
			backdrop-filter: blur(14px) saturate(1.25);
			-webkit-backdrop-filter: blur(14px) saturate(1.25);
			box-shadow:
				0 1px 0 rgba(255, 255, 255, 0.1) inset,
				0 10px 28px rgba(0, 0, 0, 0.45),
				0 4px 12px rgba(0, 0, 0, 0.28);

			&:hover:not(:disabled) {
				box-shadow:
					0 1px 0 rgba(255, 255, 255, 0.12) inset,
					0 12px 32px rgba(0, 0, 0, 0.5),
					0 4px 14px rgba(0, 0, 0, 0.32);
			}
		}
	}

	.carousel-arrow.prev {
		left: var(--carousel-edge-pad);
	}

	.carousel-arrow.next {
		right: var(--carousel-edge-pad);
	}
</style>
