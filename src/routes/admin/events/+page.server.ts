import type { PageServerLoad } from './$types';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import path from 'path';

function getEventsFilePath(): string {
	return path.join(process.cwd(), 'src', 'data', 'events.json');
}

function ensureEventsFileExists(): void {
	const filePath = getEventsFilePath();
	const dirPath = path.dirname(filePath);
	
	// Create directory if it doesn't exist
	if (!existsSync(dirPath)) {
		mkdirSync(dirPath, { recursive: true });
	}
	
	// Create file with empty events array if it doesn't exist
	if (!existsSync(filePath)) {
		writeFileSync(filePath, JSON.stringify({ events: [] }, null, 2), 'utf-8');
	}
}

export const load: PageServerLoad = async () => {
	try {
		ensureEventsFileExists();
		const filePath = getEventsFilePath();
		const fileContent = readFileSync(filePath, 'utf-8');
		const eventsData = JSON.parse(fileContent);
		return { 
			events: eventsData.events || [] 
		};
	} catch (err) {
		console.error('Error loading events:', err);
		return { events: [] };
	}
};
