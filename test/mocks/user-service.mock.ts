import { jest } from '@jest/globals';
import { User } from '../../src/prisma/generated/client.js';

export function createUserServiceMock() {
  return {
    createUser: jest.fn<() => Promise<User>>(),
    getUser: jest.fn<() => Promise<User>>(),
  };
}
