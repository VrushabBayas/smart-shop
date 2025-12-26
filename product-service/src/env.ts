import { env as loadEnv } from 'custom-env';

import { z } from 'zod';

process.env.APP_STAGE = process.env.APP_STAGE || 'development';

const isProduction = process.env.APP_STAGE === 'production';
const isDevelopment = process.env.APP_STAGE === 'development';
const isTesting = process.env.NODE_ENV === 'test';

if (isDevelopment) {
  loadEnv();
} else if (isTesting) {
  loadEnv('test');
}

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  APP_STAGE: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().positive().default(3002),
  DATABASE_URL: z.string().startsWith('postgresql://'),
  TEST_DATABASE_URL: z.string().startsWith('postgresql://'),
  JWT_SECRET: z
    .string()
    .min(10, 'JWT secret must be at least 32 characters long'),
  REFRESH_JWT_SECRET: z
    .string()
    .min(10, 'Refresh JWT secret must be at least 32 characters long'),
  BCRYPT_SALT_ROUNDS: z.coerce.number().min(10).max(20).default(12),
  JWT_EXPIRES_IN: z.string().default('15m'),
  SERVICE_NAME: z.string().default('product-service'),
  CONSUL_HOST: z.string().optional(),
  CONSUL_PORT: z.coerce.number().positive().default(8500),
  DATABASE_URL_DEV: z.string().startsWith('postgresql://').optional(),
});

export type Env = z.infer<typeof envSchema>;
let env: Env;

try {
  env = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('❌ Invalid environment variables:', error);
    console.log(JSON.stringify(error.flatten().fieldErrors, null, 2));
    error.issues.forEach((issue) => {
      console.error(` - ${issue.path.join('.')} : ${issue.message}`);
    });
  }
  process.exit(1);
}
export const isProd = isProduction;
export const isDev = isDevelopment;
export const isTest = isTesting;
export { env };
export default env;
