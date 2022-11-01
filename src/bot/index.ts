import {
	Client,
	ChannelTypes,
	TextChannel,
	AnnouncementChannel,
	ClientEvents,
	ComponentInteraction,
	MessageFlags,
	ComponentTypes,
	ModalSubmitInteraction,
	InteractionTypes,
} from 'oceanic.js';
import { readdirSync } from 'fs';
import { join } from 'path';
import { Buttons, Selects, Modals } from '../constants';
import type {
	ButtonHandlerFn,
	SelectHandlerFn,
	ModalHandlerFn,
} from '../types';
import ErrorResponse from '../structures/ErrorResponse';

class Bot {
	client: Client;
	buttons: Map<Buttons, ButtonHandlerFn>;
	selects: Map<Selects, SelectHandlerFn>;
	modals: Map<Modals, ModalHandlerFn>;

	constructor() {
		this.client = new Client({
			auth: `Bot ${process.env.BOT_TOKEN}`,
			gateway: {
				intents: ['GUILDS'],
			},
		});
		this.buttons = new Map();
		this.selects = new Map();
		this.modals = new Map();

		this.init();
	}

	init() {
		this.client.on('ready', () => {
			console.log('Client is ready as : ' + this.client.user.tag);

			this.registerButtons();
			this.registerSelects();
			this.registerModals();
		});

		this.client.on('interactionCreate', interaction => {
			if (
				interaction.type === InteractionTypes.MESSAGE_COMPONENT ||
				interaction.type === InteractionTypes.MODAL_SUBMIT
			)
				this.runInteraction(interaction);
		});

		this.client.on('error', err => {
			console.error(`Oceanic Error : ${err}`);
		});

		this.client.connect();
	}

	getChatsChannel() {
		const guild = this.client.guilds.get(process.env.GUILD_ID);
		if (!guild) throw new Error('Could not get guild');
		const channel = guild.channels.get(process.env.CHANNEL_ID);
		if (!channel) throw new Error('Could not get channel');
		if (
			![ChannelTypes.GUILD_TEXT, ChannelTypes.GUILD_ANNOUNCEMENT].includes(
				channel.type
			)
		)
			throw new Error(
				'Channel does not match types: GUILD_TEXT or GUILD_ANNOUNCEMENT'
			);
		return channel as TextChannel | AnnouncementChannel;
	}

	async registerButtons() {
		const files = readdirSync(join(__dirname, 'buttons'));

		const newButtons: Map<Buttons, ButtonHandlerFn> = new Map();

		await Promise.all(
			files.map(async name => {
				const res = await import(`./buttons/${name}`);
				const data = res.default;

				newButtons.set(
					name.split('.')[0].toUpperCase() as unknown as Buttons,
					data
				);
			})
		);

		this.buttons = newButtons;

		console.log(`Registered ${newButtons.size} buttons`);
	}

	async registerSelects() {
		const files = readdirSync(join(__dirname, 'selects'));

		const newSelects: Map<Selects, SelectHandlerFn> = new Map();

		await Promise.all(
			files.map(async name => {
				const res = await import(`./selects/${name}`);
				const data = res.default;

				newSelects.set(
					name.split('.')[0].toUpperCase() as unknown as Selects,
					data
				);
			})
		);

		this.selects = newSelects;

		console.log(`Registered ${newSelects.size} selects`);
	}

	async registerModals() {
		const files = readdirSync(join(__dirname, 'modals'));

		const newModals: Map<Modals, ModalHandlerFn> = new Map();

		await Promise.all(
			files.map(async name => {
				const res = await import(`./modals/${name}`);
				const data = res.default;

				newModals.set(
					name.split('.')[0].toUpperCase() as unknown as Modals,
					data
				);
			})
		);

		this.modals = newModals;

		console.log(`Registered ${newModals.size} modals`);
	}

	async runInteraction(
		interaction: ComponentInteraction | ModalSubmitInteraction
	) {
		const customId = interaction.data.customID;
		const parts = customId.split(':'); // each arg in custom id is split by :
		const id = parts[0] as Buttons | Selects | Modals;
		if (!id) return;

		// get the map of items based off the interaction type (either buttons, selects, or modals)
		let map:
			| Map<Buttons, ButtonHandlerFn>
			| Map<Selects, SelectHandlerFn>
			| Map<Modals, ModalHandlerFn>;
		if (interaction instanceof ComponentInteraction) {
			switch (interaction.data.componentType) {
				case ComponentTypes.BUTTON:
					map = this.buttons;
					break;
				default:
					map = this.selects;
					break;
			}
		} else {
			map = this.modals;
		}

		const fn = (map as any).get(id);
		if (!fn) return;

		let args = parts.slice(1);

		const res = await fn(interaction as any, args);

		if (res instanceof ErrorResponse) {
			await interaction.createMessage({
				content: res.toString(),
				flags: res.ephemeral ? MessageFlags.EPHEMERAL : 0,
			});
		}
	}
}

export default Bot;
