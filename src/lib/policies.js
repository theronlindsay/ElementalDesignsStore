export const POLICY_DOC_ID = 'store-policies';

export const DEFAULT_POLICY_CONTENT = {
	id: POLICY_DOC_ID,
	heroTitle: 'Store Policies',
	heroSubtitle: 'Information regarding shipping, returns, and privacy',
	shippingTitle: 'Shipping Policy',
	shippingBody:
		'We process all orders within 1-3 business days. Custom orders may take longer depending on complexity and material availability.\n\nDomestic shipping typically takes 3-5 business days after processing. We provide tracking information for all shipments once they are dispatched.',
	returnsTitle: 'Returns & Exchanges',
	returnsBody:
		'We want you to be completely satisfied with your purchase. We accept returns and exchanges on non-custom items within 14 days of delivery.\n\nItems must be returned in their original, unworn condition. Please contact us before returning an item so we can provide you with instructions.\n\nNote: Custom or personalized items cannot be returned or exchanged unless they arrive damaged or defective.',
	privacyTitle: 'Privacy Policy',
	privacyBody:
		'We deeply respect your privacy. Any personal information you provide to us during checkout or when subscribing to our newsletter is used solely for processing your orders or communicating with you.\n\nWe will never sell, share, or rent your personal information to third parties without your explicit consent.'
};

export function normalizePolicyContent(rawContent) {
	return {
		...DEFAULT_POLICY_CONTENT,
		...(rawContent || {}),
		id: POLICY_DOC_ID
	};
}

export function serializePolicyContent(rawContent) {
	const normalized = normalizePolicyContent(rawContent);

	return {
		...normalized,
		_id: normalized._id?.toString?.() ?? normalized._id
	};
}

export function splitPolicyParagraphs(text) {
	return String(text || '')
		.split(/\n\s*\n/)
		.map((paragraph) => paragraph.trim())
		.filter(Boolean);
}
