import { Router } from 'express';

import { requireRole } from '@/common/middleware/role-guard.middleware';

import { UserRole } from '@/modules/user/types/user';

import { BankAccountRepository } from '@/modules/bank-account/domain/repository/bank-account.repository';
import { UserRepository } from '@/modules/user/domain/repository/user.repository';
import { BankAccountService } from '@/modules/bank-account/domain/services/bank-account.service';
import { UserService } from '@/modules/user/domain/services/user.service';
import { ClerkIdentityProvider } from '@/modules/user/domain/external/clerk-identity.provider';
import { BankAccountApplicationServiceV1 } from '@/modules/bank-account/v1/application/bank-account.application.v1';

import { BankAccountController } from '@/modules/bank-account/v1/entry/bank-account.controller';

const bankAccountRouter = Router();

const bankAccountRepository = new BankAccountRepository();
const userRepository = new UserRepository();

const bankAccountService = new BankAccountService(bankAccountRepository);
const userService = new UserService(userRepository, new ClerkIdentityProvider());

const bankAccountApplicationService = new BankAccountApplicationServiceV1(
  bankAccountService,
  userService,
);

const controller = new BankAccountController(bankAccountApplicationService);

bankAccountRouter.get('/', controller.getBankAccounts);
bankAccountRouter.get('/:id', controller.getBankAccountById);
bankAccountRouter.post('/', requireRole(UserRole.USER), controller.createBankAccount);
bankAccountRouter.put('/:id', requireRole(UserRole.USER), controller.updateBankAccount);

export default bankAccountRouter;
