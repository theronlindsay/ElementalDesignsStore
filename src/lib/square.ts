//This manages connections to square, keep it here for auditing
//IN PROGRESS
// Docs: https://github.com/square/square-nodejs-sdk/blob/master/reference.md

import { SquareClient, SquareEnvironment, SquareError } from "square";
import { env } from '$env/dynamic/private';

const client = new SquareClient({ 
    token: env.SQUARE_ACCESS_TOKEN, 
    environment: SquareEnvironment.Sandbox, 
});

/**
 * Retrieve catalog items filtered by category or custom attribute
 * @param filterType - Type of filter: 'category' or 'attribute'
 * @param filterValue - The category ID or attribute name to filter by
 * @param attributeValue - Optional: When filterType is 'attribute', the value to match
 * @returns Array of catalog items matching the filter criteria
 */
export async function getCatalogItemsByFilter(
    filterType: 'category' | 'attribute',
    filterValue: string,
    attributeValue?: string
) {
    try {
        // Build the search query based on filter type
        const searchRequest: any = {
            objectTypes: ['ITEM'], //this is the type square assigns to items
            limit: 100, // Adjust as needed
            includeRelatedObjects: true, // Include all related data like categories
        };

        if (filterType === 'category') {
            // Filter by category ID
            searchRequest.query = {
                exactQuery: {
                    attributeName: 'category_id',
                    attributeValue: filterValue
                }
            };
        } else if (filterType === 'attribute') {
            // Filter by custom attribute
            searchRequest.query = {
                exactQuery: {
                    attributeName: filterValue,
                    attributeValue: attributeValue || ''
                }
            };
        }

        // Execute the catalog search using the correct method
        const response = await client.catalog.search(searchRequest);

        if (response.objects) {
            // Log to verify categoryId is present
            console.log("Sample item structure:", response.objects[0]);
            console.log("Sample item categoryId:", (response.objects[0] as any)?.itemData?.categoryId);
            
            console.log("got objects:", JSON.stringify(response.objects, (key, value) =>
                typeof value === 'bigint' ? value.toString() : value, 2));
            return response.objects;
        }

        return [];
    } catch (error) {
        if (error instanceof SquareError) {
            console.error('Square API Error:', error.message);
            throw new Error(`Failed to retrieve catalog items: ${error.message}`);
        }
        throw error;
    }
}

/**
 * Retrieve all items in a specific category
 * @param categoryId - The Square category ID
 * @returns Array of catalog items in the specified category
 */
export async function getItemsByCategory(categoryId: string) {
    const items = await getCatalogItemsByFilter('category', categoryId);
    
    // Add the categoryId to each item since Square doesn't include it in search results
    return items.map(item => ({
        ...item,
        itemData: {
            ...(item as any).itemData,
            categoryId: categoryId // Manually add the category ID we searched for
        }
    }));
}

/**
 * Get all subcategories of a parent category
 * @param parentCategoryId - The parent category ID
 * @returns Array of subcategory objects
 */
export async function getSubcategories(parentCategoryId: string) {
    try {
        const allCategories = await getAllCategories();
        
        // Filter categories that have this parent
        const subcategories = allCategories.filter((cat: any) => 
            cat.categoryData?.parentCategory?.id === parentCategoryId
        );
        
        console.log(`Found ${subcategories.length} subcategories for ${parentCategoryId}:`, 
            subcategories.map(c => ({ id: c.id, name: c.categoryData?.name })));
        
        return subcategories;
    } catch (error) {
        console.error('Error getting subcategories:', error);
        return [];
    }
}

/**
 * Get all items from a category and all its subcategories
 * @param categoryId - The parent category ID
 * @returns Array of catalog items from category and subcategories
 */
export async function getItemsByCategoryIncludingSubcategories(categoryId: string) {
    try {
        console.log(`Getting items for category ${categoryId} and its subcategories...`);
        
        // Get items from the main category
        const mainCategoryItems = await getItemsByCategory(categoryId);
        console.log(`Found ${mainCategoryItems.length} items in main category`);
        
        // Get all subcategories
        const subcategories = await getSubcategories(categoryId);
        
        // Get items from each subcategory
        const subcategoryItems = [];
        for (const subcat of subcategories) {
            const items = await getItemsByCategory(subcat.id);
            console.log(`Found ${items.length} items in subcategory ${subcat.categoryData?.name}`);
            subcategoryItems.push(...items);
        }
        
        // Combine and deduplicate (in case an item is in multiple categories)
        const allItems = [...mainCategoryItems, ...subcategoryItems];
        const uniqueItems = Array.from(
            new Map(allItems.map(item => [item.id, item])).values()
        );
        
        console.log(`Total unique items: ${uniqueItems.length}`);
        
        // Log the first item's complete structure to see image location
        if (uniqueItems.length > 0) {
            console.log('=== SAMPLE ITEM STRUCTURE ===');
            console.log('Item ID:', uniqueItems[0].id);
            console.log('Item Type:', uniqueItems[0].type);
            console.log('Item categoryId:', (uniqueItems[0] as any).itemData?.categoryId);
            
            // Print itemData structure
            const itemData = (uniqueItems[0] as any).itemData;
            if (itemData) {
                console.log('\nitemData fields:');
                console.log('  - name:', itemData.name);
                console.log('  - description:', itemData.description);
                console.log('  - categoryId:', itemData.categoryId);
                console.log('  - imageIds:', itemData.imageIds);
                
                if (itemData.variations && itemData.variations.length > 0) {
                    console.log('\nFirst variation:');
                    const variation = itemData.variations[0];
                    console.log('  - id:', variation.id);
                    console.log('  - type:', variation.type);
                    
                    const varData = variation.itemVariationData;
                    if (varData) {
                        console.log('  - itemId:', varData.itemId);
                        console.log('  - name:', varData.name);
                        if (varData.priceMoney) {
                            console.log('  - price amount (cents):', varData.priceMoney.amount.toString());
                            console.log('  - price currency:', varData.priceMoney.currency);
                        }
                        console.log('  - imageIds:', varData.imageIds);
                    }
                }
            }
            
            // Check for images at different locations
            console.log('\nImage-related fields:');
            console.log('  - imageIds:', (uniqueItems[0] as any).itemData?.imageIds);
            console.log('  - imageData:', (uniqueItems[0] as any).imageData);
            
            console.log('=== END SAMPLE ===');
        }
        
        // Now fetch the items with related objects (images) included
        console.log('\nFetching items with images...');
        const itemsWithImages = await enrichItemsWithImages(uniqueItems);
        
        return itemsWithImages;
    } catch (error) {
        if (error instanceof SquareError) {
            console.error('Square API Error:', error.message);
            throw new Error(`Failed to retrieve items with subcategories: ${error.message}`);
        }
        throw error;
    }
}

/**
 * Enrich items with their actual image URLs by fetching related image objects
 * @param items - Array of catalog items
 * @returns Array of items with image URLs added
 */
async function enrichItemsWithImages(items: any[]) {
    try {
        // Collect all unique image IDs from all items
        const imageIds = new Set<string>();
        items.forEach(item => {
            const itemData = item.itemData;
            if (itemData?.imageIds) {
                itemData.imageIds.forEach((id: string) => imageIds.add(id));
            }
        });
        
        if (imageIds.size === 0) {
            console.log('No images to fetch');
            return items;
        }
        
        console.log(`Fetching ${imageIds.size} image objects...`);
        
        // Batch retrieve all image objects
        const response = await client.catalog.batchGet({
            objectIds: Array.from(imageIds)
        });
        
        // Create a map of imageId -> imageUrl
        const imageMap = new Map<string, string>();
        if (response.objects) {
            response.objects.forEach((obj: any) => {
                if (obj.type === 'IMAGE' && obj.imageData?.url) {
                    imageMap.set(obj.id, obj.imageData.url);
                    console.log(`Mapped image ${obj.id} -> ${obj.imageData.url}`);
                }
            });
        }
        
        // Add imageUrls to each item
        const enrichedItems = items.map(item => {
            const imageIds = item.itemData?.imageIds || [];
            const imageUrls = imageIds
                .map((id: string) => imageMap.get(id))
                .filter((url: string | undefined) => url !== undefined);
            
            return {
                ...item,
                imageUrls // Add the actual URLs
            };
        });
        
        console.log(`Enriched ${enrichedItems.length} items with image URLs`);
        
        return enrichedItems;
    } catch (error) {
        console.error('Error enriching items with images:', error);
        // Return items without images rather than failing completely
        return items;
    }
}

/**
 * Retrieve all items with a specific custom attribute value
 * @param attributeName - The name of the custom attribute
 * @param attributeValue - The value to match
 * @returns Array of catalog items with the specified attribute
 */
export async function getItemsByAttribute(attributeName: string, attributeValue: string) {
    return getCatalogItemsByFilter('attribute', attributeName, attributeValue);
}

/**
 * Get all categories from the catalog
 * @returns Array of category objects
 */
export async function getAllCategories() {
    try {
        const categories: any[] = [];
        const response = await client.catalog.list({ types: 'CATEGORY' });
        
        // Iterate through the page results
        for await (const category of response) {
            categories.push(category);
        }
        
        console.log(`Found ${categories.length} categories:`, categories.map(c => ({
            id: c.id,
            name: c.categoryData?.name
        })));
        
        return categories;
    } catch (error) {
        if (error instanceof SquareError) {
            console.error('Square API Error:', error.message);
            throw new Error(`Failed to retrieve categories: ${error.message}`);
        }
        throw error;
    }
}

/**
 * Get all items from catalog (for testing)
 * @returns Array of all catalog items
 */
export async function getAllItems() {
    try {
        const items: any[] = [];
        const response = await client.catalog.list({ types: 'ITEM' });
        
        // Iterate through the page results
        for await (const item of response) {
            items.push(item);
        }
        
        console.log(`Found ${items.length} total items`);
        
        return items;
    } catch (error) {
        if (error instanceof SquareError) {
            console.error('Square API Error:', error.message);
            throw new Error(`Failed to retrieve items: ${error.message}`);
        }
        throw error;
    }
}

/**
 * Search catalog items by text (useful for product name search)
 * @param searchText - Text to search for in item names/descriptions
 * @returns Array of matching catalog items
 */
export async function searchItemsByText(searchText: string) {
    try {
        const response = await client.catalog.searchItems({
            textFilter: searchText,
            limit: 100
        });

        if (response.items) {
            return response.items;
        }

        return [];
    } catch (error) {
        if (error instanceof SquareError) {
            console.error('Square API Error:', error.message);
            throw new Error(`Failed to search catalog items: ${error.message}`);
        }
        throw error;
    }
}

// Example payment creation (keep for reference)
/*
await client.payments.create({
    sourceId: "ccof:GaJGNaZa8x4OgDJn4GB",
    idempotencyKey: "7b0f3ec5-086a-4871-8f13-3c81b3875218",
    amountMoney: {
        amount: BigInt(1000),
        currency: "USD",
    },
    appFeeMoney: {
        amount: BigInt(10),
        currency: "USD",
    },
    autocomplete: true,
    customerId: "W92WH6P11H4Z77CTET0RNTGFW8",
    locationId: "L88917AVBK2S5",
    referenceId: "123456",
    note: "Brief description",
});
*/