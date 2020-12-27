import { Telegraf } from 'telegraf';
import { debug } from 'debug';
const log = debug('app/telegram-bot');

log('Initialing bot ...');
export const bot = new Telegraf(process.env.BOT_TOKEN);
log(`${process.env.BOT_USERID} is running...`);
