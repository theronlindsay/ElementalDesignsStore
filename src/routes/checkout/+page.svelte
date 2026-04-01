<script>
	import { onMount } from 'svelte';

	//export let data = {};

	let title = "Checkout";

	// Toggle for showing form section
	let showForm1 = false;
  let showForm2 = false;

	// Placeholder cart items
	let cart = [
		{ name: "Handmade Necklace", price: 25, quantity: 1 },
		{ name: "Custom Bracelet", price: 18, quantity: 2 }
	];
  
  //customer information
	let customer = {
		firstName: "",
		lastName: "",
		phone: "",
		email: "",
		paymentMethod: "card",
		cardNumber: "",
		address: "",
		city: "",
		state: "",
		zip: ""
	};

	// item price total calculation
	$: total = cart.reduce((sum, item) => {
		return sum + item.price * item.quantity;
	}, 0);

	// Form validation
	$: customerFormValid =
		customer.firstName &&
		customer.lastName &&
		customer.phone &&
		customer.email &&
		customer.address &&
		customer.city &&
		customer.state &&
		customer.zip;

  $: paymentFormValid =
	  customerFormValid &&
	  customer.cardNumber;

	function reviewedOrder() {
		showForm1 = true;
	}
  function startCheckout() {
		showForm2 = true;
	}

	function placeOrder() {
		alert("Square integration will go here.");
	}

	onMount(() => {
		console.log("Checkout page ready");
	});
</script>

<main>
	<h1>{title}</h1>

	<!-- REVIEW CART -->
	<section class="box">
		<h2>Review Cart</h2>

		{#each cart as item}
			<div class="cart-item">
				<span>{item.name} x{item.quantity}</span>
				<span>${item.price * item.quantity}</span>
			</div>
		{/each}

		<div class="total">
			<strong>Total:</strong>
			<strong>${total}</strong>
		</div>

		<div class="buttons">
			<button class="secondary">Continue Shopping</button>
			<button class="primary" on:click={reviewedOrder}>
				Proceed
			</button>
		</div>
	</section>

  <!-- Customer Form (appears after "Proceed" button is clicked) -->
   {#if showForm1}
  <section class="box">
    <h2>Customer Information</h2>
    <h3>Contact </h3>
		<input placeholder="First Name" bind:value={customer.firstName} />
		<input placeholder="Last Name" bind:value={customer.lastName} />
		<input placeholder="Phone Number" bind:value={customer.phone} />
		<input placeholder="Email" bind:value={customer.email} />

    <h3>Delivery Address</h3>
		<input placeholder="Street Address" bind:value={customer.address} />
		<input placeholder="City" bind:value={customer.city} />
		<input placeholder="State" bind:value={customer.state} />
		<input placeholder="ZIP Code" bind:value={customer.zip} />
    <div class="place-order">
			<button class="primary" disabled={!customerFormValid} on:click={startCheckout}>
				Proceed
			</button>
		</div>
  </section>

	<!-- Payment information -->
	{#if showForm2}
	<section class="box">
		<h2>Payment Method</h2>
		<select bind:value={customer.paymentMethod}>
			<option value="card">Credit Card</option>
		</select>

		<input placeholder="Card Number" bind:value={customer.cardNumber} />

		<!-- <h3>Delivery Address</h3>

		<input placeholder="Street Address" bind:value={customer.address} />
		<input placeholder="City" bind:value={customer.city} />
		<input placeholder="State" bind:value={customer.state} />
		<input placeholder="ZIP Code" bind:value={customer.zip} /> -->

		<!-- Square will replace this later -->
		<!-- <div id="card-container"></div> -->

		<div class="place-order">
			<button
				class="primary"
				disabled={!paymentFormValid}
				on:click={placeOrder}
			>
				Place Order
			</button>
		</div>
	</section>
	{/if}
  {/if}
</main>

<style>
	main {
		padding: 2rem;
		font-family: sans-serif;
		max-width: 700px;
		margin: auto;
	}

	h1 {
		text-align: left;
		margin-bottom: 1.5rem;
	}

	.box {
		background: rgba(215, 184, 244, 0.5); /* light purple */
		padding: 1.5rem;
		border-radius: 10px;
		margin-bottom: 1.5rem;
		border: 1px solid rgba(239, 224, 255, 0.7);
	}

	h2 {
		margin-bottom: 1rem;
    color: #3d1d61;
	}

	h3 {
		margin-top: 1rem;
		margin-bottom: 0.5rem;
    color: rgba(239, 224, 255)
	}

	.cart-item {
		display: flex;
		justify-content: space-between;
		margin-bottom: 0.5rem;
	}

	.total {
		display: flex;
		justify-content: space-between;
		margin-top: 1rem;
		font-size: 1.1rem;
	}

	input, select {
		width: 100%;
		padding: 0.6rem;
		margin-bottom: 0.5rem;
		border-radius: 6px;
		border: 1px solid #ccc;
    box-sizing: border-box;
	}

	.buttons {
		display: flex;
		justify-content: space-between;
		margin-top: 1rem;
	}
  .buttons:disabled {
		background: #9851b3;
		cursor: not-allowed;
    color: rgb(190, 195, 210);
	}

	.place-order {
		display: flex;
		justify-content: flex-end;
		margin-top: 1rem;
	}

	button {
		padding: 0.7rem 1.2rem;
		border-radius: 6px;
		border: none;
		cursor: pointer;
	}

	.primary {
		background: #9a86ff; /* purple */
		color: white;
    border-color: #3d1d61;
    border-radius: 10px;
	}

	.primary:disabled {
		background: #6b52a8;
		cursor: not-allowed;
    color: rgb(175, 172, 209);
	}

	.secondary {
		background: #9a86ff; /* purple */
		color: white;
	}

	/* #card-container {
		margin-top: 10px;
		padding: 10px;
		border: 1px dashed #bbb;
		border-radius: 6px;
	} */
</style>



<!-- <script>
  // 1. Imports
  import { onMount } from 'svelte';

  // 2. Props (Data passed from a parent or router)
  export let data = {}; 

  // 3. Component Logic
  let title = "New Page";
  let count = 0;

  function increment() {
    count += 1;
  }

  onMount(() => {
    console.log("Page mounted!");
  });
</script>

<main>
  <section class="container">
    <h1>{title}</h1>
    <p>Welcome to your new Svelte page.</p>

    <div class="card">
      <button on:click={increment}>
        Clicks: {count}
      </button>
    </div>
  </section>
</main>

<style>
  main {
    padding: 2rem;
    font-family: sans-serif;
  }

  .container {
    max-width: 800px;
    margin: 0 auto;
    text-align: center;
  }

  .card {
    margin-top: 2rem;
    padding: 1rem;
    border: 1px solid #ddd;
    border-radius: 8px;
  }

  h1 {
    color: #ff3e00; /* Svelte Orange */
    text-transform: uppercase;
    font-size: 2.5rem;
  }
</style> -->
