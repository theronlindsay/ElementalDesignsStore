<script>
	// 1. Imports
	import { onMount } from 'svelte';

	// 2. Props (Data passed from a parent or router)
	export let data = {};

	// 3. Component Logic
	let title = 'New Page';
	let count = 0;

	function increment() {
		count += 1;
	}

	onMount(() => {
		console.log('Page mounted!');
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
</style>
