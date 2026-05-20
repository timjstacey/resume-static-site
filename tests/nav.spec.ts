import { test, expect } from '@playwright/test';

const pages = [
  { path: '/', activeLabel: 'Home' },
  { path: '/resume', activeLabel: 'Resume' },
  { path: '/projects', activeLabel: 'Projects' },
  { path: '/jobs', activeLabel: 'Jobs' },
];

test.describe('Nav active state', () => {
  for (const { path, activeLabel } of pages) {
    test(`"${activeLabel}" link is active on ${path}`, async ({ page }) => {
      await page.goto(path);
      const nav = page.getByRole('navigation');
      await expect(nav.getByRole('link', { name: activeLabel })).toHaveAttribute('aria-current', 'page');
    });
  }

  test('nav contains all four links', async ({ page }) => {
    await page.goto('/');
    const nav = page.getByRole('navigation');
    await expect(nav.getByRole('link', { name: 'Home' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Resume' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Projects' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Jobs' })).toBeVisible();
  });
});
