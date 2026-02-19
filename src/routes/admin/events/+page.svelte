<script>
import { EventCard, EventModal } from '$lib';


export let data;

// Load initial events from server
let events = data.events || [];

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
	const event = events.find((e) => e.id === id || e._id === id);
	if (event) {
		editingEvent = { ...event };
		isModalOpen = true;
	}
}

function closeModal() {
	isModalOpen = false;
	editingEvent = null;
}

async function handleSave(eventData) {
	isSaving = true;
	try {
		const response = await fetch('/admin/events', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(eventData)
		});

		if (!response.ok) {
			throw new Error('Failed to save event');
		}

		const result = await response.json();

		if (editingEvent) {
			// Update existing event
			events = events.map((e) => (e.id === eventData.id || e._id === eventData._id) ? eventData : e);
		} else {
			// Add new event
			events = [...events, eventData];
		}
		closeModal();
	} catch (error) {
		console.error('Error saving event:', error);
		alert('Failed to save event. Please try again.');
	} finally {
		isSaving = false;
	}
}

async function handleDelete(id) {
	if (!confirm('Are you sure you want to delete this event?')) return;

	isDeleting = true;
	try {
		const response = await fetch('/admin/events', {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ id })
		});

		if (!response.ok) {
			throw new Error('Failed to delete event');
		}

		events = events.filter((e) => e.id !== id && e._id !== id);
	} catch (error) {
		console.error('Error deleting event:', error);
		alert('Failed to delete event. Please try again.');
	} finally {
		isDeleting = false;
	}
}

$: upcomingEvents = events
	.filter((e) => new Date(e.date) >= new Date())
	.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

$: pastEvents = events
	.filter((e) => new Date(e.date) < new Date())
	.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
</script>

<svelte:head>
	<title>Events - Admin</title>
</svelte:head>

<div class="events-page">
	<!-- Page Header -->
	<div class="page-header">
		<div class="header-left">
			<h2 class="page-subtitle">Manage events displayed on your homepage</h2>
		</div>
		<button class="btn-primary" onclick={openAddModal}>
			<i class="fas fa-plus"></i>
			Add Event
		</button>
	</div>
	
	<!-- Upcoming Events -->
	<section class="events-section">
		<h3 class="section-title">
			<i class="fas fa-calendar-check"></i>
			Upcoming Events ({upcomingEvents.length})
		</h3>
		
		{#if upcomingEvents.length > 0}
			<div class="events-grid">
				{#each upcomingEvents as event (event.id)}
					<EventCard 
						{event}
						editable={true}
						onEdit={openEditModal}
						onDelete={handleDelete}
					/>
				{/each}
			</div>
		{:else}
			<div class="empty-state theme-glass">
				<i class="fas fa-calendar-plus"></i>
				<p>No upcoming events</p>
				<button class="add-first-btn" onclick={openAddModal}>
					Add Your First Event
				</button>
			</div>
		{/if}
	</section>
	
	<!-- Past Events -->
	{#if pastEvents.length > 0}
		<section class="events-section">
			<h3 class="section-title">
				<i class="fas fa-history"></i>
				Past Events ({pastEvents.length})
			</h3>
			
			<div class="events-grid">
				{#each pastEvents as event (event.id)}
					<EventCard 
						{event}
						editable={true}
						onEdit={openEditModal}
						onDelete={handleDelete}
					/>
				{/each}
			</div>
		</section>
	{/if}
</div>

<!-- Event Modal -->
<EventModal 
	isOpen={isModalOpen}
	event={editingEvent}
	onSave={handleSave}
	onCancel={closeModal}
/>

<style lang="scss">
	.events-page {
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
	
	.events-section {
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
	
	.events-grid {
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
		.events-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
