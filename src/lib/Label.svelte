<script lang="ts">
	export let htmlFor: string;
	export let required: boolean = false;
</script>

<label for={htmlFor} class="label">
	<slot />
	{#if required}
		<span class="required">*</span>
	{/if}
</label>

<style lang="scss">
	.label {
		display: block;
		color: var(--text-primary);
		font-size: 0.95rem;
		font-weight: 600;
		margin-bottom: 0.5rem;
	}
	
	.required {
		color: var(--accent);
		margin-left: 0.25rem;
	}
</style>
