import { describe, it, expect, vi, afterEach } from 'vitest';
import express from 'express';
import authRouter from '../routes/authRoute.ts';
import { users } from '../db/schema';
import { testDb } from '../tests/setup.ts';
import { generateTestUser, getUserByEmail } from '../tests/helper';
import request from 'supertest';
import { eq } from 'drizzle-orm';

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
      expect(response.body.data.email).toBe(testUser.email);
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

    it('should return 404 Not Found for non-existing user', async () => {
      const testUser = generateTestUser();
      await request(app).post('/api/user/signup').send(testUser).expect(201);
      const loginResponse = await request(app)
        .post('/api/user/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);
      const token = loginResponse.body.data.token;
      const userId = loginResponse.body.data.id;
      // Delete the user directly from the database to simulate non-existence
      await testDb.delete(users).where(eq(users.email, testUser.email));
      const response = await request(app)
        .get(`/api/user/profile?id=${userId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
      expect(response.body.data).toBeNull();
      expect(response.body.message).toBe('User not found');
    });
    it('should fetch user profile successfully', async () => {
      const testUser = generateTestUser();
      await request(app).post('/api/user/signup').send(testUser).expect(201);
      const loginResponse = await request(app)
        .post('/api/user/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);
      const token = loginResponse.body.data.token;
      const userId = loginResponse.body.data.id;

      const response = await request(app)
        .get(`/api/user/profile?id=${userId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.message).toBe('User profile fetched');
      expect(response.body.data.email).toBe(testUser.email);
      expect(response.body.data.username).toBe(testUser.username);
      expect(response.body.data.password).toBeUndefined();
    });
    it('should return 500 when something went wrong during fetching profile', async () => {
      const testUser = generateTestUser();
      await request(app).post('/api/user/signup').send(testUser).expect(201);
      const loginResponse = await request(app)
        .post('/api/user/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);
      const token = loginResponse.body.data.token;
      const userId = loginResponse.body.data.id;

      const dbSelectSpy = vi.spyOn(testDb, 'select').mockImplementation(() => {
        throw new Error('Database connection failed');
      });

      const response = await request(app)
        .get(`/api/user/profile?id=${userId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(500);

      expect(response.body.data).toBeNull();
      expect(response.body.message).toBe('Internal Server Error');
      expect(dbSelectSpy).toHaveBeenCalled();
      dbSelectSpy.mockRestore();
    });
  });

  describe('POST /api/user/refresh', () => {
    it('should return 400 Bad Request when no refresh token is provided', async () => {
      const response = await request(app)
        .post('/api/user/refresh')
        .send({})
        .expect(400);
      expect(response.body.data).toBeNull();
      expect(response.body.message).toBe('Refresh token is required');
    });
    it('should return 401 Invalid refresh token for invalid token', async () => {
      const response = await request(app)
        .post('/api/user/refresh')
        .send({ refreshToken: 'someInvalidToken' })
        .expect(401);
      expect(response.body.data).toBeNull();
      expect(response.body.message).toBe('Invalid token');
    });
    it('should refresh access token successfully with valid refresh token', async () => {
      const testUser = generateTestUser();
      await request(app).post('/api/user/signup').send(testUser).expect(201);
      const loginResponse = await request(app)
        .post('/api/user/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);
      const refreshToken = loginResponse.body.data.refreshToken;
      const response = await request(app)
        .post('/api/user/refresh')
        .send({ refreshToken })
        .expect(200);
      console.log('[log]response:', response);
      expect(response.body.message).toBe('Access token refreshed');
      expect(response.body.data.accessToken).toBeDefined();
    });
    it('should return 500 when something went wrong during token refresh', async () => {
      const dbSelectSpy = vi.spyOn(testDb, 'select').mockImplementation(() => {
        throw new Error('Database connection failed');
      });
      const response = await request(app)
        .post('/api/user/refresh')
        .send({ refreshToken: 'someInvalidToken' })
        .expect(500);
      expect(response.body.data).toBeNull();
      expect(response.body.message).toBe('Internal Server Error');
      expect(dbSelectSpy).toHaveBeenCalled();
      dbSelectSpy.mockRestore();
    });
  });

  describe('POST /api/user/password-reset', () => {
    it('should return 404 User not found for non-existing email', async () => {
      const testUser = generateTestUser();
      await request(app).post('/api/user/signup').send(testUser).expect(201);
      const loginResponse = await request(app)
        .post('/api/user/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);
      const token = loginResponse.body.data.token;
      await testDb.delete(users).where(eq(users.email, testUser.email));
      const response = await request(app)
        .post('/api/user/reset-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          email: testUser.email,
          newPassword: 'NewPass@1234',
        })
        .expect(404);
      expect(response.body.data).toBeNull();
      expect(response.body.message).toBe('User not found');
    });
    it('should reset password successfully for existing user', async () => {
      const testUser = generateTestUser();
      await request(app).post('/api/user/signup').send(testUser).expect(201);
      const loginResponse = await request(app)
        .post('/api/user/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);
      const token = loginResponse.body.data.token;
      const response = await request(app)
        .post('/api/user/reset-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          email: testUser.email,
          newPassword: 'NewPass@1234',
        })
        .expect(200);
      expect(response.body.message).toBe('Password reset successful');
      const loginWithNewPasswordResponse = await request(app)
        .post('/api/user/login')
        .send({
          email: testUser.email,
          password: 'NewPass@1234',
        })
        .expect(200);
      expect(loginWithNewPasswordResponse.body.message).toBe(
        'Login successful',
      );
    });
    it('should return 500 when something went wrong during password reset', async () => {
      const testUser = generateTestUser();
      await request(app).post('/api/user/signup').send(testUser).expect(201);

      const loginResponse = await request(app)
        .post('/api/user/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);
      const token = loginResponse.body.data.token;
      const dbSelectSpy = vi.spyOn(testDb, 'select').mockImplementation(() => {
        throw new Error('Database connection failed');
      });

      const response = await request(app)
        .post('/api/user/reset-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          email: 'test@gmail.com',
          newPassword: 'NewPass@1234',
        })
        .expect(500);
      expect(response.body.data).toBeNull();
      expect(response.body.message).toBe('Internal Server Error');
      expect(dbSelectSpy).toHaveBeenCalled();
      dbSelectSpy.mockRestore();
    });
  });
});
