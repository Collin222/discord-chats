import { Errors } from '../constants';

class ErrorResponse {
	error: Errors;
	message?: string;
	ephemeral?: boolean;

	constructor(error: Errors, message?: string, ephemeral = true) {
		this.error = error;
		this.message = message;
		this.ephemeral = ephemeral;
	}

	private getErrorText() {
		switch (this.error) {
			case Errors.INVALID_MESSAGE_NUM:
				return 'Invalid message number provided:';
			case Errors.UNKNOWN:
				return 'An unknown error occured.';
		}
	}

	toString() {
		return `**${this.getErrorText()}** ${this.message ? this.message : ''}`;
	}
}

export default ErrorResponse;
