import { getCollection } from '$lib/mongo';
import { BRANDING_DOC_ID, DEFAULT_BRANDING_CONTENT, serializeBrandingContent } from '$lib/branding';
import { FOOTER_DOC_ID, serializeFooterConfig } from '$lib/footer-config';

export const load = async () => {
	try {
		const brandingCollection = await getCollection('Branding');
		const brandingDoc = await brandingCollection.findOne({ id: BRANDING_DOC_ID });

		const footerCol = await getCollection('FooterConfig');
		const footerDoc = await footerCol.findOne({ id: FOOTER_DOC_ID });

		const storeConfigCol = await getCollection('StoreConfig');
		const config = await storeConfigCol.findOne({ id: 'main' });
		const navbarLinks = config?.navbarLinks || [
			{ id: 'home', label: 'Home', href: '/' },
			{ id: 'jewelry', label: 'Jewelry', href: '/search?tags=jewelry' },
			{ id: 'chainmail', label: 'Chainmail', href: '/search?tags=chainmail' },
			{ id: 'laser', label: 'Laser Engraving', href: '/search?tags=laser' },
			{ id: 'games', label: 'Games', href: '/search?tags=games' },
			{ id: 'custom', label: 'Custom Orders', href: '/#custom' },
			{ id: 'about', label: 'About', href: '/about' }
		];

		return {
			branding: serializeBrandingContent(brandingDoc),
			navbarLinks,
			footer: footerDoc ? serializeFooterConfig(footerDoc) : null
		};
	} catch (err) {
		console.error('Error loading content from MongoDB:', err);
		return {
			branding: DEFAULT_BRANDING_CONTENT,
			navbarLinks: [
				{ id: 'home', label: 'Home', href: '/' },
				{ id: 'custom', label: 'Custom Orders', href: '/#custom' },
				{ id: 'about', label: 'About', href: '/about' }
			],
			footer: null
		};
	}
};
