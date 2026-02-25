import { redirect } from '@sveltejs/kit';

// Valid categories that can be redirected
const VALID_CATEGORIES = ['jewelry', 'chainmail', 'laser', 'games'];

/** @type {import('./$types').PageServerLoad} */
export const load = async ({ params }) => {
    const category = params.category;
    
    // Only redirect if it's a valid category
    if (VALID_CATEGORIES.includes(category)) {
        throw redirect(307, `/search#${category}`);
    }
    
    // Otherwise redirect to search home
    throw redirect(307, '/search');
};
