<script lang="ts">
	interface Event {
		id: string;
		title: string;
		description: string;
		date: string;
		location?: string;
		image?: string;
		link?: string;
	}
	
	let {
		event,
		editable = false,
		onEdit = undefined,
		onDelete = undefined
	}: {
		event: Event;
		editable?: boolean;
		onEdit?: ((id: string) => void) | undefined;
		onDelete?: ((id: string) => void) | undefined;
	} = $props();
	
	// Format date for display
	function formatDate(dateString: string) {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', { 
			weekday: 'short', 
			year: 'numeric', 
			month: 'short', 
			day: 'numeric' 
		});
	}
</script>

<div class="event-card theme-glass">
	{#if event.image}
		<div class="event-image">
			<img src={event.image} alt={event.title} />
		</div>
	{/if}
	
	<div class="event-content">
		<div class="event-header">
			<div class="event-date-badge">
				<i class="fas fa-calendar-alt"></i>
				<span>{formatDate(event.date)}</span>
			</div>
			
			{#if editable && onEdit && onDelete}
				<div class="event-actions">
					<button class="action-btn edit" onclick={() => onEdit?.(event.id)} aria-label="Edit event">
						<i class="fas fa-edit"></i>
					</button>
					<button class="action-btn delete" onclick={() => onDelete?.(event.id)} aria-label="Delete event">
						<i class="fas fa-trash"></i>
					</button>
				</div>
			{/if}
		</div>
		
		<h3 class="event-title">{event.title}</h3>
		
		<p class="event-description">{event.description}</p>
		
		{#if event.location}
			<div class="event-location">
				<i class="fas fa-map-marker-alt"></i>
				<span>{event.location}</span>
			</div>
		{/if}
		
		{#if event.link}
			<a href={event.link} class="event-link" target="_blank" rel="noopener noreferrer">
				Learn More
				<i class="fas fa-arrow-right"></i>
			</a>
		{/if}
	</div>
</div>

<style lang="scss">
	.event-card {
		display: flex;
		flex-direction: column;
		overflow: hidden;
		transition: all 0.3s ease;
		
		&:hover {
			transform: translateY(-4px);
			box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3);
		}
	}
	
	.event-image {
		width: 100%;
		height: 200px;
		overflow: hidden;
		background: var(--border-primary);
		
		img {
			width: 100%;
			height: 100%;
			object-fit: cover;
			transition: transform 0.3s ease;
		}
		
		&:hover img {
			transform: scale(1.05);
		}
	}
	
	.event-content {
		padding: 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	
	.event-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.5rem;
	}
	
	.event-date-badge {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		background: rgba(167, 139, 250, 0.1);
		border: 1px solid var(--accent);
		border-radius: 8px;
		color: var(--accent);
		font-size: 0.85rem;
		font-weight: 600;
		
		i {
			font-size: 0.9rem;
		}
	}
	
	.event-actions {
		display: flex;
		gap: 0.5rem;
	}
	
	.action-btn {
		width: 32px;
		height: 32px;
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
		
		&.delete:hover {
			border-color: #ef4444;
			color: #ef4444;
			background: rgba(239, 68, 68, 0.1);
		}
	}
	
	.event-title {
		color: var(--text-primary);
		font-size: 1.5rem;
		font-weight: 700;
		margin: 0;
		line-height: 1.3;
	}
	
	.event-description {
		color: var(--muted);
		margin: 0;
		line-height: 1.6;
	}
	
	.event-location {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		color: var(--muted-2);
		font-size: 0.9rem;
		
		i {
			color: var(--accent);
		}
	}
	
	.event-link {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		color: var(--accent);
		text-decoration: none;
		font-weight: 600;
		margin-top: 0.5rem;
		transition: all 0.2s ease;
		
		&:hover {
			gap: 0.75rem;
			color: var(--accent-2);
		}
		
		i {
			font-size: 0.85rem;
		}
	}
	
	@media (max-width: 768px) {
		.event-image {
			height: 160px;
		}
		
		.event-content {
			padding: 1rem;
		}
		
		.event-title {
			font-size: 1.25rem;
		}
	}
</style>
