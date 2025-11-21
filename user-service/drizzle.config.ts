import { defineConfig } from 'drizzle-kit';

import env, { isTest } from './env.ts';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: isTest ? env.TEST_DATABASE_URL : env.DATABASE_URL,
  },
  verbose: true,
  strict: true,
});
