import { defineConfig } from 'drizzle-kit';
import env from './src/env.ts';
export default defineConfig({
  schema: './src/db/schema.ts',
  out: './dev_migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: env.DATABASE_URL_DEV!,
  },
  verbose: true,
  strict: true,
});
