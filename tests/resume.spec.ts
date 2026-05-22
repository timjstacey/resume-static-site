import { test, expect } from '@playwright/test';
import { getResume } from '../src/lib/data';

// Throws at module load if YAML is missing or fails schema validation
const resume = getResume();

test.describe('Resume page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/resume');
  });

  test('shows name and tagline from resume data', async ({ page }) => {
    expect(resume.name, 'resume.yml: name must be non-empty').toBeTruthy();
    expect(resume.tagline, 'resume.yml: tagline must be non-empty').toBeTruthy();

    await expect(page.getByRole('heading', { name: resume.name })).toBeVisible();
    await expect(page.getByText(resume.tagline)).toBeVisible();
  });

  test.describe('experience entries', () => {
    test('resume.yml has at least one experience entry', () => {
      expect(resume.experience.length, 'resume.yml: experience must have at least one entry').toBeGreaterThan(0);
    });

    for (const exp of resume.experience) {
      test(`${exp.company} — ${exp.role}`, async ({ page }) => {
        const entry = page.getByLabel(exp.company);
        await expect(entry).toBeVisible();
        await expect(entry.getByText(exp.role)).toBeVisible();
      });
    }
  });

  test.describe('skills categories', () => {
    test('resume.yml has at least one skills category', () => {
      expect(resume.skills.length, 'resume.yml: skills must have at least one category').toBeGreaterThan(0);
    });

    for (const group of resume.skills) {
      test(group.category, async ({ page }) => {
        expect(group.items.length, `skills["${group.category}"]: must have at least one item`).toBeGreaterThan(0);

        const section = page.getByLabel(group.category);
        await expect(section.getByText(group.category)).toBeVisible();
        for (const item of group.items) {
          await expect(section.getByText(item, { exact: true })).toBeVisible();
        }
      });
    }
  });
});
