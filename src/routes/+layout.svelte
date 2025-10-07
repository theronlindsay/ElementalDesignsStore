<script>
	import favicon from '$lib/assets/favicon.svg';
	import '@fortawesome/fontawesome-free/css/all.min.css';
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
</svelte:head>

{@render children?.()}
