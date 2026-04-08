import { getCollection } from '$lib/mongo';
import { PAST_WORK_DOC_ID, serializePastWorkCatalog } from '$lib/past-work';

export const load = async () => {
	try {
		const collection = await getCollection('PastWork');
		const doc = await collection.findOne({ id: PAST_WORK_DOC_ID });
		return {
			pastWork: doc ? serializePastWorkCatalog(doc) : { id: PAST_WORK_DOC_ID, items: [] }
		};
	} catch (err) {
		console.error('Error loading past work from MongoDB:', err);
		return { pastWork: { id: PAST_WORK_DOC_ID, items: [] } };
	}
};
