import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import { PrismaClientUnknownRequestError } from '../../src/prisma/generated/internal/prismaNamespace.js';

export function buildKnownPrismaError(
  errorCode: string,
  errorMessage?: string,
): PrismaClientKnownRequestError {
  return new PrismaClientKnownRequestError(
    errorMessage || 'Some error message',
    {
      code: errorCode,
      clientVersion: '1.1',
    },
  );
}

export function buildUnknownPrismaError(): PrismaClientUnknownRequestError {
  return new PrismaClientUnknownRequestError('Some error from prisma', {
    clientVersion: '1.1',
  });
}

export function buildUniqueConstraintFailedPrismaError(): PrismaClientKnownRequestError {
  return buildKnownPrismaError('P2002', 'Unique constraint violation');
}

export function buildNotFoundPrismaError(): PrismaClientKnownRequestError {
  return buildKnownPrismaError(
    'P2025',
    'An operation failed because it depends on one or more records that were required but not found.',
  );
}
