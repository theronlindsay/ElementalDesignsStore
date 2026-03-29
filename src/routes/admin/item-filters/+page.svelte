<script>
	import { Input, Label, FormGroup } from '$lib';
	import { onMount, untrack } from 'svelte';

	const { data } = $props();

	const defaultFilterConfig = {
		primaryCategories: [],
		tagGroups: [
			{ id: crypto.randomUUID(), label: 'Weave', tags: [], mode: 'or', selectionMode: 'multi' },
			{ id: crypto.randomUUID(), label: 'Color', tags: [], mode: 'or', selectionMode: 'multi' },
			{ id: crypto.randomUUID(), label: 'Category', tags: [], mode: 'or', selectionMode: 'single' },
			{
				id: crypto.randomUUID(),
				label: 'Subcategory',
				tags: [],
				mode: 'or',
				selectionMode: 'single'
			}
		],
		categoryMappings: [],
		universalFilters: {
			tagGroupIds: [],
			subcategoryTags: [],
			extraTags: []
		}
	};

	function migrateConfig(raw) {
		const cfg = structuredClone(raw);
		if (cfg.tagGroups && !Array.isArray(cfg.tagGroups)) {
			const flat = [];
			for (const [, groups] of Object.entries(cfg.tagGroups)) {
				if (Array.isArray(groups)) flat.push(...groups);
			}
			cfg.tagGroups = flat;
		}
		if (!cfg.primaryCategories) cfg.primaryCategories = [];
		if (!cfg.tagGroups) cfg.tagGroups = [];
		cfg.tagGroups = cfg.tagGroups.map((g) => ({ mode: 'or', selectionMode: 'multi', ...g }));
		if (!cfg.categoryMappings) cfg.categoryMappings = [];
		if (!cfg.universalFilters)
			cfg.universalFilters = { tagGroupIds: [], subcategoryTags: [], extraTags: [] };
		return cfg;
	}

	const config = $state(
		untrack(() =>
			data.config?.itemFilterConfig
				? migrateConfig(data.config.itemFilterConfig)
				: structuredClone(defaultFilterConfig)
		)
	);

	let isSaving = $state(false);
	let activeTab = $state('primary');

	let availableTags = $state([]);
	let isFetchingTags = $state(false);

	function findOrCreateMapping(primaryCategoryId) {
		let mapping = config.categoryMappings.find((m) => m.primaryCategoryId === primaryCategoryId);
		if (!mapping) {
			mapping = {
				primaryCategoryId,
				subcategoryTags: [],
				tagGroupIds: [],
				extraTags: []
			};
			config.categoryMappings = [...config.categoryMappings, mapping];
		}
		return mapping;
	}

	async function fetchAvailableTags() {
		isFetchingTags = true;
		try {
			const res = await fetch('/api/all-tags');
			if (res.ok) {
				const body = await res.json();
				availableTags = body.tags || [];
			}
		} catch (err) {
			console.error('Failed to fetch tags', err);
		} finally {
			isFetchingTags = false;
		}
	}

	onMount(() => {
		fetchAvailableTags();
	});

	function addPrimaryCategory() {
		config.primaryCategories = [
			...config.primaryCategories,
			{ id: crypto.randomUUID(), label: 'New Primary Category', tagKey: '' }
		];
	}

	function removePrimaryCategory(id) {
		config.primaryCategories = config.primaryCategories.filter((c) => c.id !== id);
		config.categoryMappings = config.categoryMappings.filter((m) => m.primaryCategoryId !== id);
	}

	function movePrimaryCategory(index, direction) {
		const arr = [...config.primaryCategories];
		if (direction === 'up' && index > 0) {
			[arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
		}
		if (direction === 'down' && index < arr.length - 1) {
			[arr[index], arr[index + 1]] = [arr[index + 1], arr[index]];
		}
		config.primaryCategories = arr;
	}

	function addTagGroup() {
		config.tagGroups = [
			...(config.tagGroups || []),
			{ id: crypto.randomUUID(), label: 'New Group', tags: [], mode: 'or', selectionMode: 'multi' }
		];
	}

	function removeTagGroup(id) {
		config.tagGroups = (config.tagGroups || []).filter((g) => g.id !== id);
		config.categoryMappings = config.categoryMappings.map((m) => ({
			...m,
			tagGroupIds: (m.tagGroupIds || []).filter((gid) => gid !== id)
		}));
	}

	function handleGroupTagInput(groupId, e) {
		if (e.key === 'Enter') {
			e.preventDefault();
			const value = e.target.value.trim().toLowerCase();
			if (!value) return;
			config.tagGroups = (config.tagGroups || []).map((g) => {
				if (g.id === groupId && !g.tags.includes(value)) {
					g.tags = [...g.tags, value];
				}
				return g;
			});
			e.target.value = '';
		}
	}

	function removeTagFromGroup(groupId, tagToRemove) {
		config.tagGroups = (config.tagGroups || []).map((g) => {
			if (g.id === groupId) {
				g.tags = g.tags.filter((t) => t !== tagToRemove);
			}
			return g;
		});
	}

	const UNIVERSAL_ID = '__universal__';
	let selectedPrimaryId = $state(UNIVERSAL_ID);

	let isUniversalSelected = $derived(selectedPrimaryId === UNIVERSAL_ID);

	let selectedPrimary = $derived(
		isUniversalSelected ? null : config.primaryCategories.find((c) => c.id === selectedPrimaryId)
	);

	let mappingForSelected = $derived(
		isUniversalSelected
			? null
			: selectedPrimaryId
				? (config.categoryMappings.find((m) => m.primaryCategoryId === selectedPrimaryId) ?? null)
				: null
	);

	function toggleSubcategoryForSelected(tag) {
		if (!selectedPrimaryId) return;
		const mapping = findOrCreateMapping(selectedPrimaryId);
		const list = mapping.subcategoryTags || [];
		if (list.includes(tag)) {
			mapping.subcategoryTags = list.filter((t) => t !== tag);
		} else {
			mapping.subcategoryTags = [...list, tag];
		}
		config.categoryMappings = [...config.categoryMappings];
	}

	function isSubcategorySelected(tag) {
		if (!selectedPrimaryId) return false;
		const mapping = config.categoryMappings.find((m) => m.primaryCategoryId === selectedPrimaryId);
		return mapping?.subcategoryTags?.includes(tag);
	}

	function toggleGroupForSelected(groupId) {
		if (!selectedPrimaryId) return;
		const mapping = findOrCreateMapping(selectedPrimaryId);
		const list = mapping.tagGroupIds || [];
		if (list.includes(groupId)) {
			mapping.tagGroupIds = list.filter((id) => id !== groupId);
		} else {
			mapping.tagGroupIds = [...list, groupId];
		}
		config.categoryMappings = [...config.categoryMappings];
	}

	function isGroupSelectedForSelected(groupId) {
		if (!selectedPrimaryId) return false;
		const mapping = config.categoryMappings.find((m) => m.primaryCategoryId === selectedPrimaryId);
		return mapping?.tagGroupIds?.includes(groupId);
	}

	function handleExtraTagInput(e) {
		if (!selectedPrimaryId) return;
		if (e.key === 'Enter') {
			e.preventDefault();
			const value = e.target.value.trim().toLowerCase();
			if (!value) return;
			const mapping = findOrCreateMapping(selectedPrimaryId);
			const list = mapping.extraTags || [];
			if (!list.includes(value)) {
				mapping.extraTags = [...list, value];
				config.categoryMappings = [...config.categoryMappings];
			}
			e.target.value = '';
		}
	}

	function removeExtraTag(tagToRemove) {
		if (!selectedPrimaryId) return;
		const mapping = config.categoryMappings.find((m) => m.primaryCategoryId === selectedPrimaryId);
		if (!mapping) return;
		mapping.extraTags = (mapping.extraTags || []).filter((t) => t !== tagToRemove);
		config.categoryMappings = [...config.categoryMappings];
	}

	// --- Universal filter helpers ---

	function toggleUniversalSubcategory(tag) {
		const list = config.universalFilters.subcategoryTags || [];
		if (list.includes(tag)) {
			config.universalFilters.subcategoryTags = list.filter((t) => t !== tag);
		} else {
			config.universalFilters.subcategoryTags = [...list, tag];
		}
		config.universalFilters = { ...config.universalFilters };
	}

	function toggleUniversalGroup(groupId) {
		const list = config.universalFilters.tagGroupIds || [];
		if (list.includes(groupId)) {
			config.universalFilters.tagGroupIds = list.filter((id) => id !== groupId);
		} else {
			config.universalFilters.tagGroupIds = [...list, groupId];
		}
		config.universalFilters = { ...config.universalFilters };
	}

	function handleUniversalExtraTagInput(e) {
		if (e.key === 'Enter') {
			e.preventDefault();
			const value = e.target.value.trim().toLowerCase();
			if (!value) return;
			const list = config.universalFilters.extraTags || [];
			if (!list.includes(value)) {
				config.universalFilters.extraTags = [...list, value];
				config.universalFilters = { ...config.universalFilters };
			}
			e.target.value = '';
		}
	}

	function removeUniversalExtraTag(tagToRemove) {
		config.universalFilters.extraTags = (config.universalFilters.extraTags || []).filter(
			(t) => t !== tagToRemove
		);
		config.universalFilters = { ...config.universalFilters };
	}

	async function saveConfig() {
		isSaving = true;
		try {
			const response = await fetch('/admin/item-filters', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ itemFilterConfig: config })
			});
			if (!response.ok) throw new Error('Failed to save');
			alert('Item filter configuration saved successfully!');
		} catch (err) {
			console.error(err);
			alert('Error saving item filter configuration.');
		} finally {
			isSaving = false;
		}
	}
</script>

<div class="item-filters-admin">
	<div class="page-header">
		<div class="header-left">
			<h2 class="page-title">Item Search &amp; Filtering</h2>
			<p class="page-subtitle">
				Organize your Square categories into primary collections, tag groups, and subcategories for
				the storefront search experience.
			</p>
		</div>
		<button class="btn-save" onclick={saveConfig} disabled={isSaving}>
			<i class="fas fa-save"></i>
			{isSaving ? 'Saving...' : 'Save Configuration'}
		</button>
	</div>

	<div class="tabs">
		<button
			class="tab"
			class:active={activeTab === 'primary'}
			onclick={() => (activeTab = 'primary')}
		>
			<i class="fas fa-layer-group"></i>
			<span>Primary Categories</span>
		</button>
		<button
			class="tab"
			class:active={activeTab === 'groups'}
			onclick={() => (activeTab = 'groups')}
		>
			<i class="fas fa-tags"></i>
			<span>Tag Groups</span>
		</button>
		<button
			class="tab"
			class:active={activeTab === 'mapping'}
			onclick={() => (activeTab = 'mapping')}
		>
			<i class="fas fa-project-diagram"></i>
			<span>Category Mapping</span>
		</button>
	</div>

	{#if activeTab === 'primary'}
		<section class="admin-section">
			<div class="section-header">
				<h3>Primary Categories</h3>
				<button class="btn-ghost" onclick={addPrimaryCategory}>+ Add Primary</button>
			</div>
			<p class="help-text">
				These are the top-level categories customers will see in the search sidebar. Match
				<code>tag key</code> to a Square category name (in lowercase) so items can be grouped correctly.
			</p>

			<div class="primary-layout">
				<div class="primary-list">
					{#each config.primaryCategories as cat, index (cat.id)}
						<div class="primary-card">
							<div class="primary-header">
								<div class="reorder-controls">
									<button
										disabled={index === 0}
										onclick={() => movePrimaryCategory(index, 'up')}
										aria-label="Move Up"
									>
										<i class="fas fa-chevron-up"></i>
									</button>
									<button
										disabled={index === config.primaryCategories.length - 1}
										onclick={() => movePrimaryCategory(index, 'down')}
										aria-label="Move Down"
									>
										<i class="fas fa-chevron-down"></i>
									</button>
								</div>
								<button
									class="remove-btn"
									onclick={() => removePrimaryCategory(cat.id)}
									aria-label="Remove"
								>
									<i class="fas fa-trash"></i>
								</button>
							</div>
							<div class="primary-body">
								<FormGroup>
									<Label>Display Label</Label>
									<Input bind:value={cat.label} placeholder="e.g. Jewelry" />
								</FormGroup>
								<FormGroup>
									<Label>Tag Key (Square Category Name)</Label>
									<Input bind:value={cat.tagKey} placeholder="e.g. jewelry" />
								</FormGroup>
							</div>
						</div>
					{/each}
					{#if config.primaryCategories.length === 0}
						<div class="empty-state">No primary categories configured. Add one above.</div>
					{/if}
				</div>

				<div class="available-tags-panel">
					<div class="section-header">
						<h4>Square Categories Reference</h4>
						<button class="btn-ghost" onclick={fetchAvailableTags} disabled={isFetchingTags}>
							<i class="fas fa-sync" class:fa-spin={isFetchingTags}></i>
							{isFetchingTags ? 'Refreshing...' : 'Refresh'}
						</button>
					</div>
					<p class="help-text small">Click a category name to copy it.</p>
					<div class="tags available-tags-list">
						{#if isFetchingTags}
							<span class="muted">Loading categories...</span>
						{:else if availableTags.length === 0}
							<span class="muted">No categories found in Square.</span>
						{:else}
							{#each availableTags as tag (tag)}
								<button
									class="tag available-tag-btn"
									onclick={() =>
										navigator.clipboard.writeText(tag).then(() => alert(`Copied '${tag}'`))}
								>
									{tag} <i class="fas fa-copy"></i>
								</button>
							{/each}
						{/if}
					</div>
				</div>
			</div>
		</section>
	{:else if activeTab === 'groups'}
		<section class="admin-section">
			<div class="section-header">
				<h3>Tag Groups</h3>
				<button class="btn-ghost" onclick={addTagGroup}>+ Add Group</button>
			</div>
			<p class="help-text">
				Create reusable tag groups that can be attached to primary categories to appear as filter
				sections in the search sidebar (e.g. Weave, Color). Each group has a label and a set of
				tags.
			</p>

			<div class="groups-list">
				{#each config.tagGroups || [] as group (group.id)}
					<div class="group-card">
						<div class="group-header">
							<Input bind:value={group.label} placeholder="Group label (e.g. Weave, Color)" />
							<div class="mode-toggles">
								<div
									class="mode-toggle"
									title={group.mode === 'and'
										? 'AND: item must match all selected tags'
										: 'OR: item must match at least one selected tag'}
								>
									<button
										class="mode-btn"
										class:active={group.mode !== 'and'}
										onclick={() => {
											group.mode = 'or';
											config.tagGroups = [...config.tagGroups];
										}}>OR</button
									>
									<button
										class="mode-btn"
										class:active={group.mode === 'and'}
										onclick={() => {
											group.mode = 'and';
											config.tagGroups = [...config.tagGroups];
										}}>AND</button
									>
								</div>
								<div
									class="mode-toggle"
									title={group.selectionMode === 'single'
										? 'Single: customer can only select one tag'
										: 'Multi: customer can select multiple tags'}
								>
									<button
										class="mode-btn"
										class:active={group.selectionMode !== 'single'}
										aria-label="Multi-select mode"
										onclick={() => {
											group.selectionMode = 'multi';
											config.tagGroups = [...config.tagGroups];
										}}><i class="fas fa-check-double"></i></button
									>
									<button
										class="mode-btn"
										class:active={group.selectionMode === 'single'}
										aria-label="Single-select mode"
										onclick={() => {
											group.selectionMode = 'single';
											config.tagGroups = [...config.tagGroups];
										}}><i class="fas fa-check"></i></button
									>
								</div>
							</div>
							<button
								class="remove-btn"
								onclick={() => removeTagGroup(group.id)}
								aria-label="Remove group"
							>
								<i class="fas fa-trash"></i>
							</button>
						</div>
						<div class="mode-hints">
							<span class="mode-hint">
								{#if group.mode === 'and'}
									<i class="fas fa-filter"></i> Must match <strong>all</strong> selected
								{:else}
									<i class="fas fa-random"></i> Match <strong>any</strong> selected
								{/if}
							</span>
							<span class="mode-hint">
								{#if group.selectionMode === 'single'}
									<i class="fas fa-hand-pointer"></i> Select <strong>one</strong> at a time
								{:else}
									<i class="fas fa-tasks"></i> Select <strong>multiple</strong>
								{/if}
							</span>
						</div>
						<div class="tag-input-container">
							<div class="tags">
								{#each group.tags || [] as tag (tag)}
									<span class="tag group-tag">
										{tag}
										<button
											aria-label="Remove tag {tag}"
											onclick={() => removeTagFromGroup(group.id, tag)}>&times;</button
										>
									</span>
								{/each}
							</div>
							<Input
								placeholder="Type tag and press Enter"
								onkeydown={(e) => handleGroupTagInput(group.id, e)}
							/>
						</div>
					</div>
				{/each}
				{#if (config.tagGroups || []).length === 0}
					<div class="empty-state">
						No tag groups configured. Click "+ Add Group" to create one.
					</div>
				{/if}
			</div>
		</section>
	{:else if activeTab === 'mapping'}
		<section class="admin-section">
			<div class="section-header">
				<h3>Category &amp; Filter Mapping</h3>
			</div>
			<p class="help-text">
				Choose how each primary category behaves in the search sidebar: which subcategories appear
				(only when that category is active) and which tag groups or extra tags are shown under it.
			</p>

			<div class="mapping-layout">
				<div class="mapping-sidebar">
					<Label>Scope</Label>
					<div class="mapping-primary-list">
						<button
							class="mapping-primary-btn universal"
							class:active={isUniversalSelected}
							onclick={() => (selectedPrimaryId = UNIVERSAL_ID)}
						>
							<span class="cat-label"><i class="fas fa-globe"></i> Universal</span>
							<span class="tag-key">Shown on all categories</span>
						</button>
						{#each config.primaryCategories as cat (cat.id)}
							<button
								class="mapping-primary-btn"
								class:active={selectedPrimaryId === cat.id}
								onclick={() => (selectedPrimaryId = cat.id)}
							>
								<span class="cat-label">{cat.label}</span>
								<span class="tag-key">{cat.tagKey}</span>
							</button>
						{/each}
					</div>
				</div>

				{#if isUniversalSelected}
					<div class="mapping-detail">
						<h4 class="mapping-title">
							<i class="fas fa-globe"></i> Universal Filters
						</h4>
						<p class="help-text small">
							These filters appear in the search sidebar regardless of which category is active.
						</p>

						<div class="mapping-sections">
							<div class="mapping-section">
								<h5>Subcategory Tags</h5>
								<p class="help-text small">
									Select Square categories that should always appear as filter options.
								</p>
								<div class="mapping-tags-grid">
									{#if isFetchingTags}
										<span class="muted small">Loading categories...</span>
									{:else if availableTags.length === 0}
										<span class="muted small">No categories found in Square.</span>
									{:else}
										{#each availableTags as tag (tag)}
											<button
												class="tag selectable-tag"
												class:active={(config.universalFilters.subcategoryTags || []).includes(tag)}
												onclick={() => toggleUniversalSubcategory(tag)}
											>
												{tag}
											</button>
										{/each}
									{/if}
								</div>
							</div>

							<div class="mapping-section">
								<h5>Attach Tag Groups</h5>
								<p class="help-text small">Tag groups selected here will show on every category.</p>
								{#if (config.tagGroups || []).length === 0}
									<p class="muted small">
										No tag groups defined. Create some in the "Tag Groups" tab first.
									</p>
								{:else}
									<div class="group-mapping-list">
										{#each config.tagGroups || [] as group (group.id)}
											<label class="group-mapping-row">
												<input
													type="checkbox"
													checked={(config.universalFilters.tagGroupIds || []).includes(group.id)}
													onchange={() => toggleUniversalGroup(group.id)}
												/>
												<span class="group-label">{group.label}</span>
												<span class="group-tag-count">{group.tags?.length || 0} tags</span>
											</label>
										{/each}
									</div>
								{/if}
							</div>

							<div class="mapping-section">
								<h5>Extra Standalone Tags</h5>
								<p class="help-text small">
									Individual tags that always appear in the filter panel.
								</p>
								<div class="tag-input-container">
									<div class="tags">
										{#each config.universalFilters.extraTags || [] as tag (tag)}
											<span class="tag extra-tag">
												{tag}
												<button
													aria-label="Remove tag {tag}"
													onclick={() => removeUniversalExtraTag(tag)}>&times;</button
												>
											</span>
										{/each}
									</div>
									<Input
										placeholder="Type tag and press Enter"
										onkeydown={handleUniversalExtraTagInput}
									/>
								</div>
							</div>
						</div>
					</div>
				{:else if selectedPrimaryId}
					<div class="mapping-detail">
						<h4 class="mapping-title">
							Filters for: <span>{selectedPrimary?.label || 'Unnamed Category'}</span>
						</h4>

						<div class="mapping-sections">
							<div class="mapping-section">
								<h5>Subcategories (Shown Only When Primary Is Active)</h5>
								<p class="help-text small">
									Select which Square categories should appear as subcategory filters when this
									primary category is selected.
								</p>
								<div class="mapping-tags-grid">
									{#if isFetchingTags}
										<span class="muted small">Loading categories...</span>
									{:else if availableTags.length === 0}
										<span class="muted small">No categories found in Square.</span>
									{:else}
										{#each availableTags as tag (tag)}
											<button
												class="tag selectable-tag"
												class:active={isSubcategorySelected(tag)}
												onclick={() => toggleSubcategoryForSelected(tag)}
											>
												{tag}
											</button>
										{/each}
									{/if}
								</div>
							</div>

							<div class="mapping-section">
								<h5>Attach Tag Groups</h5>
								<p class="help-text small">
									Choose which tag groups should show up under this category's filter panel.
								</p>
								{#if (config.tagGroups || []).length === 0}
									<p class="muted small">
										No tag groups defined. Create some in the "Tag Groups" tab first.
									</p>
								{:else}
									<div class="group-mapping-list">
										{#each config.tagGroups || [] as group (group.id)}
											<label class="group-mapping-row">
												<input
													type="checkbox"
													checked={isGroupSelectedForSelected(group.id)}
													onchange={() => toggleGroupForSelected(group.id)}
												/>
												<span class="group-label">{group.label}</span>
												<span class="group-tag-count">{group.tags?.length || 0} tags</span>
											</label>
										{/each}
									</div>
								{/if}
							</div>

							<div class="mapping-section">
								<h5>Extra Standalone Tags</h5>
								<p class="help-text small">
									Optional: add individual tags under this category's filters.
								</p>
								<div class="tag-input-container">
									<div class="tags">
										{#each mappingForSelected?.extraTags || [] as tag (tag)}
											<span class="tag extra-tag">
												{tag}
												<button aria-label="Remove tag {tag}" onclick={() => removeExtraTag(tag)}
													>&times;</button
												>
											</span>
										{/each}
									</div>
									<Input placeholder="Type tag and press Enter" onkeydown={handleExtraTagInput} />
								</div>
							</div>
						</div>
					</div>
				{:else}
					<div class="mapping-detail empty">
						<p class="muted">Select a scope on the left to configure filters.</p>
					</div>
				{/if}
			</div>
		</section>
	{/if}
</div>

<style lang="scss">
	.item-filters-admin {
		display: flex;
		flex-direction: column;
		gap: 2rem;
		max-width: 1100px;
	}

	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.page-subtitle {
		color: var(--muted);
		margin-top: 0.25rem;
		font-size: 0.95rem;
	}

	.btn-save {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1.25rem;
		border-radius: 12px;
		border: none;
		background: linear-gradient(135deg, var(--accent), var(--accent-2));
		color: white;
		cursor: pointer;
		font-weight: 600;
		font-size: 0.9rem;
		transition: all 0.2s;
		white-space: nowrap;

		&:hover:not(:disabled) {
			transform: translateY(-1px);
			box-shadow: 0 4px 12px rgba(167, 139, 250, 0.35);
		}

		&:disabled {
			opacity: 0.6;
			cursor: not-allowed;
		}
	}

	.btn-ghost {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.4rem 0.75rem;
		border-radius: 8px;
		border: 1px solid var(--border-secondary);
		background: transparent;
		color: var(--muted);
		cursor: pointer;
		font-weight: 600;
		font-size: 0.85rem;
		transition: all 0.2s;

		&:hover:not(:disabled) {
			border-color: var(--accent);
			color: var(--accent);
			background: rgba(167, 139, 250, 0.06);
		}

		&:disabled {
			opacity: 0.5;
			cursor: not-allowed;
		}
	}

	.tabs {
		display: inline-flex;
		gap: 0.5rem;
		background: var(--bg-panel);
		border-radius: 999px;
		padding: 0.25rem;
		border: 1px solid var(--border-secondary);
		width: fit-content;
	}

	.tab {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		border-radius: 999px;
		border: none;
		padding: 0.4rem 0.9rem;
		background: transparent;
		color: var(--muted);
		cursor: pointer;
		font-size: 0.9rem;
		transition: all 0.2s;

		&.active {
			background: var(--accent);
			color: white;
			box-shadow: 0 4px 12px rgba(167, 139, 250, 0.35);
		}
	}

	.admin-section {
		margin-top: 0.5rem;
		padding: 1.75rem 2rem;
		border-radius: 12px;
		background: var(--bg-panel);
		border: 1px solid var(--border-secondary);
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.5rem;

		h3,
		h4 {
			margin: 0;
		}
	}

	.help-text {
		color: var(--muted);
		font-size: 0.9rem;
		margin-bottom: 1.25rem;

		&.small {
			font-size: 0.85rem;
			margin-bottom: 0.75rem;
		}
	}

	.primary-layout {
		display: grid;
		grid-template-columns: 2fr 1.5fr;
		gap: 1.5rem;

		@media (max-width: 900px) {
			grid-template-columns: 1fr;
		}
	}

	.primary-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.primary-card {
		background: var(--bg-secondary);
		border-radius: 10px;
		border: 1px solid var(--border-primary);
		padding: 1rem 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.primary-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.75rem;
	}

	.reorder-controls {
		display: inline-flex;
		gap: 0.25rem;

		button {
			width: 28px;
			height: 28px;
			border-radius: 6px;
			border: 1px solid var(--border-secondary);
			background: var(--bg-panel);
			color: var(--text-primary);
			display: flex;
			align-items: center;
			justify-content: center;
			cursor: pointer;
			transition: all 0.2s;

			&:hover:not(:disabled) {
				border-color: var(--accent);
				color: var(--accent);
			}
			&:disabled {
				opacity: 0.3;
				cursor: not-allowed;
			}
		}
	}

	.primary-body {
		display: grid;
		grid-template-columns: 1.2fr 1fr;
		gap: 1rem;

		@media (max-width: 700px) {
			grid-template-columns: 1fr;
		}
		:global(.form-group) {
			margin-bottom: 0;
		}
	}

	.available-tags-panel {
		background: var(--bg-secondary);
		border-radius: 10px;
		border: 1px solid var(--border-primary);
		padding: 1rem 1.25rem;
	}

	.available-tags-list {
		padding: 0.75rem;
		background: var(--bg-panel);
		border-radius: 8px;
		border: 1px dashed var(--border-secondary);
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		max-height: 260px;
		overflow: auto;
	}

	.tag {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.25rem 0.7rem;
		border-radius: 999px;
		font-size: 0.8rem;
		font-weight: 500;
	}

	.available-tag-btn {
		background: var(--bg-panel);
		border: 1px solid var(--border-primary);
		color: var(--text-primary);
		cursor: pointer;
		transition: all 0.2s;

		i {
			color: var(--accent);
			font-size: 0.8rem;
		}
		&:hover {
			border-color: var(--accent);
			background: rgba(167, 139, 250, 0.1);
			transform: translateY(-1px);
		}
	}

	.muted {
		color: var(--muted);
		&.small {
			font-size: 0.85rem;
		}
	}

	.empty-state {
		text-align: center;
		padding: 1.25rem;
		color: var(--muted);
		border-radius: 8px;
		border: 1px dashed var(--border-secondary);
		font-size: 0.9rem;
	}

	.groups-list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.group-card {
		background: var(--bg-secondary);
		border-radius: 8px;
		border: 1px solid var(--border-secondary);
		padding: 0.75rem 0.9rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.group-header {
		display: flex;
		gap: 0.75rem;
		align-items: center;
		:global(input) {
			flex: 1;
		}
	}

	.mode-toggle {
		display: inline-flex;
		border-radius: 6px;
		overflow: hidden;
		border: 1px solid var(--border-secondary);
		flex-shrink: 0;
	}

	.mode-btn {
		padding: 0.3rem 0.6rem;
		border: none;
		background: transparent;
		color: var(--muted);
		font-size: 0.75rem;
		font-weight: 700;
		cursor: pointer;
		transition: all 0.15s;

		&.active {
			background: var(--accent);
			color: white;
		}
	}

	.mode-toggles {
		display: flex;
		gap: 0.35rem;
		flex-shrink: 0;
	}

	.mode-hints {
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.mode-hint {
		margin: 0;
		font-size: 0.78rem;
		color: var(--muted);

		i {
			margin-right: 0.25rem;
		}
		strong {
			color: var(--text-primary);
		}
	}

	.remove-btn {
		background: transparent;
		color: #ef4444;
		border: 1px solid #ef4444;
		border-radius: 8px;
		width: 34px;
		height: 34px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		flex-shrink: 0;
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
			min-height: 26px;
		}
	}

	.group-tag {
		background: rgba(167, 139, 250, 0.1);
		color: var(--accent);
		border: 1px solid rgba(167, 139, 250, 0.3);

		button {
			background: transparent;
			border: none;
			color: inherit;
			cursor: pointer;
			font-size: 1rem;
			padding: 0;
			line-height: 1;
		}
	}

	/* ---- Responsive ---- */
	@media (max-width: 768px) {
		.item-filters-admin {
			gap: 1.25rem;
		}

		.page-header {
			flex-direction: column;
			align-items: stretch;
		}

		.tabs {
			flex-wrap: wrap;
			border-radius: 12px;
			width: 100%;
			justify-content: center;
		}

		.tab {
			font-size: 0.8rem;
			padding: 0.35rem 0.7rem;
			span {
				display: none;
			}
		}

		.admin-section {
			padding: 1rem 1rem;
		}

		.section-header {
			flex-wrap: wrap;
			gap: 0.5rem;
		}

		.group-header {
			flex-wrap: wrap;
		}

		.mode-toggles {
			order: 10;
			width: 100%;
			justify-content: flex-start;
		}

		.primary-card {
			padding: 0.75rem;
		}
	}

	@media (max-width: 480px) {
		.btn-save {
			width: 100%;
			justify-content: center;
		}
	}

	.mapping-layout {
		display: grid;
		grid-template-columns: 0.9fr 2fr;
		gap: 1.5rem;
		@media (max-width: 900px) {
			grid-template-columns: 1fr;
		}
	}

	.mapping-sidebar {
		background: var(--bg-secondary);
		border-radius: 10px;
		border: 1px solid var(--border-primary);
		padding: 1rem 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.mapping-primary-list {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		overflow: auto;

		@media (max-width: 900px) {
			flex-direction: row;
			flex-wrap: wrap;
		}
	}

	.mapping-primary-btn {
		width: 100%;
		text-align: left;

		@media (max-width: 900px) {
			width: auto;
			flex: 0 1 auto;
		}
		border-radius: 8px;
		border: 1px solid var(--border-secondary);
		background: var(--bg-panel);
		padding: 0.5rem 0.6rem;
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
		cursor: pointer;
		transition: all 0.2s;

		.cat-label {
			color: var(--text-primary);
			font-size: 0.9rem;
			font-weight: 600;
		}
		.tag-key {
			color: var(--muted);
			font-size: 0.8rem;
		}
		&.active {
			border-color: var(--accent);
			background: rgba(167, 139, 250, 0.1);
		}
		&.universal {
			border-style: dashed;
			.cat-label i {
				margin-right: 0.35rem;
				color: var(--accent);
			}
		}
		&.universal.active {
			border-style: solid;
		}
	}

	.mapping-detail {
		background: var(--bg-secondary);
		border-radius: 10px;
		border: 1px solid var(--border-primary);
		padding: 1rem 1.25rem;

		&.empty {
			display: flex;
			align-items: center;
			justify-content: center;
			min-height: 220px;
		}
	}

	.mapping-title {
		margin: 0 0 0.75rem 0;
		font-size: 1rem;
		color: var(--text-primary);
		span {
			font-weight: 600;
		}
	}

	.mapping-sections {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.mapping-section h5 {
		margin: 0 0 0.25rem 0;
		font-size: 0.95rem;
	}

	.mapping-tags-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
		max-height: 160px;
		overflow: auto;
		background: var(--bg-panel);
		border-radius: 8px;
		border: 1px solid var(--border-secondary);
		padding: 0.5rem;
	}

	.selectable-tag {
		background: var(--bg-panel);
		border: 1px solid var(--border-secondary);
		color: var(--text-primary);
		cursor: pointer;
		transition: all 0.15s;

		&.active {
			background: var(--accent);
			border-color: var(--accent);
			color: white;
		}
	}

	.group-mapping-list {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		max-height: 200px;
		overflow: auto;
		background: var(--bg-panel);
		border-radius: 8px;
		border: 1px solid var(--border-secondary);
		padding: 0.5rem 0.75rem;
	}

	.group-mapping-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.9rem;
		padding: 0.35rem 0;
		cursor: pointer;

		input[type='checkbox'] {
			accent-color: var(--accent);
		}
		.group-label {
			color: var(--text-primary);
			flex: 1;
		}
		.group-tag-count {
			color: var(--muted);
			font-size: 0.8rem;
		}
	}

	.extra-tag {
		background: rgba(16, 185, 129, 0.1);
		color: #10b981;
		border: 1px solid rgba(16, 185, 129, 0.3);

		button {
			background: transparent;
			border: none;
			color: inherit;
			cursor: pointer;
			font-size: 1rem;
			padding: 0;
			line-height: 1;
		}
	}
</style>
