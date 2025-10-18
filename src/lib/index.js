// Automatically export all components from $lib
// This allows: import { Button, Navbar } from '$lib';

export { default as Button } from './Button.svelte';
export { default as Navbar } from './Navbar.svelte';
export { default as Footer } from './Footer.svelte';
export { default as CartItem } from './CartItem.svelte';
export { default as CartSummary } from './CartSummary.svelte';
export { default as EmptyCart } from './EmptyCart.svelte';
export { default as Input } from './Input.svelte';
export { default as Label } from './Label.svelte';
export { default as FormGroup } from './FormGroup.svelte';
export { default as AdminSidebar } from './AdminSidebar.svelte';

// You can also re-export specific things if needed:
// export { someFunction } from './utils.js';
