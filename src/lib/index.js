// Automatically export all components from $lib
// This allows: import { Button, Navbar } from '$lib';

//Common
export { default as Button } from './common/Button.svelte';
export { default as Navbar } from './common/Navbar.svelte';
export { default as Footer } from './common/Footer.svelte';
export { default as Input } from './common/Input.svelte';
export { default as Label } from './common/Label.svelte';
export { default as FormGroup } from './common/FormGroup.svelte';
export { default as CategoryGrid } from './common/CategoryGrid.svelte';

//Cart
export { default as CartItem } from './cart/CartItem.svelte';
export { default as CartSummary } from './cart/CartSummary.svelte';
export { default as EmptyCart } from './cart/EmptyCart.svelte';

//Admin Components
export { default as AdminSidebar } from './admin/AdminSidebar.svelte';
export { default as EventCard } from './admin/EventCard.svelte';
export { default as EventModal } from './admin/EventModal.svelte';

// You can also re-export specific things if needed:
// export { someFunction } from './utils.js';
