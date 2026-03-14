import { json, error } from '@sveltejs/kit';
import { getCollection } from '$lib/mongo';
import { POLICY_DOC_ID, normalizePolicyContent, serializePolicyContent } from '$lib/policies';

/** @type {import('./$types').RequestHandler} */
export const GET = async () => {
	try {
		const collection = await getCollection('Policies');
		const policyDoc = await collection.findOne({ id: POLICY_DOC_ID });
		return json({ policyContent: serializePolicyContent(policyDoc) });
	} catch (err) {
		console.error('Error reading policy content from MongoDB:', err);
		throw error(500, 'Failed to load policy content');
	}
};

/** @type {import('./$types').RequestHandler} */
export const POST = async ({ request }) => {
	try {
		const incomingContent = await request.json();
		const policyContent = normalizePolicyContent(incomingContent);
		const collection = await getCollection('Policies');

		await collection.updateOne(
			{ id: POLICY_DOC_ID },
			{
				$set: {
					...policyContent,
					updatedAt: new Date().toISOString()
				}
			},
			{ upsert: true }
		);

		return json({ success: true, policyContent: serializePolicyContent(policyContent) });
	} catch (err) {
		console.error('Error saving policy content to MongoDB:', err);
		throw error(500, 'Failed to save policy content');
	}
};
