import { debug } from 'debug';
const log = debug('app/menu-markup');

import { config } from './common/config';
import { bot } from './telegram-bot';
import { Context, Markup } from 'telegraf';
import {
  updateBotData,
  getTodayStatistics,
  changeUserAcceptState,
  userHasBeenDoneFirstMission,
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

bot.hears('ماموریت اول', async (ctx: Context) => {
  if (ctx.chat == null || ctx.message?.from == null) {
    return;
  }

  log('%s pressed `First Permission` button', ctx.chat.username);

  await changeUserAcceptState(String(ctx.message.from.id), true);
  await sendMessage(config.firstPermission.messageList, ctx);

  await ctx.reply(
    '👇👇👇 لیست انتخاب ها',
    Markup.keyboard([
      [
        Markup.button('انصراف'),
        Markup.button('آمار'),
        Markup.button('انجام شد'),
        Markup.button('ماموریت امروز'),
      ],
    ])
      .resize()
      .extra(),
  );
});

bot.hears('انجام شد', async (ctx: Context) => {
  if (ctx.chat == null || ctx.message?.from == null) {
    return;
  }

  const firstMissionIsDone = await userHasBeenDoneFirstMission(
    ctx.message.from,
  );
  if (!firstMissionIsDone) {
    await ctx.reply(
      'شما ماموریت اول را انجام ندادید \n\n لطفا از منوی پایین ماموریت اول رو انتخاب کنید',
    );
    return;
  }

  log('%s pressed `Done` button', ctx.chat.username);

  const todayStatistics = await updateBotData(ctx.message?.from);
  if (todayStatistics == null) {
    await ctx.reply('شما ماموریت امروز را قبلا انجام دادید');
    return;
  }

  const messageList = [...config.done.messageList];

  messageList[0] = {
    ...messageList[0],
    text: (messageList[0].text as string).replace(
      '%s%',
      String(todayStatistics.totalDoneCount),
    ),
  };

  await sendMessage(messageList, ctx);

  // await ctx.reply(
  //   '👇👇👇 لیست انتخاب ها',
  //   Markup.keyboard([[Markup.button('انصراف'), Markup.button('آمار')]])
  //     .resize()
  //     .extra(),
  // );
  // await todayStatisticsMessageSender(ctx);
});

bot.hears('آمار', async (ctx: Context) => {
  if (ctx.chat == null || ctx.message?.from == null) {
    return;
  }

  const firstMissionIsDone = await userHasBeenDoneFirstMission(
    ctx.message.from,
  );
  if (!firstMissionIsDone) {
    await ctx.reply(
      'برای دیدن آمار لطفا با ما همراه شوید و از منوی زیر ماموریت اول را انتخاب کنید',
    );
    return;
  }

  log('%s pressed `Statistics` button', ctx.chat.username);

  await todayStatisticsMessageSender(ctx);
});

export const todayStatisticsMessageSender = async (ctx: Context) => {
  log('todayStatisticsMessageSender');

  const todayStatistics = await getTodayStatistics();

  log('todayStatistics: %o', todayStatistics);

  const messageList = [...config.todayStatistics.messageList];

  messageList[0] = {
    ...messageList[0],
    text: (messageList[0].text as string).replace(
      '%s%',
      String(todayStatistics.userListCount),
    ),
  };

  messageList[1] = {
    ...messageList[1],
    text: (messageList[1].text as string).replace(
      '%s%',
      String(todayStatistics.totalDoneCount),
    ),
  };

  await sendMessage(messageList, ctx);
};

bot.hears('انصراف', async (ctx: Context) => {
  if (ctx.chat == null || ctx.message?.from == null) {
    return;
  }

  log('%s pressed `Cancel` button', ctx.chat.username);

  await ctx.reply('صفحه کلید حذف شد', {
    reply_markup: {
      remove_keyboard: true,
    },
  });
  await sendMessage(config.cancel.messageList, ctx);
  await ctx.reply(
    'میتونی دکمه بازشگت رو بزنی',
    Markup.inlineKeyboard([Markup.callbackButton('بازگشت', 'Return')]).extra(),
  );
  await changeUserAcceptState(String(ctx.message.from.id), false);
});

bot.action('Return', async (ctx: Context) => {
  log('Return button pressed %o', ctx.chat?.id);
  if (ctx.chat == null) {
    return;
  }

  log(
    '%s with id = %s pressed `Return` button',
    ctx.chat.username,
    ctx.chat.id,
  );

  await ctx.reply(
    '👇👇👇 لیست انتخاب ها',
    Markup.keyboard([
      [
        Markup.button('انصراف'),
        Markup.button('آمار'),
        Markup.button('انجام شد'),
        Markup.button('ماموریت امروز'),
      ],
    ])
      .resize()
      .extra(),
  );

  await changeUserAcceptState(String(ctx.chat.id), true);
});

bot.command('removeKeyboard', ({ reply }) =>
  reply('صفحه کلید حذف شد', {
    reply_markup: {
      remove_keyboard: true,
    },
  }),
);
