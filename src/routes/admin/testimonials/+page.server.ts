import type { PageServerLoad } from './$types';
import { getCollection } from '$lib/mongo';

export const load: PageServerLoad = async () => {
	try {
		const collection = await getCollection("Testimonials");
		const events = await collection.find({}).toArray();
		// Convert _id to string for serialization
		const serializableEvents = events.map((event) => ({
			...event,
			_id: event._id?.toString?.() ?? event._id
		}));
		return { events: serializableEvents };
	} catch (err) {
		console.error('Error loading events from MongoDB:', err);
		return { events: [] };
	}
};