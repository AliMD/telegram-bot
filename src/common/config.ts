// import dotenv from 'dotenv';
// import fs from 'fs';

import { debug } from 'debug';
debug.enable(process.env.DEBUG || 'app/*');
// const log = debug('app/config');

// eslint-disable-next-line @typescript-eslint/no-var-requires
export const config = require('../../config.json');

// const loadDotEnv = (path: string): boolean => {
//   if (!fs.existsSync(path)) {
//     log(`Skip parsing ${path}, File not found.`);
//     return false;
//   }
//   // else
//   log(`Using ${path} to supply config environment variables`);
//   const dotenvResult = dotenv.config({ path });
//   log('%s parsed: %j', path, dotenvResult.parsed);
//   if (dotenvResult.error) {
//     log('%s error', path, dotenvResult.error);
//     return false;
//   }
//   // else
//   return true;
// };

// loadDotEnv('.bot.env') || loadDotEnv('.bot.env.example');
