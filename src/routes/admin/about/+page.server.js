import { getCollection } from '$lib/mongo';
import { ABOUT_DOC_ID, DEFAULT_ABOUT_CONTENT, serializeAboutContent } from '$lib/about';

export const load = async () => {
	try {
		const collection = await getCollection('About');
		const aboutDoc = await collection.findOne({ id: ABOUT_DOC_ID });

		return {
			aboutContent: serializeAboutContent(aboutDoc)
		};
	} catch (err) {
		console.error('Error loading About admin content from MongoDB:', err);
		return { aboutContent: DEFAULT_ABOUT_CONTENT };
	}
};
