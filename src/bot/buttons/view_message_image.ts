import { ComponentTypes, TextInputStyles } from 'oceanic.js';
import { Modals } from '../../constants';
import type { ButtonHandlerFn } from '../../types';

const viewMessageImage: ButtonHandlerFn = (interaction, args) => {
	if (args.length < 1) return console.error('Invalid number of args');

	interaction.createModal({
		title: 'View Message Image',
		components: [
			{
				type: ComponentTypes.ACTION_ROW,
				components: [
					{
						type: ComponentTypes.TEXT_INPUT,
						customID: 'id',
						label: 'Message Number',
						style: TextInputStyles.SHORT,
						placeholder: 'Enter message number',
						required: true,
					},
				],
			},
		],
		customID: `${Modals.VIEW_MESSAGE_IMAGE}:${args[0]}`,
	});
};

export default viewMessageImage;
