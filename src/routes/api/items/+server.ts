import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { getAllItems } from '$lib/square';
import { SquareClient, SquareEnvironment } from 'square';
import { env } from '$env/dynamic/private';

const client = new SquareClient({ 
	token: env.SQUARE_ACCESS_TOKEN, 
	environment: SquareEnvironment.Sandbox, 
});

/**
 * Enrich items with their actual image URLs by fetching related image objects
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

export const GET: RequestHandler = async () => {
	try {
		let items = await getAllItems();
		
		// Enrich items with image URLs
		items = await enrichItemsWithImages(items);
		
		// Transform items into a lookup map
		const itemsMap: Record<string, any> = {};
		
		items.forEach((item) => {
			const variation = item.itemData?.variations?.[0];
			const itemVariationData = variation?.itemVariationData;
			const priceMoney = itemVariationData?.priceMoney;
			
			// Convert BigInt to number for price
			const priceAmount = priceMoney?.amount ? Number(BigInt(priceMoney.amount)) / 100 : 0;
			
			// Get first image URL from the enriched imageUrls array
			const imageUrl = item.imageUrls?.[0] || '';
			
			itemsMap[item.id] = {
				id: item.id,
				name: item.itemData?.name || '',
				description: item.itemData?.description || '',
				price: priceAmount,
				imageUrl: imageUrl,
				category: item.itemData?.categoryId || ''
			};
		});
		
		return json({ itemsMap });
	} catch (error) {
		console.error('Error fetching items:', error);
		return json(
			{ error: 'Failed to fetch items' },
			{ status: 500 }
		);
	}
};
