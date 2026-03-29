import { json, error } from '@sveltejs/kit';
import { getCollection } from '$lib/mongo';
import { ABOUT_DOC_ID, normalizeAboutContent, serializeAboutContent } from '$lib/about';

/** @type {import('./$types').RequestHandler} */
export const GET = async () => {
	try {
		const collection = await getCollection('About');
		const aboutDoc = await collection.findOne({ id: ABOUT_DOC_ID });
		return json({ aboutContent: serializeAboutContent(aboutDoc) });
	} catch (err) {
		console.error('Error reading About content from MongoDB:', err);
		throw error(500, 'Failed to load About content');
	}
};

/** @type {import('./$types').RequestHandler} */
export const POST = async ({ request }) => {
	try {
		const incomingContent = await request.json();
		const aboutContent = normalizeAboutContent(incomingContent);
		const collection = await getCollection('About');

		await collection.updateOne(
			{ id: ABOUT_DOC_ID },
			{
				$set: {
					...aboutContent,
					updatedAt: new Date().toISOString()
				}
			},
			{ upsert: true }
		);

		return json({ success: true, aboutContent: serializeAboutContent(aboutContent) });
	} catch (err) {
		console.error('Error saving About content to MongoDB:', err);
		throw error(500, 'Failed to save About content');
	}
};
