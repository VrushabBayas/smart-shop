import { env as loadEnv } from 'custom-env';
import { z } from 'zod';
process.env.APP_STAGE = process.env.APP_STAGE || 'development';

const isProduction = process.env.APP_STAGE === 'production';
const isDevelopment = process.env.APP_STAGE === 'development';
const isTesting = process.env.APP_STAGE === 'testing';

if (isDevelopment) {
  loadEnv();
} else if (isTesting) {
  loadEnv('testing');
}

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'testing'])
    .default('development'),
  APP_STAGE: z
    .enum(['development', 'production', 'testing'])
    .default('development'),
  PORT: z.coerce.number().positive().default(3001),
  DATABASE_URL: z.string().startsWith('postgresql://'),
  JWT_SECRET: z
    .string()
    .min(10, 'JWT secret must be at least 32 characters long'),
  REFRESH_JWT_SECRET: z
    .string()
    .min(10, 'Refresh JWT secret must be at least 32 characters long'),
  BCRYPT_SALT_ROUNDS: z.coerce.number().min(10).max(20).default(12),
  JWT_EXPIRES_IN: z.string().default('15m'),
  REFRESH_JWT_EXPIRES_IN: z.string().default('7d'),
  SERVICE_NAME: z.string().default('user-service'),
  CONSUL_HOST: z.string().optional(),
  CONSUL_PORT: z.coerce.number().positive().default(8500),
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
