import { test, expect } from '@playwright/test';
import { NAV_ITEMS } from '../src/lib/nav';

const navLabels = NAV_ITEMS.map((item) => item.label);
const pages = NAV_ITEMS.map(({ href, label }) => ({ path: href, activeLabel: label }));
const firstNavLabel = navLabels[0]!;
const lastNavLabel = navLabels[navLabels.length - 1]!;

test.describe('Nav — desktop', () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  for (const { path, activeLabel } of pages) {
    test(`"${activeLabel}" link is active on ${path}`, async ({ page }) => {
      await page.goto(path);
      const nav = page.getByRole('navigation');
      await expect(nav.getByRole('link', { name: activeLabel })).toHaveAttribute('aria-current', 'page');
    });
  }

  test('all nav links visible in nav bar', async ({ page }) => {
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

  test('hamburger opens drawer, shows all links, focuses first', async ({ page }) => {
    await page.goto('/');
    const nav = page.getByRole('navigation');
    const toggle = nav.getByRole('button', { name: 'Toggle navigation' });
    await expect(toggle).toBeVisible();
    await toggle.click();
    for (const label of navLabels) {
      await expect(nav.getByRole('link', { name: label })).toBeVisible();
    }
    await expect(nav.getByRole('link', { name: firstNavLabel })).toBeFocused();
  });

  test('Escape closes drawer and returns focus to toggle', async ({ page }) => {
    await page.goto('/');
    const nav = page.getByRole('navigation');
    const toggle = nav.getByRole('button', { name: 'Toggle navigation' });
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('Escape');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(toggle).toBeFocused();
  });

  test('outside click closes drawer', async ({ page }) => {
    await page.goto('/');
    const nav = page.getByRole('navigation');
    const toggle = nav.getByRole('button', { name: 'Toggle navigation' });
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await page.getByRole('heading', { level: 1 }).click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  test('Tab from last drawer link cycles to first (focus trap)', async ({ page }) => {
    await page.goto('/');
    const nav = page.getByRole('navigation');
    await nav.getByRole('button', { name: 'Toggle navigation' }).click();
    // Drawer auto-focuses first link; press Tab once per link to wrap back to it.
    for (let i = 0; i < navLabels.length; i++) {
      await page.keyboard.press('Tab');
    }
    await expect(nav.getByRole('link', { name: firstNavLabel })).toBeFocused();
  });

  test('Shift+Tab from first drawer link cycles to last (focus trap)', async ({ page }) => {
    await page.goto('/');
    const nav = page.getByRole('navigation');
    await nav.getByRole('button', { name: 'Toggle navigation' }).click();
    await page.keyboard.press('Shift+Tab');
    await expect(nav.getByRole('link', { name: lastNavLabel })).toBeFocused();
  });
});
