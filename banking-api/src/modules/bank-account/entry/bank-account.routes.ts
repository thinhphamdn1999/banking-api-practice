import { Router } from 'express';

import { requireRole } from '@/common/middleware/role-guard.middleware';

import { UserRole } from '@/modules/user/types/user';

import { BankAccountService } from '@/modules/bank-account/domain/services/bank-account.service';
import { BankAccountRepository } from '@/modules/bank-account/domain/repository/bank-account.repository';
import { UserRepository } from '@/modules/user/domain/repository/user.repository';

import { BankAccountController } from './bank-account.controller';

const bankAccountRouter = Router();

const bankAccountRepository = new BankAccountRepository();
const userRepository = new UserRepository();
const bankAccountService = new BankAccountService(bankAccountRepository, userRepository);
const controller = new BankAccountController(bankAccountService);

bankAccountRouter.get('/', controller.getBankAccounts);
bankAccountRouter.get('/:id', controller.getBankAccountById);
bankAccountRouter.post('/', requireRole(UserRole.USER), controller.createBankAccount);
bankAccountRouter.put('/:id', requireRole(UserRole.USER), controller.updateBankAccount);

export default bankAccountRouter;
