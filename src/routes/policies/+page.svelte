<svelte:head>
	<meta name="robots" content="noindex" />
	<title>Store Policies | Elemental Designs</title>
</svelte:head>

<main class="policies-page">
	<section class="policies-hero">
		<div class="policies-container">
			<h1 class="policies-title">Store Policies</h1>
			<p class="policies-subtitle">Information regarding shipping, returns, and privacy</p>
		</div>
	</section>

	<section class="policies-content">
		<div class="policies-container">
			<div class="policy-section" id="shipping">
				<h2>Shipping Policy</h2>
				<p>We process all orders within 1-3 business days. Custom orders may take longer depending on complexity and material availability.</p>
				<p>Domestic shipping typically takes 3-5 business days after processing. We provide tracking information for all shipments once they are dispatched.</p>
			</div>

			<div class="policy-section" id="returns">
				<h2>Returns & Exchanges</h2>
				<p>We want you to be completely satisfied with your purchase. We accept returns and exchanges on non-custom items within 14 days of delivery.</p>
				<p>Items must be returned in their original, unworn condition. Please contact us before returning an item so we can provide you with instructions.</p>
				<p>Note: Custom or personalized items cannot be returned or exchanged unless they arrive damaged or defective.</p>
			</div>

			<div class="policy-section" id="privacy">
				<h2>Privacy Policy</h2>
				<p>We deeply respect your privacy. Any personal information you provide to us during checkout or when subscribing to our newsletter is used solely for processing your orders or communicating with you.</p>
				<p>We will never sell, share, or rent your personal information to third parties without your explicit consent.</p>
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

	@media (max-width: 768px) {
		.policies-title {
			font-size: 2rem;
		}

		.policy-section {
			padding: 1.5rem;
		}
	}
</style>
