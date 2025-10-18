import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies }) => {
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