import { Repository } from 'typeorm';
import request from 'supertest';
import { verifyWebhook } from '@clerk/express/webhooks';
import type { Express } from 'express';

import { TestHelper } from '@/common/configs/test/dbInstance';

import { User } from '@/components/user/domain/entities/user.entity';

const mockVerifyWebhook = verifyWebhook as jest.Mock;

describe('Clerk Webhook Route', () => {
  let app: Express;
  let userRepo: Repository<User>;

  beforeAll(async () => {
    await TestHelper.instance.setupTestDB();

    const mod = await import('@/app');
    app = mod.default;

    userRepo = TestHelper.instance.getRepo(User);
  });

  afterAll(async () => {
    await TestHelper.instance.teardownTestDB();
  });

  beforeEach(async () => {
    await userRepo.clear();
    jest.clearAllMocks();
  });

  describe('POST /api/webhooks/clerk', () => {
    it('should create user on user.created event', async () => {
      mockVerifyWebhook.mockResolvedValue({
        type: 'user.created',
        data: { id: 'clerk_test_1' },
      });

      const res = await request(app).post('/api/webhooks/clerk').send({}); // body irrelevant because mocked

      expect(res.status).toBe(201);

      const user = await userRepo.findOneBy({
        clerkUserId: 'clerk_test_1',
      });

      expect(user).toBeTruthy();
      expect(user?.clerkUserId).toBe('clerk_test_1');
    });

    it('should soft delete user on user.deleted', async () => {
      // seed user first
      await userRepo.save({
        clerkUserId: 'clerk_test_2',
        email: 'test@test.com',
      });

      mockVerifyWebhook.mockResolvedValue({
        type: 'user.deleted',
        data: { id: 'clerk_test_2' },
      });

      const res = await request(app).post('/api/webhooks/clerk').send({});

      expect(res.status).toBe(200);

      const user = await userRepo.findOneBy({
        clerkUserId: 'clerk_test_2',
      });

      expect(user?.status).toBe('deleted');
      expect(user?.deletedAt).toBeTruthy();
    });

    it('should update user on user.updated event', async () => {
      await userRepo.save({
        clerkUserId: 'clerk_test_update',
        email: 'old@test.com',
      });

      mockVerifyWebhook.mockResolvedValue({
        type: 'user.updated',
        data: { id: 'clerk_test_update' },
      });

      const res = await request(app).post('/api/webhooks/clerk').send({});

      expect(res.status).toBe(200);

      const user = await userRepo.findOneBy({
        clerkUserId: 'clerk_test_update',
      });

      expect(user).toBeTruthy();
    });

    it('should return 400 for unknown event', async () => {
      mockVerifyWebhook.mockResolvedValue({
        type: 'unknown.event',
        data: { id: 'clerk_x' },
      });

      const res = await request(app).post('/api/webhooks/clerk').send({});

      expect(res.status).toBe(400);
    });

    it('should return 400 if id missing', async () => {
      mockVerifyWebhook.mockResolvedValue({
        type: 'user.created',
        data: {},
      });

      const res = await request(app).post('/api/webhooks/clerk').send({});

      expect(res.status).toBe(400);
    });

    it('should return 500 if verification throws', async () => {
      mockVerifyWebhook.mockRejectedValue(new Error('Invalid signature'));

      const res = await request(app).post('/api/webhooks/clerk').send({});

      expect(res.status).toBe(500);
    });
  });
});
