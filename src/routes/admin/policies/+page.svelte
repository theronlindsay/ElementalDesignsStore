<script>
	let { data } = $props();

	let isSaving = $state(false);
	let saveMessage = $state('');
	let saveError = $state('');
	let hasInitializedForm = $state(false);

	function buildFormData(content = {}) {
		return {
			id: content.id || 'store-policies',
			heroTitle: content.heroTitle || '',
			heroSubtitle: content.heroSubtitle || '',
			shippingTitle: content.shippingTitle || '',
			shippingBody: content.shippingBody || '',
			returnsTitle: content.returnsTitle || '',
			returnsBody: content.returnsBody || '',
			privacyTitle: content.privacyTitle || '',
			privacyBody: content.privacyBody || ''
		};
	}

	let formData = $state(buildFormData());

	// Initialize editor content from server-loaded data once on first render.
	$effect(() => {
		if (hasInitializedForm) {
			return;
		}

		formData = buildFormData(data.policyContent);
		hasInitializedForm = true;
	});

	async function handleSave() {
		isSaving = true;
		saveMessage = '';
		saveError = '';

		try {
			const response = await fetch('/admin/policies', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(formData)
			});

			if (!response.ok) {
				throw new Error('Failed to save policy content');
			}

			const result = await response.json();
			formData = {
				...formData,
				...(result.policyContent || {}),
				id: 'store-policies'
			};
			saveMessage = 'Policy content saved successfully.';
		} catch (error) {
			console.error('Error saving policy content:', error);
			saveError = 'Failed to save policy content. Please try again.';
		} finally {
			isSaving = false;
		}
	}
</script>

<svelte:head>
	<title>Policy - Admin</title>
</svelte:head>

<div class="policy-page">
	<div class="page-header">
		<div class="header-left">
			<h2 class="page-subtitle">Edit all public store policy content shown on the policies page</h2>
			{#if saveMessage}
				<p class="save-message" aria-live="polite">{saveMessage}</p>
			{/if}
			{#if saveError}
				<p class="save-error" aria-live="polite">{saveError}</p>
			{/if}
		</div>
		<button class="btn-primary" onclick={handleSave} disabled={isSaving}>
			<i class="fas {isSaving ? 'fa-spinner fa-spin' : 'fa-save'}"></i>
			{isSaving ? 'Saving...' : 'Save Policy'}
		</button>
	</div>

	<div class="form-layout">
		<section class="editor-card theme-glass">
			<h3>Hero</h3>
			<div class="form-group">
				<label for="hero-title">Page Title</label>
				<input id="hero-title" type="text" bind:value={formData.heroTitle} placeholder="Store Policies" />
			</div>
			<div class="form-group">
				<label for="hero-subtitle">Subtitle</label>
				<textarea id="hero-subtitle" rows="3" bind:value={formData.heroSubtitle}></textarea>
			</div>
		</section>

		<section class="editor-card theme-glass">
			<h3>Shipping Section</h3>
			<div class="form-group">
				<label for="shipping-title">Section Title</label>
				<input id="shipping-title" type="text" bind:value={formData.shippingTitle} />
			</div>
			<div class="form-group">
				<label for="shipping-body">Section Content</label>
				<textarea id="shipping-body" rows="8" bind:value={formData.shippingBody}></textarea>
				<small>Use blank lines to separate paragraphs.</small>
			</div>
		</section>

		<section class="editor-card theme-glass">
			<h3>Returns Section</h3>
			<div class="form-group">
				<label for="returns-title">Section Title</label>
				<input id="returns-title" type="text" bind:value={formData.returnsTitle} />
			</div>
			<div class="form-group">
				<label for="returns-body">Section Content</label>
				<textarea id="returns-body" rows="8" bind:value={formData.returnsBody}></textarea>
				<small>Use blank lines to separate paragraphs.</small>
			</div>
		</section>

		<section class="editor-card theme-glass">
			<h3>Privacy Section</h3>
			<div class="form-group">
				<label for="privacy-title">Section Title</label>
				<input id="privacy-title" type="text" bind:value={formData.privacyTitle} />
			</div>
			<div class="form-group">
				<label for="privacy-body">Section Content</label>
				<textarea id="privacy-body" rows="8" bind:value={formData.privacyBody}></textarea>
				<small>Use blank lines to separate paragraphs.</small>
			</div>
		</section>
	</div>
</div>

<style lang="scss">
	.policy-page {
		width: 100%;
	}

	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 1rem;
		margin-bottom: 2rem;
		flex-wrap: wrap;
	}

	.header-left {
		flex: 1;
		min-width: 260px;
	}

	.page-subtitle {
		color: var(--muted);
		font-size: 1rem;
		font-weight: 500;
		margin: 0;
	}

	.save-message,
	.save-error {
		margin: 0.75rem 0 0;
		font-size: 0.9rem;
		font-weight: 600;
	}

	.save-message {
		color: #34d399;
	}

	.save-error {
		color: #f87171;
	}

	.btn-primary {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1.5rem;
		background: linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%);
		color: white;
		border: none;
		border-radius: 12px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;

		&:hover:not(:disabled) {
			transform: translateY(-2px);
			box-shadow: 0 8px 20px rgba(167, 139, 250, 0.4);
		}

		&:disabled {
			opacity: 0.75;
			cursor: wait;
		}
	}

	.form-layout {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1.5rem;
	}

	.editor-card {
		padding: 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;

		h3 {
			margin: 0;
			color: var(--text-primary);
			font-size: 1.2rem;
		}
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;

		label {
			color: var(--text-primary);
			font-weight: 600;
			font-size: 0.9rem;
		}

		input,
		textarea {
			background: rgba(42, 36, 56, 0.65);
			border: 1px solid var(--panel-border);
			border-radius: 10px;
			padding: 0.75rem 0.9rem;
			color: var(--text-primary);
			font-size: 0.95rem;
			width: 100%;
			box-sizing: border-box;
			outline: none;
			transition: border-color 0.2s ease, box-shadow 0.2s ease;
		}

		textarea {
			resize: vertical;
			line-height: 1.5;
		}

		input:focus,
		textarea:focus {
			border-color: var(--accent);
			box-shadow: 0 0 0 3px rgba(167, 139, 250, 0.15);
		}

		small {
			color: var(--muted-2);
			font-size: 0.8rem;
		}
	}
</style>
