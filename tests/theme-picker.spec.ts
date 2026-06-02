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

  test('arrow keys rove focus across the menu items, wrapping at both ends', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: THEME_TRIGGER_LABEL }).click();

    const optionName = (i: number) => `${FLAVORS[i]!.label} theme`;
    // Opening focuses the checked item (mocha = last). Home jumps to the first.
    await page.keyboard.press('Home');
    await expect(page.getByRole('menuitemradio', { name: optionName(0) })).toBeFocused();

    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('menuitemradio', { name: optionName(1) })).toBeFocused();

    // ArrowUp from the first item wraps to the last.
    await page.keyboard.press('Home');
    await page.keyboard.press('ArrowUp');
    await expect(page.getByRole('menuitemradio', { name: optionName(FLAVORS.length - 1) })).toBeFocused();

    // End jumps to the last; ArrowDown from there wraps back to the first.
    await page.keyboard.press('End');
    await expect(page.getByRole('menuitemradio', { name: optionName(FLAVORS.length - 1) })).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('menuitemradio', { name: optionName(0) })).toBeFocused();
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
