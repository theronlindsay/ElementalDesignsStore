<script lang="ts">
	import { Button, Input, Label, FormGroup } from '$lib';
	
	interface EventData {
		id?: string;
		title: string;
		description: string;
		date: Date;
		location?: string;
		address?: string;
		mapsLink?: string;
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
		address: '',
		mapsLink: '',
		image: '',
		link: ''
	});
	
	// UI state
	let imagePreview = $state<string | null>(null);
	let isUploading = $state(false);
	let uploadError = $state<string | null>(null);
	let fileInput = $state<HTMLInputElement | undefined>(undefined);
	
	// Load event data when editing
	$effect(() => {
		if (event) {
			formData = {
				title: event.title || '',
				description: event.description || '',
				date: event.date ? new Date(event.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
				location: event.location || '',
				address: event.address || '',
				mapsLink: event.mapsLink || '',
				image: event.image || '',
				link: event.link || ''
			};
			// Set preview for existing image
			if (event.image) {
				imagePreview = event.image;
			} else {
				imagePreview = null;
			}
        } else {
			formData = {
				title: '',
				description: '',
				date: new Date().toISOString().split('T')[0],
				location: '',
				address: '',
				mapsLink: '',
				image: '',
				link: ''
			};
			imagePreview = null;
		}
		uploadError = null;
	});
	
	// Handle file selection and upload
	async function handleFileChange(e: Event) {
		const target = e.target as HTMLInputElement;
		const file = target.files?.[0];
		
		if (!file) return;
		
		// Validate file type
		if (!file.type.startsWith('image/')) {
			uploadError = 'Please select an image file';
			return;
		}
		
		// Validate file size (max 5MB)
		if (file.size > 5 * 1024 * 1024) {
			uploadError = 'Image must be smaller than 5MB';
			return;
		}
		
		// Create form data for upload
		const formDataUpload = new FormData();
		formDataUpload.append('file', file);
		
		isUploading = true;
		uploadError = null;
		
		try {
			const response = await fetch('/api/upload-event-image', {
				method: 'POST',
				body: formDataUpload
			});
			
			if (!response.ok) {
				throw new Error('Upload failed');
			}
			
			const data = await response.json();
			formData.image = data.imagePath;
			
			// Create preview
			const reader = new FileReader();
			reader.onload = (event) => {
				imagePreview = event.target?.result as string;
			};
			reader.readAsDataURL(file);
		} catch (error) {
			uploadError = error instanceof Error ? error.message : 'Upload failed';
		} finally {
			isUploading = false;
		}
	}
	
	// Clear image
	function clearImage() {
		formData.image = '';
		imagePreview = null;
		if (fileInput) {
			fileInput.value = '';
		}
	}
	
	async function handleSubmit(e: Event) {
		e.preventDefault();
		
		const eventData = {
			id: event?.id || crypto.randomUUID(),
			title: formData.title,
			description: formData.description,
			date: formData.date,
			location: formData.location,
			address: formData.address,
			mapsLink: formData.mapsLink,
			image: formData.image,
			link: formData.link
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
					class="textarea"
					rows="5"
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
					<Label htmlFor="location">Location Name</Label>
					<Input
						type="text"
						name="location"
						bind:value={formData.location}
						placeholder="e.g., Downtown Plaza"
					/>
				</FormGroup>
			</div>
			
			<!-- Address and Maps Link -->
			<FormGroup>
				<Label htmlFor="address">Street Address</Label>
				<Input
					type="text"
					name="address"
					bind:value={formData.address}
					placeholder="e.g., 123 Main St, City, State 12345"
				/>
			</FormGroup>
			
			<FormGroup>
				<Label htmlFor="mapsLink">Google Maps Link</Label>
				<Input
					type="text"
					name="mapsLink"
					bind:value={formData.mapsLink}
					placeholder="https://maps.google.com/..."
				/>
			</FormGroup>
			
			<FormGroup>
				<Label htmlFor="image">Event Image</Label>
				<div class="image-upload-section">
					{#if imagePreview}
						<div class="image-preview">
							<img src={imagePreview} alt="Event preview" />
							<button 
								type="button" 
								class="clear-image-btn"
								onclick={clearImage}
								disabled={isUploading}
							>
								<i class="fas fa-trash"></i>
								Remove Image
							</button>
						</div>
					{:else}
						<div class="upload-area">
							<input
								bind:this={fileInput}
								type="file"
								name="image"
								accept="image/*"
								onchange={handleFileChange}
								disabled={isUploading}
								class="file-input"
								id="image-upload"
							/>
							<label for="image-upload" class="upload-label">
								<i class="fas fa-cloud-upload-alt"></i>
								<div>
									<p class="upload-text">Click to upload or drag and drop</p>
									<p class="upload-hint">PNG, JPG, GIF up to 5MB</p>
								</div>
							</label>
						</div>
					{/if}
					
					{#if uploadError}
						<p class="error-message">{uploadError}</p>
					{/if}
					
					{#if isUploading}
						<p class="uploading-message">Uploading image...</p>
					{/if}
				</div>
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
		gap: 1.5rem;
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
		resize: vertical;
		min-height: 120px;
		line-height: 1.5;
		
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
	
	.image-upload-section {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	
	.image-preview {
		position: relative;
		border-radius: 8px;
		overflow: hidden;
		
		img {
			width: 100%;
			height: 300px;
			object-fit: cover;
			display: block;
		}
		
		.clear-image-btn {
			position: absolute;
			top: 0.5rem;
			right: 0.5rem;
			display: flex;
			align-items: center;
			gap: 0.5rem;
			padding: 0.5rem 1rem;
			background: rgba(0, 0, 0, 0.7);
			color: white;
			border: none;
			border-radius: 6px;
			cursor: pointer;
			font-size: 0.9rem;
			transition: all 0.2s ease;
			
			&:hover:not(:disabled) {
				background: rgba(0, 0, 0, 0.9);
				transform: scale(1.05);
			}
			
			&:disabled {
				opacity: 0.5;
				cursor: not-allowed;
			}
		}
	}
	
	.upload-area {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		
		.file-input {
			display: none;
		}
		
		.upload-label {
			width: 100%;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			padding: 2rem;
			border: 2px dashed var(--border-primary);
			border-radius: 8px;
			cursor: pointer;
			transition: all 0.2s ease;
			background: var(--bg-secondary);
			
			i {
				font-size: 2rem;
				color: var(--accent);
				margin-bottom: 0.5rem;
			}
			
			&:hover {
				border-color: var(--accent);
				background: rgba(167, 139, 250, 0.05);
			}
		}
	}
	
	.upload-text {
		color: var(--text-primary);
		font-weight: 600;
		margin: 0;
		font-size: 1rem;
	}
	
	.upload-hint {
		color: var(--muted);
		font-size: 0.85rem;
		margin: 0.25rem 0 0;
	}
	
	.error-message {
		color: #ff6b6b;
		font-size: 0.9rem;
		margin: 0;
	}
	
	.uploading-message {
		color: var(--accent);
		font-size: 0.9rem;
		margin: 0;
		text-align: center;
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
