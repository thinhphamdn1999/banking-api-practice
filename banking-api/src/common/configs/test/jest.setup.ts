/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';

jest.mock('@clerk/express', () => ({
  clerkMiddleware: () => (req: any, res: any, next: any) => next(),
  requireAuth: () => (req: any, res: any, next: any) => next(),
  getAuth: () => ({ userId: 'test-user-id' }),

  clerkClient: {
    users: {
      getUser: jest.fn().mockResolvedValue({
        primaryEmailAddress: { emailAddress: 'mock@test.com' },
        firstName: 'Mock',
        lastName: 'User',
        username: 'mockuser',
        imageUrl: null,
        createdAt: Math.floor(Date.now() / 1000),
        updatedAt: Math.floor(Date.now() / 1000),
      }),
      lockUser: jest.fn().mockResolvedValue(undefined),
    },
  },
}));
