import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').LayoutServerLoad} */
export const load = async ({ cookies }) => {
  const session = cookies.get('admin_session');
  
  // If no valid session, redirect to login
  if (!session || session !== 'authenticated') {
    throw redirect(303, '/login');
  }
  
  // Session valid, allow access to admin area
  return {
    authenticated: true
  };
};
