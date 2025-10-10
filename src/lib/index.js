// Automatically export all components from $lib
// This allows: import { Button, Navbar } from '$lib';

export { default as Button } from './Button.svelte';
export { default as Navbar } from './Navbar.svelte';
export { default as Footer } from './Footer.svelte';

// You can also re-export specific things if needed:
// export { someFunction } from './utils.js';
