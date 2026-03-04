import { Router } from 'express';

import { requireRole } from '@/common/middleware/role-guard.middleware';

import { UserRole } from '@/modules/user/types/user';

import { UserService } from '@/modules/user/domain/services/user.service';
import { UserRepository } from '@/modules/user/domain/repository/user.repository';
import { ClerkIdentityProvider } from '@/modules/user/domain/external/clerk-identity.provider';
import { UserApplicationService } from '@/modules/user/application/user.application';

import { UserController } from '@/modules/user/entry/user.controller';

const userRouter = Router();

const userRepository = new UserRepository();
const userService = new UserService(userRepository, new ClerkIdentityProvider());
const userApplicationService = new UserApplicationService(userService);
const controller = new UserController(userApplicationService);

userRouter.get('/', requireRole(UserRole.ADMIN), controller.getUsers);
userRouter.get('/me', controller.getCurrentUser);
userRouter.get('/:id', controller.getUserById);
userRouter.post('/:id/de-active', requireRole(UserRole.ADMIN), controller.deActiveUser);
userRouter.post('/:id/activate', requireRole(UserRole.ADMIN), controller.activateUser);

export default userRouter;
