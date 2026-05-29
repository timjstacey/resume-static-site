import { test, expect } from '@playwright/test';
import { getProjects } from '../src/lib/data';

// Throws at module load if YAML is missing or fails schema validation.
const projects = getProjects();
const pinned = projects.filter((p) => p.pinned);
const unpinned = projects.filter((p) => !p.pinned);

test.describe('Projects page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/projects');
  });

  test('shows the terminal heading + repo count', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /ls -la \.\/projects/ })).toBeVisible();
    await expect(page.getByText(String(projects.length), { exact: true }).first()).toBeVisible();
  });

  test('renders a card per project', async ({ page }) => {
    for (const project of projects) {
      await expect(page.locator(`[aria-label="${project.name}"]`)).toBeVisible();
    }
  });

  test('pinned projects carry a PIN badge', async ({ page }) => {
    for (const project of pinned) {
      await expect(page.locator(`[aria-label="${project.name}"]`).getByText('★ PIN')).toBeVisible();
    }
  });

  test('pinned filter hides non-pinned without reload + reflects in URL', async ({ page }) => {
    await page.getByRole('button', { name: 'pinned' }).click();
    await expect(page).toHaveURL(/\?tag=pinned/);
    await expect(page.locator(`[aria-label="${pinned[0]!.name}"]`)).toBeVisible();
    await expect(page.locator(`[aria-label="${unpinned[0]!.name}"]`)).toBeHidden();
  });
});
