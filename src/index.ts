import dotenv from 'dotenv';
dotenv.config();
import Bot from './bot';
import { connect as connectImap } from './services/imap';
import { connect as connectDb } from './services/database';
import { init as initApi } from './api';

connectDb();

export const bot = new Bot(); // start bot
connectImap(); // start IMAP
initApi(); // start api
