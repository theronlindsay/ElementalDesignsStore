import { redirect, error } from '@sveltejs/kit';
import { SquareClient, SquareEnvironment, SquareError } from 'square';
import { env } from '$env/dynamic/private';

// Initialize Square client for fetching item details
const client = new SquareClient({
    token: env.SQUARE_ACCESS_TOKEN,
    environment: SquareEnvironment.Sandbox,
});

/**
 * Fetch a single item by ID with all its details and images
 * @param itemId - The Square item ID
 * @returns Item object with image URLs
 */
async function getItemById(itemId) {
    try {
        // Batch get the item
        const response = await client.catalog.batchGet({
            objectIds: [itemId]
        });

        if (!response.objects || response.objects.length === 0) {
            return null;
        }

        const item = response.objects[0];

        // If item has images, fetch the image URLs
        if (item.itemData?.imageIds && item.itemData.imageIds.length > 0) {
            const imageIds = item.itemData.imageIds;
            
            // Batch get all images
            const imageResponse = await client.catalog.batchGet({
                objectIds: imageIds
            });

            // Map image IDs to URLs
            const imageUrls = [];
            if (imageResponse.objects) {
                imageResponse.objects.forEach((imgObj) => {
                    if (imgObj.type === 'IMAGE' && imgObj.imageData?.url) {
                        imageUrls.push(imgObj.imageData.url);
                    }
                });
            }

            return {
                ...item,
                imageUrls
            };
        }

        return {
            ...item,
            imageUrls: []
        };
    } catch (err) {
        if (err instanceof SquareError) {
            console.error('Square API Error:', err.message);
            throw new Error(`Failed to retrieve item: ${err.message}`);
        }
        throw err;
    }
}

/** @type {import('./$types').PageServerLoad} */
export const load = async ({ params }) => {
    const id = params.itemID;

    if (!id) {
        // No item ID provided, redirect to search
        throw redirect(307, '/search');
    }

    try {
        // Fetch the item details from Square
        const item = await getItemById(id);

        if (!item) {
            // Item not found
            throw error(404, 'Product not found');
        }

        return {
            item
        };
    } catch (err) {
        console.error('Error loading item:', err);
        // If it's a 404 error, re-throw it
        if (err instanceof Error && err.message.includes('404')) {
            throw error(404, 'Product not found');
        }
        // For other errors, also throw a 500 error
        throw error(500, 'Failed to load product details');
    }
};
