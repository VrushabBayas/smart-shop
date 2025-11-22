import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
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
  afterEach(() => {
    vi.restoreAllMocks();
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
        ]),
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

    it('should return 500 when database insertion fails', async () => {
      const dbInsertSpy = vi.spyOn(testDb, 'insert').mockImplementation(() => {
        throw new Error('Database connection failed');
      });
      const testUser = generateTestUser();
      // Act
      const response = await request(app)
        .post('/api/user/signup')
        .send(testUser)
        .expect(500);
      expect(response.body.data).toBeNull();
      expect(dbInsertSpy).toHaveBeenCalled();
      dbInsertSpy.mockRestore();
    });
  });

  describe('POST /api/user/login', () => {
    it('should return 401 Invalid credentials when user not found in database', async () => {
      const response = await request(app)
        .post('/api/user/login')
        .send({
          email: 'dTestuser@gmail.com',
          password: 'Test@1234',
        })
        .expect(401);
      expect(response.body.data).toBeNull();
      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should return 401 Invalid credentails for incorrect password', async () => {
      const testUser = generateTestUser();
      await request(app).post('/api/user/signup').send(testUser).expect(201);
      const response = await request(app)
        .post('/api/user/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword123',
        })
        .expect(401);
      expect(response.body.data).toBeNull();
      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should login successfully with correct credentials', async () => {
      const testUser = generateTestUser();
      await request(app).post('/api/user/signup').send(testUser).expect(201);

      const response = await request(app)
        .post('/api/user/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      expect(response.body.message).toBe('Login successful');
      expect(response.body.data.username).toBe(testUser.username);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
      expect(response.body.data.id).toBeDefined();
    });

    it('should return 500 when something went wrong during login', async () => {
      const dbSelectSpy = vi.spyOn(testDb, 'select').mockImplementation(() => {
        throw new Error('Database connection failed');
      });
      const response = await request(app)
        .post('/api/user/login')
        .send({
          email: 'test@gmail.com',
          password: 'Test@1234',
        })
        .expect(500);
      expect(response.body.data).toBeNull();
      expect(response.body.message).toBe('Internal Server Error');
      expect(dbSelectSpy).toHaveBeenCalled();
      dbSelectSpy.mockRestore();
    });
  });

  describe('GET /api/user/profile', () => {
    it('should return 401 Unauthorized when no token is provided', async () => {
      const response = await request(app).get('/api/user/profile').expect(401);
      expect(response.body.data).toBeNull();
      expect(response.body.message).toBe('Unauthorized');
    });
  });
});
