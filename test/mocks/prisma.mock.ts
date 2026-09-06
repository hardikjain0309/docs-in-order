import { jest } from '@jest/globals';
import { PrismaService } from '../../src/prisma/prisma.service.js';

export function createPrismaMock() {
  return {
    user: {
      create: jest.fn<PrismaService['user']['create']>(),
      findUniqueOrThrow: jest.fn<PrismaService['user']['findUniqueOrThrow']>(),
    },
    userSessions: {
      create: jest.fn<PrismaService['userSessions']['create']>(),
      findUnique: jest.fn<PrismaService['userSessions']['findUnique']>(),
      update: jest.fn<PrismaService['userSessions']['update']>(),
    },
  };
}
