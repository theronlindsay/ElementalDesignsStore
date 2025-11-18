import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { cwd } from 'process';

export const GET: RequestHandler = async ({ params }) => {
	try {
		const filename = params.filename;
		
		// Validate filename to prevent directory traversal
		if (!filename || filename.includes('..') || filename.includes('/')) {
			throw error(400, 'Invalid filename');
		}

		const imagePath = join(cwd(), 'src', 'data', 'images', filename);

		// Check if file exists
		if (!existsSync(imagePath)) {
			throw error(404, 'Image not found');
		}

		// Read file
		const file = readFileSync(imagePath);

		// Determine MIME type based on extension
		const ext = filename.split('.').pop()?.toLowerCase() || '';
		const mimeTypes: Record<string, string> = {
			'jpg': 'image/jpeg',
			'jpeg': 'image/jpeg',
			'png': 'image/png',
			'gif': 'image/gif',
			'webp': 'image/webp',
			'svg': 'image/svg+xml'
		};

		const contentType = mimeTypes[ext] || 'application/octet-stream';

		return new Response(file, {
			headers: {
				'Content-Type': contentType,
				'Cache-Control': 'public, max-age=31536000' // Cache for 1 year
			}
		});
	} catch (err) {
		throw error(500, 'Failed to serve image');
	}
};
