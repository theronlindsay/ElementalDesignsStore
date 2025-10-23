<script lang="ts">
  export let variant: 'default' | 'ghost' | 'primary' = 'default';
  export let size: 'sm' | 'md' = 'md';
  export let type: 'button' | 'submit' | 'reset' = 'button';
  export let ariaLabel: string | undefined = undefined;
  export let onclick: ((event: MouseEvent) => void) | undefined = undefined;
  
  // $$restProps is automatically available - no need to export it
  $: classes = [
    'btn',
    `btn--${variant}`,
    `btn--${size}`
  ].join(' ');
</script>

<button class={classes} type={type} aria-label={ariaLabel} {onclick} {...$$restProps}>
  <slot />
</button>

<style lang="scss">
  //@import '../app.scss';

  .btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 8px 12px;
    border-radius: 12px;
    border: 1px solid var(--panel-border);
    background: transparent;
    color: var(--muted);
    cursor: pointer;
    transition: all 0.18s ease;
    font-weight: 600;
  }

  .btn--sm { padding: 6px 8px; font-size: 12px }
  .btn--md { padding: 8px 12px; font-size: 13px }

  .btn--default:hover { border-color: var(--accent); background: rgba(167,139,250,0.06); color: #f3f4f6 }
  .btn--ghost { background: transparent }
  .btn--primary { background: linear-gradient(135deg,var(--accent),var(--accent-2)); color: white; border-color: transparent; padding: 1.2em 1em;}
</style>
