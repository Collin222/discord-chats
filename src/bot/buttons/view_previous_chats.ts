import { ComponentTypes, MessageFlags } from 'oceanic.js';
import { getChatsByEmail } from '../../services/database';
import type { ButtonHandlerFn } from '../../types';
import { Selects } from '../../constants';

const viewPreviousChats: ButtonHandlerFn = async (interaction, args) => {
	if (args.length < 1)
		return console.error(
			'View previous chats button has invalid number of args'
		);

	const email = args[0];

	const chats = await getChatsByEmail(email);

	const chatParts: string[] = [];
	for (let i = 0; i < chats.length; i++) {
		const chat = chats[i];
		const messages = await chat.getMessages();
		const text = `**${i + 1}.** Chat (\`ID: ${
			chat.id
		}\`) opened on <t:${Math.round(chat.createdAt / 1000)}:F> with ${
			messages.length
		} message${messages.length === 1 ? '' : 's'}.`;
		chatParts.push(text);
	}

	const parts = [
		`**${chats.length} previous chat${
			chats.length === 1 ? '' : 's'
		} with ${email}**\n\n`,
	];
	const PART_LEN = 4096;
	for (let i = 0; i < chatParts.length; i++) {
		const text = chatParts[i];
		const add = text + '\n\n';
		if ((parts[parts.length - 1] + add).length > PART_LEN) {
			parts.push(text + '\n\n');
		} else {
			parts[parts.length - 1] += add;
		}
	}

	for (let i = 0; i < parts.length; i++) {
		const text = parts[i];
		await interaction.createMessage({
			embeds: [
				{
					title: i === 0 ? 'Previous Chats' : 'Previous Chats Continued...',
					description: text,
					color: parseInt('0066ff', 16),
				},
			],
			components: [
				{
					type: ComponentTypes.ACTION_ROW,
					components: [
						{
							type: ComponentTypes.STRING_SELECT,
							customID: Selects.VIEW_CHAT_MESSAGES,
							options: chats.map(chat => ({
								label: `ID: ${chat.id}`,
								value: chat.id,
							})),
							placeholder: 'View messages of chat',
						},
					],
				},
			],
			flags: MessageFlags.EPHEMERAL,
		});
	}
};

export default viewPreviousChats;
