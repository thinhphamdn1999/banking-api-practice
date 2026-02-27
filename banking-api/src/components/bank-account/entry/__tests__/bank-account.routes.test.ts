import { Repository } from 'typeorm';
import request from 'supertest';
import type { Express } from 'express';

import { TestHelper } from '@/common/configs/test/database-instance';

import { BankAccount } from '@/components/bank-account/domain/entities/bank-account.entity';
import { User } from '@/components/user/domain/entities/user.entity';

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
  });
});
