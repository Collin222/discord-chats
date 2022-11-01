declare namespace NodeJS {
	export interface ProcessEnv {
		DB_CONN: string;
		DB_NAME: string;
		CHATS_COLLECTION_NAME?: string;
		MESSAGES_COLLECTION_NAME?: string;
		BOT_TOKEN: string;
		GUILD_ID: string;
		CHANNEL_ID: string;
		EMAIL: string;
		EMAIL_PASSWORD: string;
		IMAP_HOST: string;
		DOMAIN: string;
		PORT?: string;
		HEALTH_CHECK_ROUTE?: '1' | '0';
	}
}
