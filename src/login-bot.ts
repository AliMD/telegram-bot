import './common/config';
import { bot } from './telegram-bot';
import { Extra } from 'telegraf';
import { Markup } from 'telegraf';

const keyboard = Markup.inlineKeyboard([
  Markup.urlButton('❤️', 'http://telegraf.js.org'),
  Markup.callbackButton('Delete', 'delete'),
]);

bot.start((ctx) => ctx.reply('Hello', Extra.markup(keyboard)));
bot.action('delete', ({ deleteMessage }) => deleteMessage());

bot.launch();
