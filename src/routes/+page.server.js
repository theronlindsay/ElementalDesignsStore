import { getCollection } from '$lib/mongo';

/** @type {import('./$types').PageServerLoad} */
export const load = async () => {
	try {
		const eventsCol = await getCollection('Events');
		const events = (await eventsCol.find({}).toArray()).map(e => ({
			...e,
			id: e.id || e._id?.toString?.() || e._id,
			_id: e._id?.toString?.() ?? e._id
		}));

		const testimonialsCol = await getCollection('Testimonials');
		const testimonials = (await testimonialsCol.find({}).sort({ order: 1 }).toArray()).map(t => ({
			...t,
			id: t.id || t._id?.toString?.() || t._id,
			_id: t._id?.toString?.() ?? t._id
		}));

		return { events, testimonials };
	} catch (err) {
		console.error('Error loading data from MongoDB:', err);
		return { events: [], testimonials: [] };
	}
};
