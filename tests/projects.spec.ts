import { test, expect, type Page } from '@playwright/test';
import { getProjects } from '../src/lib/data';
import { PROJECT_FILTERS } from '../src/lib/projectFilters';
import { daysAgo } from '../src/lib/format';
import type { Project } from '../src/lib/schemas';

// Throws at module load if YAML is missing or fails schema validation.
const projects = getProjects();
const pinned = projects.filter((p) => p.pinned);

// Mirror ProjectCard's data-tags tokenisation so we can predict filter results.
function tokensOf(p: Project): string[] {
  return [...p.tags, p.lang]
    .filter(Boolean)
    .map((t) => String(t).toLowerCase())
    .concat(p.pinned ? ['pinned'] : [])
    .join(' ')
    .split(' ');
}

// Projects expected to remain visible for a given filter (sorted names).
function expectedNames(filter: string): string[] {
  const matched = filter === 'all' ? projects : projects.filter((p) => tokensOf(p).includes(filter));
  return matched.map((p) => p.name).sort();
}

// URL matcher per filter: 'all' clears the param, others set ?tag=<filter>.
function urlFor(filter: string): RegExp {
  return filter === 'all' ? /\/projects\/?$/ : new RegExp(`\\?tag=${filter}`);
}

// Mirror ProjectCard's data-updated: whole days since updatedAt, no date sorts last.
function updatedDays(p: Project): number {
  return p.updatedAt ? daysAgo(p.updatedAt) : 99999;
}

function visibleNames(page: Page): Promise<string[]> {
  return page
    .locator('#project-grid [data-project]:not(.hidden)')
    .evaluateAll((els) => els.map((e) => e.getAttribute('aria-label') ?? ''));
}

test.describe('Projects page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/projects');
  });

  test('shows the terminal heading + repo count', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /cat projects\.yml/ })).toBeVisible();
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

  // One straight-line test per filter pill (no in-test conditionals).
  for (const filter of PROJECT_FILTERS) {
    test(`filter "${filter}" shows only matching projects + reflects in URL`, async ({ page }) => {
      const expected = expectedNames(filter);
      expect(expected.length, `no fixture project matches filter "${filter}"`).toBeGreaterThan(0);

      await page.locator(`[data-filter="${filter}"]`).click();
      expect((await visibleNames(page)).sort()).toEqual(expected);
      await expect(page).toHaveURL(urlFor(filter));
    });
  }

  test('sort toggles project order by recency', async ({ page }) => {
    const byRecency = [...projects].sort((a, b) => updatedDays(a) - updatedDays(b)).map((p) => p.name);

    await expect(page.locator('#sort-arrow')).toHaveText('↓');
    expect(await visibleNames(page)).toEqual(byRecency);

    await page.locator('#sort-btn').click();
    await expect(page.locator('#sort-arrow')).toHaveText('↑');
    expect(await visibleNames(page)).toEqual([...byRecency].reverse());
  });
});

// Below sm the chip row collapses into a single select aligned with the sort
// control (#119); it drives the same filter logic as the chips.
test.describe('Projects page — mobile filter select', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('select filters the grid and reflects in the URL', async ({ page }) => {
    await page.goto('/projects');
    const select = page.getByRole('combobox', { name: 'Filter projects' });
    await expect(select).toBeVisible();

    await select.selectOption('pinned');
    // poll: the grid update runs inside a View Transition (async commit).
    await expect.poll(async () => (await visibleNames(page)).sort()).toEqual(expectedNames('pinned'));
    await expect(page).toHaveURL(urlFor('pinned'));

    await select.selectOption('all');
    await expect.poll(async () => (await visibleNames(page)).sort()).toEqual(expectedNames('all'));
    await expect(page).toHaveURL(urlFor('all'));
  });
});
