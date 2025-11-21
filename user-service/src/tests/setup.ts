import { beforeAll, beforeEach, afterAll } from 'vitest';
import { sql } from 'drizzle-orm';
import * as schema from '../db/schema';
import db from '../db/connection';

// Re-export the main db connection for tests
export const testDb = db;

// Setup test database before all tests
beforeAll(async () => {
  try {
    // Verify database connection and schema exists
    await testDb.execute(sql`SELECT 1`);

    // Check if users table exists
    const result = await testDb.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'users'
      );
    `);

    if (!result.rows[0]?.exists) {
      throw new Error('Users table does not exist. Run: npm run db:push:test');
    }

    console.log('✅ Test database ready');
  } catch (error) {
    console.error('❌ Test database setup failed:', error);
    throw error;
  }
});

// Clean up all tables before each test
beforeEach(async () => {
  try {
    // Method 1: Delete each table individually (current)
    await testDb.delete(schema.users);
    // Add more tables here as you create them:
    // await testDb.delete(schema.posts);
    // await testDb.delete(schema.comments);

    // Method 2: Faster for many tables - TRUNCATE all at once
    // await testDb.execute(sql`
    //   TRUNCATE TABLE users, posts, comments
    //   RESTART IDENTITY CASCADE;
    // `);
  } catch (error) {
    console.error('❌ Failed to clean test data:', error);
    throw error;
  }
});

// Optional: Clean up after all tests
afterAll(async () => {
  // Connection pool cleanup is handled by @epic-web/remember
  console.log('✅ Test suite completed');
});
