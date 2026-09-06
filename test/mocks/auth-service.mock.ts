import { jest } from '@jest/globals';
import { TokenResponseDto } from '../../src/auth/auth.dto.js';

export function createAuthServiceMock() {
  return {
    generateToken: jest.fn<() => Promise<TokenResponseDto>>(),
  };
}
