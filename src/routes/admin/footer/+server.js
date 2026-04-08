import { json, error } from '@sveltejs/kit';
import { getCollection } from '$lib/mongo';
import { FOOTER_DOC_ID, normalizeFooterConfig, serializeFooterConfig } from '$lib/footer-config';

/** @type {import('./$types').RequestHandler} */
export const GET = async () => {
	try {
		const collection = await getCollection('FooterConfig');
		const doc = await collection.findOne({ id: FOOTER_DOC_ID });
		return json({ footer: doc ? serializeFooterConfig(doc) : null });
	} catch (err) {
		console.error('Error loading footer config from MongoDB:', err);
		throw error(500, 'Failed to load footer configuration');
	}
};

/** @type {import('./$types').RequestHandler} */
export const POST = async ({ request }) => {
	try {
		const body = await request.json();
		const { _id, updatedAt, ...rest } = body || {};
		const sectionsInput = rest.sections;
		if (!Array.isArray(sectionsInput)) {
			throw error(400, 'Invalid payload: sections must be an array');
		}
		const normalized = normalizeFooterConfig({
			id: FOOTER_DOC_ID,
			sections: sectionsInput
		});
		const collection = await getCollection('FooterConfig');

		await collection.updateOne(
			{ id: FOOTER_DOC_ID },
			{
				$set: {
					id: FOOTER_DOC_ID,
					sections: normalized.sections,
					updatedAt: new Date().toISOString()
				}
			},
			{ upsert: true }
		);

		return json({ success: true, footer: serializeFooterConfig(normalized) });
	} catch (err) {
		if (err && typeof err === 'object' && 'status' in err) throw err;
		console.error('Error saving footer config to MongoDB:', err);
		throw error(500, 'Failed to save footer configuration');
	}
};
