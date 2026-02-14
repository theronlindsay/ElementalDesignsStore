import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export const load = async () => {
	redirect(307, '/account/profile');
};
