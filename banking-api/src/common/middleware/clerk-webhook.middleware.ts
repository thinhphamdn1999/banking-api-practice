import express from 'express';

/**
 * Clerk webhook requires raw body for signature verification.
 */
export const clerkWebhookRawBodyMiddleware = express.raw({ type: 'application/json' });
