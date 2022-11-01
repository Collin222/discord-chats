import { getChatById } from '../../services/database';
import type { ButtonHandlerFn } from '../../types';
import {
	ButtonStyles,
	ComponentTypes,
	InteractionContent,
	MessageFlags,
	User,
} from 'oceanic.js';
import { MessageAuthor } from '../../structures/Message';
import { Buttons } from '../../constants';

const viewChatMessages: ButtonHandlerFn = async (interaction, args) => {
	if (args.length < 1)
		return console.error(
			'View chat messages error contains invalid number of args'
		);

	const chatId = args[0];

	const chat = await getChatById(chatId);
	if (!chat) return console.error('Could not find chat');

	const msgs = await chat.getMessages();

	const msgParts: string[] = [];
	for (let i = 0; i < msgs.length; i++) {
		const msg = msgs[i];
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
		`**Viewing HTML of ${msgs.length} message${
			msgs.length === 1 ? '' : 's'
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
