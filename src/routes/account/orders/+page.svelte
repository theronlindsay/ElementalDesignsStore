<script>
	// TODO: Load orders from server
	const orders = [
		{
			id: 'ORD-001',
			date: 'November 5, 2024',
			total: '$149.99',
			status: 'Delivered',
			items: 3
		},
		{
			id: 'ORD-002',
			date: 'October 28, 2024',
			total: '$89.50',
			status: 'Delivered',
			items: 2
		},
		{
			id: 'ORD-003',
			date: 'October 15, 2024',
			total: '$234.00',
			status: 'Processing',
			items: 5
		}
	];

	function getStatusColor(status) {
		switch (status) {
			case 'Delivered':
				return 'delivered';
			case 'Processing':
				return 'processing';
			case 'Cancelled':
				return 'cancelled';
			default:
				return 'pending';
		}
	}
</script>

<div class="orders-container">
	<div class="orders-content">
		<h1>My Orders</h1>
		<p class="subtitle">View and manage all your orders</p>

		{#if orders.length > 0}
			<div class="orders-list">
				{#each orders as order (order.id)}
					<div class="order-card">
						<div class="order-header">
							<div class="order-id">
								<h3>{order.id}</h3>
								<p class="order-date">{order.date}</p>
							</div>
							<div class="order-status">
								<span class="status-badge {getStatusColor(order.status)}">
									{order.status}
								</span>
							</div>
						</div>

						<div class="order-details">
							<div class="detail-item">
								<span class="label">Items</span>
								<span class="value">{order.items}</span>
							</div>
							<div class="detail-item">
								<span class="label">Total</span>
								<span class="value">{order.total}</span>
							</div>
						</div>

						<button class="btn-secondary">View Details</button>
					</div>
				{/each}
			</div>
		{:else}
			<div class="empty-state">
				<p>You haven't placed any orders yet.</p>
				<a href="/search" class="btn-primary">Start Shopping</a>
			</div>
		{/if}
	</div>
</div>

<style lang="scss">
	.orders-container {
		display: flex;
		justify-content: center;
		padding: 2rem 1rem;
		min-height: calc(100vh - 200px);
	}

	.orders-content {
		width: 100%;
		max-width: 700px;

		h1 {
			margin: 0 0 0.5rem 0;
			font-size: 2rem;
			color: #f3f4f6;
		}

		.subtitle {
			margin: 0 0 2rem 0;
			color: var(--muted-2);
			font-size: 0.95rem;
		}

		.orders-list {
			display: flex;
			flex-direction: column;
			gap: 1.5rem;
		}

		.order-card {
			background: var(--panel-bg);
			border: 1px solid var(--panel-border);
			border-radius: 12px;
			padding: 1.5rem;
			backdrop-filter: blur(10px);
			transition: all 0.2s ease;

			&:hover {
				border-color: var(--accent);
				box-shadow: 0 0 20px rgba(167, 139, 250, 0.1);
			}
		}

		.order-header {
			display: flex;
			justify-content: space-between;
			align-items: flex-start;
			margin-bottom: 1rem;
			gap: 1rem;
		}

		.order-id {
			h3 {
				margin: 0;
				font-size: 1.1rem;
				color: #e8e4f3;
				font-weight: 600;
			}

			.order-date {
				margin: 0.25rem 0 0 0;
				color: var(--muted-2);
				font-size: 0.85rem;
			}
		}

		.order-status {
			.status-badge {
				display: inline-block;
				padding: 0.4rem 0.8rem;
				border-radius: 20px;
				font-size: 0.75rem;
				font-weight: 600;
				text-transform: uppercase;
				letter-spacing: 0.05em;

				&.delivered {
					background: rgba(34, 197, 94, 0.15);
					color: #86efac;
					border: 1px solid rgba(34, 197, 94, 0.3);
				}

				&.processing {
					background: rgba(251, 146, 60, 0.15);
					color: #fdba74;
					border: 1px solid rgba(251, 146, 60, 0.3);
				}

				&.cancelled {
					background: rgba(239, 68, 68, 0.15);
					color: #fca5a5;
					border: 1px solid rgba(239, 68, 68, 0.3);
				}

				&.pending {
					background: rgba(167, 139, 250, 0.15);
					color: #d8b4fe;
					border: 1px solid rgba(167, 139, 250, 0.3);
				}
			}
		}

		.order-details {
			display: grid;
			grid-template-columns: 1fr 1fr;
			gap: 1rem;
			margin-bottom: 1rem;
			padding: 1rem 0;
			border-top: 1px solid var(--panel-border);
			border-bottom: 1px solid var(--panel-border);
		}

		.detail-item {
			display: flex;
			flex-direction: column;
			gap: 0.25rem;

			.label {
				color: var(--muted-2);
				font-size: 0.8rem;
				font-weight: 600;
				text-transform: uppercase;
				letter-spacing: 0.05em;
			}

			.value {
				color: #e8e4f3;
				font-size: 1rem;
				font-weight: 600;
			}
		}

		.btn-secondary {
			width: 100%;
			padding: 0.75rem 1rem;
			background: transparent;
			border: 1px solid var(--panel-border);
			border-radius: 8px;
			color: #e8e4f3;
			font-weight: 600;
			cursor: pointer;
			transition: all 0.2s ease;

			&:hover {
				background: rgba(167, 139, 250, 0.1);
				border-color: var(--accent);
				color: var(--accent);
			}
		}

		.empty-state {
			text-align: center;
			padding: 3rem 1rem;
			background: var(--panel-bg);
			border: 1px solid var(--panel-border);
			border-radius: 12px;
			backdrop-filter: blur(10px);

			p {
				margin: 0 0 1.5rem 0;
				color: var(--muted-2);
				font-size: 1rem;
			}

			.btn-primary {
				display: inline-block;
				padding: 0.75rem 1.5rem;
				background: linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%);
				border: none;
				border-radius: 8px;
				color: #fff;
				font-weight: 600;
				text-decoration: none;
				cursor: pointer;
				transition: all 0.2s ease;

				&:hover {
					transform: translateY(-2px);
					box-shadow: 0 10px 20px rgba(167, 139, 250, 0.3);
				}
			}
		}
	}

	@media (max-width: 600px) {
		.orders-container {
			padding: 1rem;
			min-height: calc(100vh - 150px);
		}

		.orders-content {
			h1 {
				font-size: 1.5rem;
			}

			.order-details {
				grid-template-columns: 1fr;
			}
		}
	}
</style>
