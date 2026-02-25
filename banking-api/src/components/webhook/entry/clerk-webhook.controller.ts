import type { Request, Response } from 'express';

import { verifyWebhook } from '@clerk/express/webhooks';

import HttpStatusCode from '@/common/constants/http-status-code';
import { ERROR_CODES } from '@/common/constants/errors';

import { ClerkWebhook } from '@/components/user/webhooks/clerk.webhook';

import { createErrorResponse } from '@/common/utils/error-response';

export class ClerkWebhookController {
  constructor(private readonly clerkWebhook: ClerkWebhook) {}

  handleWebhook = async (req: Request, res: Response) => {
    try {
      const event = await verifyWebhook(req);

      const clerkUserId = event.data?.id;

      if (!clerkUserId) {
        return res.status(HttpStatusCode.BAD_REQUEST).json(
          createErrorResponse({
            statusCode: HttpStatusCode.BAD_REQUEST,
            message: 'Missing user id in webhook payload',
          }),
        );
      }

      switch (event.type) {
        case 'user.created':
          await this.clerkWebhook.handleUserCreated(event.data.id);
          return res.sendStatus(HttpStatusCode.CREATED);

        case 'user.updated':
          await this.clerkWebhook.handleUserUpdated(event.data.id);
          return res.sendStatus(HttpStatusCode.OK);

        case 'user.deleted':
          await this.clerkWebhook.handleUserDeleted(event.data.id as string);
          return res.sendStatus(HttpStatusCode.OK);

        default:
          return res.status(HttpStatusCode.BAD_REQUEST).json(
            createErrorResponse({
              statusCode: HttpStatusCode.BAD_REQUEST,
              errors: [
                {
                  errCode: ERROR_CODES.INVALID_REQUEST,
                  field: 'event.type',
                  message: `Unhandled Clerk event type: ${event.type}`,
                },
              ],
            }),
          );
      }
    } catch {
      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json(
        createErrorResponse({
          statusCode: HttpStatusCode.INTERNAL_SERVER_ERROR,
          message: 'Error verifying Clerk webhook',
        }),
      );
    }
  };
}
