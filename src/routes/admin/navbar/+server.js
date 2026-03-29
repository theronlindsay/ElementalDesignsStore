import { json } from '@sveltejs/kit';
import { getCollection } from '$lib/mongo';

export const POST = async ({ request }) => {
    try {
        const data = await request.json();
        const storeConfigCol = await getCollection('StoreConfig');

        // We only want to update navbarLinks
        await storeConfigCol.updateOne(
            { id: 'main' },
            { $set: { navbarLinks: data.navbarLinks } },
            { upsert: true }
        );

        return json({ success: true });
    } catch (err) {
        console.error('Error saving navbar config:', err);
        return json({ error: 'Failed to save configuration' }, { status: 500 });
    }
};
