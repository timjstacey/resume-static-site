import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:4321';

// Specs are routed to projects by file:
// - content: data-driven rendering. Same DOM across browsers, so one project is enough.
// - a11y: keyboard / focus behaviour that varies between engines.
// - responsive: viewport-dependent layout checks; runs only on mobile + tablet devices.
const contentSpecs = /(home|jobs|projects|resume|blog|feeds|testing|a11y|og)\.spec\.ts/;
const a11ySpecs = /(nav|theme-picker)\.spec\.ts/;
const responsiveSpecs = /responsive\.spec\.ts/;

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
      name: 'content',
      testMatch: contentSpecs,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'a11y-chromium',
      testMatch: a11ySpecs,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'a11y-firefox',
      testMatch: a11ySpecs,
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'a11y-webkit',
      testMatch: a11ySpecs,
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'responsive-mobile-chrome',
      testMatch: responsiveSpecs,
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'responsive-mobile-safari',
      testMatch: responsiveSpecs,
      use: { ...devices['iPhone 13'] },
    },
    {
      name: 'responsive-tablet-safari',
      testMatch: responsiveSpecs,
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
