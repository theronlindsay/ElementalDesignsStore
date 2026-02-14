import type { PageServerLoad } from './$types';
import { getCollection } from '$lib/mongo';

export const load: PageServerLoad = async () => {
	try {
		const col = await getCollection('Events');
		const events = (await col.find({}).toArray()).map(e => ({
			...e,
			_id: e._id?.toString?.() ?? e._id
		}));
return { events };
	} catch (err) {
		console.error('Error loading events from MongoDB:', err);
		return { events: [] };
	}
};
