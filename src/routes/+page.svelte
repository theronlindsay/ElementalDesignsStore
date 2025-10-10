<script lang="ts">
	let showAccountMenu = false;
	let showMainMenus = {};
</script>
    
<!-- Hero Section -->
<section class="hero">
	<div class="hero-content">
		<div class="hero-main">
			<a href="/" class="logo-link" aria-label="Elemental Designs Home">
					<div class="logo">
						<img src="/src/lib/assets/LogoTransparent.png" alt="Logo" style="max-width: 200px; display: block"/>
					</div>
				</a>
			<p class="hero-title">Handcrafted Chainmail and Laser-Engraved Gifts</p>
			<p class="hero-description">
				Explore our unique collection of handcrafted jewelry and personalized gifts.
				Each piece is carefully crafted with attention to detail and quality.
			</p>
			
			<div class="hero-actions">
				<button class="btn-primary">Shop Now</button>
				<button class="btn-secondary">Custom Orders</button>
			</div>
		</div>
		
		<div class="hero-panels">
			<div class="search-panel">
				<div class="product-images">
					<div class="product-placeholder"></div>
					<div class="product-placeholder"></div>
				</div>
			</div>
		</div>
	</div>
</section>


<!-- Product Categories Grid -->
<section class="categories-grid">
	<div class="category-item">
		<div class="category-image"></div>
		<h4>Shop by collection</h4>
	</div>
	
	<div class="category-item">
		<div class="category-image"></div>
		<h4>Bracelets</h4>
	</div>
	
	<div class="category-item">
		<div class="category-image"></div>
		<h4>Rings</h4>
	</div>
	
	<div class="category-item">
		<div class="category-image"></div>
		<h4>Engraved Gifts</h4>
	</div>
</section>

<!-- Content Grid -->
<div class="content-grid">
	<!-- Events Section -->
	<section class="events-section">
		<h3>Where we'll be</h3>
		<div class="event-list">
			<div class="event-item">
				<div class="event-date">Sat 10-4</div>
				<div class="event-details">
					<strong>Riverfront Market</strong>
					<small>Springfield, IL</small>
				</div>
			</div>
			
			<div class="event-item">
				<div class="event-date">Sun 11-3</div>
				<div class="event-details">
					<strong>Lakeside Fair</strong>
					<small>Madison, WI</small>
				</div>
			</div>
			
			<div class="event-item">
				<div class="event-date">Fri 6-9</div>
				<div class="event-details">
					<strong>Night Bazaar</strong>
					<small>Milwaukee, WI</small>
				</div>
			</div>
		</div>
		
		<div class="newsletter-signup">
			<input type="email" placeholder="Enter your email" />
			<button class="btn-signup">Get updates</button>
			<small>No pop-ups. We only email about shows and launches.</small>
		</div>
	</section>

	<!-- Custom Orders Section -->
	<section class="custom-orders">
		<h3>Custom orders</h3>
		<p>Have something specific in mind? We create custom chainmail and laser-engraved pieces tailored to your vision. From personalized jewelry to unique gifts.</p>
		
		<div class="custom-actions">
			<button class="btn-custom">Start a custom request</button>
			<button class="btn-past-work">See past work</button>
		</div>
	</section>
</div>


