import { test, expect } from '@playwright/test';
import { getResume, getProjects, getJobs } from '../src/lib/data';

// Throws at module load if YAML is missing or fails schema validation
const resume = getResume();
const projects = getProjects();
const jobs = getJobs();

test.describe('Home page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('shows name and tagline from resume data', async ({ page }) => {
    expect(resume.name, 'resume.yml: name must be non-empty').toBeTruthy();
    expect(resume.tagline, 'resume.yml: tagline must be non-empty').toBeTruthy();

    await expect(page.getByRole('heading', { name: resume.name })).toBeVisible();
    await expect(page.getByText(resume.tagline)).toBeVisible();
  });

  test('stats grid shows project and job counts from data', async ({ page }) => {
    expect(projects.length, 'projects.yml must have at least one project').toBeGreaterThan(0);
    expect(jobs.length, 'jobs.yml must have at least one job').toBeGreaterThan(0);

    const stats = page.getByRole('region', { name: 'Stats' });

    const projectStat = stats.locator('div').filter({ hasText: 'Projects' });
    await expect(projectStat.locator('p').first()).toHaveText(String(projects.length));

    const jobStat = stats.locator('div').filter({ hasText: 'Jobs applied' });
    await expect(jobStat.locator('p').first()).toHaveText(String(jobs.length));
  });

  test('CTA links navigate to correct pages', async ({ page }) => {
    const main = page.getByRole('main');

    await main.getByRole('link', { name: 'Resume' }).click();
    await expect(page).toHaveURL('/resume');

    await page.goto('/');
    await main.getByRole('link', { name: 'Projects' }).click();
    await expect(page).toHaveURL('/projects');

    await page.goto('/');
    await main.getByRole('link', { name: 'Job Board' }).click();
    await expect(page).toHaveURL('/jobs');
  });
});
