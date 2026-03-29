import { getCollection } from '$lib/mongo';

export const load = async () => {
    try {
        const storeConfigCol = await getCollection('StoreConfig');
        let config = await storeConfigCol.findOne({ id: 'main' });

        if (!config) {
            config = {
                id: 'main',
                taggedGrids: [
                    { id: '1', title: 'Featured Items', allowedTags: ['featured', 'popular'], deniedTags: [], maxRows: 1 },
                    { id: '2', title: 'New Arrivals', allowedTags: ['new'], deniedTags: ['out-of-stock'], maxRows: 1 }
                ],
                searchFilterTags: []
            };
            await storeConfigCol.insertOne(config);
        }

        // Ensure serialization
        config._id = config._id?.toString?.() ?? config._id;

        return { config };
    } catch (err) {
        console.error('Error loading store config:', err);
        return {
            config: {
                id: 'main',
                taggedGrids: [],
                searchFilterTags: []
            }
        };
    }
};
