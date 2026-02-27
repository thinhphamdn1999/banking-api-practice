import { Router } from 'express';

import { requireRole } from '@/common/middleware/role-guard.middleware';

import { UserRole } from '@/modules/user/types/user';

import { UserService } from '@/modules/user/domain/services/user.service';
import { UserRepository } from '@/modules/user/domain/repository/user.repository';
import { ClerkIdentityProvider } from '@/modules/user/domain/external/clerk-identity.provider';

import { UserController } from '@/modules/user/entry/user.controller';

const userRouter = Router();

const userRepository = new UserRepository();
const identityProvider = new ClerkIdentityProvider();
const userService = new UserService(userRepository, identityProvider);
const controller = new UserController(userService);

userRouter.get('/', requireRole(UserRole.ADMIN), controller.getUsers);
userRouter.get('/me', controller.getCurrentUser);
userRouter.get('/:id', controller.getUserById);
userRouter.post('/:id/de-active', requireRole(UserRole.ADMIN), controller.deActiveUser);
userRouter.post('/:id/activate', requireRole(UserRole.ADMIN), controller.activateUser);

export default userRouter;
