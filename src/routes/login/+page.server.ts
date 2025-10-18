import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions = {
	default: async ({ request, cookies }) => {
		const data = await request.formData();
		const username = data.get('username');
		const password = data.get('password');
		const remember = data.get('remember');
		
		// TODO: In production, check against hashed password in database
		// For now, using environment variables
		const validUsername = import.meta.env.VITE_ADMIN_USERNAME || 'admin';
		const validPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';
		
		if (username === validUsername && password === validPassword) {
			// Set secure HTTP-only cookie
			const maxAge = remember ? 60 * 60 * 24 * 30 : 60 * 60 * 24; // 30 days or 24 hours
			
			cookies.set('admin_session', 'authenticated', {
				path: '/',
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'strict',
				maxAge
			});
			
			throw redirect(303, '/admin');
		}
		
		return fail(401, { incorrect: true });
	}
} satisfies Actions;
