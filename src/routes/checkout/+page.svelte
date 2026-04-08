<script>
	import { onMount, onDestroy } from 'svelte';
	import { fromStore } from 'svelte/store';
	import { resolve } from '$app/paths';
	import { page } from '$app/stores';
	import { env } from '$env/dynamic/public';
	import { cart as cartStore } from '$lib/cart/cartStore';

	let itemsMap = $state({});
	let loadingItems = $state(true);
	let paymentReady = $state(false);
	let placingOrder = $state(false);
	let paymentError = $state('');
	let orderMessage = $state('');
	let subscribeToNewsletter = $state(false);
	let showNewsletterModal = $state(false);

	let customer = $state({
		firstName: '',
		lastName: '',
		email: '',
		phone: '',
		address: '',
		city: '',
		state: '',
		zip: ''
	});

	let billingSameAsShipping = $state(true);
	let billing = $state({
		firstName: '',
		lastName: '',
		address: '',
		city: '',
		state: '',
		zip: ''
	});

	const cartState = fromStore(cartStore);
	const pageStore = fromStore(page);
	const squareAppId = env.PUBLIC_SQUARE_APPLICATION_ID || '';
	const squareLocationId = env.PUBLIC_SQUARE_LOCATION_ID || '';
	const squareWebPaymentsSandbox =
		env.PUBLIC_SQUARE_WEB_PAYMENTS_SANDBOX === 'true' ||
		env.PUBLIC_SQUARE_WEB_PAYMENTS_SANDBOX === '1' ||
		squareAppId.startsWith('sandbox-');
	let taxRate = 0;
	let checkoutItems = $derived(
		(cartState.current || []).map((cartItem) => {
			const item = itemsMap?.[cartItem.id];
			return {
				id: cartItem.id,
				name: item?.name || `Item ${cartItem.id}`,
				price: item?.price || 0,
				quantity: cartItem.quantity
			};
		})
	);
	let subtotal = $derived(checkoutItems.reduce((sum, item) => sum + item.price * item.quantity, 0));
	let shipping = $derived(subtotal > 50 ? 0 : 5.99);
	let tax = $derived(subtotal * taxRate);
	let total = $derived(subtotal + shipping + tax);
	let shippingContactValid = $derived(
		Boolean(
			customer.firstName &&
				customer.lastName &&
				customer.email &&
				customer.phone &&
				customer.address &&
				customer.city &&
				customer.state &&
				customer.zip
		)
	);
	let billingValid = $derived(
		billingSameAsShipping ||
			(billing.firstName &&
				billing.lastName &&
				billing.address &&
				billing.city &&
				billing.state &&
				billing.zip)
	);
	let checkoutFormValid = $derived(shippingContactValid && billingValid);
	let newsletterDisclaimer = $derived(
		pageStore.current?.data?.branding?.newsletterDisclaimer ||
			'No pop-ups. We only email about shows and launches.'
	);

	let card;
	let payments;
	let applePayReady = $state(false);
	/** @type {any} */
	let applePayMethod = null;

	/** In-flow slot whose box we measure; #cash-app-pay is reparented under <main> by installCashAppPortal. */
	let cashAppAnchorEl = $state(/** @type {HTMLDivElement | null} */ (null));
	let cashAppPortalCleanup = () => {};

	/** Baseline size for `--cash-app-scale` (match `.wallet-stack` max width × wallet row height). */
	const CASH_APP_FRAME_W = 180;
	const CASH_APP_FRAME_H = 42;

	/**
	 * Cash App / Square overlays were clipped by .theme-glass (backdrop-filter).
	 * Reparent #cash-app-pay under the checkout main (not document.body) so z-index stays below the
	 * sticky navbar (z-index 1000). The in-flow `.wallet-slot.cash-app-flow-anchor` reserves layout;
	 * `#cash-app-pay` is fixed and synced to that slot.
	 */
	function installCashAppPortal() {
		const pay = document.getElementById('cash-app-pay');
		const anchor = cashAppAnchorEl;
		if (!pay || !anchor) return;

		const host =
			anchor.closest('main.checkout-page') ?? anchor.closest('main.elemental-store') ?? document.body;
		host.appendChild(pay);

		const sync = () => {
			if (!anchor.isConnected || !pay.isConnected) return;
			const r = anchor.getBoundingClientRect();
			const rw = r.width > 0 ? r.width : CASH_APP_FRAME_W;
			const rh = r.height > 0 ? r.height : CASH_APP_FRAME_H;
			const w = Math.min(CASH_APP_FRAME_W, rw);
			const h = Math.min(CASH_APP_FRAME_H, rh);
			const left = r.left + Math.max(0, (r.width - w) / 2);
			const top = r.top + Math.max(0, (r.height - h) / 2);
			const visualScale = Math.min(1, w / CASH_APP_FRAME_W, h / CASH_APP_FRAME_H);
			pay.style.setProperty('--cash-app-scale', String(visualScale));
			Object.assign(pay.style, {
				position: 'fixed',
				left: `${left}px`,
				top: `${top}px`,
				width: `${w}px`,
				maxWidth: `${CASH_APP_FRAME_W}px`,
				height: `${h}px`,
				minHeight: `${h}px`,
				maxHeight: `${h}px`,
				zIndex: '40',
				pointerEvents: 'auto',
				margin: '0',
				boxSizing: 'border-box',
				overflow: 'hidden',
				display: 'block',
				borderRadius: '12px'
			});
		};

		sync();
		requestAnimationFrame(sync);
		window.addEventListener('scroll', sync, true);
		window.addEventListener('resize', sync);
		const ro = new ResizeObserver(sync);
		ro.observe(anchor);

		const prev = cashAppPortalCleanup;
		cashAppPortalCleanup = () => {
			prev();
			window.removeEventListener('scroll', sync, true);
			window.removeEventListener('resize', sync);
			ro.disconnect();
			if (pay.parentNode !== anchor) {
				if (anchor.isConnected) {
					anchor.appendChild(pay);
				} else {
					pay.remove();
				}
			}
			pay.style.cssText = '';
		};
	}

	async function submitCheckout(sourceId) {
		const response = await fetch('/api/checkout', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({
				sourceId,
				items: checkoutItems,
				customer,
				billingSameAsShipping,
				billing: billingSameAsShipping ? null : billing,
				breakdown: { subtotal, shipping, tax, total }
			})
		});

		const data = await response.json();
		if (!response.ok) {
			throw new Error(data?.error || 'Payment failed.');
		}

		orderMessage = 'Payment successful. Thank you for your order.';
		cartStore.clearCart();
	}

	/** Square renders the card in a cross-origin iframe; theme it via CardOptions only. */
	function squareCardStyleFromTheme() {
		const root = document.documentElement;
		const cs = getComputedStyle(root);
		const v = (name, fallback) => cs.getPropertyValue(name).trim() || fallback;

		/* Square only accepts a single font-family name (no stacks) and fontSize in px (max 16px). */
		const rawFamily = getComputedStyle(document.body).fontFamily;
		const firstFamily = rawFamily
			.split(',')[0]
			.replace(/["']/g, '')
			.trim();
		const generic =
			/^(system-ui|-apple-system|ui-sans-serif|ui-rounded|BlinkMacSystemFont)$/i.test(firstFamily);
		const fontFamily = generic || !firstFamily ? 'sans-serif' : firstFamily;

		const bg = v('--bg-secondary', '#1e1e24');
		const border = v('--border-secondary', '#3f3f46');
		const text = v('--text-primary', '#fafafa');
		const muted = v('--muted', '#a1a1aa');
		const accent = v('--accent', '#8b5cf6');

		return {
			'.input-container': {
				borderColor: border,
				borderRadius: '8px'
			},
			'.input-container.is-focus': {
				borderColor: accent
			},
			'.input-container.is-error': {
				borderColor: '#f87171'
			},
			'.message-text': {
				color: muted
			},
			'.message-icon': {
				color: muted
			},
			'.message-text.is-error': {
				color: '#f87171'
			},
			'.message-icon.is-error': {
				color: '#f87171'
			},
			input: {
				backgroundColor: bg,
				color: text,
				fontFamily,
				fontSize: '16px'
			},
			'input::placeholder': {
				color: muted
			},
			'input.is-error': {
				color: '#f87171'
			}
		};
	}

	onMount(async () => {
		try {
			const response = await fetch('/api/items');
			if (response.ok) {
				const data = await response.json();
				itemsMap = data.itemsMap || {};
			}
		} catch (error) {
			console.error('Failed to load checkout items', error);
		} finally {
			loadingItems = false;
		}

		await initializeSquarePayments();
	});

	onDestroy(() => cashAppPortalCleanup());

	async function initializeSquarePayments() {
		if (!squareAppId || !squareLocationId) {
			paymentError = 'Square is not configured yet (missing public app/location keys).';
			return;
		}

		const squareWindow = /** @type {any} */ (window);
		if (!squareWindow.Square) {
			const sdkScript = document.createElement('script');
			sdkScript.src = squareWebPaymentsSandbox
				? 'https://sandbox.web.squarecdn.com/v1/square.js'
				: 'https://web.squarecdn.com/v1/square.js';
			sdkScript.async = true;
			document.body.appendChild(sdkScript);
			await new Promise((resolvePromise, rejectPromise) => {
				sdkScript.onload = resolvePromise;
				sdkScript.onerror = rejectPromise;
			});
		}

		try {
			payments = squareWindow.Square.payments(squareAppId, squareLocationId);
			card = await payments.card({ style: squareCardStyleFromTheme() });
			await card.attach('#card-container');
			await initializeWalletMethods();
			paymentReady = true;
		} catch (error) {
			console.error('Square init failed', error);
			paymentError = 'Unable to initialize Square payments.';
		}
	}

	async function initializeWalletMethods() {
		const paymentRequest = payments.paymentRequest({
			countryCode: 'US',
			currencyCode: 'USD',
			total: {
				amount: total.toFixed(2),
				label: 'Elemental Designs'
			}
		});

		try {
			const cashAppPaymentRequest = payments.paymentRequest({
				countryCode: 'US',
				currencyCode: 'USD',
				total: {
					amount: total.toFixed(2),
					label: 'Elemental Designs'
				}
			});
			const redirectURL = `${window.location.origin}${resolve('/checkout')}`;
			const cashAppPay = await payments.cashAppPay(cashAppPaymentRequest, {
				redirectURL,
				referenceId: `checkout-${Date.now()}`
			});
			cashAppPay.addEventListener('ontokenization', async (/** @type {CustomEvent} */ event) => {
				const { tokenResult, error } = event.detail;
				if (error) {
					paymentError =
						typeof error === 'string' ? error : (error?.message ?? 'Cash App Pay failed.');
					return;
				}
				if (tokenResult?.status !== 'OK' || !tokenResult?.token) return;
				if (!checkoutFormValid || total <= 0) {
					paymentError = 'Please complete contact and shipping before paying.';
					return;
				}

				placingOrder = true;
				paymentError = '';
				orderMessage = '';
				try {
					await submitCheckout(tokenResult.token);
				} catch (err) {
					paymentError = err instanceof Error ? err.message : 'Unable to place order.';
				} finally {
					placingOrder = false;
				}
			});
			await cashAppPay.attach('#cash-app-pay');
			requestAnimationFrame(() => installCashAppPortal());
		} catch (error) {
			console.error('Cash App Pay unavailable', error);
		}

		try {
			const applePaymentRequest = payments.paymentRequest({
				countryCode: 'US',
				currencyCode: 'USD',
				total: {
					amount: total.toFixed(2),
					label: 'Elemental Designs'
				}
			});
			applePayMethod = await payments.applePay(applePaymentRequest);
			applePayReady = true;
		} catch (error) {
			console.error('Apple Pay unavailable', error);
			const errText = error instanceof Error ? error.message : String(error);
			if (/domain|not registered|PaymentMethodUnsupportedError/i.test(errText)) {
				console.info(
					'[Checkout] Apple Pay: In Square Developer Console (Sandbox or Production), open your app → Apple Pay → add this site’s HTTPS domain. Download the domain association file and save it as static/.well-known/apple-developer-merchantid-domain-association (no extension), deploy, then retry. Apple Pay does not work on http:// or raw localhost. Docs: https://developer.squareup.com/docs/web-payments/apple-pay'
				);
			}
			applePayMethod = null;
			applePayReady = false;
		}

		try {
			const googlePay = await payments.googlePay(paymentRequest, {
				buttonColor: 'black',
				buttonType: 'long',
				buttonSizeMode: 'fill',
				buttonRadius: 12,
				buttonBorderType: 'default_border'
			});
			await googlePay.attach('#google-pay');
		} catch (_error) {
			// unavailable
		}
	}

	/** Apple requires tokenize() as the first async step in the click handler (no awaits before it). */
	async function handleApplePayClick(event) {
		event.preventDefault();
		if (!applePayMethod || !paymentReady) return;
		if (!checkoutFormValid || total <= 0) {
			paymentError = 'Please complete contact and shipping before paying.';
			return;
		}

		placingOrder = true;
		paymentError = '';
		orderMessage = '';
		try {
			const tokenResult = await applePayMethod.tokenize();
			if (tokenResult.status !== 'OK' || !tokenResult.token) {
				throw new Error('Apple Pay tokenization failed.');
			}
			await submitCheckout(tokenResult.token);
		} catch (error) {
			const msg = error instanceof Error ? error.message : String(error);
			if (/domain|not registered|PaymentMethodUnsupportedError/i.test(msg)) {
				paymentError =
					'Apple Pay isn’t set up for this domain yet. Use card checkout below, or ask the site owner to register the domain in Square (Apple Pay).';
			} else {
				paymentError = error instanceof Error ? error.message : 'Unable to place order.';
			}
		} finally {
			placingOrder = false;
		}
	}

	async function placeOrder() {
		if (!paymentReady || !checkoutFormValid || total <= 0) return;

		placingOrder = true;
		paymentError = '';
		orderMessage = '';

		try {
			const result = await card.tokenize();
			if (result.status !== 'OK') {
				throw new Error('Card tokenization failed.');
			}

			await submitCheckout(result.token);
		} catch (error) {
			paymentError = error instanceof Error ? error.message : 'Unable to place order.';
		} finally {
			placingOrder = false;
		}
	}
</script>

<main class="checkout-page">
	<div class="checkout-container">
		<header class="checkout-header">
			<h1>Checkout</h1>
			<a class="link-button subtle" href={resolve('/cart')}>← Back to Cart</a>
		</header>

		{#if checkoutItems.length === 0 && !loadingItems}
			<section class="panel theme-glass empty-state">
				<h2>Your cart is empty</h2>
				<a class="link-button" href={resolve('/cart')}>Return to Cart</a>
			</section>
		{:else}
			<div class="checkout-masonry">
				<div class="masonry-col masonry-col--primary">
				<!-- Contact & Shipping, then Payment -->
				<section class="panel theme-glass checkout-card contact-card">
					<h2 class="card-title">Contact and Shipping</h2>
					<div class="fields two-col">
						<input placeholder="First Name" bind:value={customer.firstName} autocomplete="given-name" />
						<input placeholder="Last Name" bind:value={customer.lastName} autocomplete="family-name" />
					</div>
					<div class="fields">
						<input placeholder="Email" type="email" bind:value={customer.email} autocomplete="email" />
						<label class="newsletter-optin">
							<input type="checkbox" bind:checked={subscribeToNewsletter} />
							<span>
								Subscribe to newsletter.
								<button
									type="button"
									class="learn-more-btn"
									onclick={() => (showNewsletterModal = true)}
								>
									Learn More
								</button>
							</span>
						</label>
						<input placeholder="Phone" type="tel" bind:value={customer.phone} autocomplete="tel" />
						<input
							placeholder="Street Address"
							bind:value={customer.address}
							autocomplete="street-address"
						/>
					</div>
					<div class="fields three-col">
						<input placeholder="City" bind:value={customer.city} autocomplete="address-level2" />
						<input placeholder="State" bind:value={customer.state} autocomplete="address-level1" />
						<input placeholder="ZIP Code" bind:value={customer.zip} autocomplete="postal-code" />
					</div>
				</section>

				<!-- Row 2, Col 1: Payment -->
				<section class="panel theme-glass checkout-card payment-card">
					<h2 class="card-title">Payment</h2>
					<div id="card-container" class="payment-slot"></div>

					<label class="billing-same-check">
						<input type="checkbox" bind:checked={billingSameAsShipping} />
						<span>Use same billing address as shipping address</span>
					</label>

					{#if !billingSameAsShipping}
						<details class="billing-accordion" open>
							<summary>Billing address</summary>
							<div class="accordion-body">
								<div class="fields two-col">
									<input placeholder="First Name" bind:value={billing.firstName} />
									<input placeholder="Last Name" bind:value={billing.lastName} />
								</div>
								<div class="fields">
									<input placeholder="Street Address" bind:value={billing.address} />
								</div>
								<div class="fields three-col">
									<input placeholder="City" bind:value={billing.city} />
									<input placeholder="State" bind:value={billing.state} />
									<input placeholder="ZIP Code" bind:value={billing.zip} />
								</div>
							</div>
						</details>
					{/if}

					{#if paymentError}
						<p class="error">{paymentError}</p>
					{/if}
					{#if orderMessage}
						<p class="success">{orderMessage}</p>
					{/if}
				</section>
				</div>

				<div class="masonry-col masonry-col--secondary">
				<section class="panel theme-glass checkout-card express-card">
					<h2 class="card-title">Express Checkout</h2>
					<p class="muted small">Pay with Cash App, Apple Pay, or Google Pay when available.</p>
					<div class="wallet-stack">
						<div class="wallet-slot cash-app-flow-anchor" bind:this={cashAppAnchorEl}>
							<div id="cash-app-pay"></div>
						</div>
						{#if applePayReady}
							<div class="wallet-slot apple-pay-host">
								<button
									type="button"
									id="apple-pay"
									class="apple-pay-native"
									aria-label="Pay with Apple Pay"
									disabled={!checkoutFormValid ||
										total <= 0 ||
										placingOrder ||
										!paymentReady ||
										checkoutItems.length === 0}
									onclick={handleApplePayClick}
								></button>
							</div>
						{/if}
						<div id="google-pay" class="wallet-slot"></div>
					</div>
				</section>

				<section class="panel theme-glass checkout-card summary-card">
					<h2 class="card-title">Order Summary</h2>
					<div class="items-list">
						{#each checkoutItems as item (item.id)}
							<div class="line-item">
								<span>{item.name} × {item.quantity}</span>
								<strong>${(item.price * item.quantity).toFixed(2)}</strong>
							</div>
						{/each}
					</div>
					<div class="breakdown">
						<div><span>Subtotal</span><strong>${subtotal.toFixed(2)}</strong></div>
						<div>
							<span>Shipping</span><strong>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</strong>
						</div>
						<div><span>Tax</span><strong>${tax.toFixed(2)}</strong></div>
						<div class="total"><span>Total</span><strong>${total.toFixed(2)}</strong></div>
					</div>
					<button
						type="button"
						class="place-order-btn"
						onclick={placeOrder}
						disabled={!checkoutFormValid || !paymentReady || placingOrder || checkoutItems.length === 0}
					>
						{placingOrder ? 'Processing…' : 'Place Order'}
					</button>
				</section>
				</div>
			</div>
		{/if}
	</div>
</main>

{#if showNewsletterModal}
	<div class="modal-backdrop" role="presentation" onclick={() => (showNewsletterModal = false)}>
		<section
			class="modal-panel theme-glass"
			role="dialog"
			aria-modal="true"
			aria-labelledby="newsletter-modal-title"
			onclick={(event) => event.stopPropagation()}
		>
			<h3 id="newsletter-modal-title">Newsletter</h3>
			<p>{newsletterDisclaimer}</p>
			<button type="button" class="modal-close-btn" onclick={() => (showNewsletterModal = false)}>
				Close
			</button>
		</section>
	</div>
{/if}

<style lang="scss">
	.checkout-page {
		padding: 2rem clamp(0.75rem, 3vw, 1.5rem) 3rem;
		min-width: 0;
	}

	.checkout-container {
		max-width: 1100px;
		margin: 0 auto;
	}

	.checkout-header {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		justify-content: space-between;
		gap: 1rem;
		margin-bottom: 1.5rem;

		h1 {
			margin: 0;
			color: var(--text-primary);
			font-size: clamp(1.5rem, 4vw, 2rem);
		}
	}

	/* Two independent columns: each stacks from the top (masonry-style, no shared row heights). */
	.checkout-masonry {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
		align-items: start;
		min-width: 0;
	}

	.masonry-col {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		min-width: 0;
	}

	/* Keep right rail tighter so summary/express don't dominate wide layouts. */
	.masonry-col--secondary {
		width: min(100%, 380px);
		justify-self: end;
	}

	.checkout-card {
		padding: 1.25rem 1.35rem;
		min-width: 0;
		display: flex;
		flex-direction: column;
	}

	.card-title {
		margin: 0 0 1rem 0;
		font-size: 1.15rem;
		font-weight: 700;
		color: var(--text-primary);
	}

	.fields {
		display: grid;
		gap: 0.6rem;
		margin-top: 0.5rem;

		&:first-of-type {
			margin-top: 0;
		}
	}

	.two-col {
		grid-template-columns: 1fr 1fr;
	}

	.three-col {
		grid-template-columns: 1fr minmax(5rem, 7rem) minmax(5.5rem, 6.5rem);
	}

	@media (max-width: 520px) {
		.three-col {
			grid-template-columns: 1fr;
		}
	}

	input {
		width: 100%;
		padding: 0.65rem 0.75rem;
		border-radius: 8px;
		border: 1px solid var(--border-secondary);
		background: var(--bg-secondary);
		color: var(--text-primary);
		font-size: 0.95rem;
		min-width: 0;
	}

	.express-card {
		min-width: 0;
		overflow-x: clip;
		container-type: inline-size;
		container-name: express;

		.small {
			font-size: 0.85rem;
			margin: -0.5rem 0 0.75rem 0;
		}
	}

	$wallet-express-h: 42px;
	/* Optical center: Square’s Cash App control sits low/right inside the iframe */
	$cash-app-optical-nudge-left: 10px;
	$cash-app-optical-nudge-up: 8px;

	/* Narrow express card: stack wallets; wide enough: row (see @container) */
	.wallet-stack {
		display: flex;
		flex-direction: column;
		flex-wrap: nowrap;
		align-items: stretch;
		gap: 0.65rem;
		flex: 0 0 auto;
		width: min(100%, 180px);
		max-width: 180px;
		margin-inline: auto;
		min-width: 0;
		box-sizing: border-box;
	}

	@container express (min-width: 380px) {
		.wallet-stack {
			flex-direction: row;
			flex-wrap: wrap;
			justify-content: center;
			align-items: stretch;
			width: 100%;
			max-width: min(100%, 420px);
			margin-inline: auto;
		}

		.wallet-stack .wallet-slot {
			flex: 1 1 150px;
			width: auto;
			max-width: 180px;
		}
	}

	.wallet-slot {
		flex: 1 1 140px;
		min-width: 0;
		max-width: 100%;
		box-sizing: border-box;
		border-radius: 12px;
		border: 1px solid rgba(255, 255, 255, 0.1);
		overflow: hidden;
		background: rgba(0, 0, 0, 0.2);
		position: relative;
		height: $wallet-express-h;
		min-height: $wallet-express-h;
		max-height: $wallet-express-h;
	}

	/*
	 * Inside the flow slot only: no second frame (outer `.wallet-slot` already matches Google Pay).
	 * After reparent under <main>, `#cash-app-pay` gets the same chrome as other wallet rows.
	 */
	.wallet-slot > #cash-app-pay {
		height: 100%;
		min-height: 0;
		border: none;
		background: transparent;
		border-radius: 0;
	}

	#cash-app-pay {
		box-sizing: border-box;
		border-radius: 12px;
		border: 1px solid rgba(255, 255, 255, 0.1);
		overflow: hidden;
		background: rgba(0, 0, 0, 0.2);
		min-width: 0;
	}

	#google-pay {
		position: relative;
	}

	/*
	 * Square Cash App: iframe uses position absolute + 50%/translate. Its containing block must be
	 * #cash-app-pay (fixed), not shrink-wrapped inner nodes — do not add position: relative here.
	 */
	#cash-app-pay :global(#cash_app_pay_v1_element),
	#cash-app-pay :global(#cash_app_pay_v1_element > div) {
		width: 100%;
		height: 100%;
		min-width: 0;
		min-height: 0;
		max-width: 100%;
		overflow: hidden;
		box-sizing: border-box;
		/* Beat Square inline position if any, so iframe CB stays #cash-app-pay (fixed). */
		position: static !important;
	}

	/* Square iframes / buttons: scale past frame, clip to rounded rect */
	#google-pay :global(iframe),
	#google-pay :global(button) {
		position: absolute !important;
		left: 50% !important;
		top: 50% !important;
		width: 115% !important;
		height: 115% !important;
		max-width: none !important;
		transform: translate(-50%, -50%) !important;
		border: 0 !important;
		box-sizing: border-box !important;
		pointer-events: auto;
	}

	#cash-app-pay :global(iframe),
	#cash-app-pay :global(button) {
		position: absolute !important;
		left: 50% !important;
		top: 50% !important;
		width: 115% !important;
		height: 115% !important;
		max-width: none !important;
		transform-origin: center center !important;
		/* --cash-app-scale set in installCashAppPortal sync() from slot vs design frame */
		transform: translate(
				calc(-50% - #{$cash-app-optical-nudge-left}),
				calc(-50% - #{$cash-app-optical-nudge-up})
			)
			scale(var(--cash-app-scale, 1)) !important;
		border: 0 !important;
		box-sizing: border-box !important;
		pointer-events: auto;
	}

	/* Keep Cash App layout gap after #cash-app-pay is reparented (slot would otherwise match :empty). */
	.wallet-slot:empty:not(.cash-app-flow-anchor) {
		display: none;
	}

	.cash-app-flow-anchor:empty {
		height: $wallet-express-h;
		min-height: $wallet-express-h;
		max-height: $wallet-express-h;
	}

	.apple-pay-host {
		padding: 0;
	}

	/* Safari draws the Apple Pay mark; scale + clip inside host */
	.apple-pay-native {
		position: absolute;
		left: 50%;
		top: 50%;
		width: 115%;
		height: $wallet-express-h;
		min-height: $wallet-express-h;
		padding: 0;
		border: none;
		border-radius: 0;
		cursor: pointer;
		transform: translate(-50%, -50%);
		-webkit-appearance: -apple-pay-button;
		-apple-pay-button-type: plain;
		-apple-pay-button-style: white-outline;

		&:disabled {
			opacity: 0.45;
			cursor: not-allowed;
		}
	}

	/* Mount point only — Square draws its own field chrome. */
	.payment-slot {
		margin-bottom: 1rem;
		min-width: 0;
		width: 100%;
		max-width: 100%;
		overflow: hidden;
		box-sizing: border-box;
	}

	/* Keep Square single-card iframe & wrappers within the payment card (cross-origin iframe; style wrappers only) */
	#card-container :global([id^='single-card-wrapper']) {
		width: 100% !important;
		max-width: 100% !important;
		min-width: 0 !important;
		box-sizing: border-box !important;
	}

	#card-container :global(.sq-card-iframe-container) {
		width: 100% !important;
		max-width: 100% !important;
		min-width: 0 !important;
		box-sizing: border-box !important;
	}

	#card-container :global(iframe.sq-card-component) {
		width: 100% !important;
		max-width: 100% !important;
		min-width: 0 !important;
		box-sizing: border-box !important;
		display: block;
	}

	.billing-same-check {
		display: flex;
		align-items: flex-start;
		gap: 0.65rem;
		cursor: pointer;
		color: var(--text-secondary);
		font-size: 0.9rem;
		line-height: 1.4;
		margin-top: 0.25rem;
		user-select: none;

		input {
			width: auto;
			margin-top: 0.2rem;
			accent-color: var(--accent);
			cursor: pointer;
		}
	}

	.newsletter-optin {
		display: flex;
		align-items: flex-start;
		gap: 0.6rem;
		font-size: 0.9rem;
		color: var(--text-secondary);
		cursor: pointer;
		user-select: none;

		input {
			width: auto;
			margin-top: 0.15rem;
			accent-color: var(--accent);
			cursor: pointer;
		}
	}

	.learn-more-btn {
		margin-left: 0.35rem;
		padding: 0;
		border: none;
		background: transparent;
		color: var(--accent);
		cursor: pointer;
		font-size: inherit;
		text-decoration: underline;
	}

	.modal-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.55);
		display: grid;
		place-items: center;
		padding: 1rem;
		z-index: 1200;
	}

	.modal-panel {
		width: min(100%, 520px);
		padding: 1rem 1.1rem;

		h3 {
			margin: 0 0 0.6rem 0;
			color: var(--text-primary);
		}

		p {
			margin: 0 0 1rem 0;
			color: var(--text-secondary);
			line-height: 1.45;
			white-space: pre-wrap;
		}
	}

	.modal-close-btn {
		padding: 0.55rem 1rem;
		border: none;
		border-radius: 10px;
		font-size: 0.95rem;
		font-weight: 700;
		cursor: pointer;
		background: linear-gradient(135deg, var(--accent), var(--accent-2));
		color: #fff;
	}

	.billing-accordion {
		margin-top: 1rem;
		border: 1px solid var(--border-secondary);
		border-radius: 8px;
		background: var(--bg-secondary);
		overflow: hidden;

		summary {
			padding: 0.75rem 1rem;
			font-weight: 600;
			color: var(--text-primary);
			cursor: pointer;
			list-style: none;

			&::-webkit-details-marker {
				display: none;
			}
		}

		&[open] summary {
			border-bottom: 1px solid var(--border-secondary);
		}
	}

	.accordion-body {
		padding: 1rem;
	}

	.summary-card {
		.items-list {
			display: grid;
			gap: 0.5rem;
			margin-bottom: 1rem;
			flex: 1;
		}
	}

	.line-item {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		font-size: 0.95rem;
		color: var(--text-secondary);

		span {
			flex: 1 1 auto;
			min-width: 0;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}

		strong {
			color: var(--text-primary);
			flex-shrink: 0;
		}
	}

	.breakdown {
		border-top: 1px solid var(--border-secondary);
		padding-top: 0.85rem;
		display: grid;
		gap: 0.4rem;
		margin-bottom: 1.25rem;
		font-size: 0.95rem;

		> div {
			display: flex;
			justify-content: space-between;
			color: var(--muted);
		}

		.total {
			margin-top: 0.35rem;
			padding-top: 0.65rem;
			border-top: 1px solid var(--border-secondary);
			font-size: 1.1rem;
			font-weight: 700;
			color: var(--text-primary);

			strong {
				color: var(--text-primary);
			}
		}
	}

	.place-order-btn {
		width: 100%;
		margin-top: auto;
		padding: 1rem 1.25rem;
		border: none;
		border-radius: 12px;
		font-size: 1rem;
		font-weight: 700;
		cursor: pointer;
		background: linear-gradient(135deg, var(--accent), var(--accent-2));
		color: #fff;
		transition:
			opacity 0.2s ease,
			transform 0.15s ease;

		&:hover:not(:disabled) {
			transform: translateY(-1px);
		}

		&:disabled {
			opacity: 0.45;
			cursor: not-allowed;
			transform: none;
		}
	}

	.link-button {
		border-radius: 10px;
		padding: 0.5rem 0.85rem;
		text-decoration: none;
		text-align: center;
		border: 1px solid var(--border-secondary);
		color: var(--text-primary);
		font-size: 0.9rem;
	}

	.link-button.subtle {
		background: transparent;
		border-color: var(--border-secondary);
		color: var(--muted);
		align-self: center;

		&:hover {
			color: var(--accent);
			border-color: var(--accent);
		}
	}

	.empty-state {
		padding: 2rem;
		text-align: center;
	}

	.error {
		color: #f87171;
		font-size: 0.9rem;
		margin: 0.75rem 0 0 0;
	}

	.success {
		color: #4ade80;
		font-size: 0.9rem;
		margin: 0.75rem 0 0 0;
	}

	.muted {
		color: var(--muted);
	}

	@media (max-width: 900px) {
		/*
		 * Single column + order on cards. Use grid (not flex) so each card gets a full-width
		 * track: flex + display: contents on .masonry-col can yield min-content cross-sizes (~tens
		 * of px) in some browsers; minmax(0, 1fr) keeps the column usable.
		 */
		.checkout-masonry {
			display: grid;
			grid-template-columns: minmax(0, 1fr);
			gap: 1rem;
			align-items: start;
		}

		.masonry-col {
			display: contents;
		}

		.checkout-card {
			width: 100%;
			min-width: 0;
		}

		/* Express first, then contact/shipping, payment, summary */
		.express-card {
			order: 1;
		}

		.contact-card {
			order: 2;
		}

		.payment-card {
			order: 3;
		}

		.summary-card {
			order: 4;
		}
	}
</style>
