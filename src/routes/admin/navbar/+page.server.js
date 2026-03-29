import { getCollection } from '$lib/mongo';

export const load = async () => {
    try {
        const storeConfigCol = await getCollection('StoreConfig');
        let config = await storeConfigCol.findOne({ id: 'main' });

        if (config) {
            config._id = config._id?.toString?.() ?? config._id;
            return { config };
        }

        return { config: { navbarLinks: [] } };
    } catch (err) {
        console.error('Error loading store config:', err);
        return { config: { navbarLinks: [] } };
    }
};
