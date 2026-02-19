import { json, error } from '@sveltejs/kit';
import { getCollection } from '$lib/mongo';

// GET - fetch all testimonials
/** @type {import('./$types').RequestHandler} */
export const GET = async () => {
	try {
		const col = await getCollection('Testimonials');
		const testimonials = await col.find({}).toArray();
		return json({ testimonials });
	} catch (err) {
		console.error('Error reading testimonials from MongoDB:', err);
		throw error(500, 'Failed to load testimonials');
	}
};

// POST - add or update a Testimonial
/** @type {import('./$types').RequestHandler} */
export const POST = async ({ request }) => {
	try {
		const testimonialData = await request.json();
		const col = await getCollection('Testimonials');
		// Upsert by id
		await col.updateOne(
			{ id: testimonialData.id },
			{ $set: testimonialData },
			{ upsert: true }
		);
		return json({ success: true, Testimonials: testimonialData });
	} catch (err) {
		console.error('Error saving Testimonials to MongoDB:', err);
		throw error(500, 'Failed to save Testimonials');
	}
};

// DELETE - remove a Testimonial
/** @type {import('./$types').RequestHandler} */
export const DELETE = async ({ request }) => {
	try {
		const { id } = await request.json();
		const col = await getCollection('Testimonials');
		await col.deleteOne({ id });
		return json({ success: true });
	} catch (err) {
		console.error('Error deleting Testimonials from MongoDB:', err);
		throw error(500, 'Failed to delete Testimonials');
	}
};

// PUT - update order of Testimonials
/** @type {import('./$types').RequestHandler} */
export const PUT = async ({ request }) => {
	try {
		const { updates } = await request.json();
		const col = await getCollection('Testimonials');
		
		const operations = updates.map((update) => ({
			updateOne: {
				filter: { id: update.id },
				update: { $set: { order: update.order } }
			}
		}));
		
		if (operations.length > 0) {
			await col.bulkWrite(operations);
		}
		
		return json({ success: true });
	} catch (err) {
		console.error('Error saving Testimonial order to MongoDB:', err);
		throw error(500, 'Failed to save Testimonial order');
	}
};
