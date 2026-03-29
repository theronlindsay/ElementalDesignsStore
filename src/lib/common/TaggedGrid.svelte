<script>
	import { ItemCard } from '$lib';
	import { onMount } from 'svelte';

	let { allowedTags = [], deniedTags = [], maxRows = 1, title = '' } = $props();

	let items = $state([]);
	let loading = $state(true);

	let container = $state(undefined);
	let showLeftArrow = $state(false);
	let showRightArrow = $state(true);

	function checkScroll() {
		if (container) {
			showLeftArrow = container.scrollLeft > 0;
			showRightArrow =
				Math.ceil(container.scrollLeft + container.clientWidth) < container.scrollWidth;
		}
	}

	function scrollLeft() {
		if (container) {
			container.scrollBy({ left: -container.clientWidth * 0.8, behavior: 'smooth' });
		}
	}

	function scrollRight() {
		if (container) {
			container.scrollBy({ left: container.clientWidth * 0.8, behavior: 'smooth' });
		}
	}

	function getItemPrice(item) {
		try {
			const variation = item.itemData?.variations?.[0];
			const price = variation?.itemVariationData?.priceMoney?.amount || 0;
			return Number(price) / 100;
		} catch {
			return 0;
		}
	}

	function formatPrice(amount) {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD'
		}).format(amount);
	}

	function getItemRating() {
		return 0;
	}

	function getItemType() {
		return 'Item';
	}

	onMount(() => {
		async function fetchItems() {
			try {
				const response = await fetch('/api/square-tags', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ allowedTags, deniedTags })
				});
				if (response.ok) {
					const data = await response.json();
					items = data.items || [];
				}
			} catch (error) {
				console.error('Failed to fetch tagged items:', error);
			} finally {
				loading = false;
				setTimeout(checkScroll, 100);
			}
		}

		fetchItems();

		window.addEventListener('resize', checkScroll);
		return () => window.removeEventListener('resize', checkScroll);
	});
</script>

{#if loading}
	<div class="tagged-grid-section loading-state">
		{#if title}
			<h3 class="section-title">{title}</h3>
		{/if}
		<p>Loading items...</p>
	</div>
{:else if items.length > 0}
	<div class="tagged-grid-section">
		{#if title}
			<h3 class="section-title">{title}</h3>
		{/if}

		<div class="carousel-wrapper">
			{#if showLeftArrow}
				<button class="nav-btn left" onclick={scrollLeft} aria-label="Scroll left">
					<i class="fas fa-chevron-left"></i>
				</button>
			{/if}

			<div
				class="items-container"
				bind:this={container}
				onscroll={checkScroll}
				style="--max-rows: {maxRows};"
			>
				{#each items as item (item.id)}
					<div class="item-wrapper">
						<ItemCard
							{item}
							itemData={item.itemData || {}}
							itemPrice={getItemPrice(item)}
							itemRating={getItemRating()}
							itemType={getItemType()}
							{formatPrice}
						/>
					</div>
				{/each}
			</div>

			{#if showRightArrow && items.length > 0}
				<button class="nav-btn right" onclick={scrollRight} aria-label="Scroll right">
					<i class="fas fa-chevron-right"></i>
				</button>
			{/if}
		</div>
	</div>
{/if}

<style lang="scss">
	.tagged-grid-section {
		margin-bottom: 3rem;
		width: 100%;
	}

	.section-title {
		margin-bottom: 1.5rem;
		color: var(--text-primary);
		font-size: 1.5rem;
		font-weight: 700;
	}

	.carousel-wrapper {
		position: relative;
		width: 100%;
		display: flex;
		align-items: center;
	}

	.items-container {
		display: grid;
		grid-auto-flow: column;
		/* Each item takes up roughly 280px, adjusting to fill space */
		grid-auto-columns: minmax(250px, 280px);
		grid-template-rows: repeat(var(--max-rows), auto);
		gap: 1.5rem;
		overflow-x: auto;
		scroll-snap-type: x mandatory;
		scrollbar-width: none; /* Firefox */
		-ms-overflow-style: none; /* IE and Edge */
		padding: 0.5rem;

		&::-webkit-scrollbar {
			display: none; /* Chrome, Safari and Opera */
		}
	}

	.item-wrapper {
		scroll-snap-align: start;
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	.nav-btn {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		width: 48px;
		height: 48px;
		border-radius: 50%;
		background: var(--bg-panel);
		border: 1px solid var(--border-secondary);
		color: var(--text-primary);
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		z-index: 10;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		transition: all 0.2s ease;

		&:hover {
			background: var(--accent);
			color: white;
			border-color: var(--accent);
			transform: translateY(-50%) scale(1.1);
		}

		&.left {
			left: -24px;
		}

		&.right {
			right: -24px;
		}
	}

	@media (max-width: 768px) {
		.items-container {
			grid-auto-columns: minmax(220px, 80vw);
			gap: 1rem;
		}

		.nav-btn {
			width: 40px;
			height: 40px;

			&.left {
				left: -10px;
			}

			&.right {
				right: -10px;
			}
		}
	}
</style>
