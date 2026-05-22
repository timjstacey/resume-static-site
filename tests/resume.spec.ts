import { test, expect } from '@playwright/test';
import { getResume } from '../src/lib/data';

// Throws at module load if YAML is missing or fails schema validation
const resume = getResume();

test.describe('Resume page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/resume');
  });

  test('renders Experience and Skills section headings', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Experience', level: 2 })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Skills', level: 2 })).toBeVisible();
  });

  test.describe('experience entries', () => {
    for (const exp of resume.experience) {
      test(`${exp.company} — ${exp.role}`, async ({ page }) => {
        const entry = page.getByLabel(exp.company);
        await expect(entry).toBeVisible();
        await expect(entry.getByText(exp.role)).toBeVisible();
      });
    }
  });

  test.describe('skills categories', () => {
    for (const group of resume.skills) {
      test(group.category, async ({ page }) => {
        const section = page.getByLabel(group.category);
        await expect(section.getByText(group.category)).toBeVisible();
        for (const item of group.items) {
          await expect(section.getByText(item, { exact: true })).toBeVisible();
        }
      });
    }
  });
});
