<script>
	import { Editor } from '@tiptap/core';
	import StarterKit from '@tiptap/starter-kit';
	import { onMount, onDestroy } from 'svelte';

	// Props for binding content and customization
	let {
		content = $bindable(''),
		placeholder = 'Start typing...',
		editorClass = ''
	} = $props();

	// Editor instance
	let editor = $state(null);
	let editorElement = $state(null);
	let isFocused = $state(false);

	// Initialize editor with TipTap on mount
	onMount(() => {
		editor = new Editor({
			element: editorElement,
			extensions: [
				StarterKit.configure({
					codeBlock: {
						languageClassPrefix: 'language-'
					}
				})
			],
			content: content,
			editorProps: {
				attributes: {
					class: `prose-editor ${editorClass}`
				}
			},
			// Update reactive content when editor changes
			onUpdate: ({ editor: editorInstance }) => {
				content = editorInstance.getHTML();
			},
			onFocus: () => {
				isFocused = true;
			},
			onBlur: () => {
				isFocused = false;
			}
		});
	});

	// Cleanup editor on destroy
	onDestroy(() => {
		if (editor) {
			editor.destroy();
		}
	});

	// Toolbar button handler
	function toggleBold() {
		editor?.chain().focus().toggleBold().run();
	}

	function toggleItalic() {
		editor?.chain().focus().toggleItalic().run();
	}

	function toggleBulletList() {
		editor?.chain().focus().toggleBulletList().run();
	}

	function toggleOrderedList() {
		editor?.chain().focus().toggleOrderedList().run();
	}

	function toggleBlockquote() {
		editor?.chain().focus().toggleBlockquote().run();
	}

	function setHeading(level) {
		editor?.chain().focus().toggleHeading({ level }).run();
	}

	function clearFormatting() {
		editor?.chain().focus().clearNodes().run();
	}

	function undo() {
		editor?.chain().focus().undo().run();
	}

	function redo() {
		editor?.chain().focus().redo().run();
	}
</script>

<div class="rich-text-editor-wrapper" class:focused={isFocused}>
	<!-- Toolbar with formatting options -->
	<div class="editor-toolbar" role="toolbar" aria-label="Text formatting options">
		<!-- Text Formatting -->
		<div class="toolbar-group">
			<button
				type="button"
				class="toolbar-btn"
				class:active={editor?.isActive('bold')}
				onclick={toggleBold}
				title="Bold (Ctrl+B)"
				aria-label="Make text bold"
			>
				<i class="fas fa-bold"></i>
			</button>
			<button
				type="button"
				class="toolbar-btn"
				class:active={editor?.isActive('italic')}
				onclick={toggleItalic}
				title="Italic (Ctrl+I)"
				aria-label="Make text italic"
			>
				<i class="fas fa-italic"></i>
			</button>
		</div>

		<!-- Divider -->
		<div class="toolbar-divider"></div>

		<!-- Heading Levels -->
		<div class="toolbar-group">
			<button
				type="button"
				class="toolbar-btn"
				class:active={editor?.isActive('heading', { level: 1 })}
				onclick={() => setHeading(1)}
				title="Heading 1"
				aria-label="Set as heading 1"
			>
				H1
			</button>
			<button
				type="button"
				class="toolbar-btn"
				class:active={editor?.isActive('heading', { level: 2 })}
				onclick={() => setHeading(2)}
				title="Heading 2"
				aria-label="Set as heading 2"
			>
				H2
			</button>
			<button
				type="button"
				class="toolbar-btn"
				class:active={editor?.isActive('heading', { level: 3 })}
				onclick={() => setHeading(3)}
				title="Heading 3"
				aria-label="Set as heading 3"
			>
				H3
			</button>
		</div>

		<!-- Divider -->
		<div class="toolbar-divider"></div>

		<!-- Lists -->
		<div class="toolbar-group">
			<button
				type="button"
				class="toolbar-btn"
				class:active={editor?.isActive('bulletList')}
				onclick={toggleBulletList}
				title="Bullet List"
				aria-label="Create bullet list"
			>
				<i class="fas fa-list-ul"></i>
			</button>
			<button
				type="button"
				class="toolbar-btn"
				class:active={editor?.isActive('orderedList')}
				onclick={toggleOrderedList}
				title="Ordered List"
				aria-label="Create ordered list"
			>
				<i class="fas fa-list-ol"></i>
			</button>
		</div>

		<!-- Divider -->
		<div class="toolbar-divider"></div>

		<!-- Block Level -->
		<div class="toolbar-group">
			<button
				type="button"
				class="toolbar-btn"
				class:active={editor?.isActive('blockquote')}
				onclick={toggleBlockquote}
				title="Blockquote"
				aria-label="Create blockquote"
			>
				<i class="fas fa-quote-left"></i>
			</button>
		</div>

		<!-- Divider -->
		<div class="toolbar-divider"></div>

		<!-- Utilities -->
		<div class="toolbar-group">
			<button
				type="button"
				class="toolbar-btn"
				onclick={clearFormatting}
				title="Clear Formatting"
				aria-label="Remove all formatting"
			>
				<i class="fas fa-eraser"></i>
			</button>
			<button
				type="button"
				class="toolbar-btn"
				onclick={undo}
				title="Undo"
				aria-label="Undo last action"
			>
				<i class="fas fa-undo"></i>
			</button>
			<button
				type="button"
				class="toolbar-btn"
				onclick={redo}
				title="Redo"
				aria-label="Redo last action"
			>
				<i class="fas fa-redo"></i>
			</button>
		</div>
	</div>

	<!-- Editor content area -->
	<div bind:this={editorElement} class="editor-content"></div>

</div>

<style lang="scss">
	.rich-text-editor-wrapper {
		display: flex;
		flex-direction: column;
		gap: 0;
		border: none;
		border-radius: 0;
		overflow: visible;
		background: transparent;
		width: 100%;
	}

	// Toolbar styling
	.editor-toolbar {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		padding: 0.75rem;
		background: var(--c-bg-secondary);
		border-bottom: 1px solid var(--c-border);
		flex-wrap: wrap;
		border-radius: var(--radius-md) var(--radius-md) 0 0;
	}

	.toolbar-group {
		display: flex;
		gap: 0.25rem;
		align-items: center;
	}

	.toolbar-divider {
		width: 1px;
		height: 1.5rem;
		background: var(--c-border);
		margin: 0 0.25rem;
	}

	.toolbar-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		padding: 0;
		border: 1px solid transparent;
		border-radius: var(--radius-sm);
		background: transparent;
		color: var(--c-text-secondary);
		cursor: pointer;
		font-size: 0.875rem;
		font-weight: 500;
		transition: all 0.2s ease;

		&:hover {
			background: var(--c-bg-hover);
			color: var(--c-text-primary);
		}

		&:active,
		&.active {
			background: var(--c-primary);
			color: white;
			border-color: var(--c-primary);
		}

		&:disabled {
			opacity: 0.5;
			cursor: not-allowed;
		}
	}

	// Editor content area - styled like a textarea
	.editor-content {
		width: 100%;
		box-sizing: border-box;
		padding: 0.75rem 1rem;
		background: var(--bg-secondary);
		border: 1px solid var(--border-secondary);
		border-radius: 12px;
		color: var(--text-secondary);
		font-size: 1rem;
		line-height: 1.6;
		color: var(--c-text-primary);
		background: var(--c-bg-primary);
		resize: vertical;
		font-family: inherit;
		transition: all 0.3s ease;
		word-wrap: break-word;
		overflow-wrap: break-word;
		white-space: normal;

		&:hover {
			background: var(--c-bg-secondary);
		}

		&:focus {
			background: var(--c-bg-primary);
			outline: none;
		}
	}

	// Global ProseMirror editor styles
	:global(.prose-editor) {
		outline: none;
		word-wrap: break-word;
		overflow-wrap: break-word;
		white-space: normal;

		p {
			margin: 0.5rem 0;

			&:first-child {
				margin-top: 0;
			}

			&:last-child {
				margin-bottom: 0;
			}
		}

		h1,
		h2,
		h3,
		h4,
		h5,
		h6 {
			margin: 1.25rem 0 0.5rem 0;
			font-weight: 600;
			line-height: 1.3;

			&:first-child {
				margin-top: 0;
			}
		}

		h1 {
			font-size: 1.875rem;
		}

		h2 {
			font-size: 1.5rem;
		}

		h3 {
			font-size: 1.25rem;
		}

		ul,
		ol {
			margin: 0.75rem 0;
			padding-left: 1.5rem;

			li {
				margin: 0.25rem 0;

				p {
					margin: 0.25rem 0;
				}
			}
		}

		blockquote {
			border-left: 3px solid var(--c-primary);
			padding: 0.75rem 1rem;
			margin: 0.75rem 0;
			background: var(--c-bg-secondary);
			border-radius: var(--radius-sm);
			color: var(--c-text-secondary);
			font-style: italic;
		}

		code {
			background: var(--c-bg-secondary);
			padding: 0.1rem 0.3rem;
			border-radius: var(--radius-xs);
			font-family: 'Courier New', monospace;
			font-size: 0.875em;
			color: var(--c-error);
		}

		pre {
			background: var(--c-bg-secondary);
			padding: 1rem;
			border-radius: var(--radius-sm);
			overflow-x: auto;
			margin: 0.75rem 0;

			code {
				background: transparent;
				padding: 0;
				color: inherit;
			}
		}

		hr {
			border: none;
			border-top: 1px solid var(--c-border);
			margin: 1rem 0;
		}
	}
</style>
