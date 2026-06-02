import { test, expect } from '@playwright/test';
import { readFileSync, readdirSync } from 'node:fs';
import { parse } from 'yaml';

const PAGE_SIZE = 10;

// posts.ts imports `astro:content`, which only resolves inside the Astro
// runtime — read the markdown sources directly instead.
const POSTS_DIR = 'src/content/posts';
const postFiles = readdirSync(POSTS_DIR).filter((f) => f.endsWith('.md'));
const postCount = postFiles.length;
// Newest post by frontmatter date — its filename stem is the detail-page slug,
// and its hashtags drive the sidebar + "Filed under" assertions.
const newest = postFiles
  .map((f) => {
    const fm = parse(readFileSync(`${POSTS_DIR}/${f}`, 'utf-8').split('---')[1]!) as {
      date: string;
      hashtags?: string[];
    };
    return { slug: f.replace(/\.md$/, ''), date: fm.date, hashtags: fm.hashtags ?? [] };
  })
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
const newestSlug = newest?.slug;
const newestHashtags = newest?.hashtags ?? [];

// Content-dependent specs only run when posts exist.
if (postCount > 0) {
  test.describe('Blog page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/blog');
    });

    test('renders the field-notes heading', async ({ page }) => {
      await expect(page.getByRole('heading', { name: /Field notes/ })).toBeVisible();
    });

    test('featured post shows a terminal preview with the cat command', async ({ page }) => {
      await expect(page.getByTestId('terminal-path')).toContainText('.md');
      await expect(page.getByText('featured · latest')).toBeVisible();
    });

    test('featured post number matches the total post count', async ({ page }) => {
      // Guards against the label reverting to a hardcoded "// post 001".
      const padded = String(postCount).padStart(3, '0');
      await expect(page.getByText(`// post ${padded}`)).toBeVisible();
    });

    test('published list shows a row per non-featured post', async ({ page }) => {
      // Counts all DOM rows including hidden pagination pages — tests completeness, not visibility.
      const rows = page.getByTestId('published-row');
      await expect(rows).toHaveCount(postCount - 1);
    });

    test('sidebar lists tag counts', async ({ page }) => {
      await expect(page.getByText(/Tags · \d+/)).toBeVisible();
    });

    if (newestHashtags.length > 0) {
      test('sidebar renders a real hashtag from the newest post', async ({ page }) => {
        await expect(page.getByTestId('hashtag-list').getByText(`#${newestHashtags[0]}`)).toBeVisible();
      });

      test('clicking a sidebar tag toggles the filter', async ({ page }) => {
        const btn = page.locator(`[data-tag-filter="${newestHashtags[0]}"]`);
        await btn.click();
        await expect(btn).toHaveAttribute('aria-pressed', 'true');
        // The newest post carries this hashtag, so its row/featured stays visible.
        await expect(page.locator('section[data-post]')).toBeVisible();
        await btn.click();
        await expect(btn).toHaveAttribute('aria-pressed', 'false');
      });
    }

    if (postCount > PAGE_SIZE + 1) {
      test('shows only the first page of rows initially', async ({ page }) => {
        const visible = page.locator('[data-testid="published-row"]:not([hidden])');
        await expect(visible).toHaveCount(PAGE_SIZE);
      });

      test('pagination nav is visible with multiple pages', async ({ page }) => {
        await expect(page.getByTestId('pagination-nav')).toBeVisible();
      });

      test('prev button is disabled on first page', async ({ page }) => {
        await expect(page.getByRole('button', { name: 'Previous page' })).toBeDisabled();
      });

      test('next button is disabled on last page', async ({ page }) => {
        const totalPages = Math.ceil((postCount - 1) / PAGE_SIZE);
        for (let i = 1; i < totalPages; i++) {
          await page.getByRole('button', { name: 'Next page' }).click();
        }
        await expect(page.getByRole('button', { name: 'Next page' })).toBeDisabled();
      });

      test('next page button advances to the second page', async ({ page }) => {
        await page.getByRole('button', { name: 'Next page' }).click();
        const visibleOnPage2 = page.locator('[data-testid="published-row"]:not([hidden])');
        const expectedPage2Count = Math.min(PAGE_SIZE, postCount - 1 - PAGE_SIZE);
        await expect(visibleOnPage2).toHaveCount(expectedPage2Count);
        await expect(page.getByRole('button', { name: 'Previous page' })).toBeEnabled();
      });

      test('page number button marks the active page with aria-current', async ({ page }) => {
        await expect(page.getByRole('button', { name: '1' })).toHaveAttribute('aria-current', 'page');
        await page.getByRole('button', { name: 'Next page' }).click();
        await expect(page.getByRole('button', { name: '2' })).toHaveAttribute('aria-current', 'page');
        await expect(page.getByRole('button', { name: '1' })).not.toHaveAttribute('aria-current');
      });

      if (newestHashtags.length > 0) {
        test('activating a tag filter hides the pagination nav', async ({ page }) => {
          const nav = page.getByTestId('pagination-nav');
          const btn = page.locator(`[data-tag-filter="${newestHashtags[0]}"]`);
          await btn.click();
          await expect(nav).toBeHidden();
          await btn.click();
          await expect(nav).toBeVisible();
        });
      }
    }
  });

  test.describe('Blog post detail page', () => {
    // Newest post — the one surfaced as "featured" on the index.
    const slug = newestSlug!;

    test.beforeEach(async ({ page }) => {
      await page.goto(`/blog/${slug}`);
    });

    test('renders the post title as the h1', async ({ page }) => {
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    });

    test('shows the cat breadcrumb for the post', async ({ page }) => {
      await expect(page.getByText(`${slug}.md`)).toBeVisible();
    });

    test('renders the markdown body as prose', async ({ page }) => {
      await expect(page.getByTestId('post-body').locator('p').first()).toBeVisible();
    });

    test('rail links back to the index and offers copy-link', async ({ page }) => {
      await expect(page.getByRole('link', { name: 'Back to the index' })).toBeVisible();
      await expect(page.getByRole('button', { name: /copy link/ })).toBeVisible();
    });

    test('renders an Expressive Code block in the article', async ({ page }) => {
      // Expressive Code owns the <pre> output, so target it under the stable
      // post-body testid rather than a bare tag selector.
      await expect(page.getByTestId('post-body').locator('pre').first()).toBeVisible();
    });

    test('shows the on-this-page TOC', async ({ page }) => {
      await expect(page.locator('[data-toc]')).toBeVisible();
    });

    // Issue #124: external links open in a new tab with a safe rel. The chrome
    // "view raw .md" link is always external; body links are rewritten by
    // rehype-external-links (asserted when the post body has any).
    test('external links open in a new tab with a safe rel', async ({ page }) => {
      const raw = page.getByRole('link', { name: /view raw \.md/ });
      await expect(raw).toHaveAttribute('target', '_blank');
      await expect(raw).toHaveAttribute('rel', /noopener/);
      await expect(raw).toHaveAttribute('rel', /noreferrer/);

      // rehype-external-links tags every rewritten body link with this testid.
      // Asserting the new-tab subset matches the full set keeps it unconditional
      // (holds trivially for a post with no external body links).
      const bodyLinks = page.getByTestId('post-body').getByTestId('post-external-link');
      const newTab = bodyLinks.and(page.locator('[target="_blank"]'));
      await expect(newTab).toHaveCount(await bodyLinks.count());
    });

    if (newestHashtags.length > 0) {
      test('"Filed under" lists the post hashtags', async ({ page }) => {
        await expect(page.getByTestId('filed-under')).toBeVisible();
        await expect(page.getByTestId('filed-under').getByText(`#${newestHashtags[0]}`)).toBeVisible();
      });
    }
  });
}
