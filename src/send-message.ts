import { debug } from 'debug';
const log = debug('app/send-message');

import './menu-markup';
import { bot } from './telegram-bot';
import { Context, Markup } from 'telegraf';
import { delay } from './common/delay';
import { getDocument } from './database';
import { config } from './common/config';

import type { User } from 'telegraf/typings/telegram-types';

// eslint-disable-next-line @typescript-eslint/no-var-requires
// export const data = require('../data.json');

interface Message {
  type: 'text' | 'voice' | 'image' | 'videoMessage';
  text?: string;
  fileId?: string;
  delay?: number;
  caption?: string;
}

bot.start(async (ctx: Context) => {
  if (ctx.message?.from != null) {
    log('User info: %o', ctx.message.from);
    await updateUserList(ctx.message.from);
  }
  await sendMessage(config.start.messageList, ctx);
});

const sendMessage = async (
  messageList: Array<Message>,
  botContext: Context,
): Promise<void> => {
  log('sendMessage');

  botContext.reply(
    'سلام',
    Markup.keyboard([
      [
        Markup.button('ماموریت امروز'),
        Markup.button('انجام شد'),
        Markup.button('انصراف'),
      ],
    ])
      .resize()
      .oneTime()
      .extra(),
  );

  if (
    !(
      Array.isArray(messageList) &&
      messageList.length > 0 &&
      botContext.chat != null
    )
  ) {
    return;
  }

  const telegram = bot.telegram;
  for (const message of messageList) {
    switch (message.type) {
      case 'videoMessage':
        if (message.fileId == null) break;
        await telegram.sendChatAction(botContext.chat.id, 'upload_video_note');
        await telegram.sendVideoNote(botContext.chat.id, message.fileId);
        break;

      case 'voice':
        if (message.fileId == null) break;
        await telegram.sendChatAction(botContext.chat.id, 'upload_audio');
        await telegram.sendVoice(botContext.chat.id, message.fileId, {
          caption: message.caption ?? '',
        });
        break;

      case 'image':
        if (message.fileId == null) break;
        await telegram.sendChatAction(botContext.chat.id, 'upload_photo');
        await telegram.sendPhoto(botContext.chat.id, message.fileId, {
          caption: message.caption ?? '',
        });
        break;

      default:
        if (message.text == null) break;
        await botContext.telegram.sendChatAction(botContext.chat.id, 'typing');
        await botContext.telegram.sendMessage(botContext.chat.id, message.text);
        break;
    }

    await delay(Number(message.delay ?? 0));
  }
};

const updateUserList = async (user: User): Promise<void> => {
  log('updateUserList');

  const userId = String(user.id);
  const userListDocument = getDocument('user-list');

  const userInDB = await userListDocument.find((doc) => {
    return doc._id === userId;
  });

  if (userInDB !== null) {
    return;
  }

  const { first_name, last_name, username, language_code, is_bot } = user;
  await userListDocument.set(
    userId,
    {
      _id: userId,
      _created: Date.now(),
      _modified: Date.now(),
      accept: false,
      doneList: [],
      first_name,
      last_name,
      username,
      language_code,
      is_bot,
    },
    true,
  );
};
