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

  describe('GET /api/user', () => {
    it('should return [] when no user', async () => {
      const res = await request(app).get('/api/users');

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it('should return list of users', async () => {
      await seedUser();
      const res = await request(app).get('/api/users');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);

      expect(res.body[0]).toHaveProperty('id');
      expect(res.body[0]).toHaveProperty('email');
      expect(res.body[0]).toHaveProperty('clerkUserId');
    });
  });
});
