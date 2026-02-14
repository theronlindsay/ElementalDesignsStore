<script>
	// TODO: Load user profile data from server
	const user = {
		name: 'John Doe',
		email: 'john@example.com',
		phone: '(555) 123-4567',
		address: '123 Main Street, Anytown, ST 12345',
		joinDate: 'January 15, 2024'
	};

	let isEditing = $state(false);
	let formData = $state({ ...user });

	function handleEdit() {
		isEditing = true;
	}

	function handleSave(event) {
		event.preventDefault();
		// TODO: Implement profile update logic
		console.log('Profile updated:', formData);
		isEditing = false;
	}

	function handleCancel() {
		formData = { ...user };
		isEditing = false;
	}
</script>

<div class="profile-container">
	<div class="profile-content">
		<h1>My Profile</h1>

		{#if !isEditing}
			<!-- View Mode -->
			<div class="profile-info">
				<div class="info-section">
					<h2>Personal Information</h2>
					<div class="info-grid">
						<div class="info-item">
							<span>Name</span>
							<p>{user.name}</p>
						</div>
						<div class="info-item">
							<span>Email</span>
							<p>{user.email}</p>
						</div>
						<div class="info-item">
							<span>Phone</span>
							<p>{user.phone}</p>
						</div>
						<div class="info-item">
							<span>Address</span>
							<p>{user.address}</p>
						</div>
						<div class="info-item">
							<span>Member Since</span>
							<p>{user.joinDate}</p>
						</div>
					</div>
				</div>

				<button class="btn-primary" onclick={handleEdit}>Edit Profile</button>
			</div>
		{:else}
			<!-- Edit Mode -->
			<form onsubmit={handleSave} class="edit-form">
				<div class="form-group">
					<label for="name">Full Name</label>
					<input
						id="name"
						type="text"
						bind:value={formData.name}
						required
					/>
				</div>

				<div class="form-group">
					<label for="email">Email Address</label>
					<input
						id="email"
						type="email"
						bind:value={formData.email}
						required
					/>
				</div>

				<div class="form-group">
					<label for="phone">Phone Number</label>
					<input
						id="phone"
						type="tel"
						bind:value={formData.phone}
						required
					/>
				</div>

				<div class="form-group">
					<label for="address">Address</label>
					<textarea
						id="address"
						bind:value={formData.address}
						required
					></textarea>
				</div>

				<div class="button-group">
					<button type="submit" class="btn-primary">Save Changes</button>
					<button type="button" class="btn-secondary" onclick={handleCancel}>Cancel</button>
				</div>
			</form>
		{/if}
	</div>
</div>

<style lang="scss">
	.profile-container {
		display: flex;
		justify-content: center;
		padding: 2rem 1rem;
		min-height: calc(100vh - 200px);
	}

	.profile-content {
		width: 100%;
		max-width: 600px;
		background: var(--panel-bg);
		border: 1px solid var(--panel-border);
		border-radius: 16px;
		padding: 2rem;
		backdrop-filter: blur(10px);

		h1 {
			margin: 0 0 2rem 0;
			font-size: 2rem;
			color: #f3f4f6;
		}

		.profile-info {
			display: flex;
			flex-direction: column;
			gap: 2rem;
		}

		.info-section {
			h2 {
				margin: 0 0 1rem 0;
				font-size: 1.25rem;
				color: #e8e4f3;
			}
		}

		.info-grid {
			display: grid;
			grid-template-columns: 1fr 1fr;
			gap: 1.5rem;
		}

		.info-item {
			display: flex;
			flex-direction: column;
			gap: 0.5rem;

			span {
				color: var(--muted-2);
				font-size: 0.85rem;
				font-weight: 600;
				text-transform: uppercase;
				letter-spacing: 0.05em;
			}

			p {
				margin: 0;
				color: #e8e4f3;
				font-size: 1rem;
			}
		}

		.edit-form {
			display: flex;
			flex-direction: column;
			gap: 1.5rem;
		}

		.form-group {
			display: flex;
			flex-direction: column;
			gap: 0.5rem;

			label {
				color: #e8e4f3;
				font-weight: 600;
				font-size: 0.95rem;
			}

			input,
			textarea {
				padding: 0.75rem 1rem;
				background: var(--input-bg, rgba(255, 255, 255, 0.05));
				border: 1px solid var(--panel-border);
				border-radius: 8px;
				color: #e8e4f3;
				font-size: 1rem;
				font-family: inherit;
				transition: all 0.2s ease;

				&::placeholder {
					color: var(--muted-2);
				}

				&:focus {
					outline: none;
					border-color: var(--accent);
					box-shadow: 0 0 0 2px rgba(167, 139, 250, 0.2);
				}
			}

			textarea {
				resize: vertical;
				min-height: 100px;
			}
		}

		.button-group {
			display: flex;
			gap: 1rem;
			margin-top: 1rem;
		}

		.btn-primary,
		.btn-secondary {
			padding: 0.75rem 1.5rem;
			border: none;
			border-radius: 8px;
			font-weight: 600;
			cursor: pointer;
			transition: all 0.2s ease;
			flex: 1;
		}

		.btn-primary {
			background: linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%);
			color: #fff;

			&:hover {
				transform: translateY(-2px);
				box-shadow: 0 10px 20px rgba(167, 139, 250, 0.3);
			}

			&:active {
				transform: translateY(0);
			}
		}

		.btn-secondary {
			background: transparent;
			border: 1px solid var(--panel-border);
			color: #e8e4f3;

			&:hover {
				background: rgba(167, 139, 250, 0.1);
				border-color: var(--accent);
			}
		}
	}

	@media (max-width: 600px) {
		.profile-container {
			padding: 1rem;
			min-height: calc(100vh - 150px);
		}

		.profile-content {
			padding: 1.5rem;

			h1 {
				font-size: 1.5rem;
			}

			.info-grid {
				grid-template-columns: 1fr;
			}
		}
	}
</style>
