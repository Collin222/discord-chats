import type { MessageAuthor } from '../structures/Message';

export default interface Message {
	id: string;
	chatId: string;
	discordMessageId?: string;
	content: string;
	createdAt: number;
	author: MessageAuthor;
	discordUserId?: string;
	mailMessageId?: string;
}
