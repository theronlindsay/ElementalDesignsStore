import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { CatalogObject, CatalogObjectType } from 'square';
import { getAllItems, enrichItemsWithImages, client } from '$lib/square';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { allowedTags = [], deniedTags = [] }: { allowedTags?: string[]; deniedTags?: string[] } =
			await request.json();

		const items = await getAllItems();
		const enriched = await enrichItemsWithImages(items);

		const objectTypes: CatalogObjectType[] = ['CATEGORY'];
		const categoryResponse = await client.catalog.search({ objectTypes });
		const categoryMap = new Map<string, string>();
		if (categoryResponse.objects) {
			for (const obj of categoryResponse.objects) {
				if (obj.type === 'CATEGORY') {
					const cat = obj as CatalogObject.Category;
					if (cat.categoryData?.name) {
						categoryMap.set(cat.id!, cat.categoryData.name.toLowerCase());
					}
				}
			}
		}

		const filteredItems = enriched.filter((item) => {
			const itemCategoryIds = item.itemData?.categories?.map((c) => c.id) || [];
			if (item.itemData?.categoryId && !itemCategoryIds.includes(item.itemData.categoryId)) {
				itemCategoryIds.push(item.itemData.categoryId);
			}

			const itemCategoryNames = itemCategoryIds
				.map((id) => (id ? categoryMap.get(id) : undefined))
				.filter(Boolean) as string[];

			if (deniedTags.length > 0) {
				const hasDenied = deniedTags.some((tag) => itemCategoryNames.includes(tag.toLowerCase()));
				if (hasDenied) return false;
			}

			if (allowedTags.length > 0) {
				const hasAllowed = allowedTags.some((tag) =>
					itemCategoryNames.includes(tag.toLowerCase()),
				);
				if (!hasAllowed) return false;
			}

			return true;
		});

		const safeItems = JSON.parse(
			JSON.stringify(filteredItems, (_key, value) =>
				typeof value === 'bigint' ? value.toString() : value,
			),
		);

		return json({ items: safeItems });
	} catch (error) {
		console.error('Error fetching tagged items:', error);
		return json({ error: 'Failed to fetch items' }, { status: 500 });
	}
};
