<script>
	import { Button, Input, Label, FormGroup } from '$lib';
	import { onMount, untrack } from 'svelte';

	const { data } = $props();

	let config = $state(untrack(() => data.config || { taggedGrids: [], searchFilterTags: [] }));
	let isSaving = $state(false);

	// Temporary state for new tags

	// Available tags from Square
	let availableTags = $state([]);
	let isFetchingTags = $state(false);

	async function fetchAvailableTags() {
		isFetchingTags = true;
		try {
			const res = await fetch('/api/all-tags');
			if (res.ok) {
				const data = await res.json();
				availableTags = data.tags || [];
			}
		} catch (e) {
			console.error('Failed to fetch tags', e);
		} finally {
			isFetchingTags = false;
		}
	}

	onMount(() => {
		fetchAvailableTags();
	});

	function addGrid() {
		config.taggedGrids = [
			...config.taggedGrids,
			{
				id: crypto.randomUUID(),
				title: 'New Grid',
				allowedTags: [],
				deniedTags: [],
				maxRows: 1
			}
		];
	}

	function removeGrid(id) {
		config.taggedGrids = config.taggedGrids.filter((g) => g.id !== id);
	}

	function addTagToGrid(gridId, type, tagValue) {
		const tag = tagValue.trim().toLowerCase();
		if (!tag) return;

		config.taggedGrids = config.taggedGrids.map((grid) => {
			if (grid.id === gridId) {
				if (!grid[type].includes(tag)) {
					grid[type] = [...grid[type], tag];
				}
			}
			return grid;
		});
	}

	function handleGridTagInput(gridId, type, e) {
		if (e.key === 'Enter') {
			e.preventDefault();
			addTagToGrid(gridId, type, e.target.value);
			e.target.value = '';
		}
	}

	function removeTagFromGrid(gridId, type, tagToRemove) {
		config.taggedGrids = config.taggedGrids.map((grid) => {
			if (grid.id === gridId) {
				grid[type] = grid[type].filter((tag) => tag !== tagToRemove);
			}
			return grid;
		});
	}

	function addSearchFilterTagValue(tagValue) {
		const tag = tagValue.trim().toLowerCase();
		if (tag && !config.searchFilterTags.includes(tag)) {
			config.searchFilterTags = [...config.searchFilterTags, tag];
		}
	}

	function removeSearchFilterTag(tagToRemove) {
		config.searchFilterTags = config.searchFilterTags.filter((tag) => tag !== tagToRemove);
	}

	async function saveConfig() {
		isSaving = true;
		try {
			const response = await fetch('/admin/storefront', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					id: 'main',
					taggedGrids: config.taggedGrids,
					searchFilterTags: config.searchFilterTags
				})
			});

			if (!response.ok) throw new Error('Failed to save');
			alert('Storefront configuration saved successfully!');
		} catch (error) {
			console.error(error);
			alert('Error saving configuration.');
		} finally {
			isSaving = false;
		}
	}
</script>

<div class="storefront-admin">
	<div class="page-header">
		<div class="header-left">
			<h2 class="page-title">Storefront Manager</h2>
		</div>
		<Button variant="primary" onclick={saveConfig} disabled={isSaving}>
			<i class="fas fa-save"></i>
			{isSaving ? 'Saving...' : 'Save Configuration'}
		</Button>
	</div>

	<!-- Available Tags Reference -->
	<section class="admin-section theme-glass available-tags-section">
		<div class="section-header">
			<h3>Available Square Categories</h3>
			<Button variant="ghost" onclick={fetchAvailableTags} disabled={isFetchingTags}>
				<i class="fas fa-sync" class:fa-spin={isFetchingTags}></i>
				{isFetchingTags ? 'Fetching...' : 'Refresh Categories'}
			</Button>
		</div>
		<p class="help-text">
			Click any of these categories found in your Square inventory to quickly copy them into your
			Grid allowed/denied lists below.
		</p>

		<div class="tags available-tags-list">
			{#if availableTags.length === 0 && !isFetchingTags}
				<span class="muted">No categories found. Create categories in your Square Dashboard.</span>
			{/if}
			{#each availableTags as tag (tag)}
				<button
					class="tag available-tag-btn"
					onclick={() =>
						navigator.clipboard.writeText(tag).then(() => alert(`Copied '${tag}' to clipboard`))}
					title="Click to copy name"
				>
					{tag} <i class="fas fa-copy"></i>
				</button>
			{/each}
		</div>
	</section>

	<!-- Homepage Grids Section -->
	<section class="admin-section theme-glass">
		<div class="section-header">
			<h3>Homepage Product Grids</h3>
			<Button variant="ghost" onclick={addGrid}>+ Add Grid</Button>
		</div>
		<p class="help-text">
			Configure the horizontal scrolling product lists on your homepage. Items will be fetched from
			Square based on the tags below matching the item name or description.
		</p>

		<div class="grids-list">
			{#each config.taggedGrids as grid (grid.id)}
				<div class="grid-editor">
					<div class="grid-header">
						<Input bind:value={grid.title} placeholder="Grid Title (e.g. Featured Items)" />
						<button class="remove-btn" onclick={() => removeGrid(grid.id)} aria-label="Remove grid">
							<i class="fas fa-trash"></i>
						</button>
					</div>

					<div class="grid-config-row">
						<FormGroup>
							<Label>Allowed Tags</Label>
							<div class="tag-input-container">
								<div class="tags">
									{#each grid.allowedTags as tag (tag)}
										<span class="tag allowed">
											{tag}
											<button
												aria-label="Remove tag {tag}"
												onclick={() => removeTagFromGrid(grid.id, 'allowedTags', tag)}
												>&times;</button
											>
										</span>
									{/each}
								</div>
								<Input
									placeholder="Type tag and press Enter"
									onkeydown={(e) => handleGridTagInput(grid.id, 'allowedTags', e)}
								/>
							</div>
							<small class="help-text">Items MUST have at least one of these tags to appear.</small>
						</FormGroup>

						<FormGroup>
							<Label>Denied Tags</Label>
							<div class="tag-input-container">
								<div class="tags">
									{#each grid.deniedTags as tag (tag)}
										<span class="tag denied">
											{tag}
											<button
												aria-label="Remove tag {tag}"
												onclick={() => removeTagFromGrid(grid.id, 'deniedTags', tag)}
												>&times;</button
											>
										</span>
									{/each}
								</div>
								<Input
									placeholder="Type tag and press Enter"
									onkeydown={(e) => handleGridTagInput(grid.id, 'deniedTags', e)}
								/>
							</div>
							<small class="help-text">Items with ANY of these tags will be excluded.</small>
						</FormGroup>

						<FormGroup>
							<Label>Max Rows</Label>
							<Input type="number" min="1" max="5" bind:value={grid.maxRows} />
						</FormGroup>
					</div>
				</div>
			{/each}

			{#if config.taggedGrids.length === 0}
				<div class="empty-state">No grids configured. Add one above.</div>
			{/if}
		</div>
	</section>

	<!-- Search Filters Section -->
	<section class="admin-section theme-glass">
		<div class="section-header">
			<h3>Search Page Filters</h3>
		</div>
		<p class="help-text">
			Select which Square categories should appear as clickable filters on your Search/Shop page.
		</p>

		<div class="filter-checklist">
			{#if isFetchingTags}
				<p class="muted">Loading categories...</p>
			{:else if availableTags.length === 0}
				<p class="muted">
					No categories found in Square. Create categories in your Square Dashboard.
				</p>
			{:else}
				{#each availableTags as tag (tag)}
					<label class="checkbox-row">
						<input
							type="checkbox"
							checked={config.searchFilterTags.includes(tag)}
							onchange={(e) => {
								if (/** @type {HTMLInputElement} */ (e.target).checked) {
									addSearchFilterTagValue(tag);
								} else {
									removeSearchFilterTag(tag);
								}
							}}
						/>
						<span class="checkbox-label">{tag}</span>
						<span class="show-in-filters-text">Show in filters</span>
					</label>
				{/each}
			{/if}
		</div>
	</section>
</div>

<style lang="scss">
	.available-tags-section {
		border-color: var(--accent);
		background: linear-gradient(to bottom, rgba(167, 139, 250, 0.05), transparent);
	}

	.available-tags-list {
		padding: 1rem;
		background: var(--bg-secondary);
		border-radius: 8px;
		border: 1px dashed var(--border-secondary);
	}

	.available-tag-btn {
		background: var(--bg-panel);
		border: 1px solid var(--border-primary);
		color: var(--text-primary);
		padding: 0.5rem 1rem;
		border-radius: 20px;
		cursor: pointer;
		transition: all 0.2s;

		i {
			color: var(--accent);
			margin-left: 0.25rem;
			font-size: 0.9em;
		}

		&:hover {
			border-color: var(--accent);
			background: rgba(167, 139, 250, 0.1);
			transform: translateY(-2px);
		}
	}

	.muted {
		color: var(--muted);
		font-size: 0.9rem;
		font-style: italic;
	}

	.storefront-admin {
		display: flex;
		flex-direction: column;
		gap: 2rem;
		max-width: 1000px;
	}

	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.admin-section {
		padding: 2rem;
		border-radius: 12px;
		background: var(--bg-panel);
		border: 1px solid var(--border-secondary);
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.5rem;

		h3 {
			margin: 0;
			color: var(--text-primary);
		}
	}

	.help-text {
		color: var(--muted);
		font-size: 0.9rem;
		margin-bottom: 1.5rem;
	}

	.grids-list {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.grid-editor {
		padding: 1.5rem;
		background: var(--bg-secondary);
		border: 1px solid var(--border-primary);
		border-radius: 8px;

		.grid-header {
			display: flex;
			gap: 1rem;
			margin-bottom: 1.5rem;

			// Override input to take full width
			:global(input) {
				flex: 1;
				font-size: 1.1rem;
				font-weight: bold;
			}
		}
	}

	.grid-config-row {
		display: grid;
		grid-template-columns: 2fr 2fr 1fr;
		gap: 1.5rem;

		@media (max-width: 768px) {
			grid-template-columns: 1fr;
		}
	}

	.remove-btn {
		background: transparent;
		color: #ef4444;
		border: 1px solid #ef4444;
		border-radius: 8px;
		width: 42px;
		height: 42px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.2s;

		&:hover {
			background: rgba(239, 68, 68, 0.1);
		}
	}

	.tag-input-container {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;

		.tags {
			display: flex;
			flex-wrap: wrap;
			gap: 0.5rem;
			min-height: 32px; // Keep space even if empty
		}
	}

	.tag {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.25rem 0.75rem;
		border-radius: 16px;
		font-size: 0.85rem;
		font-weight: 500;

		button {
			background: transparent;
			border: none;
			color: inherit;
			font-size: 1.1rem;
			cursor: pointer;
			padding: 0;
			line-height: 1;
			opacity: 0.7;

			&:hover {
				opacity: 1;
			}
		}

		&.allowed {
			background: rgba(16, 185, 129, 0.1);
			color: #10b981;
			border: 1px solid rgba(16, 185, 129, 0.2);
		}

		&.denied {
			background: rgba(239, 68, 68, 0.1);
			color: #ef4444;
			border: 1px solid rgba(239, 68, 68, 0.2);
		}
	}

	.filter-checklist {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		background: var(--bg-secondary);
		padding: 1.5rem;
		border-radius: 8px;
		border: 1px solid var(--border-primary);
	}

	.checkbox-row {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 0.75rem 1rem;
		background: var(--bg-panel);
		border: 1px solid var(--border-secondary);
		border-radius: 8px;
		cursor: pointer;
		transition: all 0.2s ease;

		&:hover {
			border-color: var(--accent);
			background: rgba(167, 139, 250, 0.05);
		}

		input[type='checkbox'] {
			width: 1.25rem;
			height: 1.25rem;
			accent-color: var(--accent);
			cursor: pointer;
		}
	}

	.checkbox-label {
		flex: 1;
		color: var(--text-primary);
		font-weight: 500;
		font-size: 1.05rem;
		text-transform: capitalize;
	}

	.show-in-filters-text {
		color: var(--muted);
		font-size: 0.85rem;
	}

	.empty-state {
		text-align: center;
		padding: 2rem;
		color: var(--muted);
		border: 1px dashed var(--border-secondary);
		border-radius: 8px;
	}

	@media (max-width: 768px) {
		.storefront-admin {
			gap: 1.25rem;
		}

		.page-header {
			flex-direction: column;
			align-items: stretch;
			gap: 0.75rem;
		}

		.admin-section {
			padding: 1rem;
		}

		.section-header {
			flex-wrap: wrap;
			gap: 0.5rem;
		}

		.grid-editor {
			padding: 1rem;

			.grid-header {
				flex-wrap: wrap;
			}
		}

		.filter-checklist {
			padding: 1rem;
		}

		.checkbox-row {
			padding: 0.5rem 0.75rem;
			gap: 0.5rem;
		}

		.show-in-filters-text {
			display: none;
		}
	}
</style>
