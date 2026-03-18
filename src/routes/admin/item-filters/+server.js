import { json } from '@sveltejs/kit';
import { getCollection } from '$lib/mongo';

export const POST = async ({ request }) => {
	try {
		const data = await request.json();
		const storeConfigCol = await getCollection('StoreConfig');

		await storeConfigCol.updateOne(
			{ id: 'main' },
			{ $set: { itemFilterConfig: data.itemFilterConfig } },
			{ upsert: true }
		);

		return json({ success: true });
	} catch (err) {
		console.error('Error saving item filter config:', err);
		return json({ error: 'Failed to save configuration' }, { status: 500 });
	}
};

