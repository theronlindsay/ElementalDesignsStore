import { getCollection } from '$lib/mongo';

/** @type {import('./$types').PageServerLoad} */
export const load = async () => {
	try {
		const storeConfigCol = await getCollection('StoreConfig');
		let config = await storeConfigCol.findOne({ id: 'main' });

		if (!config) {
			config = {
				id: 'main',
			itemFilterConfig: {
				primaryCategories: [],
				tagGroups: [],
				categoryMappings: []
			}
		};
		await storeConfigCol.insertOne(config);
	} else {
		config._id = config._id?.toString?.() ?? config._id;
		if (!config.itemFilterConfig) {
			config.itemFilterConfig = {
				primaryCategories: [],
				tagGroups: [],
				categoryMappings: []
			};
		}
	}

	return { config };
} catch (err) {
	console.error('Error loading item filter config:', err);
	return {
		config: {
			id: 'main',
			itemFilterConfig: {
				primaryCategories: [],
				tagGroups: [],
				categoryMappings: []
			}
		}
	};
	}
};

