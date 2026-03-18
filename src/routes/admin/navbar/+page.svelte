<script>
	import { Button, Input, Label, FormGroup } from '$lib';
	import { onMount } from 'svelte';

	let { data } = $props();

	// Default starting point if array doesn't exist
	const defaultLinks = [
		{ id: 'home', label: 'Home', tags: [], customUrl: '/' },
		{ id: 'jewelry', label: 'Jewelry', tags: ['jewelry'], customUrl: '' },
		{ id: 'chainmail', label: 'Chainmail', tags: ['chainmail'], customUrl: '' },
		{ id: 'laser', label: 'Laser Engraving', tags: ['laser engraved'], customUrl: '' },
		{ id: 'games', label: 'Games', tags: ['games'], customUrl: '' },
		{ id: 'custom', label: 'Custom Orders', tags: [], customUrl: '/#custom' },
		{ id: 'about', label: 'About', tags: [], customUrl: '/about' }
	];

	// Convert old config format `{ href: '/search?tags=xyz' }` to new format on load
	function migrateLinks(linksArray) {
		return linksArray.map((link) => {
			if (link.href && link.href.includes('/search?tags=')) {
				const tagString = link.href.split('/search?tags=')[1];
				const tags = tagString.split(',').filter(Boolean);
				return { ...link, tags, customUrl: '' };
			} else if (link.href && !link.customUrl) {
				return { ...link, tags: [], customUrl: link.href };
			}
			return { tags: [], customUrl: '', ...link };
		});
	}

	let links = $state(
		data.config?.navbarLinks?.length > 0 ? migrateLinks(data.config.navbarLinks) : defaultLinks
	);
	let isSaving = $state(false);

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

	function addLink() {
		links = [...links, { id: crypto.randomUUID(), label: 'New Link', tags: [], customUrl: '' }];
	}

	function removeLink(id) {
		links = links.filter((l) => l.id !== id);
	}

	function moveLink(index, direction) {
		if (direction === 'up' && index > 0) {
			const newLinks = [...links];
			[newLinks[index - 1], newLinks[index]] = [newLinks[index], newLinks[index - 1]];
			links = newLinks;
		} else if (direction === 'down' && index < links.length - 1) {
			const newLinks = [...links];
			[newLinks[index + 1], newLinks[index]] = [newLinks[index], newLinks[index + 1]];
			links = newLinks;
		}
	}

	function toggleTagForLink(linkId, tag) {
		links = links.map((link) => {
			if (link.id === linkId) {
				if (link.tags.includes(tag)) {
					link.tags = link.tags.filter((t) => t !== tag);
				} else {
					link.tags = [...link.tags, tag];
				}
			}
			return link;
		});
	}

	async function saveConfig() {
		isSaving = true;
		try {
			// Convert links back to href format for layout consumption
			const serializedLinks = links.map((link) => {
				let href = link.customUrl;
				if (link.tags && link.tags.length > 0) {
					href = `/search?tags=${link.tags.join(',')}`;
				}
				return { id: link.id, label: link.label, href };
			});

			const response = await fetch('/admin/navbar', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ navbarLinks: serializedLinks })
			});

			if (!response.ok) throw new Error('Failed to save');
			alert('Navbar configuration saved successfully!');
		} catch (error) {
			console.error(error);
			alert('Error saving configuration.');
		} finally {
			isSaving = false;
		}
	}
</script>

<div class="navbar-admin">
	<div class="page-header">
		<div class="header-left">
			<h2 class="page-title">Navbar Manager</h2>
		</div>
		<Button variant="primary" onclick={saveConfig} disabled={isSaving}>
			<i class="fas fa-save"></i>
			{isSaving ? 'Saving...' : 'Save Configuration'}
		</Button>
	</div>

	<section class="admin-section theme-glass">
		<div class="section-header">
			<h3>Navigation Links</h3>
			<Button variant="ghost" onclick={addLink}>+ Add Link</Button>
		</div>
		<p class="help-text">
			Manage the top navigation bar. "Account" and "Cart" are pinned automatically and do not need
			to be added here.
			<br />
			You can link directly to a filtered product view by selecting tags, or provide a Custom URL.
		</p>

		<div class="links-list">
			{#each links as link, index (link.id)}
				<div class="link-editor">
					<div class="reorder-controls">
						<button
							disabled={index === 0}
							onclick={() => moveLink(index, 'up')}
							aria-label="Move Up"><i class="fas fa-chevron-up"></i></button
						>
						<button
							disabled={index === links.length - 1}
							onclick={() => moveLink(index, 'down')}
							aria-label="Move Down"><i class="fas fa-chevron-down"></i></button
						>
					</div>

					<div class="link-fields">
						<div class="link-config-grid">
							<FormGroup>
								<Label>Label</Label>
								<Input bind:value={link.label} placeholder="e.g. Necklaces" />
							</FormGroup>

							<FormGroup>
								<Label>Custom URL (Overrides Tags)</Label>
								<Input bind:value={link.customUrl} placeholder="e.g. /about" />
							</FormGroup>
						</div>

						<div class="tags-container" class:disabled={link.customUrl}>
							<Label>Square Categories (Tags)</Label>
							<small class="muted" style="display: block; margin-bottom: 0.5rem;"
								>Select categories to build a custom product filter link.</small
							>
							<div class="tag-checklist">
								{#if isFetchingTags}
									<span class="muted">Loading categories...</span>
								{:else if availableTags.length === 0}
									<span class="muted">No categories found in Square.</span>
								{:else}
									{#each availableTags as tag}
										<label class="tag-checkbox">
											<input
												type="checkbox"
												checked={link.tags.includes(tag)}
												onchange={() => toggleTagForLink(link.id, tag)}
												disabled={link.customUrl}
											/>
											<span class="tag-label">{tag}</span>
										</label>
									{/each}
								{/if}
							</div>
						</div>
					</div>

					<button class="remove-btn" onclick={() => removeLink(link.id)} aria-label="Remove link">
						<i class="fas fa-trash"></i>
					</button>
				</div>
			{/each}

			{#if links.length === 0}
				<div class="empty-state">No links configured. Add one above.</div>
			{/if}
		</div>
	</section>
</div>

<style lang="scss">
	.navbar-admin {
		display: flex;
		flex-direction: column;
		gap: 2rem;
		max-width: 900px;
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
		}
	}

	.help-text {
		color: var(--muted);
		font-size: 0.95rem;
		margin-bottom: 2rem;
		line-height: 1.5;
	}

	.links-list {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.link-editor {
		display: flex;
		align-items: stretch;
		gap: 1.5rem;
		padding: 1.5rem;
		background: var(--bg-secondary);
		border: 1px solid var(--border-primary);
		border-radius: 8px;

		@media (max-width: 600px) {
			flex-direction: column;
			align-items: stretch;
		}
	}

	.reorder-controls {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;

		@media (max-width: 600px) {
			flex-direction: row;
			justify-content: flex-end;
		}

		button {
			background: var(--bg-panel);
			border: 1px solid var(--border-secondary);
			color: var(--text-primary);
			width: 32px;
			height: 32px;
			border-radius: 6px;
			cursor: pointer;
			display: flex;
			align-items: center;
			justify-content: center;
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

	.link-fields {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.link-config-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1.5rem;

		@media (max-width: 600px) {
			grid-template-columns: 1fr;
		}

		:global(.form-group) {
			margin-bottom: 0;
		}
	}

	.tags-container {
		background: var(--bg-panel);
		padding: 1rem;
		border: 1px dashed var(--border-secondary);
		border-radius: 8px;
		transition: opacity 0.2s;

		&.disabled {
			opacity: 0.5;
			pointer-events: none;
		}
	}

	.tag-checklist {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		margin-top: 0.5rem;
	}

	.tag-checkbox {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.4rem 0.75rem;
		background: rgba(167, 139, 250, 0.05);
		border: 1px solid rgba(167, 139, 250, 0.2);
		border-radius: 6px;
		cursor: pointer;
		font-size: 0.85rem;
		transition: all 0.2s;

		&:hover {
			border-color: var(--accent);
			background: rgba(167, 139, 250, 0.1);
		}

		input[type='checkbox'] {
			accent-color: var(--accent);
		}

		.tag-label {
			text-transform: capitalize;
			color: var(--text-primary);
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
		flex-shrink: 0;

		&:hover {
			background: rgba(239, 68, 68, 0.1);
		}

		@media (max-width: 600px) {
			align-self: flex-end;
		}
	}

	.empty-state {
		text-align: center;
		padding: 2rem;
		color: var(--muted);
		border: 1px dashed var(--border-secondary);
		border-radius: 8px;
	}

	@media (max-width: 768px) {
		.navbar-admin { gap: 1.25rem; }

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

		.link-editor {
			padding: 1rem;
			gap: 1rem;
		}
	}
</style>
