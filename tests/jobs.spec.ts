import { test, expect } from '@playwright/test';
import { getJobs } from '../src/lib/data';
import { JOBS_HEADING } from '../src/lib/copy';

// Throws at module load if YAML is missing or fails schema validation
const jobs = getJobs();

test.describe('Jobs page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/job-hunt');
  });

  test('shows heading and total stat', async ({ page }) => {
    await expect(page.getByRole('heading', { name: JOBS_HEADING })).toBeVisible();
    await expect(page.getByText('Total')).toBeVisible();
  });

  test('filter buttons exist for each status present in data', async ({ page }) => {
    const statuses = [...new Set(jobs.map((j) => j.status))];
    await expect(page.getByRole('button', { name: /^All/ })).toBeVisible();
    for (const status of statuses) {
      await expect(page.getByRole('button', { name: new RegExp(`^${status}`) })).toBeVisible();
    }
  });

  // Applied + Rejected presence is enforced by src/lib/data.test.ts as a fixture
  // invariant, so the `find` calls below are guaranteed to return entries.
  test('clicking a status filter hides non-matching cards', async ({ page }) => {
    const rejectedJob = jobs.find((j) => j.status === 'Rejected')!;

    await page.getByRole('button', { name: /^Rejected/ }).click();

    await expect(page.getByLabel(`${rejectedJob.company} — ${rejectedJob.role}`)).toBeVisible();
    await expect(page.locator('[data-status="Applied"]').first()).toBeHidden();
  });

  test('clicking All restores all cards', async ({ page }) => {
    const appliedJob = jobs.find((j) => j.status === 'Applied')!;

    await page.getByRole('button', { name: /^Rejected/ }).click();
    await page.getByRole('button', { name: /^All/ }).click();

    await expect(page.getByLabel(`${appliedJob.company} — ${appliedJob.role}`)).toBeVisible();
  });

  test.describe('job cards', () => {
    for (const job of jobs) {
      test(`${job.company} — ${job.role}`, async ({ page }) => {
        const card = page.getByLabel(`${job.company} — ${job.role}`);
        await expect(card).toBeVisible();
        await expect(card.getByRole('heading', { name: job.company })).toBeVisible();
        await expect(card.getByText(job.role, { exact: true })).toBeVisible();
      });
    }
  });
});
