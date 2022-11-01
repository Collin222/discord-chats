// import Imap from 'imap';
// import { simpleParser } from 'mailparser';
// import { getChatsByEmail } from './database';
// import { createChat } from './chats';
// import { MessageAuthor } from '../structures/Message';

// const imap = new Imap({
// 	user: process.env.EMAIL,
// 	password: process.env.EMAIL_PASSWORD,
// 	host: process.env.IMAP_HOST,
// 	port: parseInt(process.env.IMAP_PORT),
// 	tls: process.env.IMAP_TLS === '0' ? false : true,
// 	tlsOptions: {
// 		servername: process.env.IMAP_TLS_SERVER_NAME,
// 	},
// });

// type OpenInboxCb = (error: Error, mailbox: Imap.Box) => void;
// const openInbox = (cb: OpenInboxCb) => {
// 	imap.openBox('INBOX', true, cb);
// };

// const fetchNewestMailContent = (boxTotalMsgs: number) => {
// 	var f = imap.seq.fetch(boxTotalMsgs + ':*', {
// 		bodies: ['HEADER.FIELDS (FROM)', 'TEXT'],
// 	});

// 	f.on('message', msg => {
// 		const data: { sender: string; content: string } = {
// 			sender: '',
// 			content: '',
// 		};
// 		const done = async () => {
// 			const chats = await getChatsByEmail(data.sender);
// 			let chat = chats.find(x => x.open);
// 			if (!chat)
// 				chat = await createChat({
// 					email: data.sender,
// 				});
// 			await chat.createMessage({
// 				content: data.content,
// 				author: MessageAuthor.REQUESTER,
// 			});
// 		};

// 		msg.on('body', async stream => {
// 			simpleParser(stream, (err, parsed) => {
// 				if (err) throw err;
// 				if (parsed.from) {
// 					data.sender = parsed.from.value[0]?.address || '';
// 				} else if (parsed.textAsHtml) {
// 					let content = parsed.textAsHtml
// 						.split(parsed.headerLines[0].line)[0]
// 						.trim();
// 					if (content.endsWith('<p>'))
// 						content = content.slice(0, content.length - 1);
// 					data.content = content;
// 					done();
// 				}
// 			});
// 		});
// 	});
// 	f.on('error', function (err) {
// 		console.log('IMAP Fetch error: ' + err);
// 	});
// };

// imap.once('ready', () => {
// 	console.log('IMAP is ready');
// 	openInbox((err, box) => {
// 		if (err) throw err;

// 		imap.on('mail', (num: number) => {
// 			console.log(`Received ${num} new emails`);
// 			fetchNewestMailContent(box.messages.total);
// 		});
// 	});
// });

// imap.once('error', (err: Error) => {
// 	console.error(`IMAP Error : ${err}`);
// });

// imap.once('end', () => {
// 	console.log('IMAP connection ended');
// });

// imap.once('alert', (msg: string) => {
// 	console.warn(`IMAP Alert : ${msg}`);
// });

// export const connect = () => {
// 	imap.connect();
// };

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
