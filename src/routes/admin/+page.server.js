import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').Actions} */
export const actions = {
  logout: async ({ cookies }) => {
    // Clear the admin session cookie
    cookies.delete('admin_session', {
      path: '/'
    });
    
    // Redirect to login page
    throw redirect(303, '/login');
  }
};
