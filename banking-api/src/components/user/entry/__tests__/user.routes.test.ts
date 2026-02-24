import { Repository } from 'typeorm';
import request from 'supertest';
import type { Express } from 'express';

import { TestHelper } from '@/common/configs/test/dbInstance';

import { User } from '@/components/user/domain/entities/user.entity';

describe('User Routes', () => {
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
  });

  const seedUser = async () => {
    const users = userRepo.create({
      clerkUserId: 'clerk_test_user_1',
      email: 'test@example.com',
    });
    return userRepo.save(users);
  };

  describe('GET /api/users', () => {
    it('should return [] when no user', async () => {
      const res = await request(app).get('/api/users');

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

    it('should return list of users', async () => {
      await seedUser();
      const res = await request(app).get('/api/users');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0]).toEqual(
        expect.objectContaining({
          email: 'test@example.com',
          clerkUserId: 'clerk_test_user_1',
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

    it('should return list of users with pagination', async () => {
      await seedUser();
      const res = await request(app).get('/api/users?page=1&limit=10');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0]).toEqual(
        expect.objectContaining({
          email: 'test@example.com',
          clerkUserId: 'clerk_test_user_1',
          id: expect.any(String),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        }),
      );
      expect(res.body.metadata).toEqual(
        expect.objectContaining({
          currentPage: 1,
          limit: 10,
          offset: 0,
          pageCount: 1,
          totalCount: 1,
        }),
      );
    });
  });

  describe('GET /api/users/:id', () => {
    it('should return 404 if user not found', async () => {
      const res = await request(app).get('/api/users/non-existing-id');

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('errors');
    });

    it('should return user if found', async () => {
      const user = await seedUser();

      const res = await request(app).get(`/api/users/${user.id}`);

      expect(res.status).toBe(200);

      expect(res.body).toEqual(
        expect.objectContaining({
          id: user.id,
          email: 'test@example.com',
          clerkUserId: 'clerk_test_user_1',
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        }),
      );
    });
  });

  describe('POST /api/users/:id/de-active', () => {
    it('should return 404 if user not found', async () => {
      const res = await request(app).post('/api/users/non-existing-id/de-active');

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('errors');
    });

    it('should deactivate user successfully', async () => {
      const user = await seedUser();

      const res = await request(app).post(`/api/users/${user.id}/de-active`);

      expect(res.status).toBe(200);

      expect(res.body).toEqual(
        expect.objectContaining({
          id: user.id,
          status: 'de-active',
        }),
      );

      const updatedUser = await userRepo.findOneBy({ id: user.id });
      expect(updatedUser?.status).toBe('de-active');
    });
  });
});
