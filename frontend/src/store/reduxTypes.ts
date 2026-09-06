export const AsyncThunkStatus = {
  Idle: 'idle',
  Loading: 'loading',
  Success: 'success',
  Failed: 'failed',
} as const;

export type AsyncThunkStatusValue =
  (typeof AsyncThunkStatus)[keyof typeof AsyncThunkStatus];
