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
    await expect(page.getByText(String(TEST_STATS.unit), { exact: true }).first()).toBeVisible();
    await expect(page.getByText(String(TEST_STATS.e2e), { exact: true }).first()).toBeVisible();
  });

  test('routing matrix has a row per playwright project', async ({ page }) => {
    for (const r of routing) {
      await expect(page.getByText(r.project, { exact: true }).first()).toBeVisible();
    }
  });

  test('both CI gate workflows render', async ({ page }) => {
    for (const wf of workflows) {
      await expect(page.getByText(wf.file, { exact: true }).first()).toBeVisible();
    }
  });
});
