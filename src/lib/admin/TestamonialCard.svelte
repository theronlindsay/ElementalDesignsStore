<script lang="ts">
	interface Testamonial {
		id: string;
		name: string;
		text: string;
		stars?: string;
		image?: string;
		link?: string;
	}

	let {
		testimonial,
		editable = false,
		onEdit = undefined,
		onDelete = undefined
	}: {
		testimonial: Testamonial;
		editable?: boolean;
		onEdit?: ((id: string) => void) | undefined;
		onDelete?: ((id: string) => void) | undefined;
	} = $props();
</script>

<div class="testimonial-card theme-glass">
	{#if testimonial.image}
		<div class="testimonial-image">
			<img src={testimonial.image} alt={testimonial.name} />
		</div>
	{/if}

	<div class="testimonial-content">
		<div class="testimonial-header">
			<div class="testimonial-name">
				<i class="fas fa-user-circle"></i>
				<span>{testimonial.name}</span>
			</div>
			{#if editable && onEdit && onDelete}
				<div class="testimonial-actions">
					<button class="action-btn edit" onclick={() => onEdit?.(testimonial.id)} aria-label="Edit testimonial">
						<i class="fas fa-edit"></i>
					</button>
					<button class="action-btn delete" onclick={() => onDelete?.(testimonial.id)} aria-label="Delete testimonial">
						<i class="fas fa-trash"></i>
					</button>
				</div>
			{/if}
		</div>

		<p class="testimonial-text">{testimonial.text}</p>

		{#if testimonial.stars}
			<div class="testimonial-stars">
				{#each Array(Number(testimonial.stars)) as _, i}
					<i class="fas fa-star" style="color: gold;"></i>
				{/each}
			</div>
		{/if}

		{#if testimonial.link}
			<a href={testimonial.link} class="testimonial-link" target="_blank" rel="noopener noreferrer">
				View Source
				<i class="fas fa-arrow-right"></i>
			</a>
		{/if}
	</div>
</div>

<style lang="scss">
	// Testimonial card styles
	.testimonial-card {
		display: flex;
		flex-direction: column;
		overflow: hidden;
		transition: all 0.3s ease;
		&:hover {
			transform: translateY(-4px);
			box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3);
		}
	}

	.testimonial-image {
		width: 100%;
		height: 160px;
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

	.testimonial-content {
		padding: 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.testimonial-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.5rem;
	}

	.testimonial-name {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		color: var(--accent);
		font-size: 1.1rem;
		font-weight: 600;
	}

	.testimonial-actions {
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

	.testimonial-text {
		color: var(--text-primary);
		font-size: 1.1rem;
		margin: 0;
		line-height: 1.6;
	}

	.testimonial-stars {
		display: flex;
		gap: 0.15rem;
		margin-bottom: 0.5rem;
	}

	.testimonial-link {
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
		.testimonial-image {
			height: 120px;
		}
		.testimonial-content {
			padding: 0.75rem;
		}
		.testimonial-name {
			font-size: 1rem;
		}
		.testimonial-text {
			font-size: 1rem;
		}
	}
</style>
