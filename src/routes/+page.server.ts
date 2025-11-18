import type { PageServerLoad } from './$types';
import { readFileSync } from 'fs';
import path from 'path';

export const load: PageServerLoad = async () => {
	try {
		const filePath = path.join(process.cwd(), 'src', 'data', 'events.json');
		const fileContent = readFileSync(filePath, 'utf-8');
		const eventsData = JSON.parse(fileContent);
		console.log('Loaded events:', eventsData.events);
		return { 
			events: eventsData.events || [] 
		};
	} catch (err) {
		console.error('Error loading events:', err);
		return { events: [] };
	}
};
