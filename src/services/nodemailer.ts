import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
	auth: {
		user: process.env.EMAIL,
		pass: process.env.EMAIL_PASSWORD,
	},
	host: process.env.IMAP_HOST,
	port: 465,
	secure: true,
});

export interface SendMailOptions {
	to: string;
	subject: string;
	html: string;
	inReplyTo?: string;
}

export const sendMail = (options: SendMailOptions) => {
	transporter.sendMail({
		from: process.env.EMAIL,
		to: options.to,
		inReplyTo: options.inReplyTo,
		subject: options.subject,
		html: options.html,
	});
};
