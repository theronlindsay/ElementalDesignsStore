import { json } from '@sveltejs/kit';
import type { CatalogObject } from 'square';
import { getAllItems, enrichItemsWithImages } from '$lib/square';

export const GET = async () => {
	try {
		const items = await getAllItems();
		const enriched = await enrichItemsWithImages(items);

		const itemsMap: Record<string, {
			id: string;
			name: string;
			description: string;
			price: number;
			imageUrl: string;
			category: string;
		}> = {};

		for (const item of enriched) {
			const variation = item.itemData?.variations?.[0] as CatalogObject.ItemVariation | undefined;
			const priceMoney = variation?.itemVariationData?.priceMoney;

			const priceAmount = priceMoney?.amount ? Number(BigInt(priceMoney.amount)) / 100 : 0;
			const imageUrl = item.imageUrls[0] || '';

			itemsMap[item.id] = {
				id: item.id,
				name: item.itemData?.name || '',
				description: item.itemData?.description || '',
				price: priceAmount,
				imageUrl,
				category: item.itemData?.categoryId || '',
			};
		}

		return json({ itemsMap });
	} catch (error) {
		console.error('Error fetching items:', error);
		return json({ error: 'Failed to fetch items' }, { status: 500 });
	}
};
