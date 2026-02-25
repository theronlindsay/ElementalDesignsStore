import { getCollection } from '$lib/mongo';

export const load = async () => {
	try {
		const collection = await getCollection("Testimonials");
		const testimonials = await collection.find({}).sort({ order: 1 }).toArray();
		// Convert _id to string for serialization
		const serializableTestimonials = testimonials.map((testimonial) => ({
			...testimonial,
			id: testimonial.id || testimonial._id?.toString?.() || testimonial._id,
			_id: testimonial._id?.toString?.() ?? testimonial._id
		}));
		return { testimonials: serializableTestimonials };
	} catch (err) {
		console.error('Error loading testimonials from MongoDB:', err);
		return { testimonials: [] };
	}
};
