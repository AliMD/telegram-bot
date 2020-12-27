import { bot } from './telegram-bot';
import { Context } from 'telegraf';
import { debug } from 'debug';
const log = debug('app/bot');

bot.start((ctx: Context) =>
  ctx.reply(`Welcome To ${process.env.BOT_USERID} ❤😍💕`),
);

bot.on('photo', (ctx: Context) => {
  log('Photo details: %o', ctx.message);
});

bot.on('message', (ctx: Context) => {
  log('Message is: %s', ctx.message.text);
  bot.telegram.sendChatAction(ctx.chat.id, 'typing');

  setTimeout(() => {
    ctx.reply('Hello to you MAN! ✔');
  }, 2000);
});
