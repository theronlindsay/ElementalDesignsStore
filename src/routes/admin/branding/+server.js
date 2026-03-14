import { json, error } from '@sveltejs/kit';
import { getCollection } from '$lib/mongo';
import { BRANDING_DOC_ID, normalizeBrandingContent, serializeBrandingContent } from '$lib/branding';

/** @type {import('./$types').RequestHandler} */
export const GET = async () => {
	try {
		const collection = await getCollection('Branding');
		const brandingDoc = await collection.findOne({ id: BRANDING_DOC_ID });
		return json({ branding: serializeBrandingContent(brandingDoc) });
	} catch (err) {
		console.error('Error reading branding content from MongoDB:', err);
		throw error(500, 'Failed to load branding content');
	}
};

/** @type {import('./$types').RequestHandler} */
export const POST = async ({ request }) => {
	try {
		const incomingContent = await request.json();
		const branding = normalizeBrandingContent(incomingContent);
		const collection = await getCollection('Branding');

		await collection.updateOne(
			{ id: BRANDING_DOC_ID },
			{
				$set: {
					...branding,
					updatedAt: new Date().toISOString()
				}
			},
			{ upsert: true }
		);

		return json({ success: true, branding: serializeBrandingContent(branding) });
	} catch (err) {
		console.error('Error saving branding content to MongoDB:', err);
		throw error(500, 'Failed to save branding content');
	}
};
