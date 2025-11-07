import { getSubcategories, getItemsByCategoryIncludingSubcategories, getAllItems } from '$lib/square';
import type { LayoutServerLoad } from './$types';

// Define category IDs for each product type
const CATEGORY_IDS: Record<string, string> = {
    jewelry: 'GBU37Q2KSWR7QHCCA2SRTZB3',
    armor: 'NKJL2C6NSWFX6ATLLVEMW5CZ',
    laser: 'LLAQJ5FM7NTM6FYP4NGDM23A'
};

// Define display names for each category
const CATEGORY_NAMES: Record<string, string> = {
    jewelry: 'Jewelry',
    armor: 'Armor',
    laser: 'Laser Cut Products',
    more: 'Other Products'
};

export const load: LayoutServerLoad = async () => {
    // Fetch all categories and their items in parallel
    const allCategoriesPromise = (async () => {
        try {
            const categoryEntries = Object.entries(CATEGORY_IDS);
            
            // Fetch all categories and all items in parallel
            const [categoryResults, allItems] = await Promise.all([
                Promise.all(
                    categoryEntries.map(async ([slug, categoryId]) => {
                        try {
                            console.log(`Fetching ${slug} data...`);
                            const [subcategories, items] = await Promise.all([
                                getSubcategories(categoryId),
                                getItemsByCategoryIncludingSubcategories(categoryId)
                            ]);
                            
                            return {
                                slug,
                                categoryId,
                                name: CATEGORY_NAMES[slug],
                                subcategories,
                                items,
                                itemIds: new Set(items.map((item: any) => item.id)), // Track IDs for filtering
                                success: true as const
                            };
                        } catch (err) {
                            console.error(`Error loading ${slug}:`, err);
                            return {
                                slug,
                                categoryId,
                                name: CATEGORY_NAMES[slug],
                                subcategories: [],
                                items: [],
                                itemIds: new Set(),
                                success: false as const,
                                error: err instanceof Error ? err.message : `Failed to load ${slug}`
                            };
                        }
                    })
                ),
                getAllItems()
            ]);
            
            // Convert array to object keyed by slug
            const categoriesData: Record<string, any> = {};
            categoryResults.forEach(result => {
                categoriesData[result.slug] = result;
            });
            
            // Create "more" category with items not in jewelry, armor, or laser
            const allCategorizedItemIds = new Set([
                ...Array.from(categoriesData.jewelry?.itemIds || []),
                ...Array.from(categoriesData.armor?.itemIds || []),
                ...Array.from(categoriesData.laser?.itemIds || [])
            ]);
            
            const uncategorizedItems = allItems.filter((item: any) => 
                !allCategorizedItemIds.has(item.id)
            );
            
            console.log(`Found ${uncategorizedItems.length} uncategorized items for "more" category`);
            
            categoriesData.more = {
                slug: 'more',
                categoryId: null,
                name: CATEGORY_NAMES.more,
                subcategories: [],
                items: uncategorizedItems,
                itemIds: new Set(uncategorizedItems.map((item: any) => item.id)),
                success: true as const
            };
            
            return categoriesData;
        } catch (err) {
            console.error('Error loading categories:', err);
            return {};
        }
    })();
    
    return {
        allCategoriesPromise
    };
};
