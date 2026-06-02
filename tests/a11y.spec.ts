import { test, expect } from '@playwright/test';
import { NAV_ITEMS } from '../src/lib/nav';

// Structural accessibility: landmarks, heading rank, and accessible names.
// These are engine-invariant (same DOM everywhere), so they run once on the
// content project — the engine-varying keyboard/focus a11y lives in the
// nav / theme-picker specs (a11y projects) and responsive.spec (mobile).
const routes = NAV_ITEMS.map((n) => n.href);

test.describe('Accessibility — landmarks & headings', () => {
  for (const path of routes) {
    test(`${path} exposes one h1, a main landmark, and the primary nav`, async ({ page }) => {
      await page.goto(path);
      await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
      await expect(page.getByRole('main')).toHaveCount(1);
      await expect(page.getByRole('navigation', { name: 'Primary' })).toBeVisible();
    });
  }
});

test.describe('Accessibility — job-hunt board controls', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/job-hunt');
  });

  test('every filter control has an accessible name', async ({ page }) => {
    await expect(page.getByRole('searchbox', { name: 'Search this board' })).toBeVisible();
    await expect(page.getByRole('combobox', { name: 'Filter by company' })).toBeVisible();
    await expect(page.getByRole('combobox', { name: 'Filter by priority' })).toBeVisible();
    await expect(page.getByRole('combobox', { name: 'Filter by source' })).toBeVisible();
  });

  test('the board and its columns are labelled regions', async ({ page }) => {
    await expect(page.getByRole('region', { name: 'Job application board' })).toBeVisible();
    // Each status column is a region named "<status> — <n> issues".
    await expect(page.getByRole('region', { name: /Applied — \d+ issue/ })).toBeVisible();
  });
});

test.describe('Accessibility — projects filter', () => {
  // The select replaces the chip row below sm, so check it at a mobile width
  // where it is actually in the accessibility tree.
  test.use({ viewport: { width: 375, height: 812 } });

  test('the mobile filter select carries an accessible name', async ({ page }) => {
    await page.goto('/projects');
    await expect(page.getByRole('combobox', { name: 'Filter projects' })).toBeVisible();
  });
});
