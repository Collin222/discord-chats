import { MongoClient, Collection, Db } from 'mongodb';
import type ChatModel from '../models/Chat';
import Chat from '../structures/Chat';
import Message from '../structures/Message';
import MessageModel from '../models/Message';

const client = new MongoClient(process.env.DB_CONN);

interface Collections {
	chats: Collection<ChatModel>;
	messages: Collection<MessageModel>;
}

interface CustomDb extends Omit<Db, 'collections'> {
	collections: Collections;
}

export let db: CustomDb;

export const connect = async () => {
	await client.connect();

	console.log('Connected to database');

	const tempDb = client.db(process.env.DB_NAME);
	db = {
		...tempDb,
		collections: {
			chats: tempDb.collection(process.env.CHATS_COLLECTION_NAME || 'chats'),
			messages: tempDb.collection(
				process.env.MESSAGES_COLLECTION_NAME || 'messages'
			),
		},
	} as CustomDb;
};

export const createChat = async (chat: Chat) => {
	await db.collections.chats.insertOne(chat.toModel());
};

export const getChatById = async (id: string) => {
	const res = await db.collections.chats.findOne({ id });
	if (!res) return;
	return new Chat(res);
};

export const getChatsByEmail = async (email: string) => {
	const res = await db.collections.chats.find({ email }).toArray();
	return res.map(x => new Chat(x));
};

export const deleteChatById = async (id: string) => {
	await db.collections.chats.deleteOne({ id });
};

export const updateChatById = async (id: string, chat: Chat) => {
	await db.collections.chats.updateOne({ id }, { $set: chat.toModel() });
};

export const createMessage = async (message: Message) => {
	await db.collections.messages.insertOne(message.toModel());
};

export const getMessageById = async (id: string) => {
	const res = await db.collections.messages.findOne({ id });
	if (!res) return;
	return new Message(res);
};

export const getChatMessages = async (chatId: string) => {
	const res = await db.collections.messages.find({ chatId }).toArray();
	return res.map(x => new Message(x));
};

export const deleteMessageById = async (id: string) => {
	await db.collections.messages.deleteOne({ id });
};

export const updateMessageById = async (id: string, message: Message) => {
	await db.collections.messages.updateOne({ id }, { $set: message.toModel() });
};

export const getAllMessages = async () => {
	const res = await db.collections.messages.find().toArray();
	return res.map(x => new Message(x));
};
