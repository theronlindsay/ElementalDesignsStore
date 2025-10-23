<script lang="ts">
	import { Button, Input, Label, FormGroup } from '$lib';
	
	interface EventData {
		id?: string;
		title: string;
		description: string;
		date: Date;
		location?: string;
		image?: string;
		link?: string;
	}
	
	let {
		isOpen = false,
		event = null,
		onSave,
		onCancel
	}: {
		isOpen?: boolean;
		event?: EventData | null;
		onSave: (event: any) => void;
		onCancel: () => void;
	} = $props();
	
	// Form state
	let formData = $state({
		title: '',
		description: '',
        date: new Date().toISOString().split('T')[0],
		location: '',
		image: '',
		link: ''
	});
	
	// Load event data when editing
	$effect(() => {
		if (event) {
			formData = {
				title: event.title || '',
				description: event.description || '',
				date: event.date ? new Date(event.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
				location: event.location || '',
				image: event.image || '',
				link: event.link || ''
			};
        } else {
			formData = {
				title: '',
				description: '',
				date: new Date().toISOString().split('T')[0],
				location: '',
				image: '',
				link: ''
			};
		}
	});
	
	function handleSubmit(e: Event) {
		e.preventDefault();
		
		const eventData = {
			id: event?.id || crypto.randomUUID(),
			title: formData.title,
			description: formData.description,
			date: formData.date,
			location: formData.location || undefined,
			image: formData.image || undefined,
			link: formData.link || undefined
		};
		
		onSave(eventData);
	}
	
	function handleCancel() {
		onCancel();
	}
</script>

{#if isOpen}
	<div class="modal-overlay" onclick={handleCancel} onkeydown={(e) => e.key === 'Escape' && handleCancel()} role="button" tabindex="-1">
		<div class="modal-container" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()} role="dialog" aria-modal="true" tabindex="-1">
			<div class="modal-header">
				<h2 class="modal-title">
					{event ? 'Edit Event' : 'Add New Event'}
				</h2>
				<button class="close-btn" onclick={handleCancel} aria-label="Close modal">
					<i class="fas fa-times"></i>
				</button>
			</div>
			
			<form onsubmit={handleSubmit} class="modal-form">
				<FormGroup>
					<Label htmlFor="title" required>Event Title</Label>
					<Input
						type="text"
						name="title"
						bind:value={formData.title}
						placeholder="e.g., Renaissance Fair 2025"
						required
					/>
				</FormGroup>
				
				<FormGroup>
					<Label htmlFor="description" required>Description</Label>
					<textarea
						name="description"
						bind:value={formData.description}
						placeholder="Describe your event..."
						required
						class="input textarea"
						rows="4"
					></textarea>
				</FormGroup>
				
				<div class="form-row">
					<FormGroup>
						<Label htmlFor="date" required>Event Date</Label>
						<Input
							type="date"
							name="date"
							bind:value={formData.date}
							required
						/>
					</FormGroup>
					
					<FormGroup>
						<Label htmlFor="location">Location</Label>
						<Input
							type="text"
							name="location"
							bind:value={formData.location}
							placeholder="e.g., Downtown Plaza"
						/>
					</FormGroup>
				</div>
				
				<FormGroup>
					<Label htmlFor="image">Image URL</Label>
					<Input
						type="text"
						name="image"
						bind:value={formData.image}
						placeholder="https://example.com/image.jpg"
					/>
				</FormGroup>
				
				<FormGroup>
					<Label htmlFor="link">Event Link</Label>
					<Input
						type="text"
						name="link"
						bind:value={formData.link}
						placeholder="https://example.com/event-details"
					/>
				</FormGroup>
				
				<div class="modal-actions">
					<Button type="button" variant="ghost" onclick={handleCancel}>
						Cancel
					</Button>
					<Button type="submit" variant="primary">
						<i class="fas fa-save"></i>
						<span>{event ? 'Update' : 'Create'} Event</span>
					</Button>
				</div>
			</form>
		</div>
	</div>
{/if}

<style lang="scss">
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.7);
		backdrop-filter: blur(4px);
		z-index: 2000;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
		animation: fadeIn 0.2s ease;
	}
	
	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
	
	.modal-container {
		background: var(--nav-bg);
		border: 1px solid var(--panel-border);
		border-radius: 16px;
		max-width: 600px;
		width: 100%;
		max-height: 90vh;
		overflow-y: auto;
		box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
		animation: slideUp 0.3s ease;
		
		/* Custom scrollbar */
		&::-webkit-scrollbar {
			width: 8px;
		}
		
		&::-webkit-scrollbar-track {
			background: transparent;
		}
		
		&::-webkit-scrollbar-thumb {
			background: var(--border-primary);
			border-radius: 4px;
		}
		
		&::-webkit-scrollbar-thumb:hover {
			background: var(--accent);
		}
	}
	
	@keyframes slideUp {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	
	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1.5rem 2rem;
		border-bottom: 1px solid var(--panel-border);
	}
	
	.modal-title {
		color: var(--text-primary);
		font-size: 1.5rem;
		font-weight: 700;
		margin: 0;
	}
	
	.close-btn {
		width: 36px;
		height: 36px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: transparent;
		border: 1px solid var(--border-secondary);
		border-radius: 8px;
		color: var(--muted);
		cursor: pointer;
		transition: all 0.2s ease;
		
		&:hover {
			border-color: var(--accent);
			color: var(--accent);
			background: rgba(167, 139, 250, 0.1);
		}
	}
	
	.modal-form {
		padding: 2rem;
		display: flex;
		flex-direction: column;
	}
	
	.form-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
		
		@media (max-width: 600px) {
			grid-template-columns: 1fr;
		}
	}
	
	.textarea {
		resize: vertical;
		min-height: 100px;
		font-family: inherit;
	}
	
	.modal-actions {
		display: flex;
		justify-content: flex-end;
		gap: 1rem;
		margin-top: 1rem;
		padding-top: 1.5rem;
		border-top: 1px solid var(--panel-border);
	}
	
	@media (max-width: 600px) {
		.modal-container {
			max-height: 95vh;
		}
		
		.modal-header,
		.modal-form {
			padding: 1.5rem;
		}
		
		.modal-title {
			font-size: 1.25rem;
		}
	}
</style>
