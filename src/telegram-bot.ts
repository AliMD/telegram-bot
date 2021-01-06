import { Telegraf } from 'telegraf';
import { config } from './common/config';
import { debug } from 'debug';
const log = debug('app/telegram-bot');

log('Initialing bot ...');
export const bot = new Telegraf(config.botToken);
Telegraf.log();
log(`${config.botName ?? 'The bot'} is running...`);
