import { test, expect } from '@playwright/test';
import { getResume, getProjects, getJobs } from '../src/lib/data';
import { activePipeline, yearsOfExp } from '../src/lib/stats';
import { TEST_STATS } from '../src/lib/testStats';
import { FEATURES } from '../src/lib/features';

// Throws at module load if YAML is missing or fails schema validation.
const resume = getResume();
const projects = getProjects();
const jobs = getJobs();

test.describe('Home page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('hero heading + availability card render', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Lead QE/ })).toBeVisible();
    await expect(page.getByText('availability.json')).toBeVisible();
    await expect(page.getByText('13 Jun', { exact: true })).toBeVisible();
  });

  test('stats strip shows derived counts from data', async ({ page }) => {
    const stats: [string, string][] = [
      ['Years experience', String(yearsOfExp(resume.experience))],
      ['Projects', String(projects.length)],
      ['Roles applied for', String(jobs.length)],
      ['Active pipeline', String(activePipeline(jobs))],
    ];
    for (const [label, value] of stats) {
      await expect(page.locator(`[data-stat-label="${label}"] [data-stat-value]`)).toHaveText(value);
    }
  });

  test('current-role terminal shows the role + company', async ({ page }) => {
    const current = resume.experience[0]!;
    await expect(page.getByText(current.role, { exact: true })).toBeVisible();
    await expect(page.getByText(`@ ${current.company.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`)).toBeVisible();
  });

  if (FEATURES.blog) {
    test('writing section surfaces recent posts linking to the blog', async ({ page }) => {
      await expect(page.getByRole('heading', { name: /From the blog/ })).toBeVisible();
      await expect(page.getByRole('link', { name: 'all posts →' })).toHaveAttribute('href', '/blog');
    });
  }

  test('testing teaser shows live test counts', async ({ page }) => {
    await expect(page.getByTestId('teaser-unit')).toHaveText(String(TEST_STATS.unit));
    await expect(page.getByTestId('teaser-e2e')).toHaveText(String(TEST_STATS.e2e));
  });
});
