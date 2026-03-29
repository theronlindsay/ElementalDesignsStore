export const ABOUT_DOC_ID = 'about-page';

export const DEFAULT_ABOUT_CONTENT = {
	id: ABOUT_DOC_ID,
	heroTitle: 'About Elemental Designs',
	heroSubtitle: 'Handcrafted with Passion, Designed with Purpose',
	storyTitle: 'Our Story',
	storyBody:
		"Elemental Chain Designs is a husband-wife team making hand-crafted chainmaille jewelry and laser cut/engraved gift items. One day, out of the blue, Aaron suggested it might be fun trying to make chainmaille jewelry. Karin didn't even know what that was. We ordered supplies, fell in love, and were all in.",
	storyImage: '',
	productsHeaderTitle: 'Our Products',
	productOneTitle: 'Chainmaille Jewelry',
	productOneBody:
		'Our chainmaille product line includes necklaces, bracelets, anklets, earrings, rings, and body chains, ranging from everyday casual jewelry to more elaborate statement pieces.',
	productOneImage: '',
	productTwoTitle: 'Chainmail Products',
	productTwoBody:
		'We also make non-jewelry items, such as animal figures and keychains, and are starting to branch out into more traditional chainmaille armor pieces such as bracers, gauntlets, and pauldrons.',
	productTwoImage: '',
	productThreeTitle: 'Laser Cut Gifts',
	productThreeBody:
		'This past year, we diversified our offerings with laser cut/engraved gift items, hoping the added variety would be able to offer something for those not interested in jewelry. So far, we have primarily focused on mystical and fantasy themes, as we are big fantasy fans, with our humorous (and sometimes irreverent) tarot magnets being most popular, but we continue to broaden our collection to meet a wider range of interests.',
	productThreeImage: '',
	inclusiveTitle: 'Inclusive Designs',
	inclusiveBody:
		'Our two LGBTQ+ kids are our biggest fans and promoters, and inspired us to create an extensive Pride collection. We have been honored to participate in both the Canyon County and Boise Pride Festivals.',
	inclusiveImage: '',
	customTitle: 'Custom Designs',
	customBody:
		'One of our favorite parts of making is seeing each new piece come to life through the creation process, but most satisfying is working directly with our customers to create individualized pieces, helping bring your vision to life.',
	customImage: '',
	valueOneTitle: 'Handmade Quality',
	valueOneBody: 'Every item is carefully crafted by hand, ensuring unique character and exceptional quality.',
	valueTwoTitle: 'Local & Online',
	valueTwoBody: 'Find us at local markets and fairs, or shop online for nationwide delivery.',
	ctaTitle: "Let's Create Something Together",
	ctaBody: 'Ready to get a custom piece or have questions about our products?',
	ctaPrimaryLabel: 'Start Custom Order',
	ctaSecondaryLabel: 'Contact Us'
};

export function normalizeAboutContent(rawContent) {
	return {
		...DEFAULT_ABOUT_CONTENT,
		...(rawContent || {}),
		id: ABOUT_DOC_ID
	};
}

export function serializeAboutContent(rawContent) {
	const normalized = normalizeAboutContent(rawContent);

	return {
		...normalized,
		_id: normalized._id?.toString?.() ?? normalized._id
	};
}

export function splitAboutParagraphs(text) {
	return String(text || '')
		.split(/\n\s*\n/)
		.map((paragraph) => paragraph.trim())
		.filter(Boolean);
}
