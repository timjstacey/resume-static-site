import { test, expect } from '@playwright/test';
import { getJobs } from '../src/lib/data';
import { withKeys, columnOf, STATUS_COLUMNS, priorityFor } from '../src/lib/jobhunt';

// Throws at module load if YAML is missing or fails schema validation.
const jobs = withKeys(getJobs());

function columnLabel(id: string): string {
  return STATUS_COLUMNS.find((c) => c.id === id)!.label;
}

function countIn(id: string): number {
  return jobs.filter((j) => columnOf(j.status) === id).length;
}

function noun(n: number): string {
  return n === 1 ? 'issue' : 'issues';
}

function cardLabel(job: (typeof jobs)[number]): string {
  return `${job.role} at ${job.company}, ${job.status}, ${job.applied}`;
}

// Derived at module load. These can be absent if the fixture distribution
// changes (no closed app / no empty column); the dependent tests skip rather
// than throw at import.
const sample = jobs[0]!;
const closedJob = jobs.find((j) => columnOf(j.status) === 'closed');
const emptyColumn = STATUS_COLUMNS.find((c) => countIn(c.id) === 0);

test.describe('Job Hunt board', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/job-hunt');
  });

  test('renders the board chrome', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Active Pipeline' })).toBeVisible();
    await expect(page.getByText(`${jobs.length} issues`)).toBeVisible();
  });

  test('renders all five status columns with aria-labels and counts', async ({ page }) => {
    expect(STATUS_COLUMNS).toHaveLength(5);

    for (const col of STATUS_COLUMNS) {
      const count = countIn(col.id);
      const region = page.getByRole('region', { name: `${col.label} — ${count} ${noun(count)}` });
      await expect(region).toBeVisible();
    }
  });

  test('a card lands in the column its status maps to', async ({ page }) => {
    const expectedCol = columnOf(sample.status);
    const count = countIn(expectedCol);
    const region = page.getByRole('region', { name: `${columnLabel(expectedCol)} — ${count} ${noun(count)}` });
    await expect(region.getByLabel(cardLabel(sample))).toBeVisible();
  });

  test('every application has an accessible card label', async ({ page }) => {
    for (const job of jobs) {
      await expect(page.getByLabel(cardLabel(job)).first()).toBeVisible();
    }
  });

  test('closed cards show a sub-status pill', async ({ page }) => {
    // eslint-disable-next-line playwright/no-skipped-test -- fixture-conditional skip
    test.skip(!closedJob, 'no closed application in fixture');
    const card = page.getByLabel(cardLabel(closedJob!));
    await expect(card).toBeVisible();
    await expect(card.getByText(closedJob!.status, { exact: true })).toBeVisible();
  });

  test('empty columns show the no-issues placeholder', async ({ page }) => {
    // eslint-disable-next-line playwright/no-skipped-test -- fixture-conditional skip
    test.skip(!emptyColumn, 'no empty column in fixture');
    const region = page.getByRole('region', { name: new RegExp(`^${columnLabel(emptyColumn!.id)} — 0 issues$`) });
    await expect(region.getByText('─ no issues ─')).toBeVisible();
  });

  const shown = () => 'article[data-search]:not(.hidden)';

  test('search filters cards by role/company text', async ({ page }) => {
    const q = 'senior';
    const expected = jobs.filter((j) => `${j.role} ${j.company}`.toLowerCase().includes(q)).length;
    await page.locator('#board-search').fill(q);
    await expect(page.locator(shown())).toHaveCount(expected);
  });

  test('priority filter shows only matching cards', async ({ page }) => {
    const expected = jobs.filter((j) => priorityFor(j.role) === 'highest').length;
    await page.locator('#filter-priority').selectOption('highest');
    await expect(page.locator(shown())).toHaveCount(expected);
  });

  test('source filter shows only matching cards', async ({ page }) => {
    const source = jobs[0]!.source ?? 'Other';
    const expected = jobs.filter((j) => (j.source ?? 'Other') === source).length;
    await page.locator('#filter-source').selectOption(source);
    await expect(page.locator(shown())).toHaveCount(expected);
  });

  test('epic (company) filter shows only that company', async ({ page }) => {
    const company = jobs[0]!.company;
    const expected = jobs.filter((j) => j.company === company).length;
    await page.locator('#filter-epic').selectOption(company);
    await expect(page.locator(shown())).toHaveCount(expected);
  });

  test('clear resets all filters', async ({ page }) => {
    await page.locator('#filter-priority').selectOption('highest');
    await expect(page.locator(shown())).not.toHaveCount(jobs.length);
    await page.locator('#filter-clear').click();
    await expect(page.locator(shown())).toHaveCount(jobs.length);
  });
});
