import { Repository } from 'typeorm';
import request from 'supertest';
import type { Express } from 'express';

import { TestHelper } from '@/common/configs/test/dbInstance';

import { UserRole } from '@/components/user/types/user';

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
    const users = userRepo.create([
      {
        clerkUserId: 'test_user_id',
        email: 'test@example.com',
        role: UserRole.ADMIN,
      },
      {
        clerkUserId: 'test_user_id_2',
        email: 'test1@example.com',
        role: UserRole.USER,
      },
    ]);
    return userRepo.save(users);
  };

  describe('GET /api/users', () => {
    it('should return list of users', async () => {
      await seedUser();
      const res = await request(app).get('/api/users');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.data[0]).toEqual(
        expect.objectContaining({
          email: 'test@example.com',
          clerkUserId: 'test_user_id',
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
          totalCount: 2,
        }),
      );
    });

    it('should return list of users with pagination', async () => {
      await seedUser();
      const res = await request(app).get('/api/users?page=1&limit=10');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.data[0]).toEqual(
        expect.objectContaining({
          email: 'test@example.com',
          clerkUserId: 'test_user_id',
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
          totalCount: 2,
        }),
      );
    });
  });

  describe('GET /api/users/:id', () => {
    it('should return 404 if user not found', async () => {
      await seedUser();
      const res = await request(app).get('/api/users/non-existing-id');

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('errors');
    });

    it('should return user if found', async () => {
      const user = await seedUser();

      const res = await request(app).get(`/api/users/${user[1].id}`);

      expect(res.status).toBe(200);

      expect(res.body).toEqual(
        expect.objectContaining({
          id: user[1].id,
          email: 'test1@example.com',
          clerkUserId: 'test_user_id_2',
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        }),
      );
    });
  });

  describe('POST /api/users/:id/de-active', () => {
    it('should return 404 if user not found', async () => {
      await seedUser();
      const res = await request(app).post('/api/users/non-existing-id/de-active');

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('errors');
    });

    it('should deactivate user successfully', async () => {
      const user = await seedUser();

      const res = await request(app).post(`/api/users/${user[1].id}/de-active`);

      expect(res.status).toBe(200);

      expect(res.body).toEqual(
        expect.objectContaining({
          id: user[1].id,
          status: 'de-active',
        }),
      );

      const updatedUser = await userRepo.findOneBy({ id: user[1].id });
      expect(updatedUser?.status).toBe('de-active');
    });
  });
});
