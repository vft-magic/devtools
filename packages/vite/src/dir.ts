import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const DIR_DIST = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

export const DIR_CLIENT = path.resolve(DIR_DIST, '../client');
