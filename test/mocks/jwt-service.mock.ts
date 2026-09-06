import { jest } from '@jest/globals';
import { JwtService } from '@nestjs/jwt';

export function createJWTServiceMock() {
  return {
    sign: jest.fn<JwtService['sign']>(),
  };
}
