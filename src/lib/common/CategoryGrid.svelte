<script lang="ts">
	const categories = [
		{
			name: 'Jewelry',
			slug: 'jewelry',
			icon: '💎',
			href: '/search#jewelry'
		},
		{
			name: 'Armor',
			slug: 'armor',
			icon: '🛡️',
			href: '/search#armor'
		},
		{
			name: 'Laser Engraved',
			slug: 'laser',
			icon: '✨',
			href: '/search#laser'
		},
		{
			name: 'More',
			slug: 'more',
			icon: '📦',
			href: '/search#more'
		}
	];
</script>

<section class="categories-grid">
	{#each categories as category}
		<a href={category.href} class="category-item">
			<div class="category-image">
				<span class="category-icon">{category.icon}</span>
			</div>
			<h4>{category.name}</h4>
		</a>
	{/each}
</section>

<style lang="scss">
	// Import only variables, not the full stylesheet
	@use '$lib/app.scss' as *;
	
	.categories-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: $spacing-lg;
		padding: $spacing-xl;
		max-width: $desktop-breakpoint;
		margin: 0 auto;
	}
	
	.category-item {
		background: $bg-panel;
		border: 1px solid $border-secondary;
		border-radius: $radius-lg;
		padding: $spacing-xl;
		text-align: center;
		cursor: pointer;
		transition: all $transition-normal;
		text-decoration: none;
		display: block;
		
		&:hover {
			transform: translateY(-4px);
			border-color: $accent-primary;
			box-shadow: $shadow-accent-sm;
			
			.category-image {
				background: linear-gradient(135deg, $accent-primary 0%, $accent-secondary 100%);
			}
		}
		
		h4 {
			color: $text-primary;
			font-size: 1.2rem;
			margin: $spacing-md 0 0;
			font-weight: 600;
		}
	}
	
	.category-image {
		width: 100%;
		height: 150px;
		background: linear-gradient(135deg, $border-primary 0%, $border-secondary 100%);
		border-radius: $radius-md;
		margin-bottom: $spacing-md;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all $transition-normal;
		
		.category-icon {
			font-size: 4rem;
			filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3));
		}
	}
	
	@media (max-width: $tablet-breakpoint) {
		.categories-grid {
			grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
			gap: $spacing-md;
			padding: $spacing-lg;
		}
		
		.category-image {
			height: 120px;
			
			.category-icon {
				font-size: 3rem;
			}
		}
	}
	
	@media (max-width: $mobile-breakpoint) {
		.categories-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}
</style>
