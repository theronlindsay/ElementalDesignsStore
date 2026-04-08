import { fail, redirect, isRedirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

/** @type {import('./$types').Actions} */
export const actions = {
	default: async ({ request, cookies }) => {
		try {
			const data = await request.formData();
			const username = (data.get('username') ?? '').toString().trim();
			const password = (data.get('password') ?? '').toString();
			const remember = data.get('remember');

			if (!username || !password) {
				return fail(400, {
					message: 'Please enter both username and password.'
				});
			}

			// TODO: In production, check against hashed password in database
			// Prefer server-side env vars (ADMIN_...) but fall back to VITE_ values for local dev
			const validUsername = env.VITE_ADMIN_USERNAME || 'admin';
			const validPassword = env.VITE_ADMIN_PASSWORD || 'admin123';

			if (username === validUsername && password === validPassword) {
				const maxAge = remember ? 60 * 60 * 24 * 30 : 60 * 60 * 24; // 30 days or 24 hours
				const isProd = env.NODE_ENV === 'production';

				cookies.set('admin_session', 'authenticated', {
					path: '/',
					httpOnly: true,
					secure: isProd,
					sameSite: 'strict',
					...(isProd ? { domain: '.elementalchaindesigns.com' } : {}),
					maxAge
				});

				throw redirect(303, '/admin');
			}

			return fail(401, {
				message: 'Invalid username or password. Please try again.'
			});
		} catch (e) {
			if (isRedirect(e)) throw e;
			console.error('Admin login error', e);
			return fail(500, {
				message: 'Something went wrong. Please try again in a moment.'
			});
		}
	}
};
