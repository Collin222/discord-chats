import Chat from '../structures/Chat';
import { createChat as createChatDb } from './database';
import snowflake from './snowflake';

export interface CreateChatData {
	email: string;
	subject: string;
}
export const createChat = async (data: CreateChatData) => {
	const chat = new Chat({
		id: snowflake.generate(),
		createdAt: Date.now(),
		open: true,
		...data,
	});

	await createChatDb(chat);

	return chat;
};
