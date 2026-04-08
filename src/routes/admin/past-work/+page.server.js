import { getCollection } from '$lib/mongo';
import { PAST_WORK_DOC_ID, serializePastWorkCatalog } from '$lib/past-work';

/** @type {import('./$types').PageServerLoad} */
export const load = async () => {
	const collection = await getCollection('PastWork');
	const doc = await collection.findOne({ id: PAST_WORK_DOC_ID });
	return {
		pastWork: doc ? serializePastWorkCatalog(doc) : { id: PAST_WORK_DOC_ID, items: [], updatedAt: undefined }
	};
};
