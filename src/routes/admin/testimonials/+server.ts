import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getCollection } from '$lib/mongo';

// GET - fetch all testimonials
export const GET: RequestHandler = async () => {
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
export const POST: RequestHandler = async ({ request }) => {
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
export const DELETE: RequestHandler = async ({ request }) => {
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
