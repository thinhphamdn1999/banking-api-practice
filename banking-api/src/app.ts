import express from 'express';
import cors from 'cors';
import { clerkMiddleware } from '@clerk/express';
import helmet from 'helmet';

import corsOptions from '@/common/configs/cors';

import { authLimiter } from '@/common/middleware/rate-limit.middleware';
import { requireAuth } from '@/common/middleware/required-auth.middleware';

import userRouter from '@/modules/user/v1/entry/user.routes';
import webhookRouter from '@/modules/webhook/entry/clerk-webhook.routes';
import bankAccountRouter from '@/modules/bank-account/v1/entry/bank-account.routes';
import transactionRouter from '@/modules/transaction/v1/entry/transaction.routes';
import { attachDatabaseUser } from '@/common/middleware/user-context.middleware';

const app = express();

app.use(helmet());
app.use(cors(corsOptions));

app.use('/api/webhooks', webhookRouter);

app.use(express.json());

app.use(clerkMiddleware());

app.use('/api/v1/users', requireAuth, attachDatabaseUser, authLimiter, userRouter);
app.use('/api/v1/bank-accounts', requireAuth, attachDatabaseUser, authLimiter, bankAccountRouter);
app.use('/api/v1/transactions', requireAuth, attachDatabaseUser, authLimiter, transactionRouter);

export default app;
