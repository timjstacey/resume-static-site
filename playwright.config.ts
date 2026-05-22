import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:4321';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  maxFailures: process.env.CI ? 10 : 0,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'test-results', open: process.env.CI ? 'never' : 'on-failure' }],
    ['json'],
    ['junit'],
  ],
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 13'] },
    },
    {
      name: 'tablet-safari',
      use: { ...devices['iPad Pro 11'] },
    },
  ],
  ...(process.env.CI
    ? {}
    : {
        webServer: {
          command: 'pnpm dev',
          url: baseURL,
          reuseExistingServer: true,
        },
      }),
});
