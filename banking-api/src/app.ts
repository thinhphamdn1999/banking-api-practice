import express from 'express';
import cors from 'cors';
import { clerkMiddleware } from '@clerk/express';
import helmet from 'helmet';

import corsOptions from '@/common/configs/cors';

import { limiter } from '@/common/middleware/rateLimit';
import { requireAuth } from '@/common/middleware/requiredAuth';

import userRouter from '@/components/user/entry/user.routes';

const app = express();

app.use(helmet());
app.use(limiter);

app.use(express.json());

app.use(clerkMiddleware());
app.use(cors(corsOptions));

app.get('/', (req, res) => res.json({ title: 'Banking API' }));

app.use('/api/users', requireAuth, userRouter);

export default app;
