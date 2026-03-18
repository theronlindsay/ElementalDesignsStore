import { getAllItems, getAllCategories, enrichItemsWithImages } from '$lib/square';
import { getCollection } from '$lib/mongo';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async () => {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let storeConfig: Record<string, any> = { searchFilterTags: [] };
	try {
		const storeConfigCol = await getCollection('StoreConfig');
		const config = await storeConfigCol.findOne({ id: 'main' });
		if (config) {
			config._id = config._id?.toString?.() ?? config._id;
			storeConfig = config as Record<string, unknown>;
		}
	} catch (err) {
		console.error('Error loading store config:', err);
	}

	const allCategoriesPromise = (async () => {
		try {
			const [rawItems, allCategories] = await Promise.all([getAllItems(), getAllCategories()]);
			const allItems = await enrichItemsWithImages(rawItems);

			return {
				all: {
					slug: 'all',
					categoryId: null,
					name: 'All Products',
					subcategories: allCategories,
					items: allItems,
					itemIds: new Set(allItems.map((item) => item.id)),
					success: true
				}
			};
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
