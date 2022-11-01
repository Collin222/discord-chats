import ChatModel from '../models/Chat';
import {
	updateChatById,
	deleteChatById,
	getChatMessages,
} from '../services/database';
import { createMessage, CreateMessageData } from '../services/messages';

interface Data {
	id: string;
	email: string;
	createdAt: number;
	open: boolean;
	subject: string;
}

class Chat {
	id: string;
	email: string;
	createdAt: number;
	open: boolean;
	subject: string;

	constructor(data: Data) {
		this.id = data.id;
		this.email = data.email;
		this.createdAt = data.createdAt;
		this.open = data.open;
		this.subject = data.subject;
	}

	toModel(): ChatModel {
		return {
			id: this.id,
			email: this.email,
			createdAt: this.createdAt,
			open: this.open,
			subject: this.subject,
		};
	}

	/**
	 * @param prevId If the ID was updated, the previous ID of the chat that exists in the database. If not provided, the ID property is used.
	 */
	async update(prevId?: string) {
		await updateChatById(prevId || this.id, this);
	}

	async delete() {
		await deleteChatById(this.id);
	}

	async getMessages() {
		return await getChatMessages(this.id);
	}

	async createMessage(
		data: Omit<CreateMessageData, 'chatId'>,
		sendDiscordMessage = true,
		reply = false
	) {
		const res = await createMessage(
			{
				chatId: this.id,
				...data,
			},
			sendDiscordMessage,
			reply
		);
		return res;
	}

	async getLatestMessage() {
		const messages = await this.getMessages();
		if (messages.length < 1) return;
		return messages[messages.length - 1];
	}
}

export default Chat;
