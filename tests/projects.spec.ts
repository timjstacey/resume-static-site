import { test, expect } from '@playwright/test';
import { getProjects } from '../src/lib/data';
import { PROJECT_STATUS_LABEL } from '../src/lib/projectStatus';

// Throws at module load if YAML is missing or fails schema validation
const projects = getProjects();

test.describe('Projects page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/projects');
  });

  test('shows heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Projects' })).toBeVisible();
  });

  test.describe('project cards', () => {
    for (const project of projects) {
      test(project.name, async ({ page }) => {
        const label = PROJECT_STATUS_LABEL[project.status];
        expect(label, `PROJECT_STATUS_LABEL missing entry for status '${project.status}'`).toBeDefined();

        const card = page.locator(`[aria-label="${project.name}"]`);
        await expect(card.getByText(project.name)).toBeVisible();
        await expect(card.getByText(label)).toBeVisible();
        for (const tag of project.tags) {
          await expect(card.getByText(tag, { exact: true })).toBeVisible();
        }
      });
    }
  });
});
