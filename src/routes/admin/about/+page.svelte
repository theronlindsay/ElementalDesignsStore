<script>
	import { UploadDropzone, createUploader } from '$lib/uploadthing';
	import '@uploadthing/svelte/styles.css';

	let { data } = $props();

	let isSaving = $state(false);
	let saveMessage = $state('');
	let saveError = $state('');
	let hasInitializedForm = $state(false);
	let uploadErrors = $state({
		storyImage: '',
		productOneImage: '',
		productTwoImage: '',
		productThreeImage: '',
		inclusiveImage: '',
		customImage: ''
	});

	function buildAboutFormData(content = {}) {
		return {
			id: content.id || 'about-page',
			heroTitle: content.heroTitle || '',
			heroSubtitle: content.heroSubtitle || '',
			storyTitle: content.storyTitle || '',
			storyBody: content.storyBody || '',
			storyImage: content.storyImage || '',
			productsHeaderTitle: content.productsHeaderTitle || '',
			productOneTitle: content.productOneTitle || '',
			productOneBody: content.productOneBody || '',
			productOneImage: content.productOneImage || '',
			productTwoTitle: content.productTwoTitle || '',
			productTwoBody: content.productTwoBody || '',
			productTwoImage: content.productTwoImage || '',
			productThreeTitle: content.productThreeTitle || '',
			productThreeBody: content.productThreeBody || '',
			productThreeImage: content.productThreeImage || '',
			inclusiveTitle: content.inclusiveTitle || '',
			inclusiveBody: content.inclusiveBody || '',
			inclusiveImage: content.inclusiveImage || '',
			customTitle: content.customTitle || '',
			customBody: content.customBody || '',
			customImage: content.customImage || '',
			valueOneTitle: content.valueOneTitle || '',
			valueOneBody: content.valueOneBody || '',
			valueTwoTitle: content.valueTwoTitle || '',
			valueTwoBody: content.valueTwoBody || '',
			ctaTitle: content.ctaTitle || '',
			ctaBody: content.ctaBody || '',
			ctaPrimaryLabel: content.ctaPrimaryLabel || '',
			ctaSecondaryLabel: content.ctaSecondaryLabel || ''
		};
	}

	let formData = $state(buildAboutFormData());

	// Initialize editor state from server data once, then keep local edits in formData.
	$effect(() => {
		if (hasInitializedForm) {
			return;
		}

		formData = buildAboutFormData(data.aboutContent);
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

	const storyImageUploader = createImageUploader('storyImage');
	const productOneImageUploader = createImageUploader('productOneImage');
	const productTwoImageUploader = createImageUploader('productTwoImage');
	const productThreeImageUploader = createImageUploader('productThreeImage');
	const inclusiveImageUploader = createImageUploader('inclusiveImage');
	const customImageUploader = createImageUploader('customImage');

	function clearImage(fieldName) {
		formData[fieldName] = '';
		uploadErrors[fieldName] = '';
	}

	async function handleSave() {
		isSaving = true;
		saveMessage = '';
		saveError = '';

		try {
			const response = await fetch('/admin/about', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(formData)
			});

			if (!response.ok) {
				throw new Error('Failed to save About content');
			}

			const result = await response.json();
			formData = {
				...formData,
				...(result.aboutContent || {}),
				id: 'about-page'
			};
			saveMessage = 'About page content saved successfully.';
		} catch (error) {
			console.error('Error saving About content:', error);
			saveError = 'Failed to save About page content. Please try again.';
		} finally {
			isSaving = false;
		}
	}
</script>

<svelte:head>
	<title>About Page - Admin</title>
</svelte:head>

<div class="about-admin-page">
	<div class="page-header">
		<div class="header-left">
			<h2 class="page-subtitle">Edit each section of the About page independently, including section images.</h2>
			{#if saveMessage}
				<p class="save-message" aria-live="polite">{saveMessage}</p>
			{/if}
			{#if saveError}
				<p class="save-error" aria-live="polite">{saveError}</p>
			{/if}
		</div>
		<button class="btn-primary" onclick={handleSave} disabled={isSaving}>
			<i class="fas {isSaving ? 'fa-spinner fa-spin' : 'fa-save'}"></i>
			{isSaving ? 'Saving...' : 'Save About Page'}
		</button>
	</div>

	<div class="editor-layout">
		<section class="editor-card theme-glass">
			<h3>Hero</h3>
			<div class="form-group">
				<label for="hero-title">Hero Title</label>
				<input id="hero-title" type="text" bind:value={formData.heroTitle} />
			</div>
			<div class="form-group">
				<label for="hero-subtitle">Hero Subtitle</label>
				<textarea id="hero-subtitle" rows="3" bind:value={formData.heroSubtitle}></textarea>
			</div>
		</section>

		<section class="editor-card theme-glass">
			<h3>Our Story</h3>
			<div class="form-group">
				<label for="story-title">Section Title</label>
				<input id="story-title" type="text" bind:value={formData.storyTitle} />
			</div>
			<div class="form-group">
				<label for="story-body">Section Body</label>
				<textarea id="story-body" rows="7" bind:value={formData.storyBody}></textarea>
			</div>
			<div class="form-group">
				<p class="field-label">Story Image</p>
				<div class="image-upload-section">
					{#if formData.storyImage}
						<div class="image-preview">
							<img src={formData.storyImage} alt="Story preview" />
							<button type="button" class="clear-image-btn" onclick={() => clearImage('storyImage')}>Remove Image</button>
						</div>
					{:else}
						<UploadDropzone uploader={storyImageUploader} />
					{/if}
					{#if uploadErrors.storyImage}
						<p class="error-message">{uploadErrors.storyImage}</p>
					{/if}
				</div>
			</div>
		</section>

		<section class="editor-card theme-glass">
			<h3>Products Header</h3>
			<div class="form-group">
				<label for="products-header-title">Section Title</label>
				<input id="products-header-title" type="text" bind:value={formData.productsHeaderTitle} />
			</div>
		</section>

		<section class="editor-card theme-glass">
			<h3>Product: Chainmaille Jewelry</h3>
			<div class="form-group">
				<label for="product-one-title">Card Title</label>
				<input id="product-one-title" type="text" bind:value={formData.productOneTitle} />
			</div>
			<div class="form-group">
				<label for="product-one-body">Card Body</label>
				<textarea id="product-one-body" rows="6" bind:value={formData.productOneBody}></textarea>
			</div>
			<div class="form-group">
				<p class="field-label">Card Image</p>
				<div class="image-upload-section">
					{#if formData.productOneImage}
						<div class="image-preview">
							<img src={formData.productOneImage} alt="Chainmaille jewelry preview" />
							<button type="button" class="clear-image-btn" onclick={() => clearImage('productOneImage')}>Remove Image</button>
						</div>
					{:else}
						<UploadDropzone uploader={productOneImageUploader} />
					{/if}
					{#if uploadErrors.productOneImage}
						<p class="error-message">{uploadErrors.productOneImage}</p>
					{/if}
				</div>
			</div>
		</section>

		<section class="editor-card theme-glass">
			<h3>Product: Chainmail Products</h3>
			<div class="form-group">
				<label for="product-two-title">Card Title</label>
				<input id="product-two-title" type="text" bind:value={formData.productTwoTitle} />
			</div>
			<div class="form-group">
				<label for="product-two-body">Card Body</label>
				<textarea id="product-two-body" rows="6" bind:value={formData.productTwoBody}></textarea>
			</div>
			<div class="form-group">
				<p class="field-label">Card Image</p>
				<div class="image-upload-section">
					{#if formData.productTwoImage}
						<div class="image-preview">
							<img src={formData.productTwoImage} alt="Chainmail products preview" />
							<button type="button" class="clear-image-btn" onclick={() => clearImage('productTwoImage')}>Remove Image</button>
						</div>
					{:else}
						<UploadDropzone uploader={productTwoImageUploader} />
					{/if}
					{#if uploadErrors.productTwoImage}
						<p class="error-message">{uploadErrors.productTwoImage}</p>
					{/if}
				</div>
			</div>
		</section>

		<section class="editor-card theme-glass">
			<h3>Product: Laser Cut Gifts</h3>
			<div class="form-group">
				<label for="product-three-title">Card Title</label>
				<input id="product-three-title" type="text" bind:value={formData.productThreeTitle} />
			</div>
			<div class="form-group">
				<label for="product-three-body">Card Body</label>
				<textarea id="product-three-body" rows="8" bind:value={formData.productThreeBody}></textarea>
			</div>
			<div class="form-group">
				<p class="field-label">Card Image</p>
				<div class="image-upload-section">
					{#if formData.productThreeImage}
						<div class="image-preview">
							<img src={formData.productThreeImage} alt="Laser cut gifts preview" />
							<button type="button" class="clear-image-btn" onclick={() => clearImage('productThreeImage')}>Remove Image</button>
						</div>
					{:else}
						<UploadDropzone uploader={productThreeImageUploader} />
					{/if}
					{#if uploadErrors.productThreeImage}
						<p class="error-message">{uploadErrors.productThreeImage}</p>
					{/if}
				</div>
			</div>
		</section>

		<section class="editor-card theme-glass">
			<h3>Inclusive Designs</h3>
			<div class="form-group">
				<label for="inclusive-title">Card Title</label>
				<input id="inclusive-title" type="text" bind:value={formData.inclusiveTitle} />
			</div>
			<div class="form-group">
				<label for="inclusive-body">Card Body</label>
				<textarea id="inclusive-body" rows="6" bind:value={formData.inclusiveBody}></textarea>
			</div>
			<div class="form-group">
				<p class="field-label">Card Image</p>
				<div class="image-upload-section">
					{#if formData.inclusiveImage}
						<div class="image-preview">
							<img src={formData.inclusiveImage} alt="Inclusive designs preview" />
							<button type="button" class="clear-image-btn" onclick={() => clearImage('inclusiveImage')}>Remove Image</button>
						</div>
					{:else}
						<UploadDropzone uploader={inclusiveImageUploader} />
					{/if}
					{#if uploadErrors.inclusiveImage}
						<p class="error-message">{uploadErrors.inclusiveImage}</p>
					{/if}
				</div>
			</div>
		</section>

		<section class="editor-card theme-glass">
			<h3>Custom Designs</h3>
			<div class="form-group">
				<label for="custom-title">Card Title</label>
				<input id="custom-title" type="text" bind:value={formData.customTitle} />
			</div>
			<div class="form-group">
				<label for="custom-body">Card Body</label>
				<textarea id="custom-body" rows="6" bind:value={formData.customBody}></textarea>
			</div>
			<div class="form-group">
				<p class="field-label">Card Image</p>
				<div class="image-upload-section">
					{#if formData.customImage}
						<div class="image-preview">
							<img src={formData.customImage} alt="Custom designs preview" />
							<button type="button" class="clear-image-btn" onclick={() => clearImage('customImage')}>Remove Image</button>
						</div>
					{:else}
						<UploadDropzone uploader={customImageUploader} />
					{/if}
					{#if uploadErrors.customImage}
						<p class="error-message">{uploadErrors.customImage}</p>
					{/if}
				</div>
			</div>
		</section>

		<section class="editor-card theme-glass">
			<h3>Values Cards</h3>
			<div class="split-grid">
				<div class="form-group">
					<label for="value-one-title">Value Card 1 Title</label>
					<input id="value-one-title" type="text" bind:value={formData.valueOneTitle} />
				</div>
				<div class="form-group">
					<label for="value-one-body">Value Card 1 Body</label>
					<textarea id="value-one-body" rows="4" bind:value={formData.valueOneBody}></textarea>
				</div>
				<div class="form-group">
					<label for="value-two-title">Value Card 2 Title</label>
					<input id="value-two-title" type="text" bind:value={formData.valueTwoTitle} />
				</div>
				<div class="form-group">
					<label for="value-two-body">Value Card 2 Body</label>
					<textarea id="value-two-body" rows="4" bind:value={formData.valueTwoBody}></textarea>
				</div>
			</div>
		</section>

		<section class="editor-card theme-glass">
			<h3>CTA Section</h3>
			<div class="form-group">
				<label for="cta-title">CTA Title</label>
				<input id="cta-title" type="text" bind:value={formData.ctaTitle} />
			</div>
			<div class="form-group">
				<label for="cta-body">CTA Body</label>
				<textarea id="cta-body" rows="4" bind:value={formData.ctaBody}></textarea>
			</div>
			<div class="split-grid two-col">
				<div class="form-group">
					<label for="cta-primary-label">Primary Button Label</label>
					<input id="cta-primary-label" type="text" bind:value={formData.ctaPrimaryLabel} />
				</div>
				<div class="form-group">
					<label for="cta-secondary-label">Secondary Button Label</label>
					<input id="cta-secondary-label" type="text" bind:value={formData.ctaSecondaryLabel} />
				</div>
			</div>
		</section>
	</div>
</div>

<style lang="scss">
	.about-admin-page {
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
