import { json, error } from '@sveltejs/kit';
import { getCollection } from '$lib/mongo';
import {
	PAST_WORK_DOC_ID,
	normalizePastWorkCatalog,
	serializePastWorkCatalog
} from '$lib/past-work';

/** @type {import('./$types').RequestHandler} */
export const GET = async () => {
	try {
		const collection = await getCollection('PastWork');
		const doc = await collection.findOne({ id: PAST_WORK_DOC_ID });
		return json({ pastWork: doc ? serializePastWorkCatalog(doc) : null });
	} catch (err) {
		console.error('Error loading past work catalog:', err);
		throw error(500, 'Failed to load past work');
	}
};

/** @type {import('./$types').RequestHandler} */
export const POST = async ({ request }) => {
	try {
		const body = await request.json();
		const { _id, updatedAt, ...rest } = body || {};
		const itemsInput = rest.items;
		if (!Array.isArray(itemsInput)) {
			throw error(400, 'Invalid payload: items must be an array');
		}
		const normalized = normalizePastWorkCatalog({ id: PAST_WORK_DOC_ID, items: itemsInput });
		const missingImage = normalized.items.some(
			(it) =>
				!Array.isArray(it.imageUrls) ||
				!it.imageUrls.length ||
				!it.imageUrls.some((u) => u && String(u).trim())
		);
		if (normalized.items.length > 0 && missingImage) {
			throw error(400, 'Each entry needs at least one image');
		}
		const collection = await getCollection('PastWork');
		await collection.updateOne(
			{ id: PAST_WORK_DOC_ID },
			{
				$set: {
					id: PAST_WORK_DOC_ID,
					items: normalized.items,
					updatedAt: new Date().toISOString()
				}
			},
			{ upsert: true }
		);
		return json({ success: true, pastWork: serializePastWorkCatalog(normalized) });
	} catch (err) {
		if (err && typeof err === 'object' && 'status' in err) throw err;
		console.error('Error saving past work catalog:', err);
		throw error(500, 'Failed to save past work');
	}
};
