<script>
	import { resolve } from '$app/paths';
	import { PastWorkDetailModal } from '$lib';

	let { data } = $props();

	let modalOpen = $state(false);
	let modalItem = $state(
		/** @type {null | { id: string, imageUrls: string[], name?: string, description?: string, price?: number | null, workDate?: string }} */
		(null)
	);

	let items = $derived(
		(data.pastWork?.items || []).filter(
			(it) => Array.isArray(it.imageUrls) && it.imageUrls.some((u) => u && String(u).trim())
		)
	);

	function openModal(item) {
		modalItem = item;
		modalOpen = true;
	}

	function closeModal() {
		modalOpen = false;
		modalItem = null;
	}

	function formatPrice(amount) {
		if (amount == null || amount === '') return '';
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD'
		}).format(Number(amount));
	}

	function formatDate(isoDate) {
		if (!isoDate || typeof isoDate !== 'string') return '';
		const d = new Date(isoDate.includes('T') ? isoDate : `${isoDate}T12:00:00`);
		if (Number.isNaN(d.getTime())) return isoDate;
		return new Intl.DateTimeFormat('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		}).format(d);
	}
</script>

<svelte:head>
	<title>Past work — Elemental Chain Designs</title>
	<meta name="description" content="Gallery of custom chainmail and laser-engraved pieces." />
</svelte:head>

<main class="past-work-page">
	<header class="past-work-header">
		<h1>Past work</h1>
		<p>Custom pieces we have crafted—chainmail, jewelry, and laser-engraved work.</p>
		<a class="back-link" href={resolve('/')}>← Back to shop</a>
	</header>

	{#if items.length === 0}
		<p class="empty-state">New projects will appear here soon.</p>
	{:else}
		<div class="past-work-grid-wrap">
			<ul class="past-work-grid">
				{#each items as item (item.id)}
					<li class="past-work-tile">
						<button
							type="button"
							class="past-work-card"
							onclick={() => openModal(item)}
						>
							<div class="past-work-image-frame">
								<img
									src={item.imageUrls[0]}
									alt={item.name || 'Past project'}
									loading="lazy"
								/>
							</div>
							<div class="past-work-meta">
								{#if item.name}
									<h2>{item.name}</h2>
								{:else}
									<h2 class="untitled">Past project</h2>
								{/if}
								{#if item.workDate}
									<p class="meta-line date">{formatDate(item.workDate)}</p>
								{/if}
								{#if item.price != null}
									<p class="meta-line price">{formatPrice(item.price)}</p>
								{/if}
								{#if item.description}
									<p class="description preview">{item.description}</p>
								{/if}
								<span class="view-hint">View details</span>
							</div>
						</button>
					</li>
				{/each}
			</ul>
		</div>
	{/if}
</main>

<PastWorkDetailModal open={modalOpen} item={modalItem} onClose={closeModal} />

<style lang="scss">
	.past-work-page {
		padding: 2rem 1rem 3rem;
		box-sizing: border-box;
		min-width: 0;
	}

	.past-work-header {
		text-align: center;
		max-width: 42rem;
		margin: 0 auto 2rem;

		h1 {
			margin: 0 0 0.5rem;
			font-size: clamp(1.75rem, 4vw, 2.5rem);
			color: var(--text-primary);
		}

		p {
			margin: 0 0 1rem;
			color: var(--muted);
			line-height: 1.6;
		}
	}

	.back-link {
		display: inline-block;
		color: var(--accent);
		text-decoration: none;
		font-weight: 600;
		font-size: 0.95rem;

		&:hover {
			text-decoration: underline;
		}
	}

	.empty-state {
		text-align: center;
		color: var(--muted);
		max-width: 85vw;
		margin: 2rem auto;
	}

	.past-work-grid-wrap {
		max-width: 85vw;
		width: 100%;
		margin: 0 auto;
		box-sizing: border-box;
	}

	.past-work-grid {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
		gap: 1.5rem;
	}

	.past-work-tile {
		margin: 0;
		padding: 0;
		min-width: 0;
	}

	.past-work-card {
		width: 100%;
		margin: 0;
		padding: 0;
		border: none;
		background: rgba(42, 36, 56, 0.45);
		border-radius: 14px;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		min-width: 0;
		cursor: pointer;
		text-align: left;
		font: inherit;
		color: inherit;
		transition:
			border-color 0.2s ease,
			box-shadow 0.2s ease;
		border: 1px solid var(--border-primary, #3d3650);
		box-sizing: border-box;

		&:hover {
			border-color: color-mix(in srgb, var(--accent) 55%, var(--border-primary));
			box-shadow: 0 12px 32px rgba(0, 0, 0, 0.25);
		}

		&:focus-visible {
			outline: 2px solid var(--accent);
			outline-offset: 2px;
		}
	}

	.past-work-image-frame {
		aspect-ratio: 4 / 3;
		background: linear-gradient(
			135deg,
			rgba(88, 70, 120, 0.25) 0%,
			rgba(26, 22, 37, 0.6) 100%
		);
		overflow: hidden;

		img {
			width: 100%;
			height: 100%;
			object-fit: cover;
			display: block;
		}
	}

	.past-work-meta {
		padding: 1rem 1.1rem 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		min-width: 0;

		h2 {
			margin: 0;
			font-size: 1.1rem;
			color: var(--text-primary);
			line-height: 1.35;

			&.untitled {
				color: var(--muted);
				font-style: italic;
				font-weight: 600;
			}
		}
	}

	.meta-line {
		margin: 0;
		font-size: 0.9rem;

		&.date {
			color: var(--muted);
		}

		&.price {
			color: var(--accent);
			font-weight: 700;
		}
	}

	.description {
		margin: 0.35rem 0 0;
		font-size: 0.9rem;
		color: var(--muted);
		line-height: 1.55;
		white-space: pre-wrap;

		&.preview {
			display: -webkit-box;
			-webkit-line-clamp: 3;
			-webkit-box-orient: vertical;
			overflow: hidden;
		}
	}

	.view-hint {
		margin-top: 0.5rem;
		font-size: 0.82rem;
		font-weight: 600;
		color: var(--accent);
	}
</style>
