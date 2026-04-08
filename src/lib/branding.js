export const BRANDING_DOC_ID = 'site-branding';

export const DEFAULT_BRANDING_CONTENT = {
	id: BRANDING_DOC_ID,
	logoPrimaryUrl: '',
	logoAlt: 'Elemental Designs Logo',
	homeHeroTitle: 'Handcrafted Chainmail and Laser-Engraved Gifts',
	homeHeroDescription:
		'Explore our unique collection of handcrafted jewelry and personalized gifts.\n\nEach piece is carefully crafted with attention to detail and quality.',
	featuredItemIds: [],
	eventsSectionTitle: 'Upcoming Events',
	testimonialsSectionTitle: 'Customer Testimonials',
	customOrdersTitle: 'Custom orders',
	customOrdersBody:
		'Have something specific in mind? We create custom chainmail and laser-engraved pieces tailored to your vision. From personalized jewelry to unique gifts.',
	customOrdersPrimaryCta: 'Start a custom request',
	customOrdersSecondaryCta: 'See past work',
	newsletterTitle: 'Sign up for our newsletter:',
	newsletterEmailPlaceholder: 'Enter your email',
	newsletterButtonLabel: 'Get updates',
	newsletterDisclaimer: 'No pop-ups. We only email about shows and launches.'
};

export function normalizeBrandingContent(rawContent) {
	return {
		...DEFAULT_BRANDING_CONTENT,
		...(rawContent || {}),
		id: BRANDING_DOC_ID
	};
}

export function serializeBrandingContent(rawContent) {
	const normalized = normalizeBrandingContent(rawContent);

	return {
		...normalized,
		_id: normalized._id?.toString?.() ?? normalized._id
	};
}

export function splitBrandingParagraphs(text) {
	return String(text || '')
		.split(/\n\s*\n/)
		.map((paragraph) => paragraph.trim())
		.filter(Boolean);
}
