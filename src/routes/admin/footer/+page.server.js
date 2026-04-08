import { getCollection } from '$lib/mongo';
import {
	FOOTER_DOC_ID,
	cloneDefaultSections,
	serializeFooterConfig
} from '$lib/footer-config';

/** @type {import('./$types').PageServerLoad} */
export const load = async () => {
	const collection = await getCollection('FooterConfig');
	const doc = await collection.findOne({ id: FOOTER_DOC_ID });
	if (!doc) {
		return {
			footer: {
				id: FOOTER_DOC_ID,
				sections: cloneDefaultSections(),
				updatedAt: undefined,
				_id: undefined
			}
		};
	}
	return { footer: serializeFooterConfig(doc) };
};
