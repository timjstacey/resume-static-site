import { test, expect } from '@playwright/test';
import { getProjects } from '../src/lib/data';

// Throws at module load if YAML is missing or fails schema validation
const projects = getProjects();

const statusLabel: Record<string, string> = {
  active: 'Active',
  wip: 'WIP',
  archived: 'Archived',
};

test.describe('Projects page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/projects');
  });

  test('shows heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Projects' })).toBeVisible();
  });

  test.describe('project cards', () => {
    expect(projects.length, 'projects.yml must have at least one project').toBeGreaterThan(0);

    for (const project of projects) {
      test(project.name, async ({ page }) => {
        const label = statusLabel[project.status];
        expect(label, `statusLabel missing entry for status '${project.status}'`).toBeDefined();

        const card = page.locator(`[aria-label="${project.name}"]`);
        await expect(card.getByText(project.name)).toBeVisible();
        await expect(card.getByText(label!)).toBeVisible();
        for (const tag of project.tags) {
          await expect(card.getByText(tag, { exact: true })).toBeVisible();
        }
      });
    }
  });
});
