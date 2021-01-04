import { debug } from 'debug';
const log = debug('app/menu-markup');

import { config } from './common/config';
import { bot } from './telegram-bot';
import { Context } from 'telegraf';
import {
  updateBotData,
  getTodayStatistics,
  changeUserAcceptState,
} from './update-bot-data';
import { sendMessage } from './send-message';

// bot.command('menu', ({ reply }) =>
//   reply(
//     'One time keyboard',
//     Markup.keyboard([Markup.button('ماموریت امروز'), Markup.button('انجام شد')])
//       .oneTime()
//       .extra(),
//   ),
// );

bot.hears('ماموریت امروز', async (ctx: Context) => {
  if (ctx.chat == null) {
    return;
  }

  log('%s pressed `Today Permission` button', ctx.chat.username);

  await sendMessage(config.todayPermission.messageList, ctx);
});

bot.hears('انجام شد', async (ctx: Context) => {
  if (ctx.chat == null || ctx.message?.from == null) {
    return;
  }

  log('%s pressed `Done` button', ctx.chat.username);

  await sendMessage(config.done.messageList, ctx);
  await updateBotData(ctx.message?.from);
});

bot.hears('آمار', async (ctx: Context) => {
  if (ctx.chat == null || ctx.message?.from == null) {
    return;
  }

  log('%s pressed `Statistics` button', ctx.chat.username);

  const todayStatistics = await getTodayStatistics();

  log('todayStatistics: %o', todayStatistics);

  await sendMessage(
    [
      {
        ...config.todayStatistics.messageList[0],
        text: (config.todayStatistics.messageList[0].text as string).replace(
          '%s%',
          String(todayStatistics.userListCount),
        ),
      },
      {
        ...config.todayStatistics.messageList[1],
        text: (config.todayStatistics.messageList[1].text as string).replace(
          '%s%',
          String(todayStatistics.totalDoneCount),
        ),
      },
    ],
    ctx,
  );
});

bot.hears('انصراف', async (ctx: Context) => {
  if (ctx.chat == null || ctx.message?.from == null) {
    return;
  }

  log('%s pressed `Cancel` button', ctx.chat.username);

  await sendMessage(config.cancel.messageList, ctx);
  await ctx.reply('صفحه کلید حذف شد', {
    reply_markup: {
      remove_keyboard: true,
    },
  });
  await changeUserAcceptState(ctx.message?.from);
});

bot.command('removeKeyboard', ({ reply }) =>
  reply('صفحه کلید حذف شد', {
    reply_markup: {
      remove_keyboard: true,
    },
  }),
);
