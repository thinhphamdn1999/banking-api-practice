import { rateLimit } from 'express-rate-limit';

import HttpStatusCode from '@/common/constants/http-status-code';
import { RATE_LIMIT_MAX_REQUESTS, RATE_LIMIT_WINDOW_MS } from '@/common/constants/rate-limit';

import { createErrorResponse } from '@/common/utils/error-response';

export const authLimiter = rateLimit({
  // Limit each user (identified by clerkUserId) to 500 requests per 15 minutes
  windowMs: RATE_LIMIT_WINDOW_MS,
  limit: RATE_LIMIT_MAX_REQUESTS,
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
