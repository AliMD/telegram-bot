/* eslint-disable prettier/prettier */
import { bot } from './telegram-bot';
import { debug } from 'debug';
const log = debug('app/send-message-to-channel');

(async () => {
  try {
    // const adminList = await bot.telegram.getChatAdministrators(-1001455499240);
    // const membersCount = await bot.telegram.getChatMembersCount(-1001455499240);
    // eslint-disable-next-line prettier/prettier
    const memberChatResult = await bot.telegram.getChatMember(-1001455499240, 532323269);
    const sendedMessage = await bot.telegram.sendMessage(
      -1001455499240,
      'Hi every one',
    );
    log(`Send message to '${process.env.CHANNEL_NAME}': %o`, sendedMessage.chat);
    log(`memberChatResult in '${process.env.CHANNEL_NAME}': %o`, memberChatResult.user);
  } catch (error) {
    log(`Error on send message to '${process.env.CHANNEL_NAME}': %o`, error);
  }
})();
