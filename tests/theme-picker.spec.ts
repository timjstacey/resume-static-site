import { test, expect } from '@playwright/test';

test.describe('ThemePicker', () => {
  test('trigger toggles dropdown open/closed', async ({ page }) => {
    await page.goto('/');
    const trigger = page.getByRole('button', { name: 'Color theme' });
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await trigger.click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await trigger.click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  test('selecting a flavor applies it, persists, and closes dropdown', async ({ page }) => {
    await page.goto('/');
    const trigger = page.getByRole('button', { name: 'Color theme' });
    await trigger.click();
    await page.getByRole('button', { name: 'Mocha theme' }).click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('html')).toHaveClass(/mocha/);
    const stored = await page.evaluate(() => localStorage.getItem('ctp-flavor'));
    expect(stored).toBe('mocha');
  });

  test('outside click closes dropdown', async ({ page }) => {
    await page.goto('/');
    const trigger = page.getByRole('button', { name: 'Color theme' });
    await trigger.click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await page.getByRole('heading', { name: 'Tim Stacey', level: 1 }).click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  test('Escape closes dropdown', async ({ page }) => {
    await page.goto('/');
    const trigger = page.getByRole('button', { name: 'Color theme' });
    await trigger.click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('Escape');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  test('viewport resize closes open dropdown', async ({ page }) => {
    await page.setViewportSize({ width: 400, height: 800 });
    await page.goto('/');
    const trigger = page.getByRole('button', { name: 'Color theme' });
    await trigger.click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });
});
