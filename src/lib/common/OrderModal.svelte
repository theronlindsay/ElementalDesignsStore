<script>
	import { Button, Input, Label, FormGroup } from '$lib';
	
	let {
		isOpen = false,
		onSave,
		onCancel
	} = $props();
	
	// Form state
	let formData = $state({
		name: '',
		email: '',
		request: ''
	});
	let isSubmitting = $state(false);
	let submitError = $state(null);
	let submitSuccess = $state(false);
	
	// Reset form when modal closes
	$effect(() => {
		if (!isOpen) {
			formData = {
				name: '',
				email: '',
				request: ''
			};

			submitError = null;
			submitSuccess = false;
		}
	});	async function handleSubmit(e) {
		e.preventDefault();
		
		isSubmitting = true;
		submitError = null;
		submitSuccess = false;
		
		const orderData = {
			name: formData.name,
			email: formData.email,
			request: formData.request
		};
		
		try {
			const response = await fetch('/api/custom-order', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(orderData)
			});
			
			const result = await response.json();
			
			if (!response.ok) {
				throw new Error(result.error || 'Failed to send request');
			}
			
			submitSuccess = true;
			// Call the success callback after briefly showing success message
			setTimeout(() => {
				onSave(orderData);
			}, 2000);
			
		} catch (error) {
			console.error('Error submitting order:', error);
			submitError = error.message || 'Something went wrong. Please try again.';
		} finally {
			isSubmitting = false;
		}
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
				

				<!-- Feedback Alerts -->
				{#if submitError}
					<div class="error-alert">
						<i class="fas fa-exclamation-circle"></i>
						{submitError}
					</div>
				{/if}
				
				{#if submitSuccess}
					<div class="success-alert">
						<i class="fas fa-check-circle"></i>
						Your custom order request has been sent! We will contact you soon.
					</div>
				{/if}
				
				<!-- Actions -->
				<div class="modal-actions">
					<Button type="button" variant="ghost" onclick={handleCancel} disabled={isSubmitting || submitSuccess}>
						Cancel
					</Button>
					<Button type="submit" variant="primary" disabled={!formData.name || !formData.email || !formData.request || isSubmitting || submitSuccess}>
						{#if isSubmitting}
							<i class="fas fa-spinner fa-spin"></i>
							<span>Sending...</span>
						{:else if submitSuccess}
							<i class="fas fa-check"></i>
							<span>Sent!</span>
						{:else}
							<i class="fas fa-paper-plane"></i>
							<span>Submit Order</span>
						{/if}
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
	
	.error-alert {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 1rem;
		background: rgba(239, 68, 68, 0.1);
		border: 1px solid #ef4444;
		border-radius: 8px;
		color: #ef4444;
		font-weight: 500;
	}
	
	.success-alert {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 1rem;
		background: rgba(16, 185, 129, 0.1);
		border: 1px solid #10b981;
		border-radius: 8px;
		color: #10b981;
		font-weight: 500;
	}
</style>
