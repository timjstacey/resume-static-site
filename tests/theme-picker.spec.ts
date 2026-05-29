import { test, expect } from '@playwright/test';
import { FLAVORS, THEME_TRIGGER_LABEL } from '../src/lib/themes';

const targetFlavor = FLAVORS.find((f) => f.id === 'mocha') ?? FLAVORS[0];

test.describe('ThemePicker', () => {
  test('trigger toggles dropdown open/closed', async ({ page }) => {
    await page.goto('/');
    const trigger = page.getByRole('button', { name: THEME_TRIGGER_LABEL });
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await trigger.click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await trigger.click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  test('selecting a flavor applies it, persists, and closes dropdown', async ({ page }) => {
    await page.goto('/');
    const trigger = page.getByRole('button', { name: THEME_TRIGGER_LABEL });
    await trigger.click();
    await page.getByRole('menuitemradio', { name: `${targetFlavor.label} theme` }).click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('html')).toHaveClass(new RegExp(targetFlavor.id));
    const stored = await page.evaluate(() => localStorage.getItem('ctp-flavor'));
    expect(stored).toBe(targetFlavor.id);
  });

  test('outside click closes dropdown', async ({ page }) => {
    await page.goto('/');
    const trigger = page.getByRole('button', { name: THEME_TRIGGER_LABEL });
    await trigger.click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await page.getByRole('heading', { level: 1 }).click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  test('Escape closes dropdown', async ({ page }) => {
    await page.goto('/');
    const trigger = page.getByRole('button', { name: THEME_TRIGGER_LABEL });
    await trigger.click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('Escape');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  test('viewport resize closes open dropdown', async ({ page }) => {
    await page.setViewportSize({ width: 400, height: 800 });
    await page.goto('/');
    const trigger = page.getByRole('button', { name: THEME_TRIGGER_LABEL });
    await trigger.click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });
});
