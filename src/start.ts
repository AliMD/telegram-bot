import { debug } from 'debug';
const log = debug('app/start');

import './menu-markup';
import { bot } from './telegram-bot';
import { Context, Markup } from 'telegraf';
import { config } from './common/config';
import { updateUserList } from './update-bot-data';
import { sendMessage } from './send-message';

bot.start(async (ctx: Context) => {
  if (ctx.message?.from != null) {
    log('User info: %o', ctx.message.from);
    await updateUserList(ctx.message.from);
  }

  const messageList = [...config.start.messageList];
  messageList[0] = {
    ...messageList[0],
    text: (messageList[0].text as string).replace(
      '%s%',
      `${ctx.message?.from?.first_name ?? 'کاربر'} ${
        ctx.message?.from?.last_name ?? 'محترم'
      }`,
    ),
  };
  await sendMessage(messageList, ctx);

  await ctx.reply(
    config.showKeyboard.text,
    Markup.keyboard([
      [
        Markup.button('انصراف'),
        Markup.button('آمار'),
        Markup.button('انجام شد'),
        Markup.button('ماموریت اول'),
      ],
    ])
      .resize()
      .extra(),
  );
});
