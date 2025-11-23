import { defineConfig } from 'drizzle-kit';

import env from './env.ts';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './test_ migrationsa',
  dialect: 'postgresql',
  dbCredentials: {
    url: env.TEST_DATABASE_URL,
  },
  verbose: true,
  strict: true,
});
