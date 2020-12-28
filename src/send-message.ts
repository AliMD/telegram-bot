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

  for (const message of messageList) {
    switch (message.type) {
      case 'videoMessageId':
        await botContext.telegram.sendChatAction(
          botContext.chat.id,
          'upload_video_note',
        );
        await delay();
        await botContext.telegram.sendVideoNote(botContext.chat.id, {
          source: fs.createReadStream(message.value),
        });
        break;

      case 'voiceId':
        await botContext.telegram.sendChatAction(
          botContext.chat.id,
          'upload_audio',
        );
        await delay();
        await botContext.telegram.sendVoice(botContext.chat.id, {
          source: fs.createReadStream(message.value),
        });
        break;

      case 'imageId':
        await botContext.telegram.sendChatAction(
          botContext.chat.id,
          'upload_photo',
        );
        await delay();
        await botContext.telegram.sendPhoto(botContext.chat.id, {
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
  }

  return true;
};
