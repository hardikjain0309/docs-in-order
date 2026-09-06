import { jest } from '@jest/globals';

export function createUUIDServiceMock() {
  return {
    generateUUID: jest.fn<() => string>(),
  };
}
