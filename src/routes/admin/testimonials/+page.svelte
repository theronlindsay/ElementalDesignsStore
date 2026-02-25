<script>
import { TestimonialCard, TestimonialModal } from '$lib';


export let data;

// Load initial testimonials from server
let testimonials = data.testimonials || [];

// Modal state
let isModalOpen = false;
let editingEvent = null;
let isSaving = false;
let isDeleting = false;

function openAddModal() {
	editingEvent = null;
	isModalOpen = true;
}

function openEditModal(id) {
	const testimonial = testimonials.find((e) => e.id === id || e._id === id);
	if (testimonial) {
		editingEvent = { ...testimonial };
		isModalOpen = true;
	}
}

function closeModal() {
	isModalOpen = false;
	editingEvent = null;
}

async function handleSave(testamonialData) {
	isSaving = true;
	try {
		const response = await fetch('/admin/testimonials', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(testamonialData)
		});

		if (!response.ok) {
			throw new Error('Failed to save testimonial');
		}

		const result = await response.json();

		if (editingEvent) {
			// Update existing testimonial
			testimonials = testimonials.map((e) => (e.id === testamonialData.id || e._id === testamonialData._id) ? testamonialData : e);
		} else {
			// Add new testimonial
			testimonials = [...testimonials, testamonialData];
		}
		closeModal();
	} catch (error) {
		console.error('Error saving testimonial:', error);
		alert('Failed to save testimonial. Please try again.');
	} finally {
		isSaving = false;
	}
}

async function handleDelete(id) {
	if (!confirm('Are you sure you want to delete this testimonial?')) return;

	isDeleting = true;
	try {
		const response = await fetch('/admin/testimonials', {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ id })
		});

		if (!response.ok) {
			throw new Error('Failed to delete testimonial');
		}

		testimonials = testimonials.filter((e) => e.id !== id && e._id !== id);
	} catch (error) {
		console.error('Error deleting testimonial:', error);
		alert('Failed to delete testimonial. Please try again.');
	} finally {
		isDeleting = false;
	}
}

async function saveOrder() {
	isSaving = true;
	const updates = testimonials.map((t, index) => ({ id: t.id || t._id, order: index }));
	try {
		await fetch('/admin/testimonials', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ updates })
		});
	} catch (error) {
		console.error('Failed to save order:', error);
		alert('Failed to save ordering changes.');
	} finally {
		isSaving = false;
	}
}

function handleMoveUp(id) {
	const index = testimonials.findIndex((t) => t.id === id || t._id === id);
	if (index > 0) {
		const temp = testimonials[index];
		testimonials[index] = testimonials[index - 1];
		testimonials[index - 1] = temp;
		testimonials = [...testimonials]; // trigger reactivity
		saveOrder();
	}
}

function handleMoveDown(id) {
	const index = testimonials.findIndex((t) => t.id === id || t._id === id);
	if (index < testimonials.length - 1) {
		const temp = testimonials[index];
		testimonials[index] = testimonials[index + 1];
		testimonials[index + 1] = temp;
		testimonials = [...testimonials]; // trigger reactivity
		saveOrder();
	}
}

</script>

<svelte:head>
	<title>testimonials - Admin</title>
</svelte:head>

<div class="testimonials-page">
	<!-- Page Header -->
	<div class="page-header">
		<div class="header-left">
			<h2 class="page-subtitle">Manage testimonials displayed on your homepage</h2>
		</div>
		<button class="btn-primary" onclick={openAddModal}>
			<i class="fas fa-plus"></i>
			Add Testimonial
		</button>
	</div>
	
	<!-- Testimonials List -->
	<section class="testimonials-section">
		<h3 class="section-title">
			<i class="fas fa-quote-left"></i>
			All Testimonials ({testimonials.length})
		</h3>
		
		{#if testimonials.length > 0}
			<div class="testimonials-grid">
				{#each testimonials as testimonial, index (testimonial.id || testimonial._id)}
					<TestimonialCard
						{testimonial}
						editable={true}
						onEdit={openEditModal}
						onDelete={handleDelete}
						onMoveUp={handleMoveUp}
						onMoveDown={handleMoveDown}
						isFirst={index === 0}
						isLast={index === testimonials.length - 1}
					/>
				{/each}
			</div>
		{:else}
			<div class="empty-state theme-glass">
				<i class="fas fa-comment-dots"></i>
				<p>No testimonials available</p>
				<button class="add-first-btn" onclick={openAddModal}>
					Add Your First Testimonial
				</button>
			</div>
		{/if}
	</section>
</div>

<!-- Testimonial Modal -->
<TestimonialModal 
	isOpen={isModalOpen}
	testimonial={editingEvent}
	onSave={handleSave}
	onCancel={closeModal}
/>

<style lang="scss">
	.testimonials-page {
		width: 100%;
	}
	
	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
		gap: 1rem;
		flex-wrap: wrap;
	}
	
	.header-left {
		flex: 1;
		min-width: 200px;
	}
	
	.page-subtitle {
		color: var(--muted);
		font-size: 1rem;
		font-weight: 500;
		margin: 0;
	}
	
	.btn-primary {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1.5rem;
		background: linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%);
		color: white;
		border: none;
		border-radius: 12px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
		
		&:hover {
			transform: translateY(-2px);
			box-shadow: 0 8px 20px rgba(167, 139, 250, 0.4);
		}
	}
	
	.testimonials-section {
		margin-bottom: 3rem;
	}
	
	.section-title {
		color: var(--text-primary);
		font-size: 1.25rem;
		font-weight: 700;
		margin: 0 0 1.5rem 0;
		display: flex;
		align-items: center;
		gap: 0.75rem;
		
		i {
			color: var(--accent);
		}
	}
	
	.testimonials-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
		gap: 1.5rem;
	}
	
	.empty-state {
		padding: 4rem 2rem;
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		
		i {
			font-size: 3rem;
			color: var(--muted-2);
		}
		
		p {
			color: var(--muted);
			font-size: 1.1rem;
			margin: 0;
		}
	}
	
	.add-first-btn {
		margin-top: 1rem;
		padding: 0.75rem 1.5rem;
		background: linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%);
		color: white;
		border: none;
		border-radius: 12px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
		
		&:hover {
			transform: translateY(-2px);
			box-shadow: 0 8px 20px rgba(167, 139, 250, 0.4);
		}
	}
	
	@media (max-width: 768px) {
		.testimonials-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
