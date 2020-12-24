/* eslint-disable prettier/prettier */
import { bot } from './telegram-bot';
import { debug } from 'debug';
const log = debug('app/get-updates');

let channelMemberCount = 0;
(async () => {
  try {
    channelMemberCount = await bot.telegram.getChatMembersCount(-1001455499240);
    log('The number of `@MyDevChannel` members: %s', channelMemberCount);

    setInterval(async () => {
      const currentChannelMemberCount = await bot.telegram.getChatMembersCount(-1001455499240);
      if (currentChannelMemberCount > channelMemberCount) {
        log(`We have ${currentChannelMemberCount - channelMemberCount} new members in '${process.env.CHANNEL_NAME}' channel`);
        channelMemberCount = currentChannelMemberCount;
      }
    }, 300000);
  } catch (error) {
    log(`Error on get new members from '${process.env.CHANNEL_NAME}' channel: %o`, error);
  }
})();
