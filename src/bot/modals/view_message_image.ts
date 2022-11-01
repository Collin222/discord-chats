import { MessageFlags } from 'oceanic.js';
import { getChatById } from '../../services/database';
import type { ModalHandlerFn } from '../../types';
import ErrorResponse from '../../structures/ErrorResponse';
import { Errors } from '../../constants';
import { getMessageImageApiRoute } from '../../services/messages';

const viewMessageImage: ModalHandlerFn = async (interaction, args) => {
	if (args.length < 1) return console.error('Invalid number of args');

	const chatId = args[0];
	const chat = await getChatById(chatId);
	if (!chat) return console.error('Could not find chat');

	const messages = await chat.getMessages();

	const v = interaction.data.components[0].components[0].value;
	if (!v) return new ErrorResponse(Errors.UNKNOWN);

	const num = parseInt(v);
	if (isNaN(num) || num < 1 || num > messages.length)
		return new ErrorResponse(Errors.INVALID_MESSAGE_NUM, v);

	const msg = messages[num - 1];

	interaction.createMessage({
		embeds: [
			{
				title: `Message ${num}`,
				image: {
					url: getMessageImageApiRoute(msg.id),
				},
				color: parseInt('0066ff', 16),
			},
		],
		flags: MessageFlags.EPHEMERAL,
	});
};

export default viewMessageImage;
