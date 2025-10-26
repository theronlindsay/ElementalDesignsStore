import { getAllCategories, getItemsByCategoryIncludingSubcategories, getAllItems } from '$lib/square';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    try {
        // Jewelry category ID
        const categoryId = 'GBU37Q2KSWR7QHCCA2SRTZB3';
        
        console.log('=== Fetching all categories ===');
        const categories = await getAllCategories();
        
        console.log(`=== Getting items for category ${categoryId} and all subcategories ===`);
        
        // Get items from main category AND all subcategories
        const jewelryItems = await getItemsByCategoryIncludingSubcategories(categoryId);
        
        console.log(`Total jewelry items found: ${jewelryItems.length}`);
        
        return {
            items: jewelryItems,
            categories: categories, // For debugging
            success: true
        };
    } catch (error) {
        console.error('Error loading jewelry items:', error);
        return {
            items: [],
            success: false,
            error: error instanceof Error ? error.message : 'Failed to load jewelry items'
        };
    }
};
