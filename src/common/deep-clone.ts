export const deepClone = <T extends Record<string, unknown>>(obj: T): T => {
  const clonedString = JSON.stringify(obj);
  return JSON.parse(clonedString);
};
