import { globSync } from 'node:fs';
import path from 'node:path';

import { isProduction } from '../configs/environment';

const extension = isProduction ? 'js' : 'ts';

/**
 * Recursively finds all files whose name ends with the given suffix under the
 * project root. Only the filename suffix is fixed (e.g. *.entity.ts) — the
 * directory structure is free to change without updating this config.
 */
export const findFiles = (suffix: string): string[] =>
  globSync(path.join(isProduction ? 'dist' : 'src', '**', `*.${suffix}.${extension}`));
