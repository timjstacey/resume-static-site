import { test, expect, type Page } from '@playwright/test';

const allPages = ['/', '/resume', '/projects', '/jobs'];

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
    await page.goto('/jobs');
    const cards = page.locator('[data-status]');
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const card = cards.nth(i);
      const overflow = await card.evaluate((el) => el.scrollWidth > el.clientWidth);
      expect(overflow, `card ${i} has horizontal overflow`).toBe(false);
    }
  });

  test('stats bar visible on jobs page', async ({ page }) => {
    await page.goto('/jobs');
    await expect(page.getByText('Total')).toBeVisible();
  });

  test('status filter buttons reachable and functional on jobs page', async ({ page }) => {
    await page.goto('/jobs');

    const allButton = page.getByRole('button', { name: /^All/ });
    await expect(allButton).toBeVisible();
    await expect(allButton).toBeInViewport();

    const rejectedButton = page.getByRole('button', { name: /^Rejected/ });
    await expect(rejectedButton).toBeVisible();
    await rejectedButton.click();

    await expect(page.locator('[data-status="Applied"]').first()).toBeHidden();

    await allButton.click();
    await expect(page.locator('[data-status="Applied"]').first()).toBeVisible();
  });
});
