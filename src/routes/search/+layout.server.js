import { getSubcategories, getItemsByCategoryIncludingSubcategories, getAllItems } from '$lib/square';

// Define category IDs for each product type
const CATEGORY_IDS = {
    jewelry: 'GBU37Q2KSWR7QHCCA2SRTZB3',
    chainmail: '',
    laser: 'LLAQJ5FM7NTM6FYP4NGDM23A',
    games: ''
};

// Define display names for each category
const CATEGORY_NAMES = {
    jewelry: 'Jewelry',
    chainmail: 'Chainmail',
    laser: 'Laser Engraving',
    games: 'Games',
    more: 'Other Products'
};

/** @type {import('./$types').LayoutServerLoad} */
export const load = async () => {
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
                                itemIds: new Set(items.map((item) => item.id)), // Track IDs for filtering
                                success: true
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
                                success: false,
                                error: err instanceof Error ? err.message : `Failed to load ${slug}`
                            };
                        }
                    })
                ),
                getAllItems()
            ]);
            
            // Convert array to object keyed by slug
            const categoriesData = {};
            categoryResults.forEach(result => {
                categoriesData[result.slug] = result;
            });
            
            // Create "more" category with items not in jewelry, armor, or laser
            const allCategorizedItemIds = new Set([
                ...Array.from(categoriesData.jewelry?.itemIds || []),
                ...Array.from(categoriesData.armor?.itemIds || []),
                ...Array.from(categoriesData.laser?.itemIds || [])
            ]);
            
            const uncategorizedItems = allItems.filter((item) => 
                !allCategorizedItemIds.has(item.id)
            );
            
            console.log(`Found ${uncategorizedItems.length} uncategorized items for "more" category`);
            
            categoriesData.more = {
                slug: 'more',
                categoryId: null,
                name: CATEGORY_NAMES.more,
                subcategories: [],
                items: uncategorizedItems,
                itemIds: new Set(uncategorizedItems.map((item) => item.id)),
                success: true
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
