import path from 'node:path';
import { globSync } from 'node:fs';

import { findFiles } from '../file-loader';

jest.mock('node:fs', () => ({
  globSync: jest.fn(),
}));

jest.mock('@/common/configs/environment', () => ({
  isProduction: false,
}));

describe('findFiles', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should search in src folder when not in production', () => {
    (globSync as jest.Mock).mockReturnValue(['src/user/user.entity.ts']);

    const result = findFiles('entity');

    expect(globSync).toHaveBeenCalledWith(path.join('src', '**', '*.entity.ts'));

    expect(result).toEqual(['src/user/user.entity.ts']);
  });

  it('should search in dist folder when in production', async () => {
    jest.resetModules();

    jest.doMock('@/common/configs/environment', () => ({
      isProduction: true,
    }));

    jest.doMock('node:fs', () => ({
      globSync: jest.fn().mockReturnValue(['dist/user/user.entity.js']),
    }));

    const { findFiles } = await import('../file-loader');
    const { globSync } = await import('node:fs');

    const result = findFiles('entity');

    expect(globSync).toHaveBeenCalledWith(path.join('dist', '**', '*.entity.js'));

    expect(result).toEqual(['dist/user/user.entity.js']);
  });

  it('should correctly apply custom suffix', () => {
    (globSync as jest.Mock).mockReturnValue(['src/app.module.ts']);

    findFiles('module');

    expect(globSync).toHaveBeenCalledWith(path.join('src', '**', '*.module.ts'));
  });
});
