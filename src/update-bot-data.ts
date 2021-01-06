import { debug } from 'debug';
const log = debug('app/update-bot-data');

import { getDocument } from './database';

import type { User } from 'telegraf/typings/telegram-types';

export const getTodayStatistics = async (): Promise<{
  totalDoneCount: number;
  userListCount: number;
}> => {
  log('getTodayStatistics');

  let totalDoneCount = 0;
  let userListCount = 0;

  const doneListDocument = getDocument('done-list');
  const userListDocument = getDocument('user-list');
  const date = new Date();
  // eslint-disable-next-line prettier/prettier
  const standardDoneDate = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
  log('standardDoneDate: %s', standardDoneDate);
  const todayDoneItem = await doneListDocument.get(standardDoneDate);
  log('todayDoneItem: %o', todayDoneItem);
  if (todayDoneItem != null) {
    totalDoneCount = todayDoneItem.doneCount as number;
  }

  const userList = await userListDocument._storage;
  userListCount = Object.keys(userList).length - 1;

  return {
    totalDoneCount,
    userListCount,
  };
};

export const updateUserList = async (userInfo: User): Promise<void> => {
  log('updateUserList');

  const userId = String(userInfo.id);
  const userListDocument = getDocument('user-list');

  const userInDB = await userListDocument.find((doc) => {
    return doc._id === userId;
  });

  if (userInDB != null) {
    return;
  }

  const nowUnixTime = Date.now();
  const { first_name, last_name, username, language_code, is_bot } = userInfo;
  await userListDocument.set(userId, {
    _id: userId,
    _created: nowUnixTime,
    _modified: nowUnixTime,
    accept: false,
    doneList: [],
    first_name,
    last_name,
    username,
    language_code,
    is_bot,
  });
};

export const userHasBeenDoneFirstMission = async (
  userInfo: User,
): Promise<boolean> => {
  log('userHasBeenDoneFirstMission');

  const userId = String(userInfo.id);
  const userListDocument = getDocument('user-list');

  const userInDB = await userListDocument.find((doc) => {
    return doc._id === userId;
  });

  if (userInDB == null || !userInDB.accept) {
    return false;
  }

  return true;
};

export const updateBotData = async (
  userInfo: User,
): Promise<{
  totalDoneCount: number;
  userListCount: number;
} | null> => {
  log('updateDoneList');

  let totalDoneCount = 0;
  let userListCount = 0;
  const doneListDocument = getDocument('done-list');
  const userListDocument = getDocument('user-list');

  userListCount = Object.keys(await userListDocument._storage).length - 1;

  const userId = String(userInfo.id);
  const userInDB = await userListDocument.find((doc) => {
    return doc._id === userId;
  });

  const date = new Date();
  const unixTime = date.getTime();
  // eslint-disable-next-line prettier/prettier
  const standardDoneDate = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;

  if (
    !(
      userInDB != null &&
      'doneList' in userInDB &&
      (userInDB['doneList'] as string[]).indexOf(standardDoneDate) === -1
    )
  ) {
    log('updateBotData: %o', { user: userInDB });
    return null;
  }

  (userInDB['doneList'] as string[]).push(standardDoneDate);
  userInDB._modified = unixTime;
  await userListDocument.set(userId, userInDB);

  const todayDoneRecord = await doneListDocument.find((doc) => {
    return doc._id === standardDoneDate;
  });

  // FIXME: What do we in multiple sync requests? 👇
  if (todayDoneRecord != null) {
    todayDoneRecord._modified = unixTime;
    totalDoneCount = todayDoneRecord.doneCount =
      (todayDoneRecord.doneCount as number) + 1;
    await doneListDocument.set(standardDoneDate, todayDoneRecord);
  } else {
    // To change `totalCount` when we have a new mission in a new date
    // I think `totalCount` is total of all days that we have missions, am i right?
    const currentTotalCount = await doneListDocument.get('totalCount');
    if (currentTotalCount != null && 'value' in currentTotalCount) {
      await doneListDocument.set('totalCount', {
        ...currentTotalCount,
        _modified: unixTime,
        value: (currentTotalCount.value as number) + 1,
      });
    } else {
      await doneListDocument.set('totalCount', {
        _id: 'totalCount',
        _created: unixTime,
        _modified: unixTime,
        value: 1,
      });
    }

    totalDoneCount = 1;
    await doneListDocument.set(standardDoneDate, {
      _id: standardDoneDate,
      _created: unixTime,
      _modified: unixTime,
      doneCount: 1,
    });
  }

  return {
    totalDoneCount,
    userListCount,
  };
};

export const changeUserAcceptState = async (
  userId: string,
  accept: boolean,
) => {
  log('changeUserAcceptState');

  const userListDocument = getDocument('user-list');

  const userInDB = await userListDocument.find((doc) => {
    return doc._id === userId;
  });

  if (userInDB == null) {
    return;
  }

  await userListDocument.set(userId, {
    ...userInDB,
    accept,
  });
};
