# Svelte 5 Runes Guide

## What are Runes?

Runes are **Svelte 5's new reactive primitives** that replace the old reactivity system. They use a `$` prefix and provide explicit, fine-grained control over reactivity.

## The Three Main Runes

### 1. `$state` - Reactive State

**Purpose:** Creates reactive state that triggers UI updates when changed.

**Replaces:** Plain `let` declarations that needed to be reactive

#### Syntax:
```javascript
let variableName = $state(initialValue);
```

#### Example:
```javascript
// OLD (Svelte 4):
let count = 0; // Automatically reactive in component

// NEW (Svelte 5):
let count = $state(0); // Explicitly reactive
```

#### In Our Cart:
```javascript
let cartItems = $state([
  { id: '1', name: 'Bracelet', price: 45, quantity: 1 }
]);

// When you update it, UI automatically re-renders:
function addItem() {
  cartItems = [...cartItems, newItem]; // ✅ Triggers reactivity
}
```

**Key Points:**
- ✅ Must explicitly mark reactive state with `$state`
- ✅ Mutations to nested properties are tracked
- ✅ Arrays and objects are deeply reactive
- ✅ Works with TypeScript

---

### 2. `$derived` - Computed Values

**Purpose:** Creates values that automatically recalculate when their dependencies change.

**Replaces:** `$:` reactive declarations (for computed values)

#### Syntax:
```javascript
let computedValue = $derived(expression);
```

#### Example:
```javascript
// OLD (Svelte 4):
let count = 0;
$: doubled = count * 2;
$: tripled = count * 3;

// NEW (Svelte 5):
let count = $state(0);
let doubled = $derived(count * 2);
let tripled = $derived(count * 3);
```

#### In Our Cart:
```javascript
// These automatically recalculate when cartItems changes:
let subtotal = $derived(
  cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
);

let tax = $derived(subtotal * 0.08); // Depends on subtotal

let shipping = $derived(subtotal > 50 ? 0 : 5.99); // Depends on subtotal

let itemCount = $derived(
  cartItems.reduce((sum, item) => sum + item.quantity, 0)
);
```

**Dependency Chain:**
```
cartItems ($state)
    ↓
subtotal ($derived from cartItems)
    ↓
tax ($derived from subtotal)
shipping ($derived from subtotal)
```

**Key Points:**
- ✅ Only recalculates when dependencies change
- ✅ More efficient than `$:` because dependencies are explicit
- ✅ Can chain derived values (tax depends on subtotal)
- ✅ Read-only (cannot be reassigned)

---

### 3. `$effect` - Side Effects

**Purpose:** Runs code when dependencies change (for side effects like logging, API calls, localStorage).

**Replaces:** `$:` reactive statements (for side effects)

#### Syntax:
```javascript
$effect(() => {
  // Code that runs when dependencies change
});
```

#### Example:
```javascript
// OLD (Svelte 4):
let count = 0;
$: console.log('Count changed:', count);
$: {
  localStorage.setItem('count', count);
}

// NEW (Svelte 5):
let count = $state(0);

$effect(() => {
  console.log('Count changed:', count);
  localStorage.setItem('count', count);
});
```

#### Potential Use in Our Cart:
```javascript
// Save cart to localStorage whenever it changes
$effect(() => {
  localStorage.setItem('cart', JSON.stringify(cartItems));
  console.log('Cart saved:', cartItems);
});

// Analytics tracking
$effect(() => {
  if (cartItems.length === 0) {
    trackEvent('cart_emptied');
  }
});
```

**Key Points:**
- ✅ Runs after component mounts
- ✅ Re-runs when any dependency changes
- ✅ Use for side effects (logging, API calls, storage)
- ✅ Can return cleanup function

#### Cleanup Example:
```javascript
$effect(() => {
  const timer = setInterval(() => {
    console.log('Cart items:', cartItems.length);
  }, 1000);
  
  // Cleanup function runs when effect re-runs or component unmounts
  return () => clearInterval(timer);
});
```

---

## Other Useful Runes

### `$props` - Component Props

**Purpose:** Declares component props in Svelte 5.

```javascript
// OLD (Svelte 4):
export let name;
export let age = 0;

// NEW (Svelte 5):
let { name, age = 0 } = $props();
```

### `$bindable` - Two-way Binding

**Purpose:** Makes props bindable (two-way data flow).

```javascript
// In child component:
let { value = $bindable() } = $props();

// In parent:
<ChildComponent bind:value={myValue} />
```

---

## Migration Comparison

### Before (Svelte 4):
```javascript
<script>
  // Props
  export let initialCount = 0;
  
  // State
  let count = initialCount;
  let items = [];
  
  // Computed values
  $: doubled = count * 2;
  $: itemCount = items.length;
  
  // Side effects
  $: console.log('Count:', count);
  $: {
    if (count > 10) {
      alert('High count!');
    }
  }
  
  function increment() {
    count += 1;
  }
</script>
```

### After (Svelte 5):
```javascript
<script>
  // Props
  let { initialCount = 0 } = $props();
  
  // State
  let count = $state(initialCount);
  let items = $state([]);
  
  // Computed values
  let doubled = $derived(count * 2);
  let itemCount = $derived(items.length);
  
  // Side effects
  $effect(() => {
    console.log('Count:', count);
    if (count > 10) {
      alert('High count!');
    }
  });
  
  function increment() {
    count += 1;
  }
</script>
```

---

## Why Runes are Better

### 1. **Explicit Reactivity**
- Clear what's reactive vs. non-reactive
- No magic/hidden reactivity
- Better for TypeScript

### 2. **Better Performance**
- Fine-grained reactivity tracking
- Only updates what actually changed
- More efficient dependency tracking

### 3. **Clearer Intent**
```javascript
// Clear: This is reactive state
let count = $state(0);

// Clear: This is computed from state
let doubled = $derived(count * 2);

// Clear: This is a side effect
$effect(() => console.log(count));
```

### 4. **Works Outside Components**
```javascript
// Can use in .svelte.ts files!
import { $state, $derived } from 'svelte/reactivity';

export class Counter {
  count = $state(0);
  doubled = $derived(this.count * 2);
  
  increment() {
    this.count++;
  }
}
```

---

## Common Patterns

### Pattern 1: Form State
```javascript
let formData = $state({
  name: '',
  email: '',
  message: ''
});

let isValid = $derived(
  formData.name.length > 0 && 
  formData.email.includes('@') &&
  formData.message.length > 10
);
```

### Pattern 2: Filtered Lists
```javascript
let items = $state([...]);
let searchQuery = $state('');

let filteredItems = $derived(
  items.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  )
);
```

### Pattern 3: Async Data
```javascript
let data = $state(null);
let loading = $state(false);

async function fetchData() {
  loading = true;
  data = await fetch('/api/data').then(r => r.json());
  loading = false;
}

// Or with $effect:
$effect(() => {
  if (userId) {
    fetchUserData(userId);
  }
});
```

---

## Best Practices

### ✅ Do:
- Use `$state` for all reactive variables
- Use `$derived` for computed values (read-only)
- Use `$effect` for side effects (API calls, logging)
- Keep derived values simple and pure
- Use cleanup functions in `$effect` when needed

### ❌ Don't:
- Don't mutate `$derived` values (they're read-only)
- Don't use `$effect` for computed values (use `$derived`)
- Don't create circular dependencies
- Don't put heavy computations in `$derived` without memoization

---

## Quick Reference

| Need | Rune | Example |
|------|------|---------|
| Reactive state | `$state` | `let count = $state(0)` |
| Computed value | `$derived` | `let doubled = $derived(count * 2)` |
| Side effect | `$effect` | `$effect(() => console.log(count))` |
| Component props | `$props` | `let { name } = $props()` |
| Bindable prop | `$bindable` | `let { value = $bindable() } = $props()` |

---

## In Our Cart Example

```javascript
// REACTIVE STATE - changes trigger UI updates
let cartItems = $state([...]);

// COMPUTED VALUES - recalculate when cartItems changes
let subtotal = $derived(/* calculation */);
let tax = $derived(subtotal * 0.08);
let shipping = $derived(subtotal > 50 ? 0 : 5.99);
let itemCount = $derived(/* calculation */);

// FUNCTIONS - update state, triggering reactivity
function updateQuantity(id, quantity) {
  cartItems = cartItems.map(item => 
    item.id === id ? { ...item, quantity } : item
  );
}

// SIDE EFFECT (optional) - runs when cartItems changes
$effect(() => {
  localStorage.setItem('cart', JSON.stringify(cartItems));
});
```

**Reactivity Flow:**
1. User clicks "+1" button
2. `updateQuantity()` runs
3. `cartItems` is reassigned (triggers reactivity)
4. `subtotal`, `tax`, `shipping`, `itemCount` recalculate
5. UI re-renders with new values
6. `$effect` runs, saving to localStorage

---

## Resources

- [Official Svelte 5 Runes Docs](https://svelte-5-preview.vercel.app/docs/runes)
- [Svelte 5 Migration Guide](https://svelte-5-preview.vercel.app/docs/migration)
