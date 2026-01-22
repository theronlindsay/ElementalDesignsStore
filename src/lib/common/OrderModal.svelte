<script lang="ts">
	import { Button, Input, Label, FormGroup } from '$lib';
	
	interface OrderData {
		name: string;
		email: string;
		request: string;
		referenceImages: string[];
	}
	
	let {
		isOpen = false,
		onSave,
		onCancel
	}: {
		isOpen?: boolean;
		onSave: (order: OrderData) => void;
		onCancel: () => void;
	} = $props();
	
	// Form state
	let formData = $state({
		name: '',
		email: '',
		request: ''
	});
	
	// UI state
	let referenceImages = $state<string[]>([]);
	let imagePreview = $state<{ [key: number]: string }>({});
	let isUploading = $state(false);
	let uploadError = $state<string | null>(null);
	let fileInput = $state<HTMLInputElement | undefined>(undefined);
	let uploadedFiles = $state<File[]>([]);
	
	// Reset form when modal closes
	$effect(() => {
		if (!isOpen) {
			formData = {
				name: '',
				email: '',
				request: ''
			};
			referenceImages = [];
			imagePreview = {};
			uploadError = null;
			uploadedFiles = [];
		}
	});
	
	// Handle file selection and upload
	async function handleFileChange(e: Event) {
		const target = e.target as HTMLInputElement;
		const files = Array.from(target.files || []);
		
		if (files.length === 0) return;
		
		// Validate and process each file
		const validFiles: File[] = [];
		for (const file of files) {
			// Validate file type
			if (!file.type.startsWith('image/')) {
				uploadError = `${file.name} is not an image file`;
				return;
			}
			
			// Validate file size (max 5MB per file)
			if (file.size > 5 * 1024 * 1024) {
				uploadError = `${file.name} is larger than 5MB`;
				return;
			}
			
			validFiles.push(file);
		}
		
		// Store files for later upload
		uploadedFiles = [...uploadedFiles, ...validFiles];
		isUploading = true;
		uploadError = null;
		
		// Create previews
		for (let i = 0; i < validFiles.length; i++) {
			const file = validFiles[i];
			const reader = new FileReader();
			reader.onload = (event) => {
				const index = referenceImages.length + i;
				imagePreview[index] = event.target?.result as string;
			};
			reader.readAsDataURL(file);
		}
		
		// Add to reference images list
		referenceImages = [...referenceImages, ...validFiles.map(() => '')];
		isUploading = false;
		
		// Clear input
		if (fileInput) {
			fileInput.value = '';
		}
	}
	
	// Remove a reference image
	function removeImage(index: number) {
		uploadedFiles = uploadedFiles.filter((_, i) => i !== index);
		referenceImages = referenceImages.filter((_, i) => i !== index);
		const newPreview: { [key: number]: string } = {};
		Object.entries(imagePreview).forEach(([key, value]) => {
			const keyNum = parseInt(key);
			if (keyNum < index) {
				newPreview[keyNum] = value;
			} else if (keyNum > index) {
				newPreview[keyNum - 1] = value;
			}
		});
		imagePreview = newPreview;
	}
	
	async function handleSubmit(e: Event) {
		e.preventDefault();
		
		// Upload images if there are any
		let uploadedImagePaths: string[] = [];
		
		if (uploadedFiles.length > 0) {
			isUploading = true;
			uploadError = null;
			
			try {
				for (const file of uploadedFiles) {
					const formDataUpload = new FormData();
					formDataUpload.append('file', file);
					
					const response = await fetch('/api/upload-event-image', {
						method: 'POST',
						body: formDataUpload
					});
					
					if (!response.ok) {
						throw new Error(`Failed to upload ${file.name}`);
					}
					
					const data = await response.json();
					uploadedImagePaths.push(data.imagePath);
				}
			} catch (error) {
				uploadError = error instanceof Error ? error.message : 'Upload failed';
				isUploading = false;
				return;
			}
			
			isUploading = false;
		}
		
		const orderData: OrderData = {
			name: formData.name,
			email: formData.email,
			request: formData.request,
			referenceImages: uploadedImagePaths
		};
		
		onSave(orderData);
	}
	
	function handleCancel() {
		onCancel();
	}
</script>

{#if isOpen}
	<div class="modal-overlay" onclick={handleCancel} onkeydown={(e) => e.key === 'Escape' && handleCancel()} role="button" tabindex="-1">
		<div class="modal-container" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()} role="dialog" aria-modal="true" tabindex="-1">
			<div class="modal-header">
				<h2 class="modal-title">Place Custom Order</h2>
				<button class="close-btn" onclick={handleCancel} aria-label="Close modal">
					<i class="fas fa-times"></i>
				</button>
			</div>
			
			<form onsubmit={handleSubmit} class="modal-form">
				<!-- Name Field -->
				<FormGroup>
					<Label htmlFor="name" required>Full Name</Label>
					<Input
						type="text"
						name="name"
						bind:value={formData.name}
						placeholder="Enter your full name"
						required
					/>
				</FormGroup>
				
				<!-- Email Field -->
				<FormGroup>
					<Label htmlFor="email" required>Email Address</Label>
					<Input
						type="email"
						name="email"
						bind:value={formData.email}
						placeholder="your.email@example.com"
						required
					/>
				</FormGroup>
				
				<!-- Request Box -->
				<FormGroup>
					<Label htmlFor="request" required>Order Request</Label>
					<textarea
						name="request"
						bind:value={formData.request}
						placeholder="Describe your custom order requirements, design preferences, materials, size, etc..."
						required
						class="textarea"
						rows="6"
					></textarea>
				</FormGroup>
				
				<!-- Reference Images Upload -->
				<FormGroup>
					<Label htmlFor="reference-images">Reference Images</Label>
					<div class="image-upload-section">
						{#if referenceImages.length > 0}
							<div class="image-gallery">
								{#each referenceImages as _, index}
									{#if imagePreview[index]}
										<div class="image-preview-item">
											<img src={imagePreview[index]} alt="Reference {index + 1}" />
											<button 
												type="button" 
												class="remove-image-btn"
												onclick={() => removeImage(index)}
												disabled={isUploading}
												aria-label="Remove image {index + 1}"
											>
												<i class="fas fa-trash"></i>
											</button>
										</div>
									{/if}
								{/each}
							</div>
						{/if}
						
						<div class="upload-area">
							<input
								bind:this={fileInput}
								type="file"
								name="reference-images"
								accept="image/*"
								multiple
								onchange={handleFileChange}
								disabled={isUploading}
								class="file-input"
								id="image-upload"
							/>
							<label for="image-upload" class="upload-label">
								<i class="fas fa-cloud-upload-alt"></i>
								<div>
									<p class="upload-text">Click to upload or drag and drop</p>
									<p class="upload-hint">PNG, JPG, GIF up to 5MB per image (multiple images allowed)</p>
								</div>
							</label>
						</div>
						
						{#if uploadError}
							<p class="error-message">{uploadError}</p>
						{/if}
						
						{#if isUploading}
							<p class="uploading-message">Uploading images...</p>
						{/if}
					</div>
				</FormGroup>
				
				<!-- Actions -->
				<div class="modal-actions">
					<Button type="button" variant="ghost" onclick={handleCancel}>
						Cancel
					</Button>
					<Button type="submit" variant="primary" disabled={!formData.name || !formData.email || !formData.request || isUploading}>
						<i class="fas fa-paper-plane"></i>
						<span>Submit Order</span>
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
		min-height: 150px;
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
	
	.image-gallery {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
		gap: 1rem;
	}
	
	.image-preview-item {
		position: relative;
		border-radius: 8px;
		overflow: hidden;
		border: 1px solid var(--border-secondary);
		
		img {
			width: 100%;
			height: 120px;
			object-fit: cover;
			display: block;
		}
		
		.remove-image-btn {
			position: absolute;
			top: 0.25rem;
			right: 0.25rem;
			width: 28px;
			height: 28px;
			display: flex;
			align-items: center;
			justify-content: center;
			padding: 0;
			background: rgba(0, 0, 0, 0.7);
			color: white;
			border: none;
			border-radius: 4px;
			cursor: pointer;
			font-size: 0.8rem;
			transition: all 0.2s ease;
			
			&:hover:not(:disabled) {
				background: rgba(0, 0, 0, 0.9);
				transform: scale(1.1);
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
		
		.image-gallery {
			grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
		}
	}
</style>
