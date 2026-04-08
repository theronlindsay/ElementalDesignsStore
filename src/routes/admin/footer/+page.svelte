<script>
	let { data } = $props();

	let sections = $state(structuredClone(data.footer?.sections ?? []));
	let isSaving = $state(false);
	let saveMessage = $state('');
	let saveError = $state('');

	function addSection() {
		sections = [
			...sections,
			{
				id: crypto.randomUUID(),
				title: 'New section',
				items: []
			}
		];
	}

	function removeSection(index) {
		sections = sections.filter((_, i) => i !== index);
	}

	function moveSection(index, direction) {
		if (direction === 'up' && index > 0) {
			const next = [...sections];
			[next[index - 1], next[index]] = [next[index], next[index - 1]];
			sections = next;
		} else if (direction === 'down' && index < sections.length - 1) {
			const next = [...sections];
			[next[index + 1], next[index]] = [next[index], next[index + 1]];
			sections = next;
		}
	}

	function addItem(sectionIndex) {
		const next = [...sections];
		const sec = next[sectionIndex];
		if (!sec) return;
		sec.items = [
			...sec.items,
			{
				id: crypto.randomUUID(),
				iconClass: '',
				text: 'New link',
				href: ''
			}
		];
		sections = next;
	}

	function removeItem(sectionIndex, itemIndex) {
		const next = [...sections];
		const sec = next[sectionIndex];
		if (!sec) return;
		sec.items = sec.items.filter((_, i) => i !== itemIndex);
		sections = next;
	}

	function moveItem(sectionIndex, itemIndex, direction) {
		const next = [...sections];
		const sec = next[sectionIndex];
		if (!sec) return;
		const items = [...sec.items];
		if (direction === 'up' && itemIndex > 0) {
			[items[itemIndex - 1], items[itemIndex]] = [items[itemIndex], items[itemIndex - 1]];
		} else if (direction === 'down' && itemIndex < items.length - 1) {
			[items[itemIndex + 1], items[itemIndex]] = [items[itemIndex], items[itemIndex + 1]];
		} else {
			return;
		}
		sec.items = items;
		sections = next;
	}

	function updateSectionTitle(index, title) {
		const next = [...sections];
		if (next[index]) next[index] = { ...next[index], title };
		sections = next;
	}

	function updateItem(sectionIndex, itemIndex, field, value) {
		const next = [...sections];
		const sec = next[sectionIndex];
		if (!sec || !sec.items[itemIndex]) return;
		const items = [...sec.items];
		items[itemIndex] = { ...items[itemIndex], [field]: value };
		sec.items = items;
		sections = next;
	}

	async function saveFooter() {
		isSaving = true;
		saveMessage = '';
		saveError = '';
		try {
			const response = await fetch('/admin/footer', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ sections })
			});
			if (!response.ok) {
				const text = await response.text().catch(() => '');
				throw new Error(text || 'Failed to save');
			}
			saveMessage = 'Footer saved successfully.';
		} catch (e) {
			console.error(e);
			saveError = 'Could not save footer. Please try again.';
		} finally {
			isSaving = false;
		}
	}
</script>

<svelte:head>
	<title>Footer - Admin</title>
</svelte:head>

<div class="footer-admin">
	<div class="page-header">
		<div>
			<h2>Footer</h2>
			<p>
				Organize footer columns and links. Optional <strong>Link</strong> leaves a text-only row (no
				click). Use Font Awesome classes (for example <code>fas fa-calendar</code>).
			</p>
		</div>
		<button type="button" class="btn-primary" onclick={saveFooter} disabled={isSaving}>
			{isSaving ? 'Saving...' : 'Save footer'}
		</button>
	</div>

	{#if saveMessage}
		<p class="msg ok">{saveMessage}</p>
	{/if}
	{#if saveError}
		<p class="msg err">{saveError}</p>
	{/if}

	<div class="toolbar">
		<button type="button" class="btn-secondary" onclick={addSection}>Add section</button>
	</div>

	<div class="sections">
		{#each sections as section, sIdx (section.id)}
			<section class="section-card">
				<div class="section-head">
					<label class="sr-only" for="section-title-{section.id}">Section title</label>
					<input
						id="section-title-{section.id}"
						type="text"
						class="section-title-input"
						value={section.title}
						oninput={(e) => updateSectionTitle(sIdx, e.currentTarget.value)}
					/>
					<div class="section-actions">
						<button
							type="button"
							class="icon-btn"
							onclick={() => moveSection(sIdx, 'up')}
							disabled={sIdx === 0}
							title="Move section up"
							aria-label="Move section up"
						>
							<i class="fas fa-arrow-up" aria-hidden="true"></i>
						</button>
						<button
							type="button"
							class="icon-btn"
							onclick={() => moveSection(sIdx, 'down')}
							disabled={sIdx === sections.length - 1}
							title="Move section down"
							aria-label="Move section down"
						>
							<i class="fas fa-arrow-down" aria-hidden="true"></i>
						</button>
						<button
							type="button"
							class="icon-btn danger"
							onclick={() => removeSection(sIdx)}
							title="Remove section"
							aria-label="Remove section"
						>
							<i class="fas fa-trash" aria-hidden="true"></i>
						</button>
					</div>
				</div>

				<ul class="items">
					{#each section.items as item, iIdx (item.id)}
						<li class="item-row">
							<div class="item-reorder">
								<button
									type="button"
									class="icon-btn sm"
									onclick={() => moveItem(sIdx, iIdx, 'up')}
									disabled={iIdx === 0}
									aria-label="Move link up"
								>
									<i class="fas fa-arrow-up" aria-hidden="true"></i>
								</button>
								<button
									type="button"
									class="icon-btn sm"
									onclick={() => moveItem(sIdx, iIdx, 'down')}
									disabled={iIdx === section.items.length - 1}
									aria-label="Move link down"
								>
									<i class="fas fa-arrow-down" aria-hidden="true"></i>
								</button>
							</div>
							<div class="item-fields">
								<input
									type="text"
									placeholder="Icon classes (optional)"
									class="fld"
									value={item.iconClass}
									oninput={(e) => updateItem(sIdx, iIdx, 'iconClass', e.currentTarget.value)}
								/>
								<input
									type="text"
									placeholder="Text"
									class="fld"
									value={item.text}
									oninput={(e) => updateItem(sIdx, iIdx, 'text', e.currentTarget.value)}
								/>
								<input
									type="text"
									placeholder="Link (optional)"
									class="fld wide"
									value={item.href ?? ''}
									oninput={(e) => updateItem(sIdx, iIdx, 'href', e.currentTarget.value)}
								/>
							</div>
							<button
								type="button"
								class="icon-btn danger"
								onclick={() => removeItem(sIdx, iIdx)}
								aria-label="Remove link"
							>
								<i class="fas fa-times" aria-hidden="true"></i>
							</button>
						</li>
					{/each}
				</ul>
				<button type="button" class="btn-add-item" onclick={() => addItem(sIdx)}>
					<i class="fas fa-plus" aria-hidden="true"></i>
					Add link
				</button>
			</section>
		{/each}
	</div>
</div>

<style lang="scss">
	.footer-admin {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.page-header {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1rem;

		h2 {
			margin: 0;
			color: var(--text-primary);
			font-size: clamp(1.35rem, 2.2vw, 1.85rem);
		}

		p {
			margin: 0.45rem 0 0;
			max-width: 52rem;
			color: var(--muted);
			line-height: 1.5;
			font-size: 0.95rem;
		}

		code {
			font-size: 0.88em;
			padding: 0.12em 0.35em;
			border-radius: 4px;
			background: color-mix(in srgb, var(--nav-bg) 80%, #000);
		}
	}

	.btn-primary {
		padding: 0.65rem 1.25rem;
		border: none;
		border-radius: 10px;
		font-weight: 600;
		cursor: pointer;
		background: linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%);
		color: #fff;
		flex-shrink: 0;

		&:disabled {
			opacity: 0.55;
			cursor: not-allowed;
		}
	}

	.btn-secondary {
		padding: 0.55rem 1rem;
		border-radius: 10px;
		border: 1px solid var(--panel-border);
		background: color-mix(in srgb, var(--nav-bg) 92%, transparent);
		color: var(--text-primary);
		cursor: pointer;
		font-weight: 600;

		&:hover {
			border-color: var(--accent);
		}
	}

	.msg {
		margin: 0;
		padding: 0.65rem 1rem;
		border-radius: 10px;
		font-size: 0.9rem;

		&.ok {
			background: color-mix(in srgb, #22c55e 18%, var(--nav-bg));
			border: 1px solid color-mix(in srgb, #22c55e 40%, transparent);
			color: #bbf7d0;
		}

		&.err {
			background: color-mix(in srgb, #f87171 14%, var(--nav-bg));
			border: 1px solid color-mix(in srgb, #f87171 35%, transparent);
			color: #fecaca;
		}
	}

	.toolbar {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	.sections {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.section-card {
		border: 1px solid var(--panel-border);
		border-radius: 14px;
		padding: 1.1rem 1.15rem;
		background: linear-gradient(180deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%),
			var(--panel-bg, var(--nav-bg));
	}

	.section-head {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 0.85rem;
	}

	.section-title-input {
		flex: 1 1 200px;
		min-width: 0;
		padding: 0.55rem 0.75rem;
		border-radius: 8px;
		border: 1px solid var(--panel-border);
		background: var(--nav-bg);
		color: var(--text-primary);
		font-weight: 700;
		font-size: 1.05rem;
	}

	.section-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem;
		margin-left: auto;
	}

	.icon-btn {
		width: 2.35rem;
		height: 2.35rem;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border-radius: 8px;
		border: 1px solid var(--panel-border);
		background: var(--nav-bg);
		color: var(--text-primary);
		cursor: pointer;
		transition:
			border-color 0.2s,
			color 0.2s;

		&:hover:not(:disabled) {
			border-color: var(--accent);
			color: var(--accent);
		}

		&:disabled {
			opacity: 0.35;
			cursor: not-allowed;
		}

		&.danger:hover:not(:disabled) {
			border-color: #f87171;
			color: #fecaca;
		}

		&.sm {
			width: 2rem;
			height: 2rem;
			font-size: 0.85rem;
		}
	}

	.items {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.55rem;
	}

	.item-row {
		display: flex;
		align-items: flex-start;
		gap: 0.55rem;
	}

	.item-reorder {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		padding-top: 0.15rem;
	}

	.item-fields {
		flex: 1;
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.45rem;
		min-width: 0;

		@media (max-width: 720px) {
			grid-template-columns: 1fr;
		}
	}

	.fld {
		padding: 0.5rem 0.65rem;
		border-radius: 8px;
		border: 1px solid var(--panel-border);
		background: color-mix(in srgb, var(--nav-bg) 96%, #000);
		color: var(--text-primary);
		font-size: 0.9rem;
		min-width: 0;

		&.wide {
			grid-column: 1 / -1;
		}
	}

	.btn-add-item {
		margin-top: 0.75rem;
		padding: 0.45rem 0.85rem;
		border-radius: 8px;
		border: 1px dashed var(--panel-border);
		background: transparent;
		color: var(--muted);
		cursor: pointer;
		font-size: 0.9rem;
		width: 100%;

		&:hover {
			border-color: var(--accent);
			color: var(--text-primary);
		}
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		border: 0;
	}
</style>
