import { test, expect } from '@playwright/test';
import { readdirSync } from 'node:fs';
import { getDrafts } from '../src/lib/data';
import { FEATURES } from '../src/lib/features';

// posts.ts imports `astro:content`, which only resolves inside the Astro
// runtime — count the markdown sources directly instead.
const postCount = readdirSync('src/content/posts').filter((f) => f.endsWith('.md')).length;
const drafts = getDrafts();

if (FEATURES.blog) {
  test.describe('Blog page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/blog');
    });

    test('renders the field-notes heading', async ({ page }) => {
      await expect(page.getByRole('heading', { name: /Field notes/ })).toBeVisible();
    });

    test('featured post shows a terminal preview with the cat command', async ({ page }) => {
      await expect(page.getByTestId('terminal-path')).toContainText('.md');
      await expect(page.getByText('featured · latest')).toBeVisible();
    });

    test('published list shows a row per non-featured post', async ({ page }) => {
      const rows = page.locator('a[href^="/blog/"]').filter({ hasText: 'read →' });
      await expect(rows).toHaveCount(postCount - 1);
    });

    test('drafts in flight render every draft', async ({ page }) => {
      for (const draft of drafts.slice(0, 6)) {
        await expect(page.getByText(draft.title, { exact: true })).toBeVisible();
      }
    });

    test('sidebar lists tag counts', async ({ page }) => {
      await expect(page.getByText(/Tags · \d+/)).toBeVisible();
    });
  });
}
