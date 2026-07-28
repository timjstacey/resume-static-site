// A strict mode violation means your locator matches two elements.
import { test } from '@playwright/test';

test('delete the right row', async ({ page }) => {
  const all = page.getByRole('button', { name: 'Delete' });

  // .first() clears the error and clicks by DOM order — a coin flip.
  await all.first().click();

  // Narrow by meaning instead: scope to the row, then the button
  // resolves to one element on its own, and a third row cannot break it.
  const row = page.getByRole('row').filter({ hasText: 'invoice-042' });
  await row.getByRole('button', { name: 'Delete' }).click();
});
