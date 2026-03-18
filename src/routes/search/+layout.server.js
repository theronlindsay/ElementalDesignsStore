import { getAllItems, getAllCategories } from '$lib/square';
import { getCollection } from '$lib/mongo';
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
			const ids = item.itemData?.imageIds || [];
			const imageUrls = ids.map((id) => imageMap.get(id)).filter((url) => url !== undefined);

			return {
				...item,
				imageUrls
			};
		});
	} catch (err) {
		console.error('Error enriching items with images in search layout:', err);
		return items;
	}
}

/** @type {import('./$types').LayoutServerLoad} */
export const load = async () => {
	// Fetch store configuration
	let storeConfig = { searchFilterTags: [] };
	try {
		const storeConfigCol = await getCollection('StoreConfig');
		const config = await storeConfigCol.findOne({ id: 'main' });
		if (config) {
			config._id = config._id?.toString?.() ?? config._id;
			storeConfig = config;
		}
	} catch (err) {
		console.error('Error loading store config:', err);
	}

	// Fetch all categories and their items in parallel and enrich with image URLs
	const allCategoriesPromise = (async () => {
		try {
			let [allItems, allCategories] = await Promise.all([getAllItems(), getAllCategories()]);
			allItems = await enrichItemsWithImages(allItems);

			// In the new system, we just pass all items into a generic 'all' category.
			// The frontend will handle filtering via the tags.
			const categoriesData = {
				all: {
					slug: 'all',
					categoryId: null,
					name: 'All Products',
					subcategories: allCategories, // pass down all categories for the filter system
					items: allItems,
					itemIds: new Set(allItems.map((item) => item.id)),
					success: true
				}
			};

			return categoriesData;
		} catch (err) {
			console.error('Error loading categories:', err);
			return {};
		}
	})();

	return {
		allCategoriesPromise,
		storeConfig
	};
};
