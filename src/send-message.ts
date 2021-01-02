import { bot } from './telegram-bot';
import { Context } from 'telegraf';
import { delay } from './common/delay';
import fs from 'fs';
import { debug } from 'debug';
const log = debug('app/send-message');

// eslint-disable-next-line @typescript-eslint/no-var-requires
export const data = require('../data.json');

type MessageType = 'text' | 'voiceId' | 'imageId' | 'videoMessageId';

interface Message {
  type: MessageType;
  value: string;
}

bot.start(async (ctx: Context) => {
  await sendMessage(data.command.start.messageList, ctx);
});

export const sendMessage = async (
  messageList: Array<Message>,
  botContext: Context,
): Promise<boolean> => {
  log('sendMessage');
  if (!(Array.isArray(messageList) && messageList.length > 0)) {
    return false;
  }

  const bot = botContext.telegram;

  for (const message of messageList) {
    switch (message.type) {
      case 'videoMessageId':
        await bot.sendChatAction(
          botContext.chat.id,
          'upload_video_note',
        );
        await bot.sendVideoNote(botContext.chat.id, {
          source: fs.createReadStream(message.value),
        });
        break;

      case 'voiceId':
        await bot.sendChatAction(
          botContext.chat.id,
          'upload_audio',
        );
        await delay();
        await bot.sendVoice(botContext.chat.id, {
          source: fs.createReadStream(message.value),
        });
        break;

      case 'imageId':
        await bot.sendChatAction(
          botContext.chat.id,
          'upload_photo',
        );
        await delay();
        await bot.sendPhoto(botContext.chat.id, {
          source: message.value,
        });
        break;

      default:
        await botContext.telegram.sendChatAction(botContext.chat.id, 'typing');
        await delay();
        await botContext.telegram.sendMessage(
          botContext.chat.id,
          message.value,
        );
        break;
    }
    await delay();
  }

  return true;
};
