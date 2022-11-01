import type {
	ComponentInteraction,
	ComponentTypes,
	ModalSubmitInteraction,
	SelectMenuTypes,
} from 'oceanic.js';
import type ErrorResponse from './structures/ErrorResponse';

export type ButtonHandlerFn = (
	interaction: ComponentInteraction<ComponentTypes.BUTTON>,
	args: string[],
) => Promise<ErrorResponse | any> | ErrorResponse | any;

export type SelectHandlerFn = (
	interaction: ComponentInteraction<SelectMenuTypes>,
	args: string[],
) => Promise<ErrorResponse | any> | ErrorResponse | any;

export type ModalHandlerFn = (
	interaction: ModalSubmitInteraction,
	args: string[],
) => Promise<ErrorResponse | any> | ErrorResponse | any;
