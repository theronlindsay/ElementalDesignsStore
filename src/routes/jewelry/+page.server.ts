import { getAllCategories, getItemsByCategoryIncludingSubcategories, getAllItems, getSubcategories } from '$lib/square';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    // Jewelry category ID
    const categoryId = 'GBU37Q2KSWR7QHCCA2SRTZB3';
    
    // Return a promise that will be streamed to the client
    // This allows the page to render immediately while data loads
    const itemsPromise = (async () => {
        try {
            console.log('=== Fetching jewelry categories ===');
            // Only get subcategories of the jewelry category, not all categories
            const jewelrySubcategories = await getSubcategories(categoryId);
            
            console.log(`=== Getting items for category ${categoryId} and all subcategories ===`);
            
            // Get items from main category AND all subcategories
            const jewelryItems = await getItemsByCategoryIncludingSubcategories(categoryId);
            
            console.log(`Total jewelry items found: ${jewelryItems.length}`);
            console.log(`Jewelry subcategories found: ${jewelrySubcategories.length}`);
            
            return {
                items: jewelryItems,
                categories: jewelrySubcategories, // Only jewelry subcategories
                success: true as const
            };
        } catch (error) {
            console.error('Error loading jewelry items:', error);
            return {
                items: [],
                categories: [],
                success: false as const,
                error: error instanceof Error ? error.message : 'Failed to load jewelry items'
            };
        }
    })();
    
    // Return the promise - streams to the client PAGE as PageData
    return {
        itemsPromise
    };
};
