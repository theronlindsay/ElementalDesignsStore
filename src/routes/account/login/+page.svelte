<script>
	import { goto } from '$app/navigation';

	let email = $state('');
	let password = $state('');
	let error = $state('');

	function handleLogin(event) {
		event.preventDefault();
		if (!email || !password) {
			error = 'Please fill in all fields';
			return;
		}
		// TODO: Implement actual login logic
		console.log('Login attempted:', { email, password });
		goto('/account/profile');
	}
</script>

<div class="account-container">
	<div class="account-content">
		<h1>Login to Your Account</h1>
		<p class="subtitle">Sign in to access your orders and profile</p>

		{#if error}
			<div class="error-message">{error}</div>
		{/if}

		<form onsubmit={handleLogin} class="login-form">
			<div class="form-group">
				<label for="email">Email Address</label>
				<input
					id="email"
					type="email"
					placeholder="Enter your email"
					bind:value={email}
					required
				/>
			</div>

			<div class="form-group">
				<label for="password">Password</label>
				<input
					id="password"
					type="password"
					placeholder="Enter your password"
					bind:value={password}
					required
				/>
			</div>

			<button type="submit" class="btn-primary">Sign In</button>
		</form>

		<p class="signup-link">
			Don't have an account? <a href="/account/register">Create one here</a>
		</p>
	</div>
</div>

<style lang="scss">
	.account-container {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: calc(100vh - 200px);
		padding: 2rem 1rem;
	}

	.account-content {
		width: 100%;
		max-width: 400px;
		background: var(--panel-bg);
		border: 1px solid var(--panel-border);
		border-radius: 16px;
		padding: 2rem;
		backdrop-filter: blur(10px);

		h1 {
			margin: 0 0 0.5rem 0;
			font-size: 1.75rem;
			color: #f3f4f6;
		}

		.subtitle {
			margin: 0 0 1.5rem 0;
			color: var(--muted-2);
			font-size: 0.95rem;
		}

		.error-message {
			background: rgba(239, 68, 68, 0.1);
			border: 1px solid rgba(239, 68, 68, 0.5);
			color: #fca5a5;
			padding: 0.75rem 1rem;
			border-radius: 8px;
			margin-bottom: 1rem;
			font-size: 0.9rem;
		}

		.login-form {
			display: flex;
			flex-direction: column;
			gap: 1.25rem;
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

			input {
				padding: 0.75rem 1rem;
				background: var(--input-bg, rgba(255, 255, 255, 0.05));
				border: 1px solid var(--panel-border);
				border-radius: 8px;
				color: #e8e4f3;
				font-size: 1rem;
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
		}

		.btn-primary {
			padding: 0.75rem 1rem;
			background: linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%);
			border: none;
			border-radius: 8px;
			color: #fff;
			font-weight: 600;
			cursor: pointer;
			transition: all 0.2s ease;
			margin-top: 0.5rem;

			&:hover {
				transform: translateY(-2px);
				box-shadow: 0 10px 20px rgba(167, 139, 250, 0.3);
			}

			&:active {
				transform: translateY(0);
			}
		}

		.signup-link {
			text-align: center;
			margin-top: 1.5rem;
			color: var(--muted);
			font-size: 0.9rem;

			a {
				color: var(--accent);
				text-decoration: none;
				font-weight: 600;
				transition: color 0.2s ease;

				&:hover {
					color: var(--accent-2);
				}
			}
		}
	}

	@media (max-width: 450px) {
		.account-container {
			min-height: calc(100vh - 150px);
			padding: 1rem;
		}

		.account-content {
			padding: 1.5rem;

			h1 {
				font-size: 1.5rem;
			}
		}
	}
</style>
