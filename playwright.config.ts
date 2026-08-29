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
  // The HTML report must not be written into `outputDir` (default: test-results/).
  // The reporter clears its outputFolder before writing, so aiming it at
  // test-results/ deletes the run's own screenshots, traces and error-context.md
  // before CI can upload them (#220). Keep the two directories separate.
  // `github` on CI annotates the failing line inline on the PR; `list` locally.
  reporter: [
    process.env.CI ? ['github'] : ['list'],
    ['html', { outputFolder: 'playwright-report', open: process.env.CI ? 'never' : 'on-failure' }],
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
