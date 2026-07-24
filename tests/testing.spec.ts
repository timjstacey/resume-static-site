import { test, expect } from '@playwright/test';
import { getTesting } from '../src/lib/data';
import { TEST_STATS } from '../src/lib/testStats';

const { routing, workflows } = getTesting();

test.describe('Testing dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/testing');
  });

  test('renders the report heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /its own test report/ })).toBeVisible();
  });

  test('CI strip renders a well-shaped CI signal', async ({ page }) => {
    // Values hydrate from /api/ci-snapshot on the preview deploy (fresh) or fall
    // back to the committed baseline locally — so assert shape, not pinned
    // values. Locators target the data-ci-* contract hooks the hydration script
    // drives (mono strip text has no meaningful role); toHaveText auto-retries,
    // so a mid-assert hydration swap is fine — both states match the shape.
    // Scope to <main>: the footer (contentinfo) shares data-ci-branch.
    const strip = page.getByRole('main');
    await expect(strip.locator('[data-ci-branch]')).toHaveText('main');
    await expect(strip.locator('[data-ci-sha]')).toHaveText(/^#[0-9a-f]{7}$/);
    await expect(strip.locator('[data-ci-message]')).toHaveText(/\S/);
    // regex (not string) → no whitespace normalization; the badge is rendered
    // with surrounding template whitespace, so tolerate it.
    await expect(strip.locator('[data-ci-passing]')).toHaveText(/^\s*(passing|failing)\s*$/);
  });

  test('stat strip shows unit + e2e counts', async ({ page }) => {
    await expect(page.locator('[data-stat-label="unit specs"] [data-stat-value]')).toHaveText(String(TEST_STATS.unit));
    await expect(page.locator('[data-stat-label="E2E flows"] [data-stat-value]')).toHaveText(String(TEST_STATS.e2e));
  });

  test('routing dedup figures come from the stats, not hardcoded', async ({ page }) => {
    const pct = Math.round((1 - TEST_STATS.e2e / TEST_STATS.e2eNaive) * 100);
    await expect(page.getByText(String(TEST_STATS.e2eNaive), { exact: true })).toBeVisible();
    await expect(page.getByText(`runs · -${pct}%`)).toBeVisible();
  });

  test('routing matrix has a row per playwright project', async ({ page }) => {
    const matrix = page.getByTestId('routing-matrix');
    for (const r of routing) {
      await expect(matrix.getByText(r.project, { exact: true })).toBeVisible();
    }
  });

  test('both CI gate workflows render', async ({ page }) => {
    for (const wf of workflows) {
      await expect(page.getByText(wf.file, { exact: true })).toBeVisible();
    }
  });
});
