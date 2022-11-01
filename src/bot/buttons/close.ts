import { ComponentTypes, MessageFlags } from 'oceanic.js';
import { getChatById } from '../../services/database';
import type { ButtonHandlerFn } from '../../types';

const close: ButtonHandlerFn = async (interaction, args) => {
	if (args.length < 1)
		return console.error('Close button contains invalid number of args');

	const chatId = args[0];

	const chat = await getChatById(chatId);
	if (!chat) return console.error('Could not get chat');

	chat.open = false;
	await chat.update();

	await interaction.message.edit({
		components: [
			{
				type: ComponentTypes.ACTION_ROW,
				components: interaction.message.components[0].components.map((x, i) => ({
					...x,
					disabled: i < 2,
				})),
			},
		],
	});

	interaction.createMessage({
		content: 'Successfully closed chat.',
		flags: MessageFlags.EPHEMERAL,
	});
};

export default close;
