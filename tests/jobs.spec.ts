import { test, expect, type Page, type Locator } from '@playwright/test';
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

  // Visible (not display:none) cards, by stable data attribute + visibility —
  // no reaching through the toggled `.hidden` class.
  const shown = () => 'article[data-search]:visible';

  test('search filters cards by role/company text', async ({ page }) => {
    const q = 'senior';
    const expected = jobs.filter((j) => `${j.role} ${j.company}`.toLowerCase().includes(q)).length;
    await page.getByRole('searchbox', { name: 'Search this board' }).fill(q);
    await expect(page.locator(shown())).toHaveCount(expected);
  });

  test('priority filter shows only matching cards', async ({ page }) => {
    const expected = jobs.filter((j) => priorityFor(j.role) === 'highest').length;
    await page.getByRole('combobox', { name: 'Filter by priority' }).selectOption('highest');
    await expect(page.locator(shown())).toHaveCount(expected);
  });

  test('source filter shows only matching cards', async ({ page }) => {
    const source = jobs[0]!.source ?? 'Other';
    const expected = jobs.filter((j) => (j.source ?? 'Other') === source).length;
    await page.getByRole('combobox', { name: 'Filter by source' }).selectOption(source);
    await expect(page.locator(shown())).toHaveCount(expected);
  });

  test('epic (company) filter shows only that company', async ({ page }) => {
    const company = jobs[0]!.company;
    const expected = jobs.filter((j) => j.company === company).length;
    await page.getByRole('combobox', { name: 'Filter by company' }).selectOption(company);
    await expect(page.locator(shown())).toHaveCount(expected);
  });

  test('clear resets all filters', async ({ page }) => {
    await page.getByRole('combobox', { name: 'Filter by priority' }).selectOption('highest');
    await expect(page.locator(shown())).not.toHaveCount(jobs.length);
    await page.getByRole('button', { name: '✕ clear' }).click();
    await expect(page.locator(shown())).toHaveCount(jobs.length);
  });
});

// Read-only board (#90): cards drag on desktop but never actually move — a
// cross-column drop snaps back and shows a single permission toast. The drag
// rule (isIllegalMove) is unit-tested in lib/jobhunt; this is the one
// integration check that the pointer wiring fires it. Runs on the content
// project (Desktop Chrome → min-width 1024 + fine pointer, where drag is armed).
test.describe('Job Hunt board — read-only drag', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/job-hunt');
  });

  // Drag the card from cardBox centre into the centre-top of a target column.
  async function dragCardToColumn(page: Page, card: Locator, targetColumn: Locator) {
    const c = (await card.boundingBox())!;
    const t = (await targetColumn.boundingBox())!;
    await page.mouse.move(c.x + c.width / 2, c.y + c.height / 2);
    await page.mouse.down();
    await page.mouse.move(t.x + t.width / 2, t.y + 40, { steps: 12 });
    await page.mouse.up();
  }

  test('a cross-column drop is blocked with a permission toast, card stays put', async ({ page }) => {
    const toast = page.getByTestId('board-toast');
    await expect(toast).toHaveCount(1);
    await expect(toast).not.toHaveAttribute('data-show', 'true');

    const card = page.locator('.column-body article[data-search]').first();
    await expect(card).toBeVisible();
    const fromCol = (await card.getAttribute('data-column'))!;
    const target = page.locator(`[data-board-column]:not([data-board-column="${fromCol}"])`).first();

    await dragCardToColumn(page, card, target);

    await expect(toast).toHaveAttribute('data-show', 'true');
    // The card never left its origin column — the board re-renders from jobs.yml.
    const stillIn = await card.evaluate((el) => el.closest('[data-board-column]')?.getAttribute('data-board-column'));
    expect(stillIn).toBe(fromCol);
  });

  test('repeated illegal drops keep a single toast (no stacking)', async ({ page }) => {
    const card = page.locator('.column-body article[data-search]').first();
    const fromCol = (await card.getAttribute('data-column'))!;
    const target = page.locator(`[data-board-column]:not([data-board-column="${fromCol}"])`).first();

    await dragCardToColumn(page, card, target);
    await dragCardToColumn(page, card, target);

    await expect(page.getByTestId('board-toast')).toHaveCount(1);
    await expect(page.getByTestId('board-toast')).toHaveAttribute('data-show', 'true');
  });

  test('drag is disabled below the single-column breakpoint (<768px)', async ({ page }) => {
    // matchMedia is live, so narrowing past the accordion breakpoint disarms drag.
    await page.setViewportSize({ width: 760, height: 900 });
    const card = page.locator('.column-body article[data-search]').first();
    const fromCol = (await card.getAttribute('data-column'))!;
    const target = page.locator(`[data-board-column]:not([data-board-column="${fromCol}"])`).first();

    await dragCardToColumn(page, card, target);

    await expect(page.getByTestId('board-toast')).not.toHaveAttribute('data-show', 'true');
  });
});
