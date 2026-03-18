import { json } from '@sveltejs/kit';
import { getAllItems } from '$lib/square';
import { SquareClient, SquareEnvironment } from 'square';
import { env } from '$env/dynamic/private';

const client = new SquareClient({
	token: env.SQUARE_ACCESS_TOKEN,
	environment: SquareEnvironment.Sandbox
});

async function enrichItemsWithImages(items) {
	try {
		const imageIds = new Set();
		items.forEach((item) => {
			const itemData = item.itemData;
			if (itemData?.imageIds) {
				itemData.imageIds.forEach((id) => imageIds.add(id));
			}
		});

		if (imageIds.size === 0) {
			return items;
		}

		const response = await client.catalog.batchGet({
			objectIds: Array.from(imageIds)
		});

		const imageMap = new Map();
		if (response.objects) {
			response.objects.forEach((obj) => {
				if (obj.type === 'IMAGE' && obj.imageData?.url) {
					imageMap.set(obj.id, obj.imageData.url);
				}
			});
		}

		return items.map((item) => {
			const imageIds = item.itemData?.imageIds || [];
			const imageUrls = imageIds.map((id) => imageMap.get(id)).filter((url) => url !== undefined);

			return {
				...item,
				imageUrls
			};
		});
	} catch (error) {
		console.error('Error enriching items with images:', error);
		return items;
	}
}

export const POST = async ({ request }) => {
	try {
		const { allowedTags = [], deniedTags = [] } = await request.json();

		let items = await getAllItems();
		items = await enrichItemsWithImages(items);

		// Create a map of category IDs to Category names for filtering
		const categoryResponse = await client.catalog.search({ objectTypes: ['CATEGORY'] });
		const categoryMap = new Map(); // id -> lowercase name
		if (categoryResponse.objects) {
			categoryResponse.objects.forEach((cat) => {
				if (cat.categoryData && cat.categoryData.name) {
					categoryMap.set(cat.id, cat.categoryData.name.toLowerCase());
				}
			});
		}

		// Filter items based on category names
		let filteredItems = items.filter((item) => {
			const itemCategoryIds = item.itemData?.categories?.map((c) => c.id) || [];
			// Also check legacy categoryId just in case
			if (item.itemData?.categoryId && !itemCategoryIds.includes(item.itemData.categoryId)) {
				itemCategoryIds.push(item.itemData.categoryId);
			}

			const itemCategoryNames = itemCategoryIds.map((id) => categoryMap.get(id)).filter(Boolean);

			if (deniedTags.length > 0) {
				const hasDenied = deniedTags.some((tag) => itemCategoryNames.includes(tag.toLowerCase()));
				if (hasDenied) return false;
			}

			if (allowedTags.length > 0) {
				const hasAllowed = allowedTags.some((tag) => itemCategoryNames.includes(tag.toLowerCase()));
				if (!hasAllowed) return false;
			}

			return true;
		});
		// Convert bigints for JSON stringify
		const safeItems = JSON.parse(
			JSON.stringify(filteredItems, (key, value) =>
				typeof value === 'bigint' ? value.toString() : value
			)
		);

		return json({ items: safeItems });
	} catch (error) {
		console.error('Error fetching tagged items:', error);
		return json({ error: 'Failed to fetch items' }, { status: 500 });
	}
};
