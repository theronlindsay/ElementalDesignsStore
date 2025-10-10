
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
			<div class="about-section">
				<div class="section-content">
					<h2>Our Story</h2>
					<p>
						Elemental Designs was born from a passion for creating unique, handcrafted pieces
						that tell a story. What started as a hobby creating chainmail jewelry has grown
						into a full collection of handmade items and custom laser-engraved gifts.
					</p>
					<p>
						Every piece we create is crafted with attention to detail and quality. We believe
						in the beauty of handmade items and the personal connection they create between
						maker and wearer.
					</p>
				</div>
				<div class="section-image">
					<div class="image-placeholder">
						<i class="fas fa-hammer fa-4x"></i>
					</div>
				</div>
			</div>

			<!-- Craftsmanship Section -->
			<div class="about-section reverse">
				<div class="section-image">
					<div class="image-placeholder">
						<i class="fas fa-ring fa-4x"></i>
					</div>
				</div>
				<div class="section-content">
					<h2>Our Craftsmanship</h2>
					<p>
						<strong>Chainmail Artistry:</strong> Each piece of chainmail jewelry is woven
						by hand using traditional and modern weaving techniques. From Byzantine to
						European 4-in-1, we explore various patterns to create unique designs.
					</p>
					<p>
						<strong>Laser Engraving:</strong> Our precision laser engraving service allows
						us to personalize gifts with names, dates, quotes, or custom designs. Perfect
						for weddings, anniversaries, or special occasions.
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
						<i class="fas fa-leaf"></i>
					</div>
					<h3>Sustainable Materials</h3>
					<p>We source quality materials responsibly and create pieces designed to last.</p>
				</div>

				<div class="value-card">
					<div class="value-icon">
						<i class="fas fa-palette"></i>
					</div>
					<h3>Custom Design</h3>
					<p>Work with us to create custom pieces that reflect your personal style and vision.</p>
				</div>

				<div class="value-card">
					<div class="value-icon">
						<i class="fas fa-store"></i>
					</div>
					<h3>Local & Online</h3>
					<p>Find us at local markets and fairs, or shop online for nationwide delivery.</p>
				</div>
			</div>

			<!-- Meet the Maker -->
			<div class="maker-section">
				<h2>Meet the Maker</h2>
				<div class="maker-content">
					<div class="maker-image">
						<div class="image-placeholder large">
							<i class="fas fa-user-circle fa-5x"></i>
						</div>
					</div>
					<div class="maker-bio">
						<h3>Your Name</h3>
						<p class="maker-title">Founder & Artisan</p>
						<p>
							Hi! I'm passionate about creating unique, wearable art. My journey started
							with chainmail weaving and has expanded to include laser engraving and
							custom designs. I love connecting with customers at local markets and
							creating pieces that bring joy.
						</p>
						<p>
							When I'm not crafting, you can find me exploring new weaving patterns,
							experimenting with design software, or planning our next market appearance.
						</p>
						<div class="maker-social">
							<a href="#" class="social-link"><i class="fab fa-instagram"></i></a>
							<a href="#" class="social-link"><i class="fab fa-facebook"></i></a>
							<a href="#" class="social-link"><i class="fab fa-tiktok"></i></a>
						</div>
					</div>
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
	.about-hero {
		padding: 4rem 2rem 3rem;
		text-align: center;
		background: linear-gradient(135deg, rgba(167, 139, 250, 0.1) 0%, transparent 100%);
		border-bottom: 1px solid var(--border-primary);
	}

	.about-container {
		max-width: 1200px;
		margin: 0 auto;
	}

	.about-title {
		font-size: 3rem;
		font-weight: 700;
		color: var(--text-primary);
		margin: 0 0 1rem 0;
	}

	.about-subtitle {
		font-size: 1.25rem;
		color: var(--accent);
		font-style: italic;
	}

	.about-content {
		padding: 3rem 2rem;
	}

	/* Section Styles */
	.about-section {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 3rem;
		align-items: center;
		margin-bottom: 4rem;
		padding: 2rem;
		background: rgba(42, 36, 56, 0.3);
		border-radius: 12px;
		border: 1px solid var(--border-primary);

		&.reverse {
			direction: rtl;
			> * {
				direction: ltr;
			}
		}

		h2 {
			color: var(--text-primary);
			font-size: 2rem;
			margin-bottom: 1.5rem;
		}

		p {
			color: var(--muted);
			line-height: 1.8;
			margin-bottom: 1rem;

			strong {
				color: var(--accent);
				font-weight: 600;
			}
		}
	}

	.section-content {
		padding: 1rem;
	}

	.section-image {
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

		&.large {
			width: 250px;
			height: 250px;
			border-radius: 50%;
		}
	}

	/* Values Grid */
	.values-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 2rem;
		margin: 4rem 0;
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

	/* Maker Section */
	.maker-section {
		margin: 4rem 0;
		padding: 3rem;
		background: rgba(42, 36, 56, 0.3);
		border-radius: 12px;
		border: 1px solid var(--border-primary);

		h2 {
			text-align: center;
			color: var(--text-primary);
			font-size: 2rem;
			margin-bottom: 2rem;
		}
	}

	.maker-content {
		display: grid;
		grid-template-columns: 1fr 2fr;
		gap: 3rem;
		align-items: center;
	}

	.maker-image {
		display: flex;
		justify-content: center;
	}

	.maker-bio {
		h3 {
			color: var(--text-primary);
			font-size: 1.5rem;
			margin-bottom: 0.5rem;
		}

		.maker-title {
			color: var(--accent);
			font-style: italic;
			margin-bottom: 1.5rem;
		}

		p {
			color: var(--muted);
			line-height: 1.8;
			margin-bottom: 1rem;
		}
	}

	.maker-social {
		display: flex;
		gap: 1rem;
		margin-top: 1.5rem;
	}

	.social-link {
		width: 40px;
		height: 40px;
		background: var(--panel-bg);
		border: 1px solid var(--panel-border);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--muted);
		transition: all 0.3s ease;
		text-decoration: none;

		&:hover {
			background: var(--accent);
			border-color: var(--accent);
			color: white;
			transform: translateY(-2px);
		}
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

		.about-section {
			grid-template-columns: 1fr;
			gap: 2rem;

			&.reverse {
				direction: ltr;
			}
		}

		.maker-content {
			grid-template-columns: 1fr;
			text-align: center;
		}

		.maker-social {
			justify-content: center;
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
