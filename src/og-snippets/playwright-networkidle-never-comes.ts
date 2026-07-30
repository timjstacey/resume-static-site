// Wait for what the user sees, not for the network to fall silent.
import { test, expect } from '@playwright/test';

test('dashboard renders revenue', async ({ page }) => {
  await page.goto('/dashboard');

  // DISCOURAGED: analytics beacons and a poller keep the network busy,
  // so the 500 ms silence never comes and CI times out here.
  // await page.waitForLoadState('networkidle');

  // The assertion retries every ~100 ms until the element renders.
  // It tracks the state the test cares about, not the network.
  await expect(page.getByRole('heading', { name: 'Revenue' })).toBeVisible();
  await expect(page.getByTestId('revenue-total')).toHaveText('$48,210');
});
