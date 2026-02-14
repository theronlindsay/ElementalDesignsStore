import { getCollection } from '$lib/mongo';

/** @type {import('./$types').PageServerLoad} */
export const load = async () => {
	try {
		const col = await getCollection('events');
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
