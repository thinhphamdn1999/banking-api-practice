/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';

jest.mock('@clerk/express', () => ({
  clerkMiddleware: () => (req: any, res: any, next: any) => next(),
  requireAuth: () => (req: any, res: any, next: any) => next(),
  getAuth: () => ({ userId: 'test-user-id' }),
}));
