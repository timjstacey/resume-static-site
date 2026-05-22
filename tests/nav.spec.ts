import { test, expect } from '@playwright/test';

const pages = [
  { path: '/', activeLabel: 'Home' },
  { path: '/resume', activeLabel: 'Resume' },
  { path: '/projects', activeLabel: 'Projects' },
  { path: '/jobs', activeLabel: 'Jobs' },
];

const navLabels = ['Home', 'Resume', 'Projects', 'Jobs'];

test.describe('Nav — desktop', () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  for (const { path, activeLabel } of pages) {
    test(`"${activeLabel}" link is active on ${path}`, async ({ page }) => {
      await page.goto(path);
      const nav = page.getByRole('navigation');
      await expect(nav.getByRole('link', { name: activeLabel })).toHaveAttribute('aria-current', 'page');
    });
  }

  test('all four links visible in nav bar', async ({ page }) => {
    await page.goto('/');
    const nav = page.getByRole('navigation');
    for (const label of navLabels) {
      await expect(nav.getByRole('link', { name: label })).toBeVisible();
    }
  });
});

test.describe('Nav — mobile', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  for (const { path, activeLabel } of pages) {
    test(`"${activeLabel}" link is active on ${path}`, async ({ page }) => {
      await page.goto(path);
      const nav = page.getByRole('navigation');
      await nav.getByRole('button', { name: 'Toggle navigation' }).click();
      await expect(nav.getByRole('link', { name: activeLabel })).toHaveAttribute('aria-current', 'page');
    });
  }

  test('hamburger opens drawer with all four links', async ({ page }) => {
    await page.goto('/');
    const nav = page.getByRole('navigation');
    const toggle = nav.getByRole('button', { name: 'Toggle navigation' });
    await expect(toggle).toBeVisible();
    await toggle.click();
    for (const label of navLabels) {
      await expect(nav.getByRole('link', { name: label })).toBeVisible();
    }
  });
});
