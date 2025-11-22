import { describe, beforeEach, it, expect } from 'vitest';
import express from 'express';
import authRouter from '../routes/authRoute.ts';
import { users } from '../db/schema';
import { testDb } from '../tests/setup.ts';
import { generateTestUser, getUserByEmail } from '../tests/helper';
import request from 'supertest';

const app = express();
app.use(express.json());
app.use('/api/user', authRouter);

describe('Auth Controller', () => {
  beforeEach(async () => {
    // clear database or reset state if necessary
    await testDb.delete(users);
  });

  describe('POST /api/user/signup', () => {
    it('should register a new user', async () => {
      const userData = generateTestUser();

      const response = await request(app)
        .post('/api/user/signup')
        .send(userData)
        .expect(201);

      expect(response.body.data.message).toBe('Sign-Up Successful');

      const userInDb = await getUserByEmail(userData.email);
      expect(userInDb).toBeDefined();
      expect(userInDb?.email).toBe(userData.email);
    });
    it('should return validation errors for invalid data', async () => {
      const response = await request(app)
        .post('/api/user/signup')
        .send({
          email: 'invalid-email',
          username: 'ab',
          password: '123',
        })
        .expect(400);

      expect(response.body.data).toBeNull();
      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'email',
            message: 'Invalid email format',
          }),
          expect.objectContaining({
            field: 'username',
            message: 'Username must be at least 3 characters',
          }),
          expect.objectContaining({
            field: 'password',
            message: 'Password must be at least 8 characters',
          }),
        ])
      );
    });

    it('should return validation error for missing required fields', async () => {
      const response = await request(app)
        .post('/api/user/signup')
        .send({
          username: 'testuser',
        })
        .expect(400);

      expect(response.body.data).toBeNull();
      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toBeDefined();
    });
  });
});
