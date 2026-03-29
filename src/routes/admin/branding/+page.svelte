<script>
	import { UploadDropzone, createUploader } from '$lib/uploadthing';
	import '@uploadthing/svelte/styles.css';

	let { data } = $props();

	let isSaving = $state(false);
	let saveMessage = $state('');
	let saveError = $state('');
	let hasInitializedForm = $state(false);
	let uploadErrors = $state({
		logoPrimaryUrl: '',
		homeHeroImageOneUrl: '',
		homeHeroImageTwoUrl: ''
	});

	function buildBrandingForm(content = {}) {
		return {
			id: content.id || 'site-branding',
			logoPrimaryUrl: content.logoPrimaryUrl || '',
			logoAlt: content.logoAlt || '',
			homeHeroTitle: content.homeHeroTitle || '',
			homeHeroDescription: content.homeHeroDescription || '',
			homeHeroImageOneUrl: content.homeHeroImageOneUrl || '',
			homeHeroImageTwoUrl: content.homeHeroImageTwoUrl || '',
			eventsSectionTitle: content.eventsSectionTitle || '',
			testimonialsSectionTitle: content.testimonialsSectionTitle || '',
			customOrdersTitle: content.customOrdersTitle || '',
			customOrdersBody: content.customOrdersBody || '',
			customOrdersPrimaryCta: content.customOrdersPrimaryCta || '',
			customOrdersSecondaryCta: content.customOrdersSecondaryCta || '',
			newsletterTitle: content.newsletterTitle || '',
			newsletterEmailPlaceholder: content.newsletterEmailPlaceholder || '',
			newsletterButtonLabel: content.newsletterButtonLabel || '',
			newsletterDisclaimer: content.newsletterDisclaimer || ''
		};
	}

	let formData = $state(buildBrandingForm());

	// Initialize from server on first render, then preserve local edits.
	$effect(() => {
		if (hasInitializedForm) {
			return;
		}

		formData = buildBrandingForm(data.branding);
		hasInitializedForm = true;
	});

	function createImageUploader(fieldName) {
		return createUploader('imageUploader', {
			onClientUploadComplete: (res) => {
				if (res && res.length > 0) {
					const fileUrl = res[0].serverData?.url || res[0].url;
					formData[fieldName] = fileUrl;
					uploadErrors[fieldName] = '';
				}
			},
			onUploadError: (error) => {
				console.error(error);
				uploadErrors[fieldName] = error.message;
			}
		});
	}

	const logoUploader = createImageUploader('logoPrimaryUrl');
	const heroImageOneUploader = createImageUploader('homeHeroImageOneUrl');
	const heroImageTwoUploader = createImageUploader('homeHeroImageTwoUrl');

	function clearImage(fieldName) {
		formData[fieldName] = '';
		uploadErrors[fieldName] = '';
	}

	async function handleSave() {
		isSaving = true;
		saveMessage = '';
		saveError = '';

		try {
			const response = await fetch('/admin/branding', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(formData)
			});

			if (!response.ok) {
				throw new Error('Failed to save branding content');
			}

			const result = await response.json();
			formData = {
				...formData,
				...(result.branding || {}),
				id: 'site-branding'
			};
			saveMessage = 'Branding content saved successfully.';
		} catch (error) {
			console.error('Error saving branding content:', error);
			saveError = 'Failed to save branding content. Please try again.';
		} finally {
			isSaving = false;
		}
	}
</script>

<svelte:head>
	<title>Branding - Admin</title>
</svelte:head>

<div class="branding-page">
	<div class="page-header">
		<div class="header-left">
			<h2 class="page-subtitle">Manage homepage copy, hero images, and global logo branding.</h2>
			{#if saveMessage}
				<p class="save-message" aria-live="polite">{saveMessage}</p>
			{/if}
			{#if saveError}
				<p class="save-error" aria-live="polite">{saveError}</p>
			{/if}
		</div>
		<button class="btn-primary" onclick={handleSave} disabled={isSaving}>
			<i class="fas {isSaving ? 'fa-spinner fa-spin' : 'fa-save'}"></i>
			{isSaving ? 'Saving...' : 'Save Branding'}
		</button>
	</div>

	<div class="editor-layout">
		<section class="editor-card theme-glass">
			<h3>Logo</h3>
			<div class="form-group">
				<label for="logo-alt">Logo Alt Text</label>
				<input id="logo-alt" type="text" bind:value={formData.logoAlt} />
			</div>
			<div class="form-group">
				<p class="field-label">Logo Image</p>
				<div class="image-upload-section">
					{#if formData.logoPrimaryUrl}
						<div class="image-preview">
							<img src={formData.logoPrimaryUrl} alt="Logo preview" />
							<button type="button" class="clear-image-btn" onclick={() => clearImage('logoPrimaryUrl')}>Remove Logo</button>
						</div>
					{:else}
						<UploadDropzone uploader={logoUploader} />
					{/if}
					{#if uploadErrors.logoPrimaryUrl}
						<p class="error-message">{uploadErrors.logoPrimaryUrl}</p>
					{/if}
				</div>
			</div>
		</section>

		<section class="editor-card theme-glass">
			<h3>Homepage Hero</h3>
			<div class="form-group">
				<label for="home-hero-title">Hero Title</label>
				<input id="home-hero-title" type="text" bind:value={formData.homeHeroTitle} />
			</div>
			<div class="form-group">
				<label for="home-hero-description">Hero Description</label>
				<textarea id="home-hero-description" rows="5" bind:value={formData.homeHeroDescription}></textarea>
				<small>Use blank lines to split the hero into multiple paragraphs.</small>
			</div>
			<div class="split-grid two-col">
				<div class="form-group">
					<p class="field-label">Hero Image 1</p>
					<div class="image-upload-section">
						{#if formData.homeHeroImageOneUrl}
							<div class="image-preview">
								<img src={formData.homeHeroImageOneUrl} alt="Hero visual one preview" />
								<button type="button" class="clear-image-btn" onclick={() => clearImage('homeHeroImageOneUrl')}>Remove Image</button>
							</div>
						{:else}
							<UploadDropzone uploader={heroImageOneUploader} />
						{/if}
						{#if uploadErrors.homeHeroImageOneUrl}
							<p class="error-message">{uploadErrors.homeHeroImageOneUrl}</p>
						{/if}
					</div>
				</div>
				<div class="form-group">
					<p class="field-label">Hero Image 2</p>
					<div class="image-upload-section">
						{#if formData.homeHeroImageTwoUrl}
							<div class="image-preview">
								<img src={formData.homeHeroImageTwoUrl} alt="Hero visual two preview" />
								<button type="button" class="clear-image-btn" onclick={() => clearImage('homeHeroImageTwoUrl')}>Remove Image</button>
							</div>
						{:else}
							<UploadDropzone uploader={heroImageTwoUploader} />
						{/if}
						{#if uploadErrors.homeHeroImageTwoUrl}
							<p class="error-message">{uploadErrors.homeHeroImageTwoUrl}</p>
						{/if}
					</div>
				</div>
			</div>
		</section>

		<section class="editor-card theme-glass">
			<h3>Homepage Section Titles</h3>
			<div class="split-grid two-col">
				<div class="form-group">
					<label for="events-section-title">Events Section Title</label>
					<input id="events-section-title" type="text" bind:value={formData.eventsSectionTitle} />
				</div>
				<div class="form-group">
					<label for="testimonials-section-title">Testimonials Section Title</label>
					<input id="testimonials-section-title" type="text" bind:value={formData.testimonialsSectionTitle} />
				</div>
			</div>
		</section>

		<section class="editor-card theme-glass">
			<h3>Custom Orders Section</h3>
			<div class="form-group">
				<label for="custom-orders-title">Title</label>
				<input id="custom-orders-title" type="text" bind:value={formData.customOrdersTitle} />
			</div>
			<div class="form-group">
				<label for="custom-orders-body">Body</label>
				<textarea id="custom-orders-body" rows="5" bind:value={formData.customOrdersBody}></textarea>
			</div>
			<div class="split-grid two-col">
				<div class="form-group">
					<label for="custom-orders-primary-cta">Primary Button Label</label>
					<input id="custom-orders-primary-cta" type="text" bind:value={formData.customOrdersPrimaryCta} />
				</div>
				<div class="form-group">
					<label for="custom-orders-secondary-cta">Secondary Button Label</label>
					<input id="custom-orders-secondary-cta" type="text" bind:value={formData.customOrdersSecondaryCta} />
				</div>
			</div>
		</section>

		<section class="editor-card theme-glass">
			<h3>Newsletter Section</h3>
			<div class="form-group">
				<label for="newsletter-title">Title</label>
				<input id="newsletter-title" type="text" bind:value={formData.newsletterTitle} />
			</div>
			<div class="split-grid two-col">
				<div class="form-group">
					<label for="newsletter-placeholder">Email Placeholder</label>
					<input id="newsletter-placeholder" type="text" bind:value={formData.newsletterEmailPlaceholder} />
				</div>
				<div class="form-group">
					<label for="newsletter-button">Button Label</label>
					<input id="newsletter-button" type="text" bind:value={formData.newsletterButtonLabel} />
				</div>
			</div>
			<div class="form-group">
				<label for="newsletter-disclaimer">Disclaimer</label>
				<textarea id="newsletter-disclaimer" rows="3" bind:value={formData.newsletterDisclaimer}></textarea>
			</div>
		</section>
	</div>
</div>

<style lang="scss">
	.branding-page {
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

	.editor-layout {
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

	.field-label {
		margin: 0;
		color: var(--text-primary);
		font-weight: 600;
		font-size: 0.9rem;
	}

	.split-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1rem;
	}

	.image-upload-section {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.image-preview {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;

		img {
			width: 100%;
			max-width: 460px;
			height: auto;
			border-radius: 12px;
			border: 1px solid var(--panel-border);
		}
	}

	.clear-image-btn {
		align-self: flex-start;
		padding: 0.5rem 0.85rem;
		border-radius: 8px;
		border: 1px solid #f87171;
		background: rgba(248, 113, 113, 0.12);
		color: #f87171;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;

		&:hover {
			background: rgba(248, 113, 113, 0.2);
		}
	}

	.error-message {
		margin: 0;
		color: #f87171;
		font-size: 0.85rem;
		font-weight: 600;
	}

	@media (min-width: 900px) {
		.two-col {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
</style>
