import express from 'express';
import {
	doesMessageImagesDirectoryExist,
	getMessageImagesDirectoryPath,
} from '../services/messages';
import { mkdirSync } from 'fs';

export const init = () => {
	const port = process.env.PORT ? process.env.PORT : 4000;

	const app = express();

	if (!doesMessageImagesDirectoryExist())
		mkdirSync(getMessageImagesDirectoryPath());
	app.use('/images', express.static(getMessageImagesDirectoryPath()));

	if (process.env.HEALTH_CHECK_ROUTE !== '0')
		app.get('/health', (req, res) => res.sendStatus(200));

	app.listen(port, () => {
		console.log(`API is listening on PORT : ${port}`);
	});
};
