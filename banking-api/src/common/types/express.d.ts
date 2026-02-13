import 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        clerkUserId: string;
      };
    }
  }
}
