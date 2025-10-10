<script>
	import favicon from '$lib/assets/favicon.svg';
	import '@fortawesome/fontawesome-free/css/all.min.css';
	import '../app.scss';
	import {Navbar, Footer} from '$lib'

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
</svelte:head>

<main class="elemental-store">
	<Navbar />

	{@render children?.()}

	<Footer />
</main>
