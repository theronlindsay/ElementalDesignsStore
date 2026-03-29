<script>
	import { onMount, onDestroy, untrack } from 'svelte';

	let { value = '', onchange = () => {}, placeholder = 'Start typing...' } = $props();

	let editorContainer;
	let quillInstance = null;
	let isInternalUpdate = false;

	onMount(async () => {
		const { default: Quill } = await import('quill');

		quillInstance = new Quill(editorContainer, {
			theme: 'snow',
			placeholder,
			modules: {
				toolbar: [
					[{ header: [1, 2, 3, false] }],
					[{ font: [] }],
					[{ size: ['small', false, 'large', 'huge'] }],
					['bold', 'italic', 'underline', 'strike'],
					[{ color: [] }, { background: [] }],
					[{ list: 'ordered' }, { list: 'bullet' }],
					[{ align: [] }],
					['blockquote'],
					['link'],
					['clean']
				]
			}
		});

		if (value) {
			isInternalUpdate = true;
			quillInstance.root.innerHTML = value;
			isInternalUpdate = false;
		}

		quillInstance.on('text-change', () => {
			if (isInternalUpdate) return;
			const html = quillInstance.root.innerHTML;
			const cleaned = html === '<p><br></p>' ? '' : html;
			onchange(cleaned);
		});
	});

	$effect(() => {
		const val = value;
		const q = untrack(() => quillInstance);
		if (!q) return;
		const currentHtml = q.root.innerHTML;
		const normalizedCurrent = currentHtml === '<p><br></p>' ? '' : currentHtml;
		if (val !== normalizedCurrent) {
			isInternalUpdate = true;
			q.root.innerHTML = val || '';
			isInternalUpdate = false;
		}
	});

	onDestroy(() => {
		quillInstance = null;
	});
</script>

<svelte:head>
	<link href="https://cdn.jsdelivr.net/npm/quill@2/dist/quill.snow.css" rel="stylesheet" />
</svelte:head>

<div class="rich-text-editor">
	<div bind:this={editorContainer}></div>
</div>

<style lang="scss">
	.rich-text-editor {
		border: 1px solid var(--panel-border);
		border-radius: 10px;
		overflow: hidden;

		:global(.ql-toolbar.ql-snow) {
			background: rgba(42, 36, 56, 0.8);
			border: none;
			border-bottom: 1px solid var(--panel-border);
			padding: 0.5rem;

			:global(.ql-stroke) {
				stroke: var(--muted);
			}

			:global(.ql-fill) {
				fill: var(--muted);
			}

			:global(.ql-picker-label) {
				color: var(--muted);
				border-color: var(--panel-border);
			}

			:global(.ql-picker-options) {
				background: var(--nav-bg);
				border-color: var(--panel-border);
				border-radius: 8px;
				box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
			}

			:global(.ql-picker-item) {
				color: var(--text-primary);
			}

			:global(.ql-picker-item:hover),
			:global(.ql-picker-item.ql-selected) {
				color: var(--accent);
			}

			:global(button:hover .ql-stroke),
			:global(button.ql-active .ql-stroke) {
				stroke: var(--accent);
			}

			:global(button:hover .ql-fill),
			:global(button.ql-active .ql-fill) {
				fill: var(--accent);
			}

			:global(.ql-picker-label:hover),
			:global(.ql-picker-label.ql-active) {
				color: var(--accent);
			}
		}

		:global(.ql-container.ql-snow) {
			background: rgba(42, 36, 56, 0.65);
			border: none;
			color: var(--text-primary);
			font-size: 0.95rem;
			min-height: 150px;
		}

		:global(.ql-editor) {
			min-height: 150px;
			padding: 0.75rem 0.9rem;
			line-height: 1.6;
			color: var(--text-primary);
		}

		:global(.ql-editor.ql-blank::before) {
			color: var(--muted-2);
			font-style: italic;
		}

		:global(.ql-editor a) {
			color: var(--accent);
		}

		:global(.ql-snow .ql-tooltip) {
			background: var(--nav-bg);
			border-color: var(--panel-border);
			color: var(--text-primary);
			box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
			border-radius: 8px;
		}

		:global(.ql-snow .ql-tooltip input[type='text']) {
			background: rgba(42, 36, 56, 0.65);
			border-color: var(--panel-border);
			color: var(--text-primary);
			border-radius: 6px;
		}

		:global(.ql-snow .ql-tooltip a) {
			color: var(--accent);
		}
	}
</style>
