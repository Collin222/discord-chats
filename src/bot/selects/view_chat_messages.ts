import {
	ButtonStyles,
	ComponentTypes,
	InteractionContent,
	InteractionOptionsWrapper,
	MessageFlags,
} from 'oceanic.js';
import { getChatById } from '../../services/database';
import type { SelectHandlerFn } from '../../types';
import { Buttons } from '../../constants';
import { MessageAuthor } from '../../structures/Message';

const viewChatMessages: SelectHandlerFn = async interaction => {
	if (interaction.data.values.raw.length !== 1)
		return console.error('Invalid number of chat messages provided');

	const chatId = interaction.data.values.raw[0];
	const chat = await getChatById(chatId);
	if (!chat) return console.error('Could not get chat');

	const messages = await chat.getMessages();

	const msgParts: string[] = [];
	for (let i = 0; i < messages.length; i++) {
		const msg = messages[i];
		const user = await msg.getDiscordUser();
		const text = `**${i + 1}.** From ${
			msg.author === MessageAuthor.REQUESTER
				? chat.email
				: user
				? `replier (${user.tag})`
				: 'replier'
		}\n\`\`\`html\n${msg.content}\`\`\``;
		msgParts.push(text);
	}

	const parts: string[] = [
		`**Viewing HTML of ${messages.length} message${
			messages.length === 1 ? '' : 's'
		} in chat (\`ID: ${chatId}\`)**\n\n`,
	];
	const PART_LEN = 4096;
	for (let i = 0; i < msgParts.length; i++) {
		const text = msgParts[i];
		const add = text + '\n\n';
		if ((parts[parts.length - 1] + add).length > PART_LEN) {
			parts.push(add);
		} else {
			parts[parts.length - 1] += add;
		}
	}

	parts.forEach(async (text, i) => {
		const options: InteractionContent = {
			embeds: [
				{
					title: i === 0 ? 'Messages' : 'Messages Continued',
					description: text,
					color: parseInt('0066ff', 16),
				},
			],
			components: [
				{
					type: ComponentTypes.ACTION_ROW,
					components: [
						{
							type: ComponentTypes.BUTTON,
							style: ButtonStyles.PRIMARY,
							label: 'View Image of HTML',
							customID: `${Buttons.VIEW_MESSAGE_IMAGE}:${chatId}`,
						},
					],
				},
			],
			flags: MessageFlags.EPHEMERAL,
		};
		if (i === 0) interaction.createMessage(options);
		else interaction.createFollowup(options);
	});
};

export default viewChatMessages;
