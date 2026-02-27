import { Router } from 'express';

import { requireRole } from '@/common/middleware/role-guard.middleware';

import { UserRole } from '@/components/user/types/user';

import { UserService } from '@/components/user/domain/services/user.service';
import { UserRepository } from '@/components/user/domain/repository/user.repository';
import { ClerkIdentityProvider } from '@/components/user/domain/external/clerk-identity.provider';

import { UserController } from '@/components/user/entry/user.controller';

const userRouter = Router();

const userRepository = new UserRepository();
const identityProvider = new ClerkIdentityProvider();
const userService = new UserService(userRepository, identityProvider);
const controller = new UserController(userService);

userRouter.get('/', requireRole(UserRole.ADMIN), controller.getUsers);
userRouter.get('/:id', controller.getUserById);
userRouter.post('/:id/de-active', requireRole(UserRole.ADMIN), controller.deActiveUser);

export default userRouter;
