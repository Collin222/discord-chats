import { MessageFlags } from 'oceanic.js';
import { getChatById } from '../../services/database';
import { MessageAuthor } from '../../structures/Message';
import type { ModalHandlerFn } from '../../types';

const reply: ModalHandlerFn = async (interaction, args) => {
	if (args.length < 1)
		return console.error('Reply modal contains invalid number of args');

	const chatId = args[0];

	const chat = await getChatById(chatId);
	if (!chat) return console.error('Could not find chat');

	const message = interaction.data.components[0].components.find(
		x => x.customID === 'message'
	)?.value;
	if (!message)
		return console.error("Reply modal doesn't contain message input");

	chat.createMessage({
		content: `<div>${message}</div>`,
		author: MessageAuthor.RESPONDENT,
		discordUserId: interaction.user.id,
	}, true, true);

	interaction.createMessage({
		content: 'Successfully created reply!',
		flags: MessageFlags.EPHEMERAL,
	});
};

export default reply;
