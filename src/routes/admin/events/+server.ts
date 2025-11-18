import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import path from 'path';

function getEventsFilePath(): string {
	return path.join(process.cwd(), 'src', 'data', 'events.json');
}

// Read events from JSON file
function readEvents(): any[] {
	try {
		const EVENTS_FILE = getEventsFilePath();
		if (!existsSync(EVENTS_FILE)) {
			return [];
		}
		const data = readFileSync(EVENTS_FILE, 'utf-8');
		const parsed = JSON.parse(data);
		return parsed.events || [];
	} catch (err) {
		console.error('Error reading events:', err);
		return [];
	}
}

// Write events to JSON file
function writeEvents(events: any[]): void {
	try {
		const EVENTS_FILE = getEventsFilePath();
		const data = JSON.stringify({ events }, null, 2);
		writeFileSync(EVENTS_FILE, data, 'utf-8');
	} catch (err) {
		console.error('Error writing events:', err);
		throw error(500, 'Failed to save events');
	}
}

// GET - fetch all events
export const GET: RequestHandler = async () => {
	const events = readEvents();
	return json({ events });
};

// POST - add or update an event
export const POST: RequestHandler = async ({ request }) => {
	try {
		const eventData = await request.json();
		const events = readEvents();

		// Check if updating existing event
		const existingIndex = events.findIndex((e: any) => e.id === eventData.id);
		if (existingIndex >= 0) {
			events[existingIndex] = eventData;
		} else {
			events.push(eventData);
		}

		writeEvents(events);
		return json({ success: true, event: eventData });
	} catch (err) {
		console.error('Error saving event:', err);
		throw error(500, 'Failed to save event');
	}
};

// DELETE - remove an event
export const DELETE: RequestHandler = async ({ request }) => {
	try {
		const { id } = await request.json();
		let events = readEvents();

		events = events.filter((e: any) => e.id !== id);
		writeEvents(events);

		return json({ success: true });
	} catch (err) {
		console.error('Error deleting event:', err);
		throw error(500, 'Failed to delete event');
	}
};
