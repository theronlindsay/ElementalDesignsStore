import { json } from '@sveltejs/kit';
import nodemailer from 'nodemailer';
import { env } from '$env/dynamic/private';

/** @type {import('@sveltejs/kit').RequestHandler} */
export const POST = async ({ request }) => {
	try {
		const orderData = await request.json();
		const { name, email, request: orderRequest } = orderData;

		if (!name || !email || !orderRequest) {
			return json({ error: 'Missing required fields' }, { status: 400 });
		}

		// Create transporter using SMTP credentials from env
		const transporter = nodemailer.createTransport({
			service: 'gmail',
			auth: {
				user: env.GMAIL_USER,
				pass: env.GMAIL_APP_PASSWORD
			}
		});

		// Setup email data
		const mailOptions = {
			from: env.GMAIL_USER,
			to: 'elementaldesignsstore@gmail.com',
			subject: `New Custom Order Request from ${name}`,
			text: `Name: ${name}\nEmail: ${email}\n\nRequest:\n${orderRequest}`,
			html: `
				<h3>New Custom Order Request</h3>
				<p><strong>Name:</strong> ${name}</p>
				<p><strong>Email:</strong> ${email}</p>
				<div>
					<strong>Request:</strong><br/>
					<p style="white-space: pre-wrap;">${orderRequest}</p>
				</div>
			`
		};

		// Send email
		await transporter.sendMail(mailOptions);

		return json({ success: true, message: 'Order request sent successfully' });
	} catch (error) {
		console.error('Error sending email:', error);
		return json({ error: 'Failed to send order request' }, { status: 500 });
	}
};
