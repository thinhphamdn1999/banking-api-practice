import request from 'supertest';
import type { Express } from 'express';
import { Repository } from 'typeorm';

import { TestHelper } from '@/common/configs/test/database-instance';
import environmentConfig from '@/common/configs/environment';

import { UserRole } from '@/modules/user/types/user';

import { User } from '@/modules/user/domain/entities/user.entity';

jest.mock('@/common/constants/rate-limit', () => ({
  RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000,
  RATE_LIMIT_MAX_REQUESTS: 2,
}));

describe('App', () => {
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

  describe('CORS', () => {
    it('should include Access-Control-Allow-Origin for allowed origin', async () => {
      const res = await request(app)
        .options('/api/users')
        .set('Origin', environmentConfig.corsOrigin[0])
        .set('Access-Control-Request-Method', 'GET');

      expect(res.headers['access-control-allow-origin']).toBe(environmentConfig.corsOrigin[0]);
    });

    it('should not reflect disallowed origin in Access-Control-Allow-Origin', async () => {
      const res = await request(app)
        .options('/api/users')
        .set('Origin', 'http://testing.com')
        .set('Access-Control-Request-Method', 'GET');

      // cors with a static origin string always returns the configured origin,
      // not the request's origin — browsers block mismatched origins.
      expect(res.headers['access-control-allow-origin']).not.toBe('http://testing.com');
    });
  });

  describe('Rate Limiting', () => {
    beforeAll(async () => {
      await userRepo.save(
        userRepo.create({
          clerkUserId: 'test_user_id',
          email: 'test@example.com',
          role: UserRole.USER,
        }),
      );
    });

    afterAll(async () => {
      await userRepo.clear();
    });

    it('should return 429 after exceeding the rate limit', async () => {
      await request(app).get('/api/users');
      await request(app).get('/api/users');

      const res = await request(app).get('/api/users');

      expect(res.status).toBe(429);
    });
  });
});
