<script>
	let {
		open = false,
		/** @type {{ id: string, imageUrls: string[], name?: string, description?: string, price?: number | null, workDate?: string } | null} */
		item = null,
		onClose = () => {}
	} = $props();

	let selectedImage = $state('');

	$effect(() => {
		if (open && item?.imageUrls?.[0]) {
			selectedImage = item.imageUrls[0];
		} else {
			selectedImage = '';
		}
	});

	function selectImage(url) {
		selectedImage = url;
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
			month: 'long',
			day: 'numeric'
		}).format(d);
	}

	function handleKeydown(/** @type {KeyboardEvent} */ e) {
		if (!open) return;
		if (e.key === 'Escape') {
			e.preventDefault();
			onClose();
		}
	}

	$effect(() => {
		if (!open || typeof document === 'undefined') return;
		const prev = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		return () => {
			document.body.style.overflow = prev;
		};
	});
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open && item}
	<div
		class="pw-modal-backdrop"
		role="presentation"
		onclick={() => onClose()}
	></div>
	<div
		class="pw-modal-shell"
		role="dialog"
		aria-modal="true"
		aria-labelledby="pw-modal-title"
		aria-describedby="pw-modal-desc"
	>
		<div
			class="pw-modal-panel theme-glass"
			onclick={(e) => e.stopPropagation()}
		>
			<button
				type="button"
				class="pw-modal-close"
				onclick={() => onClose()}
				aria-label="Close"
			>
				<i class="fas fa-times" aria-hidden="true"></i>
			</button>

			<div class="pw-modal-layout">
				<div class="pw-modal-gallery">
					<div class="pw-main-image">
						{#if selectedImage}
							<img src={selectedImage} alt={item.name || 'Past project'} />
						{:else}
							<div class="pw-placeholder">No image</div>
						{/if}
					</div>
					{#if item.imageUrls && item.imageUrls.length > 1}
						<div class="pw-thumbnail-row">
							{#each item.imageUrls as img (img)}
								<button
									type="button"
									class="pw-thumbnail-btn"
									class:selected={selectedImage === img}
									onclick={() => selectImage(img)}
									aria-label="Show image"
								>
									<img src={img} alt="" />
								</button>
							{/each}
						</div>
					{/if}
				</div>

				<div class="pw-modal-details" id="pw-modal-desc">
					<h2 id="pw-modal-title" class="pw-modal-title">
						{item.name?.trim() || 'Past project'}
					</h2>
					<div class="pw-meta-chips">
						{#if item.workDate}
							<span class="pw-chip pw-chip-date">{formatDate(item.workDate)}</span>
						{/if}
						{#if item.price != null}
							<span class="pw-chip pw-chip-price">{formatPrice(item.price)}</span>
						{/if}
					</div>
					{#if item.description?.trim()}
						<p class="pw-description">{item.description}</p>
					{:else}
						<p class="pw-description muted">No description for this piece.</p>
					{/if}
				</div>
			</div>
		</div>
	</div>
{/if}

<style lang="scss">
	.pw-modal-backdrop {
		position: fixed;
		inset: 0;
		z-index: 1200;
		background: rgba(8, 6, 14, 0.72);
		backdrop-filter: blur(6px);
		-webkit-backdrop-filter: blur(6px);
	}

	.pw-modal-shell {
		position: fixed;
		inset: 0;
		z-index: 1201;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: max(1rem, env(safe-area-inset-top)) max(1rem, env(safe-area-inset-right))
			max(1rem, env(safe-area-inset-bottom)) max(1rem, env(safe-area-inset-left));
		pointer-events: none;
	}

	.pw-modal-panel {
		pointer-events: auto;
		position: relative;
		width: min(96vw, 920px);
		max-height: min(92vh, 880px);
		overflow: auto;
		border-radius: 18px;
		border: 1px solid var(--panel-border, rgba(167, 139, 250, 0.25));
		box-shadow:
			0 24px 48px rgba(0, 0, 0, 0.45),
			0 0 0 1px rgba(255, 255, 255, 0.04) inset;
		padding: clamp(1rem, 3vw, 1.75rem);
		box-sizing: border-box;
	}

	.pw-modal-close {
		position: absolute;
		top: 0.65rem;
		right: 0.65rem;
		z-index: 2;
		width: 2.5rem;
		height: 2.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 10px;
		border: 1px solid var(--panel-border);
		background: color-mix(in srgb, var(--nav-bg, #1e1829) 88%, transparent);
		color: var(--text-primary, #f3f4f6);
		cursor: pointer;
		transition:
			border-color 0.2s ease,
			color 0.2s ease,
			background 0.2s ease;

		&:hover {
			border-color: var(--accent, #a78bfa);
			color: var(--accent, #a78bfa);
		}
	}

	.pw-modal-layout {
		display: grid;
		grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
		gap: clamp(1.25rem, 4vw, 2rem);
		align-items: start;
		padding-top: 0.25rem;

		@media (max-width: 720px) {
			grid-template-columns: 1fr;
		}
	}

	.pw-modal-gallery {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--nav-gap, 0.75rem);
		min-width: 0;
	}

	.pw-main-image {
		width: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
		border-radius: 14px;
		overflow: hidden;
		border: 1px solid var(--border-primary, #3d3650);
		box-shadow: var(--glass-shadow, 0 8px 24px rgba(0, 0, 0, 0.35));
		background: linear-gradient(
			145deg,
			rgba(32, 28, 44, 0.85) 0%,
			rgba(18, 14, 26, 0.92) 100%
		);

		img {
			display: block;
			width: auto;
			height: auto;
			max-width: 100%;
			max-height: min(78vh, 720px);
			object-fit: contain;
			border-radius: 12px;
		}
	}

	.pw-placeholder {
		min-height: 200px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--muted);
		background: linear-gradient(
			135deg,
			rgba(88, 70, 120, 0.2) 0%,
			rgba(26, 22, 37, 0.5) 100%
		);
	}

	.pw-thumbnail-row {
		display: flex;
		justify-content: center;
		flex-wrap: wrap;
		gap: 0.65rem;
	}

	.pw-thumbnail-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		background: color-mix(in srgb, var(--nav-bg, #1e1829) 70%, transparent);
		border: 2px solid var(--border-secondary, #4a4560);
		padding: 4px;
		border-radius: var(--nav-gap, 0.75rem);
		cursor: pointer;
		overflow: hidden;
		width: 72px;
		height: 72px;
		flex-shrink: 0;
		transition:
			border-color 0.2s ease,
			box-shadow 0.2s ease;

		img {
			display: block;
			max-width: 100%;
			max-height: 100%;
			width: auto;
			height: auto;
			object-fit: contain;
			border-radius: 8px;
			opacity: 0.65;
			transition: opacity 0.2s ease;
		}

		&:hover img {
			opacity: 1;
		}

		&.selected {
			border-color: var(--accent, #a78bfa);
			box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent) 35%, transparent);

			img {
				opacity: 1;
			}
		}
	}

	.pw-modal-details {
		min-width: 0;
		padding-right: 2rem;

		@media (max-width: 720px) {
			padding-right: 0;
		}
	}

	.pw-modal-title {
		margin: 0 0 0.75rem;
		font-size: clamp(1.35rem, 3.2vw, 1.85rem);
		color: var(--text-primary, #f3f4f6);
		line-height: 1.25;
	}

	.pw-meta-chips {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	.pw-chip {
		display: inline-flex;
		align-items: center;
		padding: 0.35rem 0.75rem;
		border-radius: 999px;
		font-size: 0.85rem;
		font-weight: 600;
	}

	.pw-chip-date {
		background: color-mix(in srgb, var(--nav-bg) 80%, #000);
		border: 1px solid var(--panel-border);
		color: var(--muted);
	}

	.pw-chip-price {
		background: linear-gradient(135deg, var(--accent, #a78bfa) 0%, var(--accent-2, #8b5cf6) 100%);
		color: #fff;
		border: none;
	}

	.pw-description {
		margin: 0;
		color: var(--muted);
		line-height: 1.65;
		font-size: 0.98rem;
		white-space: pre-wrap;

		&.muted {
			opacity: 0.8;
			font-style: italic;
		}
	}
</style>
