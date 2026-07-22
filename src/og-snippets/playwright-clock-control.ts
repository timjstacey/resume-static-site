// Never let a test wait out a real timer.
import { test, expect } from '@playwright/test';

test('session times out in ms, not minutes', async ({ page }) => {
  // Freeze time before the app reads the clock.
  await page.clock.install({ time: new Date('2026-07-21T09:00:00') });
  await page.goto('/dashboard');
  // Jump 25 min — the warning fires, no real wait.
  await page.clock.fastForward('25:00');
  await expect(page.getByRole('alert')).toHaveText(/session expires soon/i);
  // Jump the final 5 min — the timeout redirects to login.
  await page.clock.fastForward('05:00');
  await expect(page).toHaveURL('/login');
  // 30 minutes of behaviour. Milliseconds of runtime.
});
