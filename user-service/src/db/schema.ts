import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  firstName: varchar('first_name', { length: 50 }),
  lastName: varchar('last_name', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  refreshToken: varchar('refresh_token', { length: 255 }),
});

// Zod schemas for validation with custom error messages
export const insertUserSchema = createInsertSchema(users, {
  email: z.string().email('Invalid email format').min(1, 'Email is required'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must not exceed 50 characters'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(15, 'Password must not exceed 15 characters'),
  firstName: z
    .string()
    .min(1, 'First name must not be empty')
    .max(50, 'First name must not exceed 50 characters')
    .optional(),
  lastName: z
    .string()
    .min(1, 'Last name must not be empty')
    .max(50, 'Last name must not exceed 50 characters')
    .optional(),
});

export const selectUserSchema = createSelectSchema(users);

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
