<script>
	export let type = 'text';
	export let name;
	export let placeholder = '';
	export let value = '';
	export let required = false;
	export let ariaLabel = undefined;
	export let autocomplete = undefined;
</script>

<input
	{type}
	{name}
	{placeholder}
	bind:value
	{required}
	aria-label={ariaLabel}
	{autocomplete}
	class="input"
	{...$$restProps}
/>

<style lang="scss">
	.input {
		width: -webkit-fill-available;	
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
