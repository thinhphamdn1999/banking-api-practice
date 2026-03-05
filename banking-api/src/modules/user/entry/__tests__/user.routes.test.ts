import { Repository } from 'typeorm';
import request from 'supertest';
import type { Express } from 'express';

import { TestHelper } from '@/common/configs/test/database-instance';

import { BaseError } from '@/common/types/error';
import { ERROR_CODES } from '@/common/constants/error';
import { UserRole, UserStatus } from '@/modules/user/types/user';

import { User } from '@/modules/user/domain/entities/user.entity';
import { UserService } from '@/modules/user/domain/services/user.service';

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

  afterEach(() => {
    jest.restoreAllMocks();
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

    it('should return only active users when filtered by status', async () => {
      const users = await seedUser();
      await userRepo.update({ id: users[1].id }, { status: UserStatus.DE_ACTIVE });

      const res = await request(app).get(`/api/users?status=${UserStatus.ACTIVE}`);

      expect(res.status).toBe(200);
      expect(res.body.metadata.totalCount).toBe(1);
      expect(res.body.data[0].email).toBe('test@example.com');
    });

    it('should return only de-active users when filtered by status', async () => {
      const users = await seedUser();
      await userRepo.update({ id: users[1].id }, { status: UserStatus.DE_ACTIVE });

      const res = await request(app).get(`/api/users?status=${UserStatus.DE_ACTIVE}`);

      expect(res.status).toBe(200);
      expect(res.body.metadata.totalCount).toBe(1);
      expect(res.body.data[0].email).toBe('test1@example.com');
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

  describe('GET /api/users/me', () => {
    it('should return the current authenticated user', async () => {
      const users = await seedUser();

      const res = await request(app).get('/api/users/me');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(
        expect.objectContaining({
          id: users[0].id,
          email: 'test@example.com',
          role: UserRole.ADMIN,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        }),
      );
    });

    it('should return 404 if user not found', async () => {
      await seedUser();
      jest
        .spyOn(UserService.prototype, 'getUserById')
        .mockRejectedValueOnce(new BaseError({ message: ERROR_CODES.USER_NOT_FOUND }));

      const res = await request(app).get('/api/users/me');

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('errors');
    });

    it('should return 401 if the authenticated Clerk user has no matching DB record', async () => {
      // No seed — DB is empty, attachDatabaseUser middleware returns 401
      const res = await request(app).get('/api/users/me');

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('errors');
    });

    it('should return 500 if an unexpected error occurs', async () => {
      await seedUser();
      jest
        .spyOn(UserService.prototype, 'getUserById')
        .mockRejectedValueOnce(new Error('Unexpected error'));

      const res = await request(app).get('/api/users/me');

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty('errors');
    });
  });

  describe('GET /api/users/:id', () => {
    it('should return 500 if an unexpected error occurs', async () => {
      await seedUser();
      jest
        .spyOn(UserService.prototype, 'getUserById')
        .mockRejectedValueOnce(new Error('Unexpected error'));

      const res = await request(app).get('/api/users/some-id');

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty('errors');
    });

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

    it('should return 500 if an unexpected error occurs', async () => {
      const user = await seedUser();
      jest
        .spyOn(UserService.prototype, 'deActiveUser')
        .mockRejectedValueOnce(new Error('Unexpected error'));

      const res = await request(app).post(`/api/users/${user[1].id}/de-active`);

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty('errors');
    });
  });

  describe('POST /api/users/:id/activate', () => {
    it('should return 404 if user not found', async () => {
      await seedUser();
      const res = await request(app).post('/api/users/non-existing-id/activate');

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('errors');
    });

    it('should activate user successfully', async () => {
      const user = await seedUser();
      await userRepo.update({ id: user[1].id }, { status: UserStatus.DE_ACTIVE });

      const res = await request(app).post(`/api/users/${user[1].id}/activate`);

      expect(res.status).toBe(200);

      expect(res.body).toEqual(
        expect.objectContaining({
          id: user[1].id,
          status: UserStatus.ACTIVE,
        }),
      );

      const updatedUser = await userRepo.findOneBy({ id: user[1].id });
      expect(updatedUser?.status).toBe(UserStatus.ACTIVE);
    });

    it('should return 500 if an unexpected error occurs', async () => {
      const user = await seedUser();
      jest
        .spyOn(UserService.prototype, 'activateUser')
        .mockRejectedValueOnce(new Error('Unexpected error'));

      const res = await request(app).post(`/api/users/${user[1].id}/activate`);

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty('errors');
    });
  });
});
