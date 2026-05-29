import { test, expect } from '@playwright/test';
import { getJobs } from '../src/lib/data';
import { withKeys, columnOf, STATUS_COLUMNS } from '../src/lib/jobhunt';

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

// Derived at module load. The fixture invariants (see src/data/jobs.yml) keep
// at least one closed application and at least one empty column populated, so
// these are non-null in practice; `!` documents that contract.
const sample = jobs[0]!;
const closedJob = jobs.find((j) => columnOf(j.status) === 'closed')!;
const emptyColumn = STATUS_COLUMNS.find((c) => countIn(c.id) === 0)!;

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
});

  test('closed cards show a sub-status pill', async ({ page }) => {
    const card = page.getByLabel(cardLabel(closedJob));
    await expect(card).toBeVisible();
    await expect(card.getByText(closedJob.status, { exact: true })).toBeVisible();
  });

  test('empty columns show the no-issues placeholder', async ({ page }) => {
    const region = page.getByRole('region', { name: new RegExp(`^${columnLabel(emptyColumn.id)} — 0 issues$`) });
    await expect(region.getByText('─ no issues ─')).toBeVisible();
  });
