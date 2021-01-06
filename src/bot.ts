import { bot } from './telegram-bot';
import { Context } from 'telegraf';
import { debug } from 'debug';
const log = debug('app/bot');

bot.start((ctx: Context) =>
  ctx.reply(`Welcome To ${process.env.BOT_USERID ?? 'Our bot'} ❤😍💕`),
);

bot.on('photo', (ctx: Context) => {
  log('Photo details: %o', ctx.message);
});

bot.on('video_note', (ctx: Context) => {
  log('Video Note details: %o', ctx.message);
});

bot.on('video', (ctx: Context) => {
  log('Video Note details: %o', ctx.message);
});

bot.on('audio', (ctx: Context) => {
  log('Voice details: %o', ctx.message);
});

bot.on('message', (ctx: Context) => {
  if (ctx.message == null || ctx.message.text == null || ctx.chat == null) {
    return;
  }
  log('Message is: %s', ctx.message.text);
  bot.telegram.sendChatAction(ctx.chat.id, 'typing');

  setTimeout(() => {
    ctx.reply('Hello to you MAN! ✔');
  }, 2000);
});
