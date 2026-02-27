import express from 'express';
import cors from 'cors';
import { clerkMiddleware } from '@clerk/express';
import helmet from 'helmet';

import corsOptions from '@/common/configs/cors';

import { authLimiter } from '@/common/middleware/rate-limit.middleware';
import { requireAuth } from '@/common/middleware/required-auth.middleware';

import userRouter from '@/components/user/entry/user.routes';
import webhookRouter from '@/components/webhook/entry/clerk-webhook.routes';
import bankAccountRouter from '@/components/bank-account/entry/bank-account.routes';
import transactionRouter from '@/components/transaction/entry/transaction.routes';
import { attachDatabaseUser } from '@/common/middleware/user-context.middleware';

const app = express();

app.use(helmet());
app.use(cors(corsOptions));

app.use('/api/webhooks', webhookRouter);

app.use(express.json());

app.use(clerkMiddleware());

app.use('/api/users', requireAuth, attachDatabaseUser, authLimiter, userRouter);
app.use('/api/bank-accounts', requireAuth, attachDatabaseUser, authLimiter, bankAccountRouter);
app.use('/api/transactions', requireAuth, attachDatabaseUser, authLimiter, transactionRouter);

export default app;
