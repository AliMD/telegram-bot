/* eslint-disable prettier/prettier */
import { bot } from './telegram-bot';
import { debug } from 'debug';
import { Context } from 'telegraf';
const log = debug('app/command');

(async () => {
  bot.command('test', (ctx: Context) => {
    log('Command `test` received: %o', ctx.botInfo);
    ctx.telegram.sendChatAction(ctx.chat.id, 'upload_photo');

    setTimeout(async () => {
      try {
        await ctx.replyWithPhoto({ source: 'asset/photo.jpg' }, {
          caption: 'A photo for test command',
        });
      } catch (error) {
        log('Error On command `test`: %o', error);
      }
    }, 2000);
  });
})();
