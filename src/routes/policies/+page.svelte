<script>
	let { data } = $props();

	let policyContent = $derived(data.policyContent);

	function renderHtml(text) {
		if (!text) return '';
		if (text.includes('<')) return text;
		return text.split(/\n\s*\n/).map(p => `<p>${p.trim()}</p>`).join('');
	}
</script>

<svelte:head>
	<meta name="robots" content="noindex" />
	<title>{policyContent.heroTitle} | Elemental Designs</title>
</svelte:head>

<main class="policies-page">
	<section class="policies-hero">
		<div class="policies-container">
			<h1 class="policies-title">{policyContent.heroTitle}</h1>
			<p class="policies-subtitle">{policyContent.heroSubtitle}</p>
		</div>
	</section>

	<section class="policies-content">
		<div class="policies-container">
			<div class="policy-section" id="shipping">
				<h2>{policyContent.shippingTitle}</h2>
				<div class="rich-content">{@html renderHtml(policyContent.shippingBody)}</div>
			</div>

			<div class="policy-section" id="returns">
				<h2>{policyContent.returnsTitle}</h2>
				<div class="rich-content">{@html renderHtml(policyContent.returnsBody)}</div>
			</div>

			<div class="policy-section" id="privacy">
				<h2>{policyContent.privacyTitle}</h2>
				<div class="rich-content">{@html renderHtml(policyContent.privacyBody)}</div>
			</div>
		</div>
	</section>
</main>

<style lang="scss">
	* {
		box-sizing: border-box;
	}

	.policies-hero {
		padding: 4rem 2rem 3rem;
		text-align: center;
		border-bottom: 1px solid var(--border-primary);
	}

	.policies-container {
		max-width: 800px;
		margin: 0 auto;
		box-sizing: border-box;
	}

	.policies-title {
		font-size: 3rem;
		font-weight: 700;
		color: var(--text-primary);
		margin: 0;
	}

	.policies-subtitle {
		font-size: 1.25rem;
		color: var(--accent);
		font-style: italic;
		margin-top: 1rem;
	}

	.policies-content {
		padding: 4rem 2rem;
		width: 100%;
		max-width: 100vw;
		overflow-x: hidden;
	}

	.policy-section {
		background: rgba(42, 36, 56, 0.3);
		border: 1px solid var(--border-primary);
		border-radius: 12px;
		padding: 2.5rem;
		margin-bottom: 3rem;
		transition: all 0.3s ease;
		scroll-margin-top: 100px; /* Accounts for potential sticky navbar when jumping to #id */

		&:target {
			border-color: var(--accent);
			box-shadow: 0 0 20px rgba(167, 139, 250, 0.15);
		}

		h2 {
			color: var(--text-primary);
			font-size: 2rem;
			margin-top: 0;
			margin-bottom: 1.5rem;
			border-bottom: 2px solid rgba(167, 139, 250, 0.3);
			padding-bottom: 0.5rem;
			display: inline-block;
		}

		p {
			color: var(--muted);
			line-height: 1.8;
			margin-bottom: 1rem;

			&:last-child {
				margin-bottom: 0;
			}
		}
	}

	.rich-content {
		:global(p) {
			color: var(--muted);
			line-height: 1.8;
			margin-bottom: 1rem;
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

	@media (max-width: 768px) {
		.policies-title {
			font-size: 2rem;
		}

		.policy-section {
			padding: 1.5rem;
		}
	}
</style>
