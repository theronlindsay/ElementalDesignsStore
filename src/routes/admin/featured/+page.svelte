<script>
	import { onMount } from 'svelte';

	let { data } = $props();

	let items = $state([]);
	let isLoadingItems = $state(true);
	let isSaving = $state(false);
	let saveMessage = $state('');
	let saveError = $state('');
	let hasInitializedSelection = $state(false);

	let selectedItemIds = $state([]);

	$effect(() => {
		if (hasInitializedSelection) return;
		selectedItemIds = Array.isArray(data.branding?.featuredItemIds) ? [...data.branding.featuredItemIds] : [];
		hasInitializedSelection = true;
	});

	function formatPrice(amount) {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD'
		}).format(amount || 0);
	}

	function toggleFeaturedItem(itemId) {
		if (selectedItemIds.includes(itemId)) {
			selectedItemIds = selectedItemIds.filter((id) => id !== itemId);
		} else {
			selectedItemIds = [...selectedItemIds, itemId];
		}
	}

	async function loadItems() {
		isLoadingItems = true;
		try {
			const response = await fetch('/api/items');
			if (!response.ok) {
				throw new Error('Failed to load items');
			}
			const payload = await response.json();
			items = Object.values(payload.itemsMap || {}).sort((a, b) => a.name.localeCompare(b.name));
		} catch (error) {
			console.error('Failed to fetch items for featured admin', error);
			saveError = 'Unable to load item catalog right now.';
		} finally {
			isLoadingItems = false;
		}
	}

	async function saveFeatured() {
		isSaving = true;
		saveMessage = '';
		saveError = '';
		try {
			const { _id, updatedAt, ...brandingBase } = data.branding || {};
			const response = await fetch('/admin/branding', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					...brandingBase,
					featuredItemIds: selectedItemIds
				})
			});
			if (!response.ok) {
				const errText = await response.text().catch(() => '');
				throw new Error(errText || 'Failed to save featured items');
			}
			saveMessage = 'Featured items saved.';
		} catch (error) {
			console.error('Failed to save featured items', error);
			saveError = 'Could not save featured items. Please try again.';
		} finally {
			isSaving = false;
		}
	}

	onMount(() => {
		loadItems();
	});
</script>

<svelte:head>
	<title>Featured - Admin</title>
</svelte:head>

<div class="featured-page">
	<div class="page-header">
		<div>
			<h2>Featured Hero Items</h2>
			<p>Select items to show as cards in the homepage hero section.</p>
		</div>
		<button type="button" class="btn-primary" onclick={saveFeatured} disabled={isSaving || isLoadingItems}>
			{isSaving ? 'Saving...' : 'Save Featured'}
		</button>
	</div>

	{#if saveMessage}
		<p class="save-message" aria-live="polite">{saveMessage}</p>
	{/if}
	{#if saveError}
		<p class="save-error" aria-live="polite">{saveError}</p>
	{/if}

	{#if isLoadingItems}
		<p class="loading">Loading catalog...</p>
	{:else}
		<div class="featured-grid">
			{#each items as item (item.id)}
				<button
					type="button"
					class="featured-item-card"
					class:is-selected={selectedItemIds.includes(item.id)}
					onclick={() => toggleFeaturedItem(item.id)}
					aria-pressed={selectedItemIds.includes(item.id)}
				>
					<div class="image-wrap">
						{#if item.imageUrl}
							<img src={item.imageUrl} alt={item.name} />
						{:else}
							<div class="image-placeholder">No image</div>
						{/if}
					</div>
					<div class="item-meta">
						<h3>{item.name}</h3>
						<p>{formatPrice(item.price)}</p>
					</div>
					<label class="checkbox-row">
						<input
							type="checkbox"
							checked={selectedItemIds.includes(item.id)}
							onclick={(event) => event.stopPropagation()}
							onchange={() => toggleFeaturedItem(item.id)}
						/>
						<span>Featured</span>
					</label>
				</button>
			{/each}
		</div>
	{/if}
</div>

<style lang="scss">
	.featured-page {
		width: 100%;
	}

	.page-header {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		flex-wrap: wrap;
		align-items: center;
		margin-bottom: 1rem;

		h2 {
			margin: 0;
			color: var(--text-primary);
		}

		p {
			margin: 0.35rem 0 0;
			color: var(--muted);
		}
	}

	.btn-primary {
		border: none;
		border-radius: 10px;
		padding: 0.7rem 1.1rem;
		font-weight: 700;
		cursor: pointer;
		background: linear-gradient(135deg, var(--accent), var(--accent-2));
		color: #fff;
	}

	.save-message {
		color: #34d399;
		margin: 0 0 1rem;
		font-weight: 600;
	}

	.save-error {
		color: #f87171;
		margin: 0 0 1rem;
		font-weight: 600;
	}

	.loading {
		color: var(--muted);
	}

	.featured-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
		gap: 1rem;
	}

	.featured-item-card {
		text-align: left;
		border: 1px solid var(--panel-border);
		border-radius: 12px;
		background: rgba(42, 36, 56, 0.6);
		padding: 0.6rem;
		cursor: pointer;
		color: inherit;
		transition: border-color 0.2s ease, box-shadow 0.2s ease;

		&.is-selected {
			border-color: var(--accent);
			box-shadow: 0 0 0 2px rgba(167, 139, 250, 0.22);
		}
	}

	.image-wrap {
		width: 100%;
		aspect-ratio: 1 / 1;
		overflow: hidden;
		border-radius: 10px;
		border: 1px solid var(--border-secondary);
		background: rgba(0, 0, 0, 0.2);

		img {
			width: 100%;
			height: 100%;
			object-fit: cover;
			display: block;
		}
	}

	.image-placeholder {
		width: 100%;
		height: 100%;
		display: grid;
		place-items: center;
		color: var(--muted);
		font-size: 0.9rem;
	}

	.item-meta {
		padding: 0.65rem 0.2rem 0.4rem;

		h3 {
			margin: 0;
			color: var(--text-primary);
			font-size: 0.95rem;
			line-height: 1.3;
		}

		p {
			margin: 0.25rem 0 0;
			color: var(--accent);
			font-weight: 700;
		}
	}

	.checkbox-row {
		display: flex;
		align-items: center;
		gap: 0.45rem;
		color: var(--text-secondary);
		font-size: 0.85rem;
		padding: 0 0.2rem 0.25rem;

		input {
			accent-color: var(--accent);
		}
	}
</style>
