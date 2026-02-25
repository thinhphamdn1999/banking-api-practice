import express from 'express';
import cors from 'cors';
import { clerkMiddleware } from '@clerk/express';
import helmet from 'helmet';

import corsOptions from '@/common/configs/cors';

import { authLimiter } from '@/common/middleware/rate-limit';
import { requireAuth } from '@/common/middleware/required-auth';

import userRouter from '@/components/user/entry/user.routes';
import webhookRouter from '@/components/webhook/entry/clerk-webhook.routes';
import bankAccountRouter from '@/components/bank-account/entry/bank-account.routes';
import transactionRouter from '@/components/transaction/entry/transaction.routes';
import { attachDbUser } from '@/common/middleware/attach-db-user';

const app = express();

app.use(helmet());
app.use(cors(corsOptions));

app.use('/api/webhooks', webhookRouter);

app.use(express.json());

app.use(clerkMiddleware());

app.use('/api/users', requireAuth, attachDbUser, authLimiter, userRouter);
app.use('/api/bank-accounts', requireAuth, attachDbUser, authLimiter, bankAccountRouter);
app.use('/api/transactions', requireAuth, attachDbUser, authLimiter, transactionRouter);

export default app;
