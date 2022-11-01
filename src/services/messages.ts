import Message, { MessageAuthor } from '../structures/Message';
import {
	createMessage as createMessageDb,
	getAllMessages,
	getChatById,
} from './database';
import snowflake from './snowflake';
import { join } from 'path';
import nodeHtmlToImage from 'node-html-to-image';
import { unlinkSync, existsSync, readdirSync, mkdirSync } from 'fs';
import { sendMail } from './nodemailer';

export interface CreateMessageData {
	chatId: string;
	content: string;
	author: MessageAuthor;
	discordUserId?: string;
	mailMessageId?: string;
}
export const createMessage = async (
	data: CreateMessageData,
	sendDiscordMessage = true,
	reply = false
) => {
	if (reply) {
		// send mail
		const chat = await getChatById(data.chatId);
		if (!chat) throw new Error('Could not get chat');
		const latestMsg = await chat.getLatestMessage();

		sendMail({
			to: chat.email,
			subject: chat.subject,
			html: data.content,
			inReplyTo: latestMsg?.mailMessageId,
		});
	}

	const message = new Message({
		id: snowflake.generate(),
		createdAt: Date.now(),
		...data,
	});
	if (sendDiscordMessage) await message.sendMessage();

	await createMessageDb(message);

	return message;
};

export const getMessageImagesDirectoryPath = () =>
	join(__dirname, '..', '..', 'message-images');

export const getMessageImagePath = (id: string) => {
	return join(getMessageImagesDirectoryPath(), `${id}.png`);
};

/**
 * @returns The path to the image.
 */
export const createMessageImage = async (id: string, content: string) => {
	if (!doesMessageImagesDirectoryExist())
		mkdirSync(getMessageImagesDirectoryPath());
	const path = getMessageImagePath(id);
	await nodeHtmlToImage({
		output: path,
		html: content,
	});
	return path;
};

export const deleteMessageImage = (id: string) => {
	const path = getMessageImagePath(id);
	unlinkSync(path);
};

export const doesMessageImageExist = (id: string) => {
	const path = getMessageImagePath(id);
	return existsSync(path);
};

export const getMessageImageApiRoute = (id: string) => {
	return `${process.env.DOMAIN}/images/${id}.png`;
};

export const doesMessageImagesDirectoryExist = () => {
	return existsSync(getMessageImagesDirectoryPath());
};

export const deleteAllMessageImages = () => {
	if (!doesMessageImagesDirectoryExist())
		mkdirSync(getMessageImagesDirectoryPath());
	const files = readdirSync(getMessageImagesDirectoryPath());

	for (const file of files) {
		unlinkSync(join(getMessageImagesDirectoryPath(), file));
	}
};

export const createAllMessageImages = async () => {
	const messages = await getAllMessages();
	deleteAllMessageImages();
	await Promise.all(
		messages.map(async msg => {
			await createMessageImage(msg.id, msg.content);
		})
	);

	console.log(`Created images for ${messages.length} messages`);
};
