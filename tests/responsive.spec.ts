import { test, expect, type Page } from '@playwright/test';

const allPages = ['/', '/resume', '/projects', '/job-hunt'];

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

  test('job cards have no horizontal overflow', async ({ page }) => {
    await page.goto('/job-hunt');
    const cards = page.locator('[data-status]');
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const card = cards.nth(i);
      const overflow = await card.evaluate((el) => el.scrollWidth > el.clientWidth);
      expect(overflow, `card ${i} has horizontal overflow`).toBe(false);
    }
  });

  test('filter buttons reachable in viewport on jobs page', async ({ page }) => {
    await page.goto('/job-hunt');
    const allButton = page.getByRole('button', { name: /^All/ });
    await expect(allButton).toBeVisible();
    await expect(allButton).toBeInViewport();
  });
});
