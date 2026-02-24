import { rateLimit } from 'express-rate-limit';
import HttpStatusCode from '../constants/httpStatusCode';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 500,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.clerkUserId as string,
  handler: (req, res) => {
    res.status(HttpStatusCode.TOO_MANY_REQUESTS).json({
      success: false,
      message: 'Too many requests. Please try again later.',
    });
  },
});
