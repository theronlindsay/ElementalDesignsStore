<script>
	let { event, editable = false, onEdit = undefined, onDelete = undefined } = $props();

	// Format date for display
	function formatDate(dateString) {
		if (!dateString) return '';
		// Append T12:00:00 to treat YYYY-MM-DD as local noon instead of UTC midnight, preventing timezone offset bugs
		const parsedString = dateString.includes('T') ? dateString : `${dateString}T12:00:00`;
		const date = new Date(parsedString);
		return date.toLocaleDateString('en-US', {
			weekday: 'short',
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}

	function formatTime(timeString) {
		if (!timeString) return '';
		const [hours, minutes] = timeString.split(':');
		const h = parseInt(hours, 10);
		const ampm = h >= 12 ? 'PM' : 'AM';
		const h12 = h % 12 || 12;
		return `${h12}:${minutes} ${ampm}`;
	}

	function getShortDateRange(e) {
		if (e.days && e.days.length > 0) {
			const sortedDays = [...e.days].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
			const first = sortedDays[0];
			const last = sortedDays[sortedDays.length - 1];
			
			if (first.date === last.date) {
				return formatDate(first.date);
			} else {
				const firstD = new Date(first.date.includes('T') ? first.date : `${first.date}T12:00:00`);
				const lastD = new Date(last.date.includes('T') ? last.date : `${last.date}T12:00:00`);
				
				const formatOpts = { month: 'short', day: 'numeric' };
				const firstStr = firstD.toLocaleDateString('en-US', formatOpts);
				const lastStr = lastD.toLocaleDateString('en-US', formatOpts);
				const year = lastD.getFullYear();
				
				return `${firstStr} - ${lastStr}, ${year}`;
			}
		}
		return formatDate(e.date);
	}
	
	let hasDetails = $derived(event.days && (event.days.length > 1 || event.days.some(d => d.startTime || d.endTime)));

	function renderHtml(text) {
		if (!text) return '';
		if (text.includes('<')) return text;
		return `<p>${text}</p>`;
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
			<div class="event-date-badge" class:has-dropdown={hasDetails} tabindex={hasDetails ? 0 : -1}>
				<i class="fas fa-calendar-alt"></i>
				<span>{getShortDateRange(event)}</span>
				
				{#if hasDetails}
					<div class="dates-dropdown">
						{#each [...event.days].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()) as day}
							<div class="day-row">
								<span class="day-date">{formatDate(day.date)}</span>
								{#if day.startTime || day.endTime}
									<span class="day-time">
										{#if day.startTime}{formatTime(day.startTime)}{/if}
										{#if day.startTime && day.endTime} - {/if}
										{#if day.endTime}{formatTime(day.endTime)}{/if}
									</span>
								{/if}
							</div>
						{/each}
					</div>
				{/if}
			</div>

			{#if editable && onEdit && onDelete}
				<div class="event-actions">
					<button
						class="action-btn edit"
						onclick={() => onEdit?.(event.id)}
						aria-label="Edit event"
					>
						<i class="fas fa-edit"></i>
					</button>
					<button
						class="action-btn delete"
						onclick={() => onDelete?.(event.id)}
						aria-label="Delete event"
					>
						<i class="fas fa-trash"></i>
					</button>
				</div>
			{/if}
		</div>

		<h3 class="event-title">{event.title}</h3>

		<div class="event-description rich-content">{@html renderHtml(event.description)}</div>

		{#if event.location}
			<div class="event-location-section">
				<div class="event-location" title={event.address}>
					<i class="fas fa-map-marker-alt"></i>
					<span>{event.location}</span>
					{#if event.address}
						<span class="location-address">{event.address}</span>
					{/if}
				</div>
				{#if event.mapsLink}
					<a
						href={event.mapsLink}
						class="directions-btn"
						target="_blank"
						rel="noopener noreferrer"
						aria-label="Get directions"
					>
						<i class="fas fa-directions"></i>
						Directions
					</a>
				{/if}
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

		:global(p) {
			margin: 0 0 0.5rem;
			&:last-child { margin-bottom: 0; }
		}
		:global(a) { color: var(--accent); }
	}

	.event-location-section {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	.event-location {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		color: var(--muted-2);
		font-size: 0.9rem;
		position: relative;
		cursor: help;

		i {
			color: var(--accent);
		}
	}

	.location-address {
		position: absolute;
		bottom: 100%;
		left: 0;
		margin-bottom: 0.5rem;
		padding: 0.5rem 0.75rem;
		background: var(--bg-secondary);
		border: 1px solid var(--border-primary);
		border-radius: 6px;
		color: var(--text-secondary);
		font-size: 0.85rem;
		white-space: nowrap;
		opacity: 0;
		pointer-events: none;
		transition: opacity 0.2s ease;
		z-index: 100;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.event-location:hover .location-address {
		opacity: 1;
		pointer-events: auto;
	}

	.directions-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.75rem;
		background: rgba(167, 139, 250, 0.1);
		border: 1px solid var(--accent);
		border-radius: 6px;
		color: var(--accent);
		text-decoration: none;
		font-size: 0.85rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;

		i {
			font-size: 0.8rem;
		}

		&:hover {
			background: rgba(167, 139, 250, 0.2);
			border-color: var(--accent-2);
			color: var(--accent-2);
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

	.event-date-badge {
		position: relative;
		cursor: default;
		
		&.has-dropdown {
			cursor: help;
		}
	}
	
	.dates-dropdown {
		position: absolute;
		top: 100%;
		left: 0;
		margin-top: 0.5rem;
		padding: 1rem;
		background: var(--bg-secondary);
		border: 1px solid var(--border-primary);
		border-radius: 8px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		z-index: 100;
		opacity: 0;
		pointer-events: none;
		transition: opacity 0.2s ease, transform 0.2s ease;
		transform: translateY(-5px);
		min-width: max-content;
		text-align: left;
	}

	.event-date-badge:hover .dates-dropdown,
	.event-date-badge:focus-within .dates-dropdown {
		opacity: 1;
		pointer-events: auto;
		transform: translateY(0);
	}
	
	.day-row {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		padding-bottom: 0.5rem;
		margin-bottom: 0.5rem;
		border-bottom: 1px solid var(--border-secondary);
		
		&:last-child {
			padding-bottom: 0;
			margin-bottom: 0;
			border-bottom: none;
		}
	}
	
	.day-date {
		color: var(--text-primary);
		font-weight: 600;
		font-size: 0.9rem;
	}
	
	.day-time {
		color: var(--text-secondary);
		font-size: 0.85rem;
		display: flex;
		align-items: center;
		gap: 0.35rem;
		
		&::before {
			content: '\f017';
			font-family: 'Font Awesome 5 Free';
			font-weight: 400;
			color: var(--muted);
			font-size: 0.8rem;
		}
	}

</style>
