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
				<a href="#schedule"><i class="fas fa-calendar"></i> Event schedule</a>
				<a href="#about"><i class="fas fa-info"></i> About</a>
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

@import '../../app.scss';

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