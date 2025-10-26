<script>
	import favicon from '$lib/assets/favicon.png';
	import '@fortawesome/fontawesome-free/css/all.min.css';
	import '$lib/app.scss';
	import {Navbar, Footer} from '$lib'
	import { page } from '$app/stores';

	let { children } = $props();
	
	// Hide navbar and footer in admin routes (except login)
	// $derived rune creates computed values that automatically update
	let isAdminRoute = $derived($page.url.pathname.startsWith('/admin'));
	let showNavAndFooter = $derived(!isAdminRoute);
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
</svelte:head>

<main class="elemental-store">
	{#if showNavAndFooter}
		<Navbar />
	{/if}

	{@render children?.()}

	{#if showNavAndFooter}
		<Footer />
	{/if}
</main>
