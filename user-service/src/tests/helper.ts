import { faker } from '@faker-js/faker';
import { NewUser, users } from '../db/schema';
import { testDb } from './setup';
import { hashPassword } from '../utils/password';
import { eq } from 'drizzle-orm';
import request from 'supertest';
import { Express } from 'express';

export const generateTestUser = (): NewUser => ({
  email: faker.internet.email().toLowerCase(),
  username: faker.internet.username().toLowerCase(),
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  password: 'Test@123',
});

export const createAuthHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
});

// Helper to create a user and login in one step
export const createUserAndLogin = async (app: Express) => {
  const testUser = generateTestUser();

  await request(app).post('/api/user/signup').send(testUser).expect(201);

  const loginResponse = await request(app)
    .post('/api/user/login')
    .send({
      email: testUser.email,
      password: testUser.password,
    })
    .expect(200);

  return {
    user: testUser,
    token: loginResponse.body.data.token,
    refreshToken: loginResponse.body.data.refreshToken,
    userId: loginResponse.body.data.id,
  };
};

// Helper to insert a user directly into the database for testing purposes

export const insertTestUser = async (userData: NewUser) => {
  const hashedPassword = await hashPassword(userData.password);

  const [user] = await testDb
    .insert(users)
    .values({
      ...userData,
      password: hashedPassword,
    })
    .returning({
      id: users.id,
      username: users.username,
      email: users.email,
    });
  return user;
};

// Get user by email
export const getUserByEmail = async (email: string) => {
  const [user] = await testDb
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  return user;
};

// Get user by id
export const getUserById = async (id: string) => {
  const [user] = await testDb
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  return user;
};
