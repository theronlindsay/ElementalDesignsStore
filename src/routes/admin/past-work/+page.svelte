<script>
	import { UploadDropzone, createUploader } from '$lib/uploadthing';
	import '@uploadthing/svelte/styles.css';

	let { data } = $props();

	let items = $state(structuredClone(data.pastWork?.items ?? []));
	let isSaving = $state(false);
	let saveMessage = $state('');
	let saveError = $state('');

	/** @type {Map<string, ReturnType<typeof createUploader>>} */
	let uploaderCache = new Map();

	function getUploader(itemId) {
		if (!uploaderCache.has(itemId)) {
			uploaderCache.set(
				itemId,
				createUploader('imageUploader', {
					onClientUploadComplete: (res) => {
						const url = res?.[0]?.serverData?.url || res?.[0]?.url;
						if (url) {
							items = items.map((row) => {
								if (row.id !== itemId) return row;
								const existing = Array.isArray(row.imageUrls) ? row.imageUrls : [];
								if (existing.includes(url)) return row;
								return { ...row, imageUrls: [...existing, url] };
							});
						}
					},
					onUploadError: (err) => console.error(err)
				})
			);
		}
		return /** @type {ReturnType<typeof createUploader>} */ (uploaderCache.get(itemId));
	}

	function addItem() {
		items = [
			...items,
			{
				id: crypto.randomUUID(),
				imageUrls: [],
				name: '',
				description: '',
				price: null,
				workDate: ''
			}
		];
	}

	function removeItem(index) {
		const id = items[index]?.id;
		if (id) uploaderCache.delete(id);
		items = items.filter((_, i) => i !== index);
	}

	function moveItem(index, direction) {
		if (direction === 'up' && index > 0) {
			const next = [...items];
			[next[index - 1], next[index]] = [next[index], next[index - 1]];
			items = next;
		} else if (direction === 'down' && index < items.length - 1) {
			const next = [...items];
			[next[index + 1], next[index]] = [next[index], next[index + 1]];
			items = next;
		}
	}

	function removeImage(itemIndex, urlIndex) {
		const next = [...items];
		const row = next[itemIndex];
		if (!row || !Array.isArray(row.imageUrls)) return;
		next[itemIndex] = {
			...row,
			imageUrls: row.imageUrls.filter((_, i) => i !== urlIndex)
		};
		items = next;
	}

	function moveImage(itemIndex, urlIndex, direction) {
		const next = [...items];
		const row = next[itemIndex];
		if (!row || !Array.isArray(row.imageUrls)) return;
		const urls = [...row.imageUrls];
		if (direction === 'up' && urlIndex > 0) {
			[urls[urlIndex - 1], urls[urlIndex]] = [urls[urlIndex], urls[urlIndex - 1]];
		} else if (direction === 'down' && urlIndex < urls.length - 1) {
			[urls[urlIndex + 1], urls[urlIndex]] = [urls[urlIndex], urls[urlIndex + 1]];
		} else {
			return;
		}
		next[itemIndex] = { ...row, imageUrls: urls };
		items = next;
	}

	function updateField(index, field, value) {
		const next = [...items];
		if (!next[index]) return;
		if (field === 'price') {
			const v = String(value).trim();
			if (v === '') {
				next[index] = { ...next[index], price: null };
			} else {
				const n = Number.parseFloat(v);
				next[index] = { ...next[index], price: Number.isFinite(n) ? n : null };
			}
		} else {
			next[index] = { ...next[index], [field]: value };
		}
		items = next;
	}

	async function savePastWork() {
		isSaving = true;
		saveMessage = '';
		saveError = '';
		try {
			const payload = items.map((it) => ({
				id: it.id,
				imageUrls: Array.isArray(it.imageUrls) ? it.imageUrls : [],
				name: it.name,
				description: it.description,
				price: it.price,
				workDate: it.workDate
			}));
			const res = await fetch('/admin/past-work', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ items: payload })
			});
			if (!res.ok) {
				const text = await res.text().catch(() => '');
				throw new Error(text || 'Save failed');
			}
			saveMessage = 'Past work gallery saved.';
		} catch (e) {
			console.error(e);
			saveError =
				e instanceof Error && e.message
					? e.message
					: 'Could not save. Each piece needs at least one image when listed.';
		} finally {
			isSaving = false;
		}
	}
</script>

<svelte:head>
	<title>Past work — Admin</title>
</svelte:head>

<div class="past-work-admin">
	<div class="page-header">
		<div>
			<h2>Past work gallery</h2>
			<p>
				Add multiple images per piece (UploadThing). Use ↑ ↓ to reorder; first image is the card
				thumbnail.
			</p>
		</div>
		<button type="button" class="btn-primary" onclick={savePastWork} disabled={isSaving}>
			{isSaving ? 'Saving…' : 'Save gallery'}
		</button>
	</div>

	{#if saveMessage}
		<p class="msg ok">{saveMessage}</p>
	{/if}
	{#if saveError}
		<p class="msg err">{saveError}</p>
	{/if}

	<button type="button" class="btn-secondary" onclick={addItem}>Add piece</button>

	<ul class="item-list">
		{#each items as item, idx (item.id)}
			<li class="item-card">
				<div class="item-head">
					<span class="item-label">Piece {idx + 1}</span>
					<div class="item-actions">
						<button
							type="button"
							class="icon-btn"
							onclick={() => moveItem(idx, 'up')}
							disabled={idx === 0}
							aria-label="Move up"
						>
							<i class="fas fa-arrow-up" aria-hidden="true"></i>
						</button>
						<button
							type="button"
							class="icon-btn"
							onclick={() => moveItem(idx, 'down')}
							disabled={idx === items.length - 1}
							aria-label="Move down"
						>
							<i class="fas fa-arrow-down" aria-hidden="true"></i>
						</button>
						<button
							type="button"
							class="icon-btn danger"
							onclick={() => removeItem(idx)}
							aria-label="Remove"
						>
							<i class="fas fa-trash" aria-hidden="true"></i>
						</button>
					</div>
				</div>

				<div class="item-body">
					<div class="upload-col">
						<p class="upload-label">Add images</p>
						<UploadDropzone uploader={getUploader(item.id)} />
						{#if item.imageUrls?.length}
							<ul class="image-list">
								{#each item.imageUrls as imgUrl, uidx (`${item.id}-${uidx}`)}
									<li class="image-row">
										<div class="thumb-wrap">
											<img src={imgUrl} alt="" class="thumb" />
										</div>
										<div class="image-row-actions">
											<button
												type="button"
												class="icon-btn sm"
												onclick={() => moveImage(idx, uidx, 'up')}
												disabled={uidx === 0}
												aria-label="Move image earlier in list"
											>
												<i class="fas fa-arrow-up" aria-hidden="true"></i>
											</button>
											<button
												type="button"
												class="icon-btn sm"
												onclick={() => moveImage(idx, uidx, 'down')}
												disabled={uidx === (item.imageUrls?.length ?? 0) - 1}
												aria-label="Move image later in list"
											>
												<i class="fas fa-arrow-down" aria-hidden="true"></i>
											</button>
											<button
												type="button"
												class="icon-btn sm danger"
												onclick={() => removeImage(idx, uidx)}
												aria-label="Remove image"
											>
												<i class="fas fa-times" aria-hidden="true"></i>
											</button>
										</div>
									</li>
								{/each}
							</ul>
						{/if}
					</div>
					<div class="fields">
						<label>
							Name <span class="hint">(optional)</span>
							<input
								type="text"
								value={item.name}
								oninput={(e) => updateField(idx, 'name', e.currentTarget.value)}
							/>
						</label>
						<label>
							Description <span class="hint">(optional)</span>
							<textarea
								rows="3"
								value={item.description}
								oninput={(e) => updateField(idx, 'description', e.currentTarget.value)}
							></textarea>
						</label>
						<div class="row-2">
							<label>
								Price (USD) <span class="hint">(optional)</span>
								<input
									type="number"
									step="0.01"
									min="0"
									value={item.price ?? ''}
									oninput={(e) => updateField(idx, 'price', e.currentTarget.value)}
								/>
							</label>
							<label>
								Date <span class="hint">(optional)</span>
								<input
									type="date"
									value={item.workDate ?? ''}
									oninput={(e) => updateField(idx, 'workDate', e.currentTarget.value)}
								/>
							</label>
						</div>
					</div>
				</div>
			</li>
		{/each}
	</ul>

	{#if items.length === 0}
		<p class="empty-hint">No pieces yet. Use “Add piece” to start.</p>
	{/if}
</div>

<style lang="scss">
	.past-work-admin {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
		width: 100%;
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
			max-width: 44rem;
			color: var(--muted);
			line-height: 1.5;
			font-size: 0.95rem;
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
		width: fit-content;

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

	.item-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.item-card {
		border: 1px solid var(--panel-border);
		border-radius: 14px;
		padding: 1rem 1.15rem;
		background: linear-gradient(180deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%),
			var(--panel-bg, var(--nav-bg));
	}

	.item-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		margin-bottom: 0.85rem;
	}

	.item-label {
		font-weight: 700;
		color: var(--text-primary);
	}

	.item-actions {
		display: flex;
		gap: 0.35rem;
		flex-wrap: wrap;
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
			font-size: 0.8rem;
		}
	}

	.item-body {
		display: grid;
		grid-template-columns: minmax(0, 280px) 1fr;
		gap: 1.25rem;
		align-items: start;

		@media (max-width: 768px) {
			grid-template-columns: 1fr;
		}
	}

	.upload-col {
		display: flex;
		flex-direction: column;
		gap: 0.65rem;
		min-width: 0;
	}

	.upload-label {
		margin: 0;
		font-size: 0.88rem;
		font-weight: 600;
		color: var(--text-primary);
	}

	.image-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.image-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.35rem;
		border-radius: 10px;
		border: 1px solid var(--panel-border);
		background: color-mix(in srgb, var(--nav-bg) 94%, #000);
	}

	.thumb-wrap {
		width: 72px;
		height: 54px;
		border-radius: 8px;
		overflow: hidden;
		flex-shrink: 0;
		border: 1px solid var(--panel-border);
	}

	.thumb {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	.image-row-actions {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.2rem;
		margin-left: auto;
	}

	.fields {
		display: flex;
		flex-direction: column;
		gap: 0.65rem;
		min-width: 0;

		label {
			display: flex;
			flex-direction: column;
			gap: 0.35rem;
			font-size: 0.88rem;
			color: var(--muted);
		}

		.hint {
			font-weight: 400;
			opacity: 0.85;
		}

		input,
		textarea {
			padding: 0.5rem 0.65rem;
			border-radius: 8px;
			border: 1px solid var(--panel-border);
			background: color-mix(in srgb, var(--nav-bg) 96%, #000);
			color: var(--text-primary);
			font-size: 0.9rem;
		}

		textarea {
			resize: vertical;
			min-height: 4.5rem;
		}
	}

	.row-2 {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.75rem;

		@media (max-width: 520px) {
			grid-template-columns: 1fr;
		}
	}

	.empty-hint {
		color: var(--muted);
		margin: 0;
	}
</style>
