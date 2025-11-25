import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/tests/setup.ts'],
    clearMocks: true,
    env: {
      NODE_ENV: 'test',
      APP_STAGE: 'testing',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: [
        'node_modules/**',
        'dist/**',
        'src/tests/**',
        '**/*.spec.ts',
        '**/*.test.ts',
        'vitest.config.ts',
        'src/server.ts',
        'src/index.ts',
        'src/consul/**', // Consul integration tested separately,
      ],
      thresholds: {
        lines: 50,
        functions: 80,
        branches: 50,
        statements: 50,
      },
    },
    testTimeout: 10000,
    hookTimeout: 10000,
  },
  resolve: { alias: { '@': '/src' } },
});
