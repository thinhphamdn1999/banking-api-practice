import { rateLimit } from 'express-rate-limit';

import HttpStatusCode from '@/common/constants/http-status-code';

import { createErrorResponse } from '@/common/utils/error-response';

export const authLimiter = rateLimit({
  // Limit each user (identified by clerkUserId) to 500 requests per 15 minutes
  windowMs: 15 * 60 * 1000,
  limit: 500,
  standardHeaders: true,
  legacyHeaders: false,
  // Use clerkUserId as the key to identify unique users for rate limiting
  keyGenerator: (req) => req.user?.clerkUserId as string,
  handler: (req, res) => {
    res.status(HttpStatusCode.TOO_MANY_REQUESTS).json(
      createErrorResponse({
        statusCode: HttpStatusCode.TOO_MANY_REQUESTS,
        message: 'Too many request. Please try again later',
      }),
    );
  },
});
