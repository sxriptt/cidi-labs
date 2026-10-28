import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { defineConfig, devices, type ReporterDescription } from '@playwright/test';
import { requiredEnv } from './support/env';

const envFile = join(__dirname, '.env');
if (existsSync(envFile)) process.loadEnvFile(envFile);


const baseURL = requiredEnv('BASE_URL');

// Local: readable terminal output plus an HTML report (`npm run report`).
// CI: adds PR annotations for failures and JUnit XML for the CI's test results tab.
const reporter: ReporterDescription[] = [
  ['list'],
  ['html', { open: 'never' }],
  ...(process.env.CI
    ? ([['github'], ['junit', { outputFile: 'test-results/junit.xml' }]] satisfies ReporterDescription[])
    : []),
];

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  // One retry covers the rare case where the 10-minute reset lands mid-test.
  // Each test builds its own data, so a retry starts clean.
  retries: 1,
  reporter,
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'api', testDir: './tests/api' },
    { name: 'ui', testDir: './tests/ui', use: { ...devices['Desktop Chrome'] } },
  ],
});
