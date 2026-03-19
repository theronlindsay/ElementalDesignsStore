import { redirect, error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { SquareError, type CatalogObject } from 'square';
import { client, type ItemWithImages, getAllItems, enrichItemsWithImages } from '$lib/square';

async function getItemById(itemId: string): Promise<ItemWithImages | null> {
    try {
        const response = await client.catalog.batchGet({
            objectIds: [itemId],
        });

        if (!response.objects || response.objects.length === 0) {
            return null;
        }

        const item = response.objects[0] as CatalogObject.Item;

        if (item.itemData?.imageIds && item.itemData.imageIds.length > 0) {
            const imageIds = item.itemData.imageIds;

            const imageResponse = await client.catalog.batchGet({ objectIds: imageIds });

            const imageUrls: string[] = [];
            if (imageResponse.objects) {
                for (const obj of imageResponse.objects) {
                    if (obj.type === 'IMAGE' && obj.imageData?.url) {
                        imageUrls.push(obj.imageData.url);
                    }
                }
            }

            return { ...item, imageUrls };
        }

        return { ...item, imageUrls: [] };
    } catch (err) {
        if (err instanceof SquareError) {
            console.error('Square API Error:', err.message);
            throw new Error(`Failed to retrieve item: ${err.message}`);
        }
        throw err;
    }
}

// Helper function to get a custom attribute by name
function getCustomAttribute(item: any, attrName: string) {
    const customAttributes = item?.customAttributeValues || {};
    return Object.values(customAttributes).find((attr: any) => attr?.name === attrName);
}

// Get the primaryid from an item's custom attributes
function getPrimaryId(item: any): string | null {
    const primaryIdAttr = getCustomAttribute(item, 'primaryid');
    return primaryIdAttr?.stringValue || null;
}

// Check if an item is a primary item (HAS primary attribute set to true)
function hasPrimaryVariation(item: any): boolean {
    const primaryAttr = getCustomAttribute(item, 'primary');
    return primaryAttr?.booleanValue === true;
}

// Check if an item is a variant (does NOT have primary attribute set to true)
function hasVariation(item: any): boolean {
    const primaryAttr = getCustomAttribute(item, 'primary');
    return primaryAttr?.booleanValue !== true;
}

// Get variants for a primary item
async function getVariantsForPrimary(primaryItemId: string): Promise<ItemWithImages[]> {
    try {
        // Get all items from the catalog
        const allRawItems = await getAllItems();
        const allItems = await enrichItemsWithImages(allRawItems);

        console.log('getVariantsForPrimary - Total items fetched:', allItems.length);
        console.log('getVariantsForPrimary - Looking for primary:', primaryItemId);

        const variants: ItemWithImages[] = [];

        for (const item of allItems) {
            if (item.type !== 'ITEM') continue;
            
            if (!hasVariation(item)) continue;

            const itemPrimaryId = getPrimaryId(item);
            console.log('Checking variant:', item.id, 'with primaryid:', itemPrimaryId);
            
            if (itemPrimaryId === primaryItemId) {
                console.log('Found matching variant:', item.id);
                variants.push(item);
            }
        }

        console.log('Total variants found:', variants.length);
        return variants;
    } catch (err) {
        console.error('Error loading variants:', err);
        return [];
    }
}

export const load: PageServerLoad = async ({ params }) => {
    const id = params.itemID;

    if (!id) {
        throw redirect(307, '/search');
    }

    try {
        const item = await getItemById(id);

        if (!item) {
            throw error(404, 'Product not found');
        }

        console.log('Item loaded:', item.id, 'hasPrimaryVariation:', hasPrimaryVariation(item));

        // Get variants for this item (if it's a primary item)
        let variants: ItemWithImages[] = [];
        if (hasPrimaryVariation(item)) {
            console.log('Item is a primary, fetching variants...');
            variants = await getVariantsForPrimary(id);
        }

        console.log('Returning with', variants.length, 'variants');
        return { item, variants };
    } catch (err) {
        console.error('Error loading item:', err);
        if (err instanceof Error && err.message.includes('404')) {
            throw error(404, 'Product not found');
        }
        throw error(500, 'Failed to load product details');
    }
};
