<script lang="ts">
	import { Button, Input, Label, FormGroup } from '$lib';
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';
	
	export let form: ActionData;
</script>

<svelte:head>
	<title>Admin Login - Elemental Designs</title>
</svelte:head>

<main class="login-page">
	<div class="login-container">
		<div class="login-card theme-glass">
			<!-- Logo/Header -->
			<div class="login-header">
				<div class="logo-container">
					<i class="fas fa-shield-alt"></i>
				</div>
				<h1 class="login-title">Admin Login</h1>
				<p class="login-subtitle">Enter your credentials to access the admin panel</p>
			</div>
			
			<!-- Login Form -->
			<form method="POST" use:enhance class="login-form">
				<FormGroup>
					<Label htmlFor="username" required>Username</Label>
					<Input
						type="text"
						name="username"
						placeholder="Enter your username"
						required
						ariaLabel="Username"
						autocomplete="username"
					/>
				</FormGroup>
				
				<FormGroup>
					<Label htmlFor="password" required>Password</Label>
					<Input
						type="password"
						name="password"
						placeholder="Enter your password"
						required
						ariaLabel="Password"
						autocomplete="current-password"
					/>
				</FormGroup>
				
				<!-- Error Message -->
				{#if form?.incorrect}
					<div class="error-message">
						<i class="fas fa-exclamation-circle"></i>
						<span>Invalid credentials. Please try again.</span>
					</div>
				{/if}
				
				<!-- Remember Me (Optional) -->
				<div class="remember-me">
					<label class="checkbox-label">
						<input type="checkbox" name="remember" />
						<span>Remember me for 30 days</span>
					</label>
				</div>
				
				<!-- Submit Button -->
				<Button type="submit" variant="primary" className="login-button">
					<i class="fas fa-sign-in-alt"></i>
					<span>Sign In</span>
				</Button>
			</form>
			
			<!-- Footer Info -->
			<div class="login-footer">
				<p class="footer-text">
					<i class="fas fa-lock"></i>
					Secure authentication
				</p>
			</div>
		</div>
		
		<!-- Back to Store Link -->
		<a href="/" class="back-link">
			<i class="fas fa-arrow-left"></i>
			Back to Store
		</a>
	</div>
</main>

<style lang="scss">
	.login-page {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem;
		margin-top: -1rem;
		background: var(--bg-primary);
	}
	
	.login-container {
		width: 100%;
		max-width: 440px;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}
	
	.login-card {
		padding: 3rem;
		width: 100%;
	}
	
	.login-header {
		text-align: center;
		margin-bottom: 2.5rem;
	}
	
	.logo-container {
		width: 80px;
		height: 80px;
		margin: 0 auto 1.5rem;
		background: linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%);
		border-radius: 20px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 2rem;
		color: white;
		box-shadow: 0 8px 20px rgba(167, 139, 250, 0.3);
	}
	
	.login-title {
		color: var(--text-primary);
		font-size: 1.75rem;
		font-weight: 700;
		margin: 0 0 0.5rem 0;
	}
	
	.login-subtitle {
		color: var(--muted);
		font-size: 0.95rem;
		margin: 0;
	}
	
	.login-form {
		display: flex;
		flex-direction: column;
	}
	
	.error-message {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.875rem 1rem;
		background: rgba(239, 68, 68, 0.1);
		border: 1px solid rgba(239, 68, 68, 0.3);
		border-radius: 8px;
		color: #fca5a5;
		font-size: 0.9rem;
		margin-bottom: 1.5rem;
		
		i {
			font-size: 1.1rem;
		}
	}
	
	.remember-me {
		margin-bottom: 1.5rem;
	}
	
	.checkbox-label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		color: var(--text-secondary);
		font-size: 0.9rem;
		cursor: pointer;
		
		input[type="checkbox"] {
			width: 18px;
			height: 18px;
			border-radius: 4px;
			border: 1px solid var(--border-secondary);
			background: var(--bg-secondary);
			cursor: pointer;
			accent-color: var(--accent);
		}
		
		&:hover {
			color: var(--text-primary);
		}
	}
	
	:global(.login-button) {
		width: 100%;
		padding: 1rem;
		justify-content: center;
		font-size: 1rem;
		font-weight: 600;
	}
	
	.login-footer {
		margin-top: 2rem;
		text-align: center;
		padding-top: 1.5rem;
		border-top: 1px solid var(--border-primary);
	}
	
	.footer-text {
		color: var(--muted-2);
		font-size: 0.85rem;
		margin: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		
		i {
			color: var(--accent);
		}
	}
	
	.back-link {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		color: var(--muted);
		text-decoration: none;
		font-size: 0.95rem;
		transition: all 0.3s ease;
		
		&:hover {
			color: var(--accent);
			transform: translateX(-2px);
		}
	}
	
	@media (max-width: 500px) {
		.login-page {
			padding: 1rem;
		}
		
		.login-card {
			padding: 2rem 1.5rem;
		}
		
		.logo-container {
			width: 60px;
			height: 60px;
			font-size: 1.5rem;
		}
		
		.login-title {
			font-size: 1.5rem;
		}
	}
</style>
