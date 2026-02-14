// src/lib/cart/cartStore.js
import { writable } from 'svelte/store';
import { browser } from '$app/environment';

function createCart() {
	let initialValue = [];

	if (browser) {
		const storedValue = localStorage.getItem('cart');
		if (storedValue) {
			initialValue = JSON.parse(storedValue);
		}
	}

	const { subscribe, set, update } = writable(initialValue);

	if (browser) {
		subscribe((items) => {
            // Log when we save to localStorage
			console.log('SAVING TO localStorage:', items);
			localStorage.setItem('cart', JSON.stringify(items));
		});
	}

	return {
		subscribe,

		addItem(id) {
            // --- VVV DEBUGGING LOGS VVV ---
			console.log('--------------------');
			console.log('addItem CALLED WITH ID:', id);
			
			update((items) => {
				console.log('Current items in store:', items);
				const existing = items.find((i) => i.id === id);
				
				if (existing) {
					existing.quantity += 1;
					console.log('Incremented item:', existing);
					return items;
				} else {
					const newItem = { id, quantity: 1 };
					console.log('Adding new item:', newItem);
					return [...items, newItem];
				}
			});
            console.log('--------------------');
		},
        // --- ^^^ DEBUGGING LOGS ^^^ ---

		updateQuantity(id, quantity) {
			update((items) => {
				const existing = items.find((i) => i.id === id);
				if (existing) {
					if (quantity > 0) {
						existing.quantity = quantity;
					} else {
						return items.filter((i) => i.id !== id);
					}
				}
				return items;
			});
		},

		removeItem(id) {
			update((items) => items.filter((i) => i.id !== id));
		},

		clearCart() {
			set([]);
		}
	};
}

export const cart = createCart();
