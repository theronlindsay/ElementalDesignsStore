
<main class="about-page">

	<!-- About Hero Section -->
	<section class="about-hero">
		<div class="about-container">
			<h1 class="about-title">About Elemental Designs</h1>
			<p class="about-subtitle">Handcrafted with Passion, Designed with Purpose</p>
		</div>
	</section>

	<!-- About Content -->
	<section class="about-content">
		<div class="about-container">
			
			<!-- Story Section -->
			<div class="designs-section">
				<div class="design-card full-width-card story-card">
					<div class="story-content">
						<h2>Our Story</h2>
						<p>
							Elemental Chain Designs is a husband-wife team making hand-crafted chainmaille jewelry and laser cut/engraved gift items. One day, out of the blue, Aaron suggested it might be fun trying to make chainmaille jewelry. Karin didn't even know what that was. We ordered supplies, fell in love, and were all in.
						</p>
					</div>
					<div class="story-image">
						<div class="image-placeholder">
							<i class="fas fa-hammer fa-4x"></i>
						</div>
					</div>
				</div>
			</div>

			<!-- Product Section -->
			<div class="products-header">
				<h2>Our Products</h2>
			</div>
			
			<div class="designs-section products-grid">
				<div class="design-card">
					<div class="design-image-frame">
						<i class="fas fa-ring fa-4x"></i>
					</div>
					<h3>Chainmaille Jewelry</h3>
					<p>
						Our chainmaille product line includes necklaces, bracelets, anklets, earrings, rings, and body chains, ranging from everyday casual jewelry to more elaborate statement pieces.
					</p>
				</div>
				<div class="design-card">
					<div class="design-image-frame">
						<i class="fas fa-shield-alt fa-4x"></i>
					</div>
					<h3>Chainmail Products</h3>
					<p>
						We also make non-jewelry items, such as animal figures and keychains, and are starting to branch out into more traditional chainmaille armor pieces such as bracers, gauntlets, and pauldrons.
					</p>
				</div>
				<div class="design-card full-width-card">
					<div class="design-image-frame">
						<i class="fas fa-gift fa-4x"></i>
					</div>
					<h3>Laser Cut Gifts</h3>
					<p>
						This past year, we diversified our offerings with laser cut/engraved gift items, hoping the added variety would be able to offer something for those not interested in jewelry. So far, we have primarily focused on mystical and fantasy themes, as we are big fantasy fans, with our humorous (and sometimes irreverent) tarot magnets being most popular, but we continue to broaden our collection to meet a wider range of interests.
					</p>
				</div>
			</div>

			<!-- Inclusive and Custom Designs Section -->
			<div class="designs-section">
				<div class="design-card">
					<div class="design-image-frame">
						<i class="fas fa-rainbow fa-4x"></i>
					</div>
					<h3>Inclusive Designs</h3>
					<p>
						Our two LGBTQ+ kids are our biggest fans and promoters, and inspired us to create an extensive Pride collection. We have been honored to participate in both the Canyon County and Boise Pride Festivals.
					</p>
				</div>
				<div class="design-card">
					<div class="design-image-frame">
						<i class="fas fa-magic fa-4x"></i>
					</div>
					<h3>Custom Designs</h3>
					<p>
						One of our favorite parts of making is seeing each new piece come to life through the creation process, but most satisfying is working directly with our customers to create individualized pieces, helping bring your vision to life.
					</p>
				</div>
			</div>


			<!-- Values Section -->
			<div class="values-grid">
				<div class="value-card">
					<div class="value-icon">
						<i class="fas fa-heart"></i>
					</div>
					<h3>Handmade Quality</h3>
					<p>Every item is carefully crafted by hand, ensuring unique character and exceptional quality.</p>
				</div>

				<div class="value-card">
					<div class="value-icon">
						<i class="fas fa-store"></i>
					</div>
					<h3>Local & Online</h3>
					<p>Find us at local markets and fairs, or shop online for nationwide delivery.</p>
				</div>
			</div>


			<!-- CTA Section -->
			<div class="about-cta">
				<h2>Let's Create Something Together</h2>
				<p>Ready to get a custom piece or have questions about our products?</p>
				<div class="cta-buttons">
					<button class="btn-primary">Start Custom Order</button>
					<button class="btn-secondary">Contact Us</button>
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
			margin-bottom: 0;
		}
	}

	.story-image {
		display: flex;
		justify-content: center;
		align-items: center;
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

		&:hover {
			border-color: var(--accent);
			box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.3), 0 8px 25px rgba(167, 139, 250, 0.15);
		}
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

		.image-placeholder {
			width: 200px;
			height: 200px;
		}
	}
</style>
