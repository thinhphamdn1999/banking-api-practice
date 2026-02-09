import { Router } from 'express';

import { getUsers } from '@/components/user/entry/user.controller';

const userRouter = Router();

userRouter.get('/', getUsers);

export default userRouter;
