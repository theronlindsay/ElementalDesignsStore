import { json, error } from '@sveltejs/kit';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { cwd } from 'process';

// Ensure data directory exists
function ensureDataDir() {
	const dataDir = join(cwd(), 'src', 'data', 'images');
	try {
		mkdirSync(dataDir, { recursive: true });
	} catch (err) {
		// Directory might already exist
	}
	return dataDir;
}

// Generate unique filename
function generateFilename() {
	return `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.webp`;
}

/** @type {import('./$types').RequestHandler} */
export const POST = async ({ request }) => {
	try {
		// Get the uploaded file
		const formData = await request.formData();
		const file = formData.get('file');

		if (!file) {
			throw error(400, 'No file provided');
		}

		// Validate file type
		if (!file.type.startsWith('image/')) {
			throw error(400, 'File must be an image');
		}

		// Validate file size (5MB max)
		if (file.size > 5 * 1024 * 1024) {
			throw error(400, 'File must be smaller than 5MB');
		}

		// Convert to buffer
		const buffer = await file.arrayBuffer();
		const uint8Array = new Uint8Array(buffer);

		// Ensure directory exists
		const dataDir = ensureDataDir();

		// Generate filename
		const filename = generateFilename();
		const filepath = join(dataDir, filename);

		// Write file to disk
		writeFileSync(filepath, uint8Array);

		// Return relative path for accessing the image
		const imagePath = `/data/images/${filename}`;

		return json({ imagePath, success: true });
	} catch (err) {
		console.error('Upload error:', err);
		throw error(500, 'Failed to upload image');
	}
};
