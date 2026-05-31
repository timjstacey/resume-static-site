import { test, expect } from '@playwright/test';
import { readFileSync, readdirSync } from 'node:fs';
import { parse } from 'yaml';
import { getResume, getProjects, getJobs } from '../src/lib/data';
import { activePipeline, yearsOfExp } from '../src/lib/stats';
import { TEST_STATS } from '../src/lib/testStats';
import { FEATURES } from '../src/lib/features';

// Throws at module load if YAML is missing or fails schema validation.
const resume = getResume();
const projects = getProjects();
const jobs = getJobs();

// posts.ts imports `astro:content`, which only resolves inside the Astro
// runtime — read the post frontmatter directly to find the newest title (same
// fs approach as blog.spec.ts). The home row shows the latest 3, newest first.
const POSTS_DIR = 'src/content/posts';
const latestPosts = readdirSync(POSTS_DIR)
  .filter((f) => f.endsWith('.md'))
  .map((f) => parse(readFileSync(`${POSTS_DIR}/${f}`, 'utf-8').split('---')[1]!) as { title: string; date: string })
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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

  // Only when the blog is enabled and at least three posts exist to fill the row.
  if (FEATURES.blog && latestPosts.length >= 3) {
    test('writing section surfaces recent posts linking to the blog', async ({ page }) => {
      await expect(page.getByRole('heading', { name: /From the blog/ })).toBeVisible();
      await expect(page.getByRole('link', { name: 'all posts →' })).toHaveAttribute('href', '/blog');

      // The three newest posts must actually render — a broken post fetch would
      // leave the section empty without this assertion.
      const cards = page.getByTestId('post-card');
      await expect(cards).toHaveCount(3);
      await expect(cards.first().getByRole('heading')).toHaveText(latestPosts[0]!.title);
    });
  }

  test('testing teaser shows live test counts', async ({ page }) => {
    await expect(page.getByTestId('teaser-unit')).toHaveText(String(TEST_STATS.unit));
    await expect(page.getByTestId('teaser-e2e')).toHaveText(String(TEST_STATS.e2e));
  });
});
