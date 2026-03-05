import { Repository } from 'typeorm';
import request from 'supertest';
import type { Express } from 'express';

import { TestHelper } from '@/common/configs/test/database-instance';

import { BankAccount } from '@/modules/bank-account/domain/entities/bank-account.entity';
import { User } from '@/modules/user/domain/entities/user.entity';
import { UserRole } from '@/modules/user/types/user';
import { BankAccountService } from '@/modules/bank-account/domain/services/bank-account.service';

describe('Bank Account Routes', () => {
  let app: Express;
  let bankAccountRepo: Repository<BankAccount>;
  let userRepo: Repository<User>;

  beforeAll(async () => {
    await TestHelper.instance.setupTestDB();

    const mod = await import('@/app');
    app = mod.default;

    bankAccountRepo = TestHelper.instance.getRepo(BankAccount);
    userRepo = TestHelper.instance.getRepo(User);
  });

  afterAll(async () => {
    await TestHelper.instance.teardownTestDB();
  });

  beforeEach(async () => {
    await bankAccountRepo.clear();
    await userRepo.clear();

    await seedUser();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const seedUser = async () => {
    const users = userRepo.create({
      clerkUserId: 'test_user_id',
      email: 'test@example.com',
    });
    return userRepo.save(users);
  };

  const seedBankAccounts = async () => {
    const user = await userRepo.findOneBy({
      clerkUserId: 'test_user_id',
    });

    const bankAccounts = bankAccountRepo.create({
      name: 'bank_account_test_1',
      accountNumber: '5883926628',
      user: user!,
    });
    return bankAccountRepo.save(bankAccounts);
  };

  describe('GET /api/bank-accounts', () => {
    it('should return [] when no account', async () => {
      const res = await request(app).get('/api/bank-accounts');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        data: [],
        metadata: {
          currentPage: 1,
          limit: 20,
          offset: 0,
          pageCount: 0,
          totalCount: 0,
        },
      });
    });

    it('should return list of bank accounts', async () => {
      await seedBankAccounts();
      const res = await request(app).get('/api/bank-accounts');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0]).toEqual(
        expect.objectContaining({
          accountNumber: '5883926628',
          balance: 0,
          id: expect.any(String),
          name: 'bank_account_test_1',
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        }),
      );
      expect(res.body.metadata).toEqual(
        expect.objectContaining({
          currentPage: 1,
          limit: 20,
          offset: 0,
          pageCount: 1,
          totalCount: 1,
        }),
      );
    });

    it('should respect pagination query params', async () => {
      const res = await request(app).get('/api/bank-accounts?page=2&limit=5');

      expect(res.status).toBe(200);
      expect(res.body.metadata).toEqual(
        expect.objectContaining({
          currentPage: 2,
          limit: 5,
          pageCount: 0,
          totalCount: 0,
        }),
      );
    });

    it('should only return bank accounts belonging to the authenticated user', async () => {
      await seedBankAccounts();

      const otherUser = await userRepo.save(
        userRepo.create({ clerkUserId: 'other_user_id', email: 'other@example.com' }),
      );
      await bankAccountRepo.save(
        bankAccountRepo.create({
          name: 'other_account',
          accountNumber: '1111111111',
          user: otherUser,
        }),
      );

      const res = await request(app).get('/api/bank-accounts');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].name).toBe('bank_account_test_1');
      expect(res.body.metadata.totalCount).toBe(1);
    });

    it('should return 500 if an unexpected error occurs', async () => {
      jest
        .spyOn(BankAccountService.prototype, 'findBankAccounts')
        .mockRejectedValueOnce(new Error('Unexpected error'));

      const res = await request(app).get('/api/bank-accounts');

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty('errors');
    });

    it('should return all accounts when admin has no userId filter', async () => {
      await seedBankAccounts();
      await userRepo.update({ clerkUserId: 'test_user_id' }, { role: UserRole.ADMIN });

      const otherUser = await userRepo.save(
        userRepo.create({ clerkUserId: 'other_user_id', email: 'other@example.com' }),
      );
      await bankAccountRepo.save(
        bankAccountRepo.create({
          name: 'other_account',
          accountNumber: '1111111111',
          user: otherUser,
        }),
      );

      const res = await request(app).get('/api/bank-accounts');

      expect(res.status).toBe(200);
      expect(res.body.metadata.totalCount).toBe(2);
    });
  });

  describe('GET /api/bank-accounts/:id', () => {
    it('should return 404 if user not found', async () => {
      const res = await request(app).get('/api/bank-accounts/non-existing-id');

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('errors');
    });

    it('should return user if found', async () => {
      const bankAccount = await seedBankAccounts();

      const res = await request(app).get(`/api/bank-accounts/${bankAccount.id}`);

      expect(res.status).toBe(200);

      expect(res.body).toEqual(
        expect.objectContaining({
          id: bankAccount.id,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        }),
      );
    });

    it('should return 500 if an unexpected error occurs', async () => {
      jest
        .spyOn(BankAccountService.prototype, 'getBankAccountById')
        .mockRejectedValueOnce(new Error('Unexpected error'));

      const res = await request(app).get('/api/bank-accounts/some-id');

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty('errors');
    });
  });

  describe('POST /api/bank-accounts', () => {
    it('should create bank account successfully', async () => {
      const res = await request(app).post('/api/bank-accounts').send({ name: 'Test Account' });

      expect(res.status).toBe(201);

      expect(res.body).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          name: 'Test Account',
          accountNumber: expect.any(String),
          balance: 0,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        }),
      );

      const dbAccount = await bankAccountRepo.findOne({
        where: { name: 'Test Account' },
        relations: ['user'],
      });

      expect(dbAccount).not.toBeNull();
      expect(dbAccount?.user.clerkUserId).toBe('test_user_id');
    });

    it('should return 400 if name missing', async () => {
      const res = await request(app).post('/api/bank-accounts').send({});

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('errors');
    });

    it('should return 403 if user does not have USER role', async () => {
      await userRepo.update({ clerkUserId: 'test_user_id' }, { role: UserRole.ADMIN });

      const res = await request(app).post('/api/bank-accounts').send({ name: 'Test Account' });

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty('errors');
    });

    it('should retry account number generation if number already exists', async () => {
      const existingAccount = await seedBankAccounts();

      jest
        .spyOn(BankAccountService.prototype, 'findByAccountNumber')
        .mockResolvedValueOnce(existingAccount)
        .mockResolvedValueOnce(null);

      const res = await request(app).post('/api/bank-accounts').send({ name: 'Test Account' });

      expect(res.status).toBe(201);
      expect(BankAccountService.prototype.findByAccountNumber).toHaveBeenCalledTimes(2);
    });

    it('should return 500 if an unexpected error occurs', async () => {
      jest
        .spyOn(BankAccountService.prototype, 'createBankAccount')
        .mockRejectedValueOnce(new Error('Unexpected error'));

      const res = await request(app).post('/api/bank-accounts').send({ name: 'Test Account' });

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty('errors');
    });
  });

  describe('PUT /api/bank-accounts/:id', () => {
    it('should update bank account successfully', async () => {
      const bankAccount = await seedBankAccounts();

      const res = await request(app)
        .put(`/api/bank-accounts/${bankAccount.id}`)
        .send({ name: 'Updated Account Name' });

      expect(res.status).toBe(200);

      expect(res.body).toEqual(
        expect.objectContaining({
          id: bankAccount.id,
          name: 'Updated Account Name',
        }),
      );

      const updated = await bankAccountRepo.findOneBy({
        id: bankAccount.id,
      });

      expect(updated?.name).toBe('Updated Account Name');
    });

    it('should return 404 if bank account not found', async () => {
      const res = await request(app)
        .put('/api/bank-accounts/non-existing-id')
        .send({ name: 'Test' });

      expect(res.status).toBe(404);
    });

    it('should return 400 if name missing', async () => {
      const bankAccount = await seedBankAccounts();

      const res = await request(app).put(`/api/bank-accounts/${bankAccount.id}`).send({});

      expect(res.status).toBe(400);
    });

    it('should return 403 if user does not have USER role', async () => {
      const bankAccount = await seedBankAccounts();
      await userRepo.update({ clerkUserId: 'test_user_id' }, { role: UserRole.ADMIN });

      const res = await request(app)
        .put(`/api/bank-accounts/${bankAccount.id}`)
        .send({ name: 'Updated Name' });

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty('errors');
    });

    it('should return 500 if an unexpected error occurs', async () => {
      const bankAccount = await seedBankAccounts();
      jest
        .spyOn(BankAccountService.prototype, 'updateBankAccount')
        .mockRejectedValueOnce(new Error('Unexpected error'));

      const res = await request(app)
        .put(`/api/bank-accounts/${bankAccount.id}`)
        .send({ name: 'Updated Name' });

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty('errors');
    });
  });
});
