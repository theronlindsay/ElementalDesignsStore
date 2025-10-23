<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	
	export let type: 'date' | 'text' | 'password' | 'email' | 'number' = 'text';
	export let name: string;
	export let placeholder: string = '';
	export let value: string = '';
	export let required: boolean = false;
	export let ariaLabel: string | undefined = undefined;
	export let autocomplete: HTMLInputAttributes['autocomplete'] = undefined;
</script>

<input
	{type}
	{name}
	{placeholder}
	{value}
	{required}
	aria-label={ariaLabel}
	{autocomplete}
	class="input"
	{...$$restProps}
/>

<style lang="scss">
	.input {
		width: 100%;
		padding: 0.75rem 1rem;
		background: var(--bg-secondary);
		border: 1px solid var(--border-secondary);
		border-radius: 12px;
		color: var(--text-secondary);
		font-size: 1rem;
		outline: none;
		transition: all 0.3s ease;
		font-family: inherit;
		
		&:focus {
			border-color: var(--accent);
			box-shadow: 0 0 0 3px rgba(167, 139, 250, 0.1);
			background: var(--bg-primary);
		}
		
		&::placeholder {
			color: var(--muted-2);
		}
		
		&:hover:not(:focus) {
			border-color: var(--border-primary);
		}
	}
</style>
