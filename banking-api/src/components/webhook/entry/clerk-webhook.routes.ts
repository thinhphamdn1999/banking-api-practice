import { Router } from 'express';

import { clerkWebhookRawBodyMiddleware } from '@/common/middleware/clerk-webhook';

import { UserRepository } from '@/components/user/domain/repository/user.repository';
import { ClerkIdentityProvider } from '@/components/user/domain/external/clerk-identity.provider';
import { ClerkWebhook } from '@/components/user/webhooks/clerk.webhook';

import { ClerkWebhookController } from './clerk-webhook.controller';

const router = Router();

const userRepo = new UserRepository();
const identityProvider = new ClerkIdentityProvider();
const clerkWebhook = new ClerkWebhook(userRepo, identityProvider);
const controller = new ClerkWebhookController(clerkWebhook);

router.post('/clerk', clerkWebhookRawBodyMiddleware, controller.handleWebhook);

export default router;
