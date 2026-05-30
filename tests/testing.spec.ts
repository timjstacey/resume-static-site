import { test, expect } from '@playwright/test';
import { getTesting, getCiSnapshot } from '../src/lib/data';
import { TEST_STATS } from '../src/lib/testStats';

const { routing, workflows } = getTesting();
const ci = getCiSnapshot();

test.describe('Testing dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/testing');
  });

  test('renders the report heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /its own test report/ })).toBeVisible();
  });

  test('CI strip shows live snapshot values', async ({ page }) => {
    await expect(page.getByText(`#${ci.sha}`)).toBeVisible();
    await expect(page.getByText(ci.commitMessage)).toBeVisible();
    await expect(page.getByText(ci.passing ? 'passing' : 'failing', { exact: true })).toBeVisible();
  });

  test('stat strip shows unit + e2e counts', async ({ page }) => {
    await expect(page.locator('[data-stat-label="unit specs"] [data-stat-value]')).toHaveText(String(TEST_STATS.unit));
    await expect(page.locator('[data-stat-label="E2E flows"] [data-stat-value]')).toHaveText(String(TEST_STATS.e2e));
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
