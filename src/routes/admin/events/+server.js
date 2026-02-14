import { json, error } from '@sveltejs/kit';
import { getCollection } from '$lib/mongo';

// GET - fetch all events
/** @type {import('./$types').RequestHandler} */
export const GET = async () => {
	try {
		const col = await getCollection('Events');
		const events = await col.find({}).toArray();
		return json({ events });
	} catch (err) {
		console.error('Error reading events from MongoDB:', err);
		throw error(500, 'Failed to load events');
	}
};

// POST - add or update an event
/** @type {import('./$types').RequestHandler} */
export const POST = async ({ request }) => {
	try {
		const eventData = await request.json();
		const col = await getCollection('Events');
		// Upsert by id
		await col.updateOne(
			{ id: eventData.id },
			{ $set: eventData },
			{ upsert: true }
		);
		return json({ success: true, event: eventData });
	} catch (err) {
		console.error('Error saving event to MongoDB:', err);
		throw error(500, 'Failed to save event');
	}
};

// DELETE - remove an event
/** @type {import('./$types').RequestHandler} */
export const DELETE = async ({ request }) => {
	try {
		const { id } = await request.json();
		const col = await getCollection('Events');
		await col.deleteOne({ id });
		return json({ success: true });
	} catch (err) {
		console.error('Error deleting event from MongoDB:', err);
		throw error(500, 'Failed to delete event');
	}
};
