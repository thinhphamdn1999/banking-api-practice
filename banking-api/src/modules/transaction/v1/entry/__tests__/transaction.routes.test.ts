import { Repository } from 'typeorm';
import request from 'supertest';
import type { Express } from 'express';

import { TestHelper } from '@/common/configs/test/database-instance';

import { BankAccount } from '@/modules/bank-account/domain/entities/bank-account.entity';
import { User } from '@/modules/user/domain/entities/user.entity';
import { Transaction } from '@/modules/transaction/domain/entities/transaction.entity';
import { TransactionService } from '@/modules/transaction/domain/services/transaction.service';

describe('Transaction Routes', () => {
  let app: Express;
  let bankAccountRepo: Repository<BankAccount>;
  let transactionRepo: Repository<Transaction>;
  let userRepo: Repository<User>;

  beforeAll(async () => {
    await TestHelper.instance.setupTestDB();

    const mod = await import('@/app');
    app = mod.default;

    bankAccountRepo = TestHelper.instance.getRepo(BankAccount);
    transactionRepo = TestHelper.instance.getRepo(Transaction);
    userRepo = TestHelper.instance.getRepo(User);
  });

  afterAll(async () => {
    await TestHelper.instance.teardownTestDB();
  });

  beforeEach(async () => {
    await TestHelper.instance.clearAllTables();

    await seedUser();
    await seedBankAccounts();
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

    const bankAccounts = bankAccountRepo.create([
      {
        name: 'bank_account_test_1',
        accountNumber: '5883926628',
        user: user!,
      },
      {
        name: 'bank_account_test_2',
        accountNumber: '5883926629',
        user: user!,
      },
    ]);
    return bankAccountRepo.save(bankAccounts);
  };

  describe('GET /api/transactions', () => {
    it('should return 500 if an unexpected error occurs', async () => {
      jest
        .spyOn(TransactionService.prototype, 'findTransactions')
        .mockRejectedValueOnce(new Error('Unexpected error'));

      const res = await request(app).get('/api/v1/transactions');

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty('errors');
    });

    it('should return [] when transaction', async () => {
      const res = await request(app).get('/api/v1/transactions');

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

    it('should return list of transactions', async () => {
      const bankAccount = await bankAccountRepo.findOneBy({
        accountNumber: '5883926628',
      });
      await request(app)
        .post('/api/v1/transactions')
        .set('Idempotency-Key', '67925adc-1f5d-41b2-98c4-3dc5840b5a69')
        .send({
          type: 'deposit',
          amount: {
            amount: 150,
            currency: 'usd',
          },
          destinationAccountId: bankAccount?.id,
          description: 'deposit to bank account',
        });

      const res = await request(app).get('/api/v1/transactions');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0]).toEqual(
        expect.objectContaining({
          amount: {
            amount: 150,
            currency: 'USD',
          },
          description: 'deposit to bank account',
          fromAccount: null,
          name: 'Deposit to bank_account_test_1',
          status: 'success',
          type: 'deposit',
          id: expect.any(String),
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

    it('should filter transactions by type and status', async () => {
      const bankAccount = await bankAccountRepo.findOneBy({
        accountNumber: '5883926628',
      });

      await request(app)
        .post('/api/v1/transactions')
        .set('Idempotency-Key', 'key-deposit')
        .send({
          type: 'deposit',
          amount: { amount: 100, currency: 'usd' },
          destinationAccountId: bankAccount?.id,
        });

      await request(app)
        .post('/api/v1/transactions')
        .set('Idempotency-Key', 'key-withdraw')
        .send({
          type: 'withdraw',
          amount: { amount: 50, currency: 'usd' },
          sourceAccountId: bankAccount?.id,
        });

      const res = await request(app).get(
        '/api/v1/transactions?type=deposit&status=success&page=1&limit=30',
      );

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].type).toBe('deposit');
      expect(
        res.body.data.every((transaction: Transaction) => transaction.status === 'success'),
      ).toBe(true);
    });

    it('should return transactions where account is either source or destination', async () => {
      const account1 = await bankAccountRepo.findOneBy({
        accountNumber: '5883926628',
      });

      const account2 = await bankAccountRepo.findOneBy({
        accountNumber: '5883926629',
      });

      await request(app)
        .post('/api/v1/transactions')
        .set('Idempotency-Key', '67925adc-1f5d-41b2-98c4-3dc5840b5a69')
        .send({
          type: 'deposit',
          amount: { amount: 100, currency: 'usd' },
          destinationAccountId: account1?.id,
        });

      await request(app)
        .post('/api/v1/transactions')
        .set('Idempotency-Key', '67925adc-1f5d-41b2-98c4-3dc5840b5a70')
        .send({
          type: 'transfer',
          amount: { amount: 50, currency: 'usd' },
          sourceAccountId: account1?.id,
          destinationAccountId: account2?.id,
        });

      await request(app)
        .post('/api/v1/transactions')
        .set('Idempotency-Key', '67925adc-1f5d-41b2-98c4-3dc5840b5a71')
        .send({
          type: 'withdraw',
          amount: { amount: 30, currency: 'usd' },
          sourceAccountId: account2?.id,
        });

      const res = await request(app)
        .get(`/api/v1/transactions`)
        .query({
          bankAccountIds: [account1?.id],
        });

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);

      expect(
        res.body.data.every(
          (transaction: Transaction) =>
            transaction.fromAccount?.id === account1?.id ||
            transaction.toAccount?.id === account1?.id,
        ),
      ).toBe(true);
    });

    it('should return transactions within date range', async () => {
      const account = await bankAccountRepo.findOneBy({
        accountNumber: '5883926628',
      });

      await request(app)
        .post('/api/v1/transactions')
        .set('Idempotency-Key', 'date-1')
        .send({
          type: 'deposit',
          amount: { amount: 100, currency: 'usd' },
          destinationAccountId: account?.id,
        });

      await request(app)
        .post('/api/v1/transactions')
        .set('Idempotency-Key', 'date-2')
        .send({
          type: 'deposit',
          amount: { amount: 200, currency: 'usd' },
          destinationAccountId: account?.id,
        });

      await request(app)
        .post('/api/v1/transactions')
        .set('Idempotency-Key', 'date-3')
        .send({
          type: 'deposit',
          amount: { amount: 300, currency: 'usd' },
          destinationAccountId: account?.id,
        });

      const transaction1 = await transactionRepo.findOneBy({ idempotencyKey: 'date-1' });
      const transaction2 = await transactionRepo.findOneBy({ idempotencyKey: 'date-2' });
      const transaction3 = await transactionRepo.findOneBy({ idempotencyKey: 'date-3' });

      await transactionRepo.update(transaction1?.id as string, {
        createdAt: new Date('2026-02-01'),
      });
      await transactionRepo.update(transaction2?.id as string, {
        createdAt: new Date('2026-02-15'),
      });
      await transactionRepo.update(transaction3?.id as string, {
        createdAt: new Date('2026-03-01'),
      });

      const res = await request(app).get(
        '/api/v1/transactions?fromDate=2026-02-01&toDate=2026-02-28',
      );

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);

      expect(
        res.body.data.every((transaction: Transaction) => {
          const date = new Date(transaction.createdAt);
          return date >= new Date('2026-02-01') && date <= new Date('2026-02-28');
        }),
      ).toBe(true);
    });

    it('should filter transactions with only fromDate', async () => {
      const account = await bankAccountRepo.findOneBy({
        accountNumber: '5883926628',
      });

      await request(app)
        .post('/api/v1/transactions')
        .set('Idempotency-Key', 'from-1')
        .send({
          type: 'deposit',
          amount: { amount: 100, currency: 'usd' },
          destinationAccountId: account?.id,
        });

      await request(app)
        .post('/api/v1/transactions')
        .set('Idempotency-Key', 'from-2')
        .send({
          type: 'deposit',
          amount: { amount: 200, currency: 'usd' },
          destinationAccountId: account?.id,
        });

      const transaction1 = await transactionRepo.findOneBy({ idempotencyKey: 'from-1' });
      const transaction2 = await transactionRepo.findOneBy({ idempotencyKey: 'from-2' });

      await transactionRepo.update(transaction1!.id, {
        createdAt: new Date('2026-02-01T00:00:00.000Z'),
      });

      await transactionRepo.update(transaction2!.id, {
        createdAt: new Date('2026-03-01T00:00:00.000Z'),
      });

      const res = await request(app).get('/api/v1/transactions?fromDate=2026-02-15T00:00:00.000Z');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);

      const returnedDate = new Date(res.body.data[0].createdAt);
      expect(returnedDate >= new Date('2026-02-15T00:00:00.000Z')).toBe(true);
    });

    it('should filter transactions with only toDate', async () => {
      const account = await bankAccountRepo.findOneBy({
        accountNumber: '5883926628',
      });

      await request(app)
        .post('/api/v1/transactions')
        .set('Idempotency-Key', 'to-1')
        .send({
          type: 'deposit',
          amount: { amount: 100, currency: 'usd' },
          destinationAccountId: account?.id,
        });

      await request(app)
        .post('/api/v1/transactions')
        .set('Idempotency-Key', 'to-2')
        .send({
          type: 'deposit',
          amount: { amount: 200, currency: 'usd' },
          destinationAccountId: account?.id,
        });

      const transaction1 = await transactionRepo.findOneBy({ idempotencyKey: 'to-1' });
      const transaction2 = await transactionRepo.findOneBy({ idempotencyKey: 'to-2' });

      await transactionRepo.update(transaction1!.id, {
        createdAt: new Date('2026-02-01T00:00:00.000Z'),
      });

      await transactionRepo.update(transaction2!.id, {
        createdAt: new Date('2026-03-01T00:00:00.000Z'),
      });

      const res = await request(app).get('/api/v1/transactions?toDate=2026-02-12T00:00:00.000Z');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);

      const returnedDate = new Date(res.body.data[0].createdAt);
      expect(returnedDate <= new Date('2026-02-12T00:00:00.000Z')).toBe(true);
    });
  });

  describe('GET /api/transaction/:id', () => {
    it('should return 500 if an unexpected error occurs', async () => {
      jest
        .spyOn(TransactionService.prototype, 'getTransactionById')
        .mockRejectedValueOnce(new Error('Unexpected error'));

      const res = await request(app).get('/api/v1/transactions/some-id');

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty('errors');
    });

    it('should return 404 if transaction not found', async () => {
      const res = await request(app).get(
        '/api/v1/transactions/00000000-0000-0000-0000-000000000000',
      );

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('errors');
    });

    it('should return transaction if found', async () => {
      const bankAccount = await bankAccountRepo.findOneBy({
        accountNumber: '5883926628',
      });

      await request(app)
        .post('/api/v1/transactions')
        .set('Idempotency-Key', '67925adc-1f5d-41b2-98c4-3dc5840b5a69')
        .send({
          type: 'deposit',
          amount: {
            amount: 150,
            currency: 'usd',
          },
          destinationAccountId: bankAccount?.id,
          description: 'deposit to bank account',
        });

      const transaction = await transactionRepo.findOneBy({
        idempotencyKey: '67925adc-1f5d-41b2-98c4-3dc5840b5a69',
      });

      const res = await request(app).get(`/api/v1/transactions/${transaction?.id}`);

      expect(res.status).toBe(200);

      expect(res.body).toMatchObject(
        expect.objectContaining({
          amount: {
            amount: 150,
            currency: 'USD',
          },
          description: 'deposit to bank account',
          fromAccount: null,
          name: 'Deposit to bank_account_test_1',
          status: 'success',
          type: 'deposit',
          id: expect.any(String),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        }),
      );
    });
  });

  describe('POST /api/transactions', () => {
    it('should return 500 if an unexpected error occurs', async () => {
      const bankAccount = await bankAccountRepo.findOneBy({ accountNumber: '5883926628' });

      jest
        .spyOn(TransactionService.prototype, 'createTransaction')
        .mockRejectedValueOnce(new Error('Unexpected error'));

      const res = await request(app)
        .post('/api/v1/transactions')
        .set('Idempotency-Key', 'test-500-key')
        .send({
          type: 'deposit',
          amount: { amount: 100, currency: 'usd' },
          destinationAccountId: bankAccount?.id,
        });

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty('errors');
    });

    it('should create transaction successfully', async () => {
      const bankAccount = await bankAccountRepo.findOneBy({
        accountNumber: '5883926628',
      });
      const res = await request(app)
        .post('/api/v1/transactions')
        .set('Idempotency-Key', '67925adc-1f5d-41b2-98c4-3dc5840b5a69')
        .send({
          type: 'deposit',
          amount: {
            amount: 150,
            currency: 'usd',
          },
          destinationAccountId: bankAccount?.id,
          description: 'deposit to bank account',
        });

      expect(res.status).toBe(201);

      expect(res.body).toMatchObject(
        expect.objectContaining({
          description: 'deposit to bank account',
          amount: {
            amount: 150,
            currency: 'USD',
          },
          name: 'Deposit to bank_account_test_1',
          status: 'success',
          type: 'deposit',
          toAccount: {
            accountNumber: '5883926628',
            balance: 150,
            createdAt: expect.any(String),
            id: expect.any(String),
            name: 'bank_account_test_1',
            updatedAt: expect.any(String),
          },
          id: expect.any(String),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        }),
      );
    });

    it('should return 400 and type field error if type missing', async () => {
      const res = await request(app)
        .post('/api/v1/transactions')
        .set('Idempotency-Key', '67925adc-1f5d-41b2-98c4-3dc5840b5a69')
        .send({
          type: 'invalid',
          amount: { amount: 100, currency: 'usd' },
        });

      expect(res.status).toBe(400);
      expect(res.body.errors[0].field).toBe('transaction.type');
    });

    it('should return 400 if Idempotency-Key header is missing', async () => {
      const bankAccount = await bankAccountRepo.findOneBy({
        accountNumber: '5883926628',
      });

      const res = await request(app)
        .post('/api/v1/transactions')
        .send({
          type: 'deposit',
          amount: { amount: 100, currency: 'usd' },
          destinationAccountId: bankAccount?.id,
        });

      expect(res.status).toBe(400);
      expect(res.body.errors[0].field).toBe('Idempotency-Key');
    });

    it('should return 400 if deposit without destinationAccountId', async () => {
      const res = await request(app)
        .post('/api/v1/transactions')
        .set('Idempotency-Key', '67925adc-1f5d-41b2-98c4-3dc5840b5a69')
        .send({
          type: 'deposit',
          amount: { amount: 100, currency: 'usd' },
        });

      expect(res.status).toBe(400);
      expect(res.body.errors[0].field).toBe('transaction.destinationAccountId');
    });

    it('should return 400 if withdraw without sourceAccountId', async () => {
      const res = await request(app)
        .post('/api/v1/transactions')
        .set('Idempotency-Key', '67925adc-1f5d-41b2-98c4-3dc5840b5a69')
        .send({
          type: 'withdraw',
          amount: { amount: 100, currency: 'usd' },
        });

      expect(res.status).toBe(400);
      expect(res.body.errors[0].field).toBe('transaction.sourceAccountId');
    });

    it('should return 400 if transfer without sourceAccountId or destinationAccountId', async () => {
      const res = await request(app)
        .post('/api/v1/transactions')
        .set('Idempotency-Key', '67925adc-1f5d-41b2-98c4-3dc5840b5a69')
        .send({
          type: 'transfer',
          amount: { amount: 100, currency: 'usd' },
        });

      expect(res.status).toBe(400);
      expect(res.body.errors[0].field).toBe('transaction.sourceAccountId');
      expect(res.body.errors[1].field).toBe('transaction.destinationAccountId');
    });

    it('should return 400 if amount <= 0', async () => {
      const bankAccount = await bankAccountRepo.findOneBy({
        accountNumber: '5883926628',
      });

      const res = await request(app)
        .post('/api/v1/transactions')
        .set('Idempotency-Key', '67925adc-1f5d-41b2-98c4-3dc5840b5a69')
        .send({
          type: 'deposit',
          amount: { amount: 0, currency: 'usd' },
          destinationAccountId: bankAccount?.id,
        });

      expect(res.status).toBe(400);
      expect(res.body.errors[0].errCode).toBe('invalidRequest');
      expect(res.body.errors[0].field).toBe('transaction.amount.amount');
    });

    it('should return 400 if destination account not found', async () => {
      const res = await request(app)
        .post('/api/v1/transactions')
        .set('Idempotency-Key', '67925adc-1f5d-41b2-98c4-3dc5840b5a69')
        .send({
          type: 'deposit',
          amount: { amount: 100, currency: 'usd' },
          destinationAccountId: '00000000-0000-0000-0000-000000000000',
        });

      expect(res.status).toBe(400);
      expect(res.body.errors[0].errCode).toBe('destinationAccountNotFound');
    });

    it('should return 400 if source account not found', async () => {
      const res = await request(app)
        .post('/api/v1/transactions')
        .set('Idempotency-Key', '67925adc-1f5d-41b2-98c4-3dc5840b5a69')
        .send({
          type: 'withdraw',
          amount: { amount: 100, currency: 'usd' },
          sourceAccountId: '00000000-0000-0000-0000-000000000000',
        });

      expect(res.status).toBe(400);
      expect(res.body.errors[0].errCode).toBe('sourceAccountNotFound');
    });

    it('should return 400 if insufficient balance', async () => {
      const bankAccount = await bankAccountRepo.findOneBy({
        accountNumber: '5883926628',
      });

      const res = await request(app)
        .post('/api/v1/transactions')
        .set('Idempotency-Key', '67925adc-1f5d-41b2-98c4-3dc5840b5a69')
        .send({
          type: 'withdraw',
          amount: { amount: 999999, currency: 'usd' },
          sourceAccountId: bankAccount?.id,
        });

      expect(res.status).toBe(400);
      expect(res.body.errors[0].errCode).toBe('insufficientBalance');
    });

    it('should return existing transaction if idempotencyKey reused', async () => {
      const bankAccount = await bankAccountRepo.findOneBy({
        accountNumber: '5883926628',
      });

      const payload = {
        type: 'deposit',
        amount: { amount: 100, currency: 'usd' },
        destinationAccountId: bankAccount?.id,
      };

      const first = await request(app)
        .post('/api/v1/transactions')
        .set('Idempotency-Key', '67925adc-1f5d-41b2-98c4-3dc5840b5a69')
        .send(payload);
      const second = await request(app)
        .post('/api/v1/transactions')
        .set('Idempotency-Key', '67925adc-1f5d-41b2-98c4-3dc5840b5a69')
        .send(payload);

      expect(first.body.id).toBe(second.body.id);
    });
  });

  describe('PUT /api/transactions/:id', () => {
    it('should return 500 if an unexpected error occurs', async () => {
      jest
        .spyOn(TransactionService.prototype, 'updateTransaction')
        .mockRejectedValueOnce(new Error('Unexpected error'));

      const res = await request(app)
        .put('/api/v1/transactions/some-id')
        .send({ description: 'test' });

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty('errors');
    });

    it('should update transaction successfully', async () => {
      const bankAccount = await bankAccountRepo.findOneBy({
        accountNumber: '5883926628',
      });
      await request(app)
        .post('/api/v1/transactions')
        .set('Idempotency-Key', '67925adc-1f5d-41b2-98c4-3dc5840b5a69')
        .send({
          type: 'deposit',
          amount: {
            amount: 150,
            currency: 'usd',
          },
          destinationAccountId: bankAccount?.id,
          description: 'deposit to bank account',
        });
      const transaction = await transactionRepo.findOneBy({
        idempotencyKey: '67925adc-1f5d-41b2-98c4-3dc5840b5a69',
      });

      const res = await request(app)
        .put(`/api/v1/transactions/${transaction?.id}`)
        .send({ description: 'Updated Transaction' });

      expect(res.status).toBe(200);

      expect(res.body).toMatchObject(
        expect.objectContaining({
          description: 'Updated Transaction',
          amount: {
            amount: 150,
            currency: 'USD',
          },
          name: 'Deposit to bank_account_test_1',
          status: 'success',
          type: 'deposit',
          toAccount: {
            accountNumber: '5883926628',
            balance: 150,
            createdAt: expect.any(String),
            id: expect.any(String),
            name: 'bank_account_test_1',
            updatedAt: expect.any(String),
          },
          id: expect.any(String),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        }),
      );
    });

    it('should return 404 if transaction not found when updating', async () => {
      const res = await request(app)
        .put('/api/v1/transactions/00000000-0000-0000-0000-000000000000')
        .send({ description: 'test' });

      expect(res.status).toBe(404);
    });
  });
});
