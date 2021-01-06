import type { User } from 'telegraf/typings/telegram-types';

export interface MyUser extends User {
  accept: boolean;
  doneList: Array<string>;
}
