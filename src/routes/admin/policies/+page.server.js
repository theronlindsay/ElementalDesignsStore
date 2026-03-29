import { getCollection } from '$lib/mongo';
import { DEFAULT_POLICY_CONTENT, POLICY_DOC_ID, serializePolicyContent } from '$lib/policies';

export const load = async () => {
	try {
		const collection = await getCollection('Policies');
		const policyDoc = await collection.findOne({ id: POLICY_DOC_ID });

		return {
			policyContent: serializePolicyContent(policyDoc)
		};
	} catch (err) {
		console.error('Error loading policy content from MongoDB:', err);
		return { policyContent: DEFAULT_POLICY_CONTENT };
	}
};
