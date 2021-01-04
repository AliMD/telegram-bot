import { debug } from 'debug';
const log = debug('app/send-message');

import './menu-markup';
import { bot } from './telegram-bot';
import { Context } from 'telegraf';
import { delay } from './common/delay';

// eslint-disable-next-line @typescript-eslint/no-var-requires
// export const data = require('../data.json');

interface Message {
  type: 'text' | 'voice' | 'image' | 'videoMessage';
  text?: string;
  fileId?: string;
  delay?: number;
  caption?: string;
}

export const sendMessage = async (
  messageList: Array<Message>,
  botContext: Context,
): Promise<void> => {
  log('sendMessage');

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
