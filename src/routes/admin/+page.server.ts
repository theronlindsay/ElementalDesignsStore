import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions = {
  logout: async ({ cookies }) => {
    // Clear the admin session cookie
    cookies.delete('admin_session', {
      path: '/'
    });
    
    // Redirect to login page
    throw redirect(303, '/login');
  }
} satisfies Actions;