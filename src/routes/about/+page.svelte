<script>
	import { resolve } from '$app/paths';

	let { data } = $props();

	let aboutContent = $derived(data.aboutContent);

	function renderHtml(text) {
		if (!text) return '';
		if (text.includes('<')) return text;
		return text.split(/\n\s*\n/).map(p => `<p>${p.trim()}</p>`).join('');
	}
</script>

<main class="about-page">
	<!-- About Hero Section -->
	<section class="about-hero">
		<div class="about-container">
			<h1 class="about-title">{aboutContent.heroTitle}</h1>
			<p class="about-subtitle">{aboutContent.heroSubtitle}</p>
		</div>
	</section>

	<!-- About Content -->
	<section class="about-content">
		<div class="about-container">
			<!-- Story Section -->
			<div class="designs-section">
				<div class="design-card full-width-card story-card">
					<div class="story-content">
						<h2>{aboutContent.storyTitle}</h2>
						<div class="rich-content">{@html renderHtml(aboutContent.storyBody)}</div>
					</div>
					<div class="story-image">
						{#if aboutContent.storyImage}
							<img class="section-image" src={aboutContent.storyImage} alt="Our story" />
						{:else}
							<div class="image-placeholder">
								<i class="fas fa-hammer fa-4x"></i>
							</div>
						{/if}
					</div>
				</div>
			</div>

			<!-- Product Section -->
			<div class="products-header">
				<h2>{aboutContent.productsHeaderTitle}</h2>
			</div>

			<div class="designs-section products-grid">
				<div class="design-card">
					<div class="design-image-frame">
						{#if aboutContent.productOneImage}
							<img class="design-image" src={aboutContent.productOneImage} alt={aboutContent.productOneTitle} />
						{:else}
							<i class="fas fa-ring fa-4x"></i>
						{/if}
					</div>
					<h3>{aboutContent.productOneTitle}</h3>
					<div class="rich-content">{@html renderHtml(aboutContent.productOneBody)}</div>
				</div>
				<div class="design-card">
					<div class="design-image-frame">
						{#if aboutContent.productTwoImage}
							<img class="design-image" src={aboutContent.productTwoImage} alt={aboutContent.productTwoTitle} />
						{:else}
							<i class="fas fa-shield-alt fa-4x"></i>
						{/if}
					</div>
					<h3>{aboutContent.productTwoTitle}</h3>
					<div class="rich-content">{@html renderHtml(aboutContent.productTwoBody)}</div>
				</div>
				<div class="design-card full-width-card">
					<div class="design-image-frame">
						{#if aboutContent.productThreeImage}
							<img class="design-image" src={aboutContent.productThreeImage} alt={aboutContent.productThreeTitle} />
						{:else}
							<i class="fas fa-gift fa-4x"></i>
						{/if}
					</div>
					<h3>{aboutContent.productThreeTitle}</h3>
					<div class="rich-content">{@html renderHtml(aboutContent.productThreeBody)}</div>
				</div>
			</div>

			<!-- Inclusive and Custom Designs Section -->
			<div class="designs-section">
				<div class="design-card">
					<div class="design-image-frame">
						{#if aboutContent.inclusiveImage}
							<img class="design-image" src={aboutContent.inclusiveImage} alt={aboutContent.inclusiveTitle} />
						{:else}
							<i class="fas fa-rainbow fa-4x"></i>
						{/if}
					</div>
					<h3>{aboutContent.inclusiveTitle}</h3>
					<div class="rich-content">{@html renderHtml(aboutContent.inclusiveBody)}</div>
				</div>
				<div class="design-card">
					<div class="design-image-frame">
						{#if aboutContent.customImage}
							<img class="design-image" src={aboutContent.customImage} alt={aboutContent.customTitle} />
						{:else}
							<i class="fas fa-magic fa-4x"></i>
						{/if}
					</div>
					<h3>{aboutContent.customTitle}</h3>
					<div class="rich-content">{@html renderHtml(aboutContent.customBody)}</div>
					<p class="custom-past-work-cta">
						<a href={resolve('/past-work')} class="past-work-link">See past work</a>
					</p>
				</div>
			</div>

			<!-- Values Section -->
			<div class="values-grid">
				<div class="value-card">
					<div class="value-icon">
						<i class="fas fa-heart"></i>
					</div>
					<h3>{aboutContent.valueOneTitle}</h3>
					<div class="rich-content">{@html renderHtml(aboutContent.valueOneBody)}</div>
				</div>

				<div class="value-card">
					<div class="value-icon">
						<i class="fas fa-store"></i>
					</div>
					<h3>{aboutContent.valueTwoTitle}</h3>
					<div class="rich-content">{@html renderHtml(aboutContent.valueTwoBody)}</div>
				</div>
			</div>

			<!-- CTA Section -->
			<div class="about-cta">
				<h2>{aboutContent.ctaTitle}</h2>
				<div class="rich-content">{@html renderHtml(aboutContent.ctaBody)}</div>
				<div class="cta-buttons">
					<button class="btn-primary">{aboutContent.ctaPrimaryLabel}</button>
					<button class="btn-secondary">{aboutContent.ctaSecondaryLabel}</button>
				</div>
			</div>
		</div>
	</section>
</main>

<style lang="scss">
	* {
		box-sizing: border-box;
	}

	.about-hero {
		padding: 4rem 2rem 3rem;
		text-align: center;
		border-bottom: 1px solid var(--border-primary);
	}

	.about-container {
		max-width: 1200px;
		margin: 0 auto;
		box-sizing: border-box;
	}

	.about-title {
		font-size: 3rem;
		font-weight: 700;
		color: var(--text-primary);
		margin: 0 0 0 0;
	}

	.about-subtitle {
		font-size: 1.25rem;
		color: var(--accent);
		font-style: italic;
	}

	.about-content {
		padding: 3rem 2rem;
		width: 100%;
		max-width: 100vw;
		box-sizing: border-box;
		overflow-x: hidden;
	}

	/* Section Styles */
	.story-card {
		display: grid !important;
		grid-template-columns: 1fr 1fr;
		gap: 3rem;
		align-items: center;
		text-align: left !important;
		max-width: 100%;
		box-sizing: border-box;

		h2 {
			color: var(--text-primary);
			font-size: 2rem;
			margin-bottom: 1.5rem;
			margin-top: 0 !important;
		}

		p {
			color: var(--muted);
			line-height: 1.8;
			margin-bottom: 1rem;
		}
	}

	.story-image {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.section-image {
		width: 300px;
		height: 300px;
		object-fit: cover;
		border-radius: 12px;
		border: 2px solid var(--border-accent);
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
	}

	.image-placeholder {
		width: 300px;
		height: 300px;
		background: linear-gradient(135deg, var(--border-primary) 0%, var(--border-secondary) 100%);
		border-radius: 12px;
		border: 2px dashed var(--border-accent);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--muted-2);
		transition: all 0.3s ease;

		&:hover {
			border-color: var(--accent);
			transform: translateY(-5px);
		}
	}

	/* Products & Designs Sections */
	.products-header {
		text-align: center;
		margin-bottom: 2.5rem;

		h2 {
			color: var(--text-primary);
			font-size: 2.5rem;
			margin: 0;
		}
	}

	.designs-section {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 3rem;
		margin-bottom: 4rem;
		max-width: 100%;
		box-sizing: border-box;
	}

	.full-width-card {
		grid-column: 1 / -1;
		width: 100%;
		max-width: 100%;
	}

	.design-card {
		background: rgba(42, 36, 56, 0.3);
		border: 1px solid var(--border-primary);
		border-radius: 16px;
		padding: 2rem;
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		transition: all 0.3s ease;
		max-width: 100%;
		box-sizing: border-box;

		&:hover {
			border-color: var(--accent);
			transform: translateY(-5px);
			box-shadow: 0 10px 25px -5px rgba(167, 139, 250, 0.15);
		}

		h3 {
			color: var(--text-primary);
			font-size: 1.5rem;
			margin: 1.5rem 0 1rem;
		}

		p {
			color: var(--muted);
			line-height: 1.8;
		}
	}

	.design-image-frame {
		width: 100%;
		max-width: 360px;
		height: 240px;
		background: linear-gradient(135deg, rgba(88, 70, 120, 0.3) 0%, rgba(42, 36, 56, 0.5) 100%);
		border-radius: 24px;
		border: 1px solid rgba(167, 139, 250, 0.2);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--accent);
		box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.2), 0 8px 20px rgba(0, 0, 0, 0.1);
		margin-bottom: 1rem;
		transition: all 0.3s ease;
		overflow: hidden;

		&:hover {
			border-color: var(--accent);
			box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.3), 0 8px 25px rgba(167, 139, 250, 0.15);
		}
	}

	.design-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	/* Values Grid */
	.values-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 2rem;
		margin: 2rem 0;
	}

	.value-card {
		background: rgba(42, 36, 56, 0.5);
		border: 1px solid var(--border-primary);
		border-radius: 12px;
		padding: 2rem;
		text-align: center;
		transition: all 0.3s ease;

		&:hover {
			transform: translateY(-5px);
			border-color: var(--accent);
			box-shadow: 0 10px 25px -5px rgba(167, 139, 250, 0.2);
		}

		h3 {
			color: var(--text-primary);
			margin: 1rem 0;
			font-size: 1.25rem;
		}

		p {
			color: var(--muted);
			line-height: 1.6;
		}
	}

	.value-icon {
		width: 60px;
		height: 60px;
		background: linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 0 auto;
		color: white;
		font-size: 1.5rem;
	}

	/* CTA Section */
	.about-cta {
		text-align: center;
		padding: 3rem 2rem;
		background: linear-gradient(135deg, rgba(167, 139, 250, 0.1) 0%, transparent 100%);
		border-radius: 12px;
		margin-top: 4rem;

		h2 {
			color: var(--text-primary);
			font-size: 2rem;
			margin-bottom: 1rem;
		}

		p {
			color: var(--muted);
			font-size: 1.1rem;
			margin-bottom: 2rem;
		}
	}

	.cta-buttons {
		display: flex;
		gap: 1rem;
		justify-content: center;
		flex-wrap: wrap;
	}

	.btn-primary,
	.btn-secondary {
		padding: 0.75rem 2rem;
		border-radius: 8px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
		border: none;
		font-size: 1rem;
	}

	.btn-primary {
		background: linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%);
		color: white;

		&:hover {
			transform: translateY(-2px);
			box-shadow: 0 10px 25px -5px rgba(167, 139, 250, 0.4);
		}
	}

	.btn-secondary {
		background: transparent;
		color: var(--accent);
		border: 2px solid var(--accent);

		&:hover {
			background: rgba(167, 139, 250, 0.1);
			transform: translateY(-2px);
		}
	}

	.custom-past-work-cta {
		margin: 1.25rem 0 0;
	}

	.past-work-link {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		font-weight: 600;
		color: var(--accent);
		text-decoration: none;
		border-bottom: 1px solid color-mix(in srgb, var(--accent) 45%, transparent);

		&:hover {
			color: var(--accent-2, var(--accent));
			border-bottom-color: var(--accent);
		}
	}

	.rich-content {
		:global(p) {
			color: var(--muted);
			line-height: 1.8;
			margin: 0 0 1rem;
			&:last-child { margin-bottom: 0; }
		}
		:global(a) { color: var(--accent); }
		:global(ul), :global(ol) {
			color: var(--muted);
			line-height: 1.8;
			padding-left: 1.5rem;
		}
		:global(strong) { color: var(--text-primary); }
	}

	/* Responsive Design */
	@media (max-width: 768px) {
		.about-title {
			font-size: 2rem;
		}

		.designs-section {
			grid-template-columns: 1fr;
			gap: 2rem;
		}

		.story-card {
			grid-template-columns: 1fr !important;
			text-align: center !important;
		}

		.values-grid {
			grid-template-columns: 1fr;
		}

		.image-placeholder,
		.section-image {
			width: 200px;
			height: 200px;
		}
	}
</style>
