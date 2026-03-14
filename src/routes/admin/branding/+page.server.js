import { getCollection } from '$lib/mongo';
import { BRANDING_DOC_ID, DEFAULT_BRANDING_CONTENT, serializeBrandingContent } from '$lib/branding';

export const load = async () => {
	try {
		const collection = await getCollection('Branding');
		const brandingDoc = await collection.findOne({ id: BRANDING_DOC_ID });

		return {
			branding: serializeBrandingContent(brandingDoc)
		};
	} catch (err) {
		console.error('Error loading branding admin content from MongoDB:', err);
		return { branding: DEFAULT_BRANDING_CONTENT };
	}
};
