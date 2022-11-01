import { getChatById } from '../../services/database';
import type { ButtonHandlerFn } from '../../types';
import { Modals } from '../../constants';
import { ComponentTypes, TextInputStyles } from 'oceanic.js';

const reply: ButtonHandlerFn = async (interaction, args) => {
	if (args.length < 1)
		return console.error('Reply button contains invalid number of args');

	const chatId = args[0];

	const chat = await getChatById(chatId);
	if (!chat) return console.error('Could not find chat');

	interaction.createModal({
		title: 'Reply to User',
		customID: `${Modals.REPLY}:${chatId}`,
		components: [
			{
				type: ComponentTypes.ACTION_ROW,
				components: [
					{
						type: ComponentTypes.TEXT_INPUT,
						style: TextInputStyles.PARAGRAPH,
						label: 'Message',
						placeholder: 'Enter your message',
						customID: 'message',
					},
				],
			},
		],
	});
};

export default reply;
