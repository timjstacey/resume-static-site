import { test, expect, type Page, type Locator } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { parse } from 'yaml';
import { getHunt, getJobs } from '../src/lib/data';
import { withKeys, columnOf, STATUS_COLUMNS, priorityFor, huntRetro } from '../src/lib/jobhunt';
import { JobSourceSchema } from '../src/lib/schemas';
import { JOBS_ACTIVE_HEADING, JOBS_RETRO_HEADING } from '../src/lib/copy';

// Throws at module load if YAML is missing or fails schema validation.
const hunt = getHunt();
const jobs = withKeys(getJobs());
// Narrowed for TS: only the closed-mode describe reads it (skipped when active).
const closedAt = hunt.state === 'closed' ? hunt.closedAt : '';

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
  // Closed hunts are anonymised (empty company) — no "at <company>" segment.
  if (!job.company) return `${job.role}, ${job.status}, ${job.applied}`;
  return `${job.role} at ${job.company}, ${job.status}, ${job.applied}`;
}

// Derived at module load. These can be absent if the fixture distribution
// changes (no closed app / no empty column); the dependent tests skip rather
// than throw at import.
const sample = jobs[0]!;
const closedJob = jobs.find((j) => columnOf(j.status) === 'closed');
const emptyColumn = STATUS_COLUMNS.find((c) => countIn(c.id) === 0);

test.describe('Job Hunt board', () => {
  // The company filter/search and active heading only exist while the hunt is open.
  // eslint-disable-next-line playwright/no-skipped-test -- mode-conditional skip (hunt.yml)
  test.skip(hunt.state !== 'active', 'hunt is closed — see the closed-mode describe');

  test.beforeEach(async ({ page }) => {
    await page.goto('/job-hunt');
  });

  test('renders the board chrome', async ({ page }) => {
    await expect(page.getByRole('heading', { name: JOBS_ACTIVE_HEADING })).toBeVisible();
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
    await expect(region.getByTestId('column-empty')).toBeVisible();
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

test.describe('Job Hunt board — closed retro', () => {
  // eslint-disable-next-line playwright/no-skipped-test -- mode-conditional skip (hunt.yml)
  test.skip(hunt.state !== 'closed', 'hunt is active — see the active-mode describe');

  test.beforeEach(async ({ page }) => {
    await page.goto('/job-hunt');
  });

  test('shows the retro heading and closed sprint chrome', async ({ page }) => {
    await expect(page.getByRole('heading', { name: JOBS_RETRO_HEADING })).toBeVisible();
    await expect(page.getByText(`${jobs.length} issues`)).toBeVisible();
    await expect(page.getByTestId('sprint-complete')).toBeVisible();
  });

  test('retro stats region shows values derived from the data', async ({ page }) => {
    const retro = huntRetro(jobs, closedAt);
    const region = page.getByRole('region', { name: 'Sprint retro stats' });
    const stats: [string, string][] = [
      ['Applications', String(retro.total)],
      ['Response rate', `${retro.responseRate}%`],
      ['Interviews', String(retro.interviews)],
      ['Days searching', String(retro.daysToClose)],
    ];
    for (const [label, value] of stats) {
      await expect(region.locator(`[data-stat-label="${label}"] [data-stat-value]`)).toHaveText(value);
    }
    for (const row of retro.bySource) {
      await expect(page.getByTestId('retro-sources')).toContainText(
        `${row.source} ${row.applied} sent · ${row.responses} ${row.responses === 1 ? 'reply' : 'replies'}`
      );
    }
  });

  test('the EPIC (company) filter is absent but the other filters remain', async ({ page }) => {
    await expect(page.getByRole('combobox', { name: 'Filter by company' })).toHaveCount(0);
    await expect(page.getByRole('combobox', { name: 'Filter by priority' })).toBeVisible();
    await expect(page.getByRole('combobox', { name: 'Filter by source' })).toBeVisible();
  });

  test('source filter still narrows the anonymised board', async ({ page }) => {
    const source = jobs[0]!.source ?? 'Other';
    const expected = jobs.filter((j) => (j.source ?? 'Other') === source).length;
    await page.getByRole('combobox', { name: 'Filter by source' }).selectOption(source);
    // Visible cards by the filter's contract attr (filtered-out cards get `hidden`).
    await expect(page.locator('article[data-search]:visible')).toHaveCount(expected);
  });

  test('every card carries the redacted accessible label', async ({ page }) => {
    await expect(page.getByRole('article')).toHaveCount(jobs.length);
    const counts = new Map<string, number>();
    for (const job of jobs) {
      expect(cardLabel(job)).not.toContain(' at ');
      counts.set(cardLabel(job), (counts.get(cardLabel(job)) ?? 0) + 1);
    }
    for (const [name, n] of counts) {
      await expect(page.getByRole('article', { name, exact: true })).toHaveCount(n);
    }
  });

  test('no company name leaks into the rendered HTML', async ({ page }) => {
    const raw = parse(readFileSync('src/data/jobs.yml', 'utf-8')) as { company: string }[];
    // A company that is also an application source (e.g. "Jobgether") legitimately
    // appears as a source chip, filter option and per-source stat — a substring check
    // can't tell that from a leak, so those are covered by the structural assertions
    // below (no company attribute, no epic pill title) instead.
    const sources = new Set(JobSourceSchema.options.map((o) => o.toLowerCase()));
    const companies = [...new Set(raw.map((j) => j.company.toLowerCase()))].filter((c) => !sources.has(c));
    // Scoped to the page header + board (<main> sections), not page.content(): short
    // names like "ABC" collide with inline-script/hash text in <head> and the footer.
    const html = (
      await page.locator('main > section').evaluateAll((els) => els.map((e) => e.outerHTML).join('\n'))
    ).toLowerCase();
    await expect(page.locator('[data-company]')).toHaveCount(0);
    for (const company of companies) {
      expect(html, `leaked "${company}"`).not.toContain(company);
    }
    // Whole-document sweep (head, meta, scripts, footer) for names distinctive
    // enough not to collide with incidental text.
    const doc = (await page.content()).toLowerCase();
    for (const company of companies.filter((c) => c.length > 6)) {
      expect(doc, `leaked "${company}" outside the board`).not.toContain(company);
    }
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
