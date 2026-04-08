import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { client } from '$lib/square';

export const POST = async ({ request }) => {
	try {
		const body = await request.json();
		const { sourceId, breakdown } = body ?? {};

		if (!sourceId) {
			return json({ error: 'Missing payment source token.' }, { status: 400 });
		}

		const total = Number(breakdown?.total ?? 0);
		if (!Number.isFinite(total) || total <= 0) {
			return json({ error: 'Invalid total amount.' }, { status: 400 });
		}

		const locationId = env.PUBLIC_SQUARE_LOCATION_ID;
		if (!locationId) {
			return json({ error: 'Square location is not configured.' }, { status: 500 });
		}

		const amountCents = BigInt(Math.round(total * 100));
		const payment = await client.payments.create({
			sourceId,
			idempotencyKey: `checkout-${Date.now()}-${Math.random().toString(16).slice(2)}`,
			locationId,
			amountMoney: {
				amount: amountCents,
				currency: 'USD'
			}
		});

		return json({ success: true, paymentId: payment.payment?.id ?? null });
	} catch (error) {
		console.error('Checkout error:', error);
		return json({ error: 'Unable to process payment.' }, { status: 500 });
	}
};
