<!-- Footer -->
<footer class="footer">
	<div class="footer-content">
		
		<div class="hero-subtitle">Subscribe to our Newsletter!: </div>
		<div class="footer-newsletter">
			<input type="email" placeholder="Enter your email" />
			<button class="btn-subscribe">Subscribe</button>
		</div>
		
		<div class="footer-links">
			<div class="footer-column">
				<h4>Info</h4>
				<a href="/#events-schedule"><i class="fas fa-calendar"></i> Event schedule</a>
				<a href="/about"><i class="fas fa-info"></i> About</a>
				<a href="#contact"><i class="fas fa-envelope"></i> Contact</a>
			</div>
			
			<div class="footer-column">
				<h4>Social</h4>
				<a href="#instagram"><i class="fab fa-instagram"></i> Instagram</a>
				<a href="#tiktok"><i class="fab fa-tiktok"></i> TikTok</a>
				<a href="#facebook"><i class="fab fa-facebook"></i> Facebook</a>
			</div>
			
			<div class="footer-column">
				<h4>Payments</h4>
				<a href="#visa"><i class="fab fa-cc-visa"></i> Visa/Mastercard</a>
				<a href="#mastercard"><i class="fab fa-cc-mastercard"></i>Amex/Discover</a>
				<a href="#amex"><i class="fab fa-cc-amex"></i>Google/Apple Pay</a>
			</div>
			
			<div class="footer-column">
				<h4>Policies</h4>
				<a href="#shipping"><i class="fas fa-shipping-fast"></i> Shipping</a>
				<a href="#returns"><i class="fas fa-undo"></i> Returns</a>
				<a href="#privacy"><i class="fas fa-shield-alt"></i> Privacy</a>
			</div>
		</div>
	</div>
</footer>

<style lang="scss">

// Color Variables
$bg-primary: #1a1625;
$bg-secondary: #2a2438;
$bg-panel: rgba(26, 22, 37, 0.6);
$bg-nav: rgba(42, 36, 56, 0.8);

$border-primary: #3d3650;
$border-secondary: #4a4560;
$border-accent: #6b5d7a;

$text-primary: #f3f4f6;
$text-secondary: #e8e4f3;
$text-muted: #d1d5db;
$text-muted-2: #9ca3af;
$text-muted-3: #94a3b8;

$accent-primary: #a78bfa;
$accent-secondary: #8b5cf6;

// Spacing Variables
$spacing-xs: 0.25rem;
$spacing-sm: 0.5rem;
$spacing-md: 1rem;
$spacing-lg: 1.5rem;
$spacing-xl: 2rem;
$spacing-2xl: 3rem;
$spacing-3xl: 4rem;

$desktop-breakpoint: 1200px;
$bg-primary: #1a1625;

// Border Radius
$radius-sm: 6px;
$radius-md: 8px;
$radius-lg: 12px;
$radius-full: 50%;

// Transitions
$transition-fast: 0.18s ease;
$transition-normal: 0.3s ease;
$transition-slow: 0.5s ease;

.footer {
  background: $bg-primary;
  border-top: 1px solid $border-primary;
  padding: $spacing-2xl $spacing-xl $spacing-xl;
}

.footer-content {
  max-width: $desktop-breakpoint;
  margin: 0 auto;
}

.footer-newsletter {
  display: flex;
  gap: $spacing-md;
  margin-bottom: $spacing-xl;
  max-width: 400px;

  input {
    flex: 1;
    padding: 0.75rem;
    background: $bg-secondary;
    border: 1px solid $border-secondary;
    border-radius: $radius-sm;
    color: $text-secondary;
    outline: none;
  }
}

.btn-subscribe {
  background: $accent-primary;
  border: none;
  color: white;
  padding: 0.75rem $spacing-lg;
  border-radius: $radius-sm;
  cursor: pointer;
  transition: all $transition-normal;
  font-weight: 600;

  &:hover {
    background: $accent-secondary;
  }
}

.footer-links {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: $spacing-xl;
}

.footer-column {
  h4 {
    color: $text-primary;
    margin: 0 0 $spacing-md 0;
    font-size: 1.1rem;
  }

  a {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    color: $text-muted-2;
    text-decoration: none;
    padding: $spacing-sm 0;
    transition: all $transition-normal;

    &:hover {
      color: $accent-primary;
      transform: translateX(5px);
    }

    i {
      width: 20px;
      font-size: 0.9rem;
    }
  }
}
</style>