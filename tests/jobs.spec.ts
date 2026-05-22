import { test, expect } from '@playwright/test';
import { getJobs } from '../src/lib/data';
import { JOBS_HEADING } from '../src/lib/copy';

// Throws at module load if YAML is missing or fails schema validation
const jobs = getJobs();

test.describe('Jobs page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/jobs');
  });

  test('shows heading and total stat', async ({ page }) => {
    expect(jobs.length, 'jobs.yml must have at least one entry').toBeGreaterThan(0);

    await expect(page.getByRole('heading', { name: JOBS_HEADING })).toBeVisible();
    await expect(page.getByText('Total')).toBeVisible();
  });

  test('filter buttons exist for each status present in data', async ({ page }) => {
    const statuses = [...new Set(jobs.map((j) => j.status))];
    expect(statuses.length, 'jobs.yml must have at least one status').toBeGreaterThan(0);

    await expect(page.getByRole('button', { name: /^All/ })).toBeVisible();
    for (const status of statuses) {
      await expect(page.getByRole('button', { name: new RegExp(`^${status}`) })).toBeVisible();
    }
  });

  test('clicking a status filter hides non-matching cards', async ({ page }) => {
    const rejectedJob = jobs.find((j) => j.status === 'Rejected');
    const appliedJob = jobs.find((j) => j.status === 'Applied');
    expect(rejectedJob, 'jobs.yml needs at least one Rejected entry for filter test').toBeDefined();
    expect(appliedJob, 'jobs.yml needs at least one Applied entry for filter test').toBeDefined();

    await page.getByRole('button', { name: /^Rejected/ }).click();

    await expect(page.getByLabel(`${rejectedJob!.company} — ${rejectedJob!.role}`)).toBeVisible();
    await expect(page.locator('[data-status="Applied"]').first()).toBeHidden();
  });

  test('clicking All restores all cards', async ({ page }) => {
    const appliedJob = jobs.find((j) => j.status === 'Applied');
    expect(appliedJob, 'jobs.yml needs at least one Applied entry').toBeDefined();

    await page.getByRole('button', { name: /^Rejected/ }).click();
    await page.getByRole('button', { name: /^All/ }).click();

    await expect(page.getByLabel(`${appliedJob!.company} — ${appliedJob!.role}`)).toBeVisible();
  });

  test.describe('job cards', () => {
    test('jobs.yml has at least one entry', () => {
      expect(jobs.length, 'jobs.yml must have at least one entry').toBeGreaterThan(0);
    });

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
