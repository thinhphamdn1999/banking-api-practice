import { Router } from 'express';

import { UserController } from './user.controller';
import { UserService } from '../domain/services/user.service';
import { UserRepository } from '../domain/repository/user.repository';
import { ClerkIdentityProvider } from '../domain/external/clerk-identity.provider';

const userRouter = Router();

const userRepository = new UserRepository();
const identityProvider = new ClerkIdentityProvider();
const userService = new UserService(userRepository, identityProvider);
const controller = new UserController(userService);

userRouter.get('/', controller.getUsers);
userRouter.get('/:id', controller.getUserById);
userRouter.post('/:id/de-active', controller.deActiveUser);

export default userRouter;
