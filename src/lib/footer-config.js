export const FOOTER_DOC_ID = 'site-footer';

/** @typedef {{ id: string, iconClass?: string, text: string, href?: string }} FooterLinkItem */
/** @typedef {{ id: string, title: string, items: FooterLinkItem[] }} FooterSection */

function newLocalId() {
	if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
		return crypto.randomUUID();
	}
	return `id-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/** Mirrors the original static footer columns (fallback when no Mongo doc or empty sections). */
export const DEFAULT_FOOTER_SECTIONS = /** @type {FooterSection[]} */ ([
	{
		id: 'def-col-info',
		title: 'Info',
		items: [
			{
				id: 'def-i-cal',
				iconClass: 'fas fa-calendar',
				text: 'Event schedule',
				href: '/#events-schedule'
			},
			{ id: 'def-i-about', iconClass: 'fas fa-info', text: 'About', href: '/about' },
			{
				id: 'def-i-past',
				iconClass: 'fas fa-images',
				text: 'Past work',
				href: '/past-work'
			},
			{
				id: 'def-i-contact',
				iconClass: 'fas fa-envelope',
				text: 'Contact',
				href: 'mailto:elementalchaindesigns@gmail.com'
			}
		]
	},
	{
		id: 'def-col-social',
		title: 'Social',
		items: [
			{
				id: 'def-i-ig',
				iconClass: 'fab fa-instagram',
				text: 'Instagram',
				href: 'https://www.instagram.com/elementalchaindesigns?igsh=MTF3YW13amV4MDFhMw=='
			},
			{
				id: 'def-i-fb',
				iconClass: 'fab fa-facebook',
				text: 'Facebook',
				href: 'https://www.facebook.com/share/188h9hVurC/?mibextid=LQQJ4d'
			}
		]
	},
	{
		id: 'def-col-payments',
		title: 'Payments',
		items: [
			{ id: 'def-p-vm', iconClass: 'fab fa-cc-visa', text: 'Visa / Mastercard' },
			{ id: 'def-p-ad', iconClass: 'fab fa-cc-amex', text: 'Amex / Discover' },
			{ id: 'def-p-ag', iconClass: 'fab fa-apple-pay', text: 'Apple / Google Pay' },
			{ id: 'def-p-pv', iconClass: 'fab fa-cc-paypal', text: 'Paypal / Venmo' },
			{ id: 'def-p-cs', iconClass: 'fab fa-cash-app', text: 'CashApp / Square' }
		]
	},
	{
		id: 'def-col-policies',
		title: 'Policies',
		items: [
			{
				id: 'def-pol-ship',
				iconClass: 'fas fa-shipping-fast',
				text: 'Shipping',
				href: '/policies#shipping'
			},
			{
				id: 'def-pol-ret',
				iconClass: 'fas fa-undo',
				text: 'Returns',
				href: '/policies#returns'
			},
			{
				id: 'def-pol-priv',
				iconClass: 'fas fa-shield-alt',
				text: 'Privacy',
				href: '/policies#privacy'
			}
		]
	}
]);

export function cloneDefaultSections() {
	return structuredClone(DEFAULT_FOOTER_SECTIONS);
}

/**
 * @param {unknown} raw
 * @returns {FooterLinkItem}
 */
function normalizeItem(raw) {
	const o = raw && typeof raw === 'object' ? /** @type {Record<string, unknown>} */ (raw) : {};
	const hrefRaw = o.href;
	const hrefStr = hrefRaw == null ? '' : String(hrefRaw).trim();
	return {
		id: typeof o.id === 'string' && o.id ? o.id : newLocalId(),
		iconClass: typeof o.iconClass === 'string' ? o.iconClass.trim() : '',
		text: typeof o.text === 'string' ? o.text : '',
		...(hrefStr ? { href: hrefStr } : {})
	};
}

/**
 * @param {unknown} raw
 * @returns {FooterSection}
 */
function normalizeSection(raw) {
	const o = raw && typeof raw === 'object' ? /** @type {Record<string, unknown>} */ (raw) : {};
	const itemsRaw = o.items;
	const items = Array.isArray(itemsRaw) ? itemsRaw.map(normalizeItem) : [];
	return {
		id: typeof o.id === 'string' && o.id ? o.id : newLocalId(),
		title: typeof o.title === 'string' ? o.title : 'Section',
		items
	};
}

/**
 * @param {unknown} raw
 * @returns {{ id: string, sections: FooterSection[], updatedAt?: string }}
 */
export function normalizeFooterConfig(raw) {
	const o = raw && typeof raw === 'object' ? /** @type {Record<string, unknown>} */ (raw) : {};
	const sectionsRaw = o.sections;
	const sections = Array.isArray(sectionsRaw) ? sectionsRaw.map(normalizeSection) : [];
	return {
		id: FOOTER_DOC_ID,
		sections,
		...(typeof o.updatedAt === 'string' ? { updatedAt: o.updatedAt } : {})
	};
}

/**
 * @param {unknown} raw
 */
export function serializeFooterConfig(raw) {
	const normalized = normalizeFooterConfig(raw);
	const o = raw && typeof raw === 'object' ? /** @type {Record<string, unknown>} */ (raw) : {};
	return {
		...normalized,
		_id: o._id?.toString?.() ?? o._id
	};
}
