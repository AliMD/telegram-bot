import { debug } from 'debug';
const log = debug('app/menu-markup');

import { bot } from './telegram-bot';
import { Context } from 'telegraf';
import { getDocument } from './database';

import type { User } from 'telegraf/typings/telegram-types';

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
  await ctx.telegram.sendChatAction(ctx.chat.id, 'typing');
  ctx.reply('انجام یک ذکر صلوات');
});

bot.hears('انجام شد', async (ctx: Context) => {
  if (ctx.chat == null || ctx.message?.from == null) {
    return;
  }

  await updateBotData(ctx.message?.from);
  await ctx.telegram.sendChatAction(ctx.chat.id, 'typing');
  ctx.reply('تشکر از مشارکت شما.');
});

bot.command('removeKeyboard', ({ reply }) =>
  reply('صفحه کلید حذف شد', {
    reply_markup: {
      remove_keyboard: true,
    },
  }),
);

const updateBotData = async (userInfo: User) => {
  log('updateDoneList');
  const doneListDocument = getDocument('done-list');
  const userListDocument = getDocument('user-list');

  const userId = String(userInfo.id);
  const userInDB = await userListDocument.find((doc) => {
    return doc._id === userId;
  });

  const date = new Date();
  // eslint-disable-next-line prettier/prettier
  const doneStandardDate = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;

  if (
    userInDB != null &&
    'doneList' in userInDB &&
    (userInDB['doneList'] as string[]).indexOf(doneStandardDate) === -1
  ) {
    (userInDB['doneList'] as string[]).push(doneStandardDate);
    userInDB._modified = Date.now();
    await userListDocument.set(userId, userInDB);
  }

  // FIXME: What do we in multiple sync requests? 👇

  const doneList = await doneListDocument._storage;
  if (Object.keys(doneList).length === 0) {
    await doneListDocument.set(doneStandardDate, {
      _id: doneStandardDate,
      _created: Date.now(),
      _modified: Date.now(),
      totalCount: 1,
    });
    return;
  }

  const todayDoneRecord = await doneListDocument.find((doc) => {
    return doc._id === doneStandardDate;
  });

  if (todayDoneRecord != null) {
    todayDoneRecord._modified = Date.now();
    todayDoneRecord.totalCount = (todayDoneRecord.totalCount as number) + 1;
    await doneListDocument.set(doneStandardDate, todayDoneRecord);
  }
};
