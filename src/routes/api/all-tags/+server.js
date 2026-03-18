import { json } from '@sveltejs/kit';
import { SquareClient, SquareEnvironment } from 'square';
import { env } from '$env/dynamic/private';

const client = new SquareClient({
	token: env.SQUARE_ACCESS_TOKEN,
	environment: SquareEnvironment.Sandbox
});

export const GET = async () => {
	try {
		const response = await client.catalog.search({ objectTypes: ['CATEGORY'] });
		const allTags = new Set();

		if (response.objects) {
			response.objects.forEach((obj) => {
				if (obj.categoryData && obj.categoryData.name) {
					allTags.add(obj.categoryData.name.toLowerCase());
				}
			});
		}

		return json({
			tags: Array.from(allTags)
				.filter((t) => t)
				.sort()
		});
	} catch (error) {
		console.error('Error fetching all categories (tags):', error);
		return json({ error: 'Failed to fetch tags' }, { status: 500 });
	}
};
