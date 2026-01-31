import type { PageServerLoad } from './$types';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import path from 'path';

export const load: PageServerLoad = async () => {
	try {
		const filePath = path.join(process.cwd(), 'src', 'data', 'events.json');
		
		// Check if file exists, if not create it with empty events array
		if (!existsSync(filePath)) {
			const emptyEvents = { events: [] };
			writeFileSync(filePath, JSON.stringify(emptyEvents, null, 2), 'utf-8');
			console.log('Created empty events.json file');
			return { events: [] };
		}
		
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
