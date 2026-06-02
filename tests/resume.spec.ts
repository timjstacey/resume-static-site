import { test, expect } from '@playwright/test';
import { getResume } from '../src/lib/data';

// Throws at module load if YAML is missing or fails schema validation
const resume = getResume();

test.describe('Resume page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/resume');
  });

  test('renders the main page heading', async ({ page }) => {
    const heading = page.getByTestId('resume-heading');
    await expect(heading).toBeVisible();
    await expect(heading).toContainText('10 years of');
    await expect(heading).toContainText('not breaking prod.');
  });

  test('renders the // resume.tex section label', async ({ page }) => {
    await expect(page.getByText('// resume.tex')).toBeVisible();
  });

  test('renders the experience section label', async ({ page }) => {
    await expect(page.getByText('experience · 2015 — 2026')).toBeVisible();
  });

  test('renders the resume.pdf download button', async ({ page }) => {
    await expect(page.getByRole('link', { name: /resume\.pdf/i })).toBeVisible();
  });

  test('resume.pdf link serves the actual PDF (200 + pdf content-type)', async ({ page, request }) => {
    const link = page.getByRole('link', { name: /resume\.pdf/i });
    await expect(link).toHaveAttribute('href', '/tim-stacey-resume.pdf');
    await expect(link).toHaveAttribute('download', 'tim-stacey-resume.pdf');

    const res = await request.get('/tim-stacey-resume.pdf');
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toMatch(/pdf/);
  });

  test.describe('experience role cards', () => {
    for (const exp of resume.experience) {
      test(`${exp.company} — ${exp.role}`, async ({ page }) => {
        const card = page.getByRole('article', { name: exp.company });
        await expect(card).toBeVisible();
        await expect(card.getByRole('heading', { level: 2 })).toContainText(exp.role);
      });
    }
  });

  test('current role shows the current-role caption', async ({ page }) => {
    const current = resume.experience.find((e) => e.end === 'present')!;
    const card = page.getByRole('article', { name: current.company });
    await expect(card).toBeVisible();
    await expect(card).toContainText('current role');
  });

  test('past roles show zero-padded index', async ({ page }) => {
    // Entain Australia is the first past role (index 01)
    const card = page.getByRole('article', { name: 'Entain Australia' });
    await expect(card).toBeVisible();
    await expect(card).toContainText('01');
  });

  test('sidebar renders all skill groups', async ({ page }) => {
    const sidebar = page.getByTestId('resume-sidebar');
    await expect(sidebar).toBeVisible();
    for (const group of resume.skills) {
      const section = sidebar.getByLabel(group.category);
      await expect(section).toBeVisible();
      await expect(section.getByText(group.category)).toBeVisible();
    }
  });

  test.describe('skills items visible', () => {
    for (const group of resume.skills) {
      test(group.category, async ({ page }) => {
        const sidebar = page.getByTestId('resume-sidebar');
        const section = sidebar.getByLabel(group.category);
        for (const item of group.items) {
          await expect(section.getByText(item, { exact: true })).toBeVisible();
        }
      });
    }
  });

  test('bullet points render with peach arrow prefix', async ({ page }) => {
    // At least one experience bullet, carrying the → prefix, should be visible.
    const bullet = page.getByTestId('resume-bullet').first();
    await expect(bullet).toBeVisible();
    await expect(bullet).toContainText('→');
  });
});
