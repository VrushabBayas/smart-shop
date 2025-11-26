import env, { isProd, isTest } from '../env';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { remember } from '@epic-web/remember';

const createPool = () => {
  const connectionString = isTest
    ? env.TEST_DATABASE_URL
    : isProd
      ? env.DATABASE_URL
      : env.DATABASE_URL_DEV || env.DATABASE_URL_DEV;

  return new Pool({
    connectionString,
  });
};

let client;

if (isProd) {
  client = createPool();
} else {
  client = remember('dbPool', () => createPool());
}

export const db = drizzle(client);
export default db;
