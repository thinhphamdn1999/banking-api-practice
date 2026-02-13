import express from 'express';
import cors from 'cors';
import { clerkMiddleware } from '@clerk/express';
import helmet from 'helmet';

import corsOptions from '@/common/configs/cors';

import { limiter } from '@/common/middleware/rateLimit';
import { requireAuth } from '@/common/middleware/requiredAuth';

import userRouter from '@/components/user/entry/user.routes';
import webhookRouter from '@/components/webhook/entry/clerk-webhook.routes';
import bankAccountRouter from '@/components/bank-account/entry/bank-account.routes';

const app = express();

app.use(helmet());
app.use(limiter);

app.use('/api/webhooks', webhookRouter);

app.use(express.json());

app.use(clerkMiddleware());
app.use(cors(corsOptions));

app.get('/', (req, res) => res.json({ title: 'Banking API' }));

app.use('/api/users', requireAuth, userRouter);
app.use('/api/bank-accounts', requireAuth, bankAccountRouter);

export default app;
