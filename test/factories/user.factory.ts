import { SignupRequestDto } from '../../src/auth/auth.dto.js';
import { User, UserSessions } from '../../src/prisma/generated/client.js';

export function buildSignUpRequest(
  overrides: Partial<SignupRequestDto> = {},
): SignupRequestDto {
  return {
    email: 'hardik.j0309@gmail.com',
    name: 'Hardik Jain',
    password: 'password',
    ...overrides,
  };
}

export function buildUser(overrides: Partial<User> = {}): User {
  return {
    id: 'some-uuid',
    email: 'hardik.j0309@gmail.com',
    name: 'Hardik Jain',
    createdAt: new Date(),
    passwordHash: 'hashed-password',
    ...overrides,
  };
}

export function buildUserSession(): UserSessions {
  return {
    sessionId: 'some-sessionid',
    userId: 'some-uuid',
    refreshTokenHash: 'refresh-token-hash',
    expiresAt: new Date(Date.now() + 12 * 60 * 1000), // 1 hour from now
  };
}
