import type { PageServerLoad } from './$types';
import eventsData from '../../../data/events.json';

export const load: PageServerLoad = async () => {
	return { 
		events: eventsData.events || [] 
	};
};
