import { json } from '@sveltejs/kit';
import type { CatalogObject, CatalogObjectType } from 'square';
import { client } from '$lib/square';

export const GET = async () => {
	try {
		const objectTypes: CatalogObjectType[] = ['CATEGORY'];
		const response = await client.catalog.search({ objectTypes });
		const allTags = new Set<string>();

		if (response.objects) {
			for (const obj of response.objects) {
				if (obj.type === 'CATEGORY') {
					const name = (obj as CatalogObject.Category).categoryData?.name;
					if (name) allTags.add(name.toLowerCase());
				}
			}
		}

		return json({
			tags: Array.from(allTags)
				.filter((t) => t)
				.sort(),
		});
	} catch (error) {
		console.error('Error fetching all categories (tags):', error);
		return json({ error: 'Failed to fetch tags' }, { status: 500 });
	}
};
