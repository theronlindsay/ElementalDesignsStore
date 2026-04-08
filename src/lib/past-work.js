export const PAST_WORK_DOC_ID = 'past-work-catalog';

function newLocalId() {
	if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
		return crypto.randomUUID();
	}
	return `id-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * Merge legacy single `imageUrl` with `imageUrls` array (deduped, order preserved).
 * @param {unknown} o
 * @returns {string[]}
 */
function normalizeImageUrls(o) {
	const rec = o && typeof o === 'object' ? /** @type {Record<string, unknown>} */ (o) : {};
	const fromArray = Array.isArray(rec.imageUrls)
		? rec.imageUrls
				.filter((u) => typeof u === 'string' && u.trim())
				.map((u) => /** @type {string} */ (u).trim())
		: [];
	const legacy =
		typeof rec.imageUrl === 'string' && rec.imageUrl.trim() ? [rec.imageUrl.trim()] : [];
	const seen = new Set();
	const out = [];
	for (const u of [...fromArray, ...legacy]) {
		if (!seen.has(u)) {
			seen.add(u);
			out.push(u);
		}
	}
	return out;
}

/**
 * @param {unknown} raw
 */
export function normalizePastWorkCatalog(raw) {
	const o = raw && typeof raw === 'object' ? /** @type {Record<string, unknown>} */ (raw) : {};
	const itemsRaw = o.items;
	const items = Array.isArray(itemsRaw)
		? itemsRaw.map((entry) => normalizePastWorkItem(entry))
		: [];
	return {
		id: PAST_WORK_DOC_ID,
		items
	};
}

/**
 * @param {unknown} raw
 */
function normalizePastWorkItem(raw) {
	const o = raw && typeof raw === 'object' ? /** @type {Record<string, unknown>} */ (raw) : {};
	const priceRaw = o.price;
	let price = null;
	if (priceRaw != null && priceRaw !== '') {
		const n = Number(priceRaw);
		price = Number.isFinite(n) ? n : null;
	}
	let workDate = '';
	if (o.workDate instanceof Date && !Number.isNaN(o.workDate.getTime())) {
		workDate = o.workDate.toISOString().slice(0, 10);
	} else if (typeof o.workDate === 'string' && o.workDate.trim()) {
		workDate = o.workDate.trim().slice(0, 10);
	}
	return {
		id: typeof o.id === 'string' && o.id ? o.id : newLocalId(),
		imageUrls: normalizeImageUrls(o),
		name: typeof o.name === 'string' ? o.name : '',
		description: typeof o.description === 'string' ? o.description : '',
		price,
		workDate
	};
}

/**
 * @param {unknown} raw
 */
export function serializePastWorkCatalog(raw) {
	const normalized = normalizePastWorkCatalog(raw);
	const o = raw && typeof raw === 'object' ? /** @type {Record<string, unknown>} */ (raw) : {};
	return {
		...normalized,
		_id: o._id?.toString?.() ?? o._id,
		...(typeof o.updatedAt === 'string' ? { updatedAt: o.updatedAt } : {})
	};
}
