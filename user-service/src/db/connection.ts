import env, { isProd } from '../../env';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { remember } from '@epic-web/remember';
const createPool = () => {
  return new Pool({
    connectionString: env.DATABASE_URL,
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
