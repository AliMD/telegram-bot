import { OneDB } from './common/1db';

const databaseList: {
  [key: string]: OneDB;
} = {};

export const getDocument = (docId: string): OneDB => {
  if (!databaseList[docId]) {
    const dbPath = `data/${docId}.json`;
    databaseList[docId] = new OneDB(dbPath);
  }
  return databaseList[docId];
};
