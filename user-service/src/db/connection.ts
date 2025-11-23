import env, { isProd, isTest } from '../../env';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { remember } from '@epic-web/remember';

const createPool = () => {
  // Use TEST_DATABASE_URL when running tests, otherwise use DATABASE_URL
  const connectionString = isTest ? env.TEST_DATABASE_URL : env.DATABASE_URL;

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
