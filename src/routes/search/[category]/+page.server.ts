import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

// Valid categories that can be redirected
const VALID_CATEGORIES = ['jewelry', 'armor', 'laser', 'more'];

export const load: PageServerLoad = async ({ params }) => {
    const category = params.category;
    
    // Only redirect if it's a valid category
    if (VALID_CATEGORIES.includes(category)) {
        throw redirect(307, `/search#${category}`);
    }
    
    // Otherwise redirect to search home
    throw redirect(307, '/search');
};
