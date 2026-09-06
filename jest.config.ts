import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',

  extensionsToTreatAsEsm: ['.ts'],

  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },

  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },

  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  moduleFileExtensions: ['ts', 'js', 'json'],
};

export default config;
