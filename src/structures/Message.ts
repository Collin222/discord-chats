import MessageModel from '../models/Message';
import {
	deleteMessageById,
	getChatById,
	updateMessageById,
	getChatsByEmail,
} from '../services/database';
import { bot } from '../index';
import { ButtonStyles, ComponentTypes, MessageActionRow } from 'oceanic.js';
import { Buttons } from '../constants';
import {
	createMessageImage,
	doesMessageImageExist,
	getMessageImageApiRoute,
	getMessageImagePath,
} from '../services/messages';

export enum MessageAuthor {
	RESPONDENT,
	REQUESTER,
}

interface Data {
	id: string;
	chatId: string;
	discordMessageId?: string;
	content: string;
	createdAt: number;
	author: MessageAuthor;
	discordUserId?: string;
	mailMessageId?: string;
}

class Message {
	id: string;
	chatId: string;
	discordMessageId?: string;
	content: string;
	createdAt: number;
	author: MessageAuthor;
	discordUserId?: string;
	mailMessageId?: string;

	constructor(data: Data) {
		this.id = data.id;
		this.chatId = data.chatId;
		this.discordMessageId = data.discordMessageId;
		this.content = data.content;
		this.createdAt = data.createdAt;
		this.author = data.author;
		this.discordUserId = data.discordUserId;
		this.mailMessageId = data.mailMessageId;
	}

	toModel(): MessageModel {
		return {
			id: this.id,
			chatId: this.chatId,
			discordMessageId: this.discordMessageId,
			content: this.content,
			createdAt: this.createdAt,
			author: this.author,
			discordUserId: this.discordUserId,
			mailMessageId: this.mailMessageId,
		};
	}

	async getChat() {
		return await getChatById(this.chatId);
	}

	async sendMessage() {
		const channel = bot.getChatsChannel();

		const chat = await this.getChat();
		if (!chat)
			throw new Error(`Could not get chat for message with ID: ${this.id}`);
		const msgs = await chat.getMessages();

		const numOfChats = (await getChatsByEmail(chat.email)).length - 1;

		// get latest message ID
		let latestMsgId: string | undefined;
		const reversedMsgs = msgs.reverse();
		for (let i = 0; i < msgs.length; i++) {
			const msg = reversedMsgs[i];
			if (!msg.discordMessageId) continue;
			latestMsgId = msg.discordMessageId;
			break;
		}

		await this.findOrCreateImage();

		const components: MessageActionRow[] = [
			{
				type: ComponentTypes.ACTION_ROW,
				components: [
					{
						type: ComponentTypes.BUTTON,
						label: 'Reply',
						style: ButtonStyles.SUCCESS,
						customID: `${Buttons.REPLY}:${this.chatId}`,
					},
					{
						type: ComponentTypes.BUTTON,
						label: 'Close Chat',
						style: ButtonStyles.DANGER,
						customID: `${Buttons.CLOSE}:${this.chatId}`,
					},
					{
						type: ComponentTypes.BUTTON,
						label: 'View Chat Messages',
						style: ButtonStyles.SECONDARY,
						customID: `${Buttons.VIEW_CHAT_MESSAGES}:${this.chatId}`,
					},
					{
						type: ComponentTypes.BUTTON,
						label: 'View Previous Chats',
						style: ButtonStyles.SECONDARY,
						customID: `${Buttons.VIEW_PREVIOUS_CHATS}:${chat.email}`,
					},
				],
			},
		];

		const msg = await channel.createMessage({
			embeds: [
				{
					title:
						this.author === MessageAuthor.REQUESTER
							? 'New Message'
							: 'Message Sent',
					fields: [
						{
							name: "User's Email",
							value: chat.email,
							inline: true,
						},
						{
							name: '# of Messages in Chat',
							value: `${msgs.length + 1}`,
							inline: true,
						},
						{
							name: 'Previous Chats',
							value: numOfChats.toString(),
							inline: true,
						},
						{
							name: 'Subject',
							value: chat.subject,
							inline: true,
						},
					],
					timestamp: new Date().toISOString(),
					color:
						this.author === MessageAuthor.RESPONDENT
							? parseInt('00ff2a', 16)
							: msgs.length === 0
							? parseInt('ffd500', 16)
							: parseInt('0066ff', 16),
					image: {
						url: getMessageImageApiRoute(this.id),
					},
				},
			],
			messageReference: latestMsgId
				? {
						guildID: channel.guildID,
						channelID: channel.id,
						messageID: latestMsgId,
				  }
				: undefined,
			components,
		});
		latestMsgId = msg.id;
		this.discordMessageId = latestMsgId;
		await this.update();
	}

	/**
	 * @param prevId If the ID was updated, the previous ID of the message that exists in the database. If not provided, the ID property is used.
	 */
	async update(prevId?: string) {
		await updateMessageById(prevId || this.id, this);
	}

	async delete() {
		await deleteMessageById(this.id);
	}

	async getDiscordUser() {
		if (!this.discordUserId) return;
		const user = await bot.client.rest.users.get(this.discordUserId);
		return user;
	}

	/**
	 * @returns The path to the image.
	 */
	async findOrCreateImage() {
		const exists = doesMessageImageExist(this.id);
		if (!exists) {
			await createMessageImage(this.id, this.content);
		}

		return getMessageImagePath(this.id);
	}
}

export default Message;
