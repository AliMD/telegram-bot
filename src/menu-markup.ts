import { bot } from './telegram-bot';
import { Context, Markup } from 'telegraf';
// import { debug } from 'debug';
// import { config } from './common/config';
// const log = debug('app/menu-markup');

bot.command('menu', ({ reply }) =>
  reply(
    'One time keyboard',
    Markup.keyboard([Markup.button('ماموریت امروز'), Markup.button('انجام شد')])
      .oneTime()
      .extra(),
  ),
);

bot.hears('ماموریت امروز', async (ctx: Context) => {
  await ctx.telegram.sendChatAction(ctx.chat.id, 'typing');
  ctx.reply('انجام یک ذکر صلوات');
});

bot.hears('انجام شد', async (ctx: Context) => {
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
