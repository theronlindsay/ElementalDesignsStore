<script>
  let product = {
    name: "Chainmail Necklace",
    subtitle: "Handwoven silver rings",
    description:
      "The Chainmail Necklace is crafted from interlocking sterling silver rings, creating a supple and durable weave. Each piece is handcrafted, ensuring that no two are ever identical.",
    price: 129.99,
    images: [
      "src/lib/assets/images/2-1_necklace_pride_6color.png",
      "src/lib/assets/images/2-1_necklace_pride_ally_zoom.png",
      "src/lib/assets/images/2-1_necklace_pride_agender.png",
      "src/lib/assets/images/2-1_necklace_pride_agender_zoom.png"
    ]
  };

  let selectedImage = product.images[0];

  function selectImage(img) {
    selectedImage = img;
  }
</script>

<div class="elemental-store">

  <!-- Main Product Section -->
  <section class="hero">
    <div class="hero-content image-left">
      <!-- Product Image Gallery -->
      <div class="search-panel">
        <div class="product-gallery">
          <div class="main-image">
            <img src={selectedImage} alt="Luna Chainmail Necklace" />
          </div>
          <div class="thumbnail-row">
            {#each product.images as img}
              <img
                src={img}
                alt="Thumbnail"
                class:selected={selectedImage === img}
                on:click={() => selectImage(img)}
              />
            {/each}
          </div>
        </div>
      </div>

      <!-- Product Details -->
      <div class="product-info">
        <h2 class="hero-title">{product.name}</h2>
        <p class="hero-subtitle">{product.subtitle}</p>
        <p class="hero-description">{product.description}</p>

        <h3 style="color: var(--accent); margin-bottom: var(--nav-gap);">
          ${product.price.toFixed(2)}
        </h3>

        <div class="hero-actions">
          <button class="btn-primary">Add to Cart</button>
          <button class="btn-secondary">Add to Wishlist</button>
        </div>
      </div>
    </div>
  </section>

  <!-- Details Section -->
  <section class="content-grid">
    <div class="events-section">
      <h3>Product Details</h3>
      <ul style="color: var(--muted); line-height: 1.6;">
        <li>Handwoven chainmail weave using sterling silver rings</li>
        <li>Adjustable clasp with extender chain</li>
        <li>Neck circumference: 18" – 22"</li>
        <li>Hypoallergenic and tarnish-resistant finish</li>
        <li>Includes velvet-lined gift box</li>
      </ul>
    </div>

    <div class="custom-orders">
      <h3>Custom Orders</h3>
      <p>
        Want a personalized weave pattern, different alloy, or gemstone accents?
        Our artisans can craft a custom Luna Necklace tailored to your style.
      </p>
      <div class="custom-actions">
        <button class="btn-custom">Request Custom Design</button>
        <button class="btn-past-work">View Past Creations</button>
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
</div>

<style>

/* ======== Left-Side Image Gallery ======== */

.image-left {
  grid-template-columns: 1fr 1.5fr; /* images left, info right */
  
}

/* Quick fallback that doesn't depend on grid behavior */
.search-panel {
  margin-right: 2rem;
}


.product-gallery {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--nav-gap);
}

.main-image {
  width: 100%;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid var(--border-primary);
  box-shadow: var(--glass-shadow);

  img {
    width: 100%;
    height: auto;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  img:hover {
    transform: scale(1.02);
  }
}

.thumbnail-row {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: var(--nav-gap);

  img {
    width: 80px;
    height: 80px;
    object-fit: cover;
    border-radius: var(--nav-gap);
    border: 2px solid var(--border-secondary);
    opacity: 0.6;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  img:hover {
    opacity: 1;
    transform: translateY(-2px);
  }

  img.selected {
    opacity: 1;
    border-color: var(--accent);
    box-shadow: var(--shadow-accent-sm);
  }
}

/* ======== Responsive Adjustments ======== */
@media (max-width: 768px) {
  .image-left {
    grid-template-columns: 1fr;
  }

/* If layout stacks on mobile, remove the right margin there */
@media (max-width: 768px) {
  .search-panel {
    margin-right: 0;
  }
}

  .thumbnail-row img {
    width: 60px;
    height: 60px;
  }
}
</style>