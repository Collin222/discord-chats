import notifier, { Config } from 'mail-notifier';
import { getChatsByEmail } from './database';
import { createChat } from './chats';
import { MessageAuthor } from '../structures/Message';

const config: Config = {
	user: process.env.EMAIL,
	password: process.env.EMAIL_PASSWORD,
	host: process.env.IMAP_HOST,
	port: 993,
	tls: true,
	tlsOptions: {
		servername: process.env.IMAP_HOST,
	},
};

const n = notifier(config);

n.on('mail', async mail => {
	const address = mail.from[0]?.address;
	if (!address) return console.error('Could not get address of email');

	const chats = await getChatsByEmail(address);
	let chat = chats.find(x => x.open);
	if (!chat)
		chat = await createChat({
			email: address,
			subject: mail.subject,
		});
	chat.subject = mail.subject;
	await chat.update();
	await chat.createMessage({
		content: mail.html,
		author: MessageAuthor.REQUESTER,
		mailMessageId: mail.messageId,
	});
});

n.on('end', () => n.start());

n.on('connected', () => {
	console.log('Connected to IMAP');
});

n.on('error', err => {
	console.error('IMAP Error : ' + err);
});

export const connect = () => {
	n.start();
};
