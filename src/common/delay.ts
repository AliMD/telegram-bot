import { config } from './config';

export const delay = (): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, parseInt(config.delayTime));
  });
};
