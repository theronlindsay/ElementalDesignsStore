import { redirect, error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { SquareError, type CatalogObject } from 'square';
import { client, type ItemWithImages } from '$lib/square';

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

        return { item };
    } catch (err) {
        console.error('Error loading item:', err);
        if (err instanceof Error && err.message.includes('404')) {
            throw error(404, 'Product not found');
        }
        throw error(500, 'Failed to load product details');
    }
};
