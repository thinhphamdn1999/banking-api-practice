import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
  coveragePathIgnorePatterns: ['<rootDir>/src/common/configs/test'],
  roots: ['<rootDir>/src'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  verbose: true,
  moduleFileExtensions: ['js', 'ts'],
  setupFilesAfterEnv: ['<rootDir>/src/common/configs/test/jest.setup.ts'],
};

export default config;
