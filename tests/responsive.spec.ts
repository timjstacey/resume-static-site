import { test, expect, type Page } from '@playwright/test';
import { readFileSync, readdirSync } from 'node:fs';
import { parse } from 'yaml';

// Include the newest post's detail page — its code blocks are the likeliest
// source of horizontal overflow on a phone.
const POSTS_DIR = 'src/content/posts';
const newestSlug = readdirSync(POSTS_DIR)
  .filter((f) => f.endsWith('.md'))
  .map((f) => ({
    slug: f.replace(/\.md$/, ''),
    date: (parse(readFileSync(`${POSTS_DIR}/${f}`, 'utf-8').split('---')[1]!) as { date: string }).date,
  }))
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]?.slug;

const allPages = ['/', '/resume', '/projects', '/blog', '/job-hunt', '/testing'];
if (newestSlug) allPages.push(`/blog/${newestSlug}`);

function hasHorizontalScroll(page: Page): Promise<boolean> {
  return page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
}

test.describe('Responsive layout — mobile (375px)', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test.describe('No horizontal scroll', () => {
    for (const path of allPages) {
      test(`no horizontal overflow on ${path}`, async ({ page }) => {
        await page.goto(path);
        expect(await hasHorizontalScroll(page)).toBe(false);
      });
    }
  });

  test('board cards have no horizontal overflow', async ({ page }) => {
    await page.goto('/job-hunt');
    const cards = page.getByRole('article');
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const card = cards.nth(i);
      const overflow = await card.evaluate((el) => el.scrollWidth > el.clientWidth);
      expect(overflow, `card ${i} has horizontal overflow`).toBe(false);
    }
  });

  test('board title visible on jobs page', async ({ page }) => {
    await page.goto('/job-hunt');
    await expect(page.getByRole('heading', { name: 'Active Pipeline' })).toBeVisible();
  });
});

// Mobile S is the narrowest device tier we support; the px-14 page gutters and
// big stat numbers overflowed here before responsive padding/sizing landed.
test.describe('Responsive layout — Mobile S (320px)', () => {
  test.use({ viewport: { width: 320, height: 658 } });

  for (const path of allPages) {
    test(`no horizontal overflow on ${path}`, async ({ page }) => {
      await page.goto(path);
      expect(await hasHorizontalScroll(page)).toBe(false);
    });
  }
});

// The desktop nav links overflowed before the collapse breakpoint, so the
// hamburger must already be showing below the lg (1024px) breakpoint.
test.describe('Nav collapse breakpoint', () => {
  const toggleName = 'Toggle navigation';

  test('hamburger is shown just below lg (1000px)', async ({ page }) => {
    await page.setViewportSize({ width: 1000, height: 720 });
    await page.goto('/');
    await expect(page.getByRole('navigation').getByRole('button', { name: toggleName })).toBeVisible();
  });

  test('desktop links replace the hamburger at lg (1024px)', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 720 });
    await page.goto('/');
    const nav = page.getByRole('navigation');
    await expect(nav.getByRole('button', { name: toggleName })).toBeHidden();
    // Drawer + desktop copies both exist in the DOM; the visible one is the desktop row.
    await expect(nav.getByRole('link', { name: 'Testing' }).locator('visible=true')).toBeVisible();
  });
});
