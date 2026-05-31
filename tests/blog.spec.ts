import { test, expect } from '@playwright/test';
import { readFileSync, readdirSync } from 'node:fs';
import { parse } from 'yaml';

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
      const rows = page.locator('a[href^="/blog/"]').filter({ hasText: 'read →' });
      await expect(rows).toHaveCount(postCount - 1);
    });

    test('sidebar lists tag counts', async ({ page }) => {
      await expect(page.getByText(/Tags · \d+/)).toBeVisible();
    });

    if (newestHashtags.length > 0) {
      test('sidebar renders a real hashtag from the newest post', async ({ page }) => {
        await expect(page.getByText(`#${newestHashtags[0]}`).first()).toBeVisible();
      });

      test('clicking a sidebar tag toggles the filter', async ({ page }) => {
        const btn = page.locator(`[data-tag-filter="${newestHashtags[0]}"]`);
        await btn.click();
        await expect(btn).toHaveAttribute('aria-pressed', 'true');
        // The newest post carries this hashtag, so its row/featured stays visible.
        await expect(page.locator('[data-post]').first()).toBeVisible();
        await btn.click();
        await expect(btn).toHaveAttribute('aria-pressed', 'false');
      });
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
      await expect(page.locator('article.prose p').first()).toBeVisible();
    });

    test('rail links back to the index and offers copy-link', async ({ page }) => {
      await expect(page.getByRole('link', { name: 'Back to the index' })).toBeVisible();
      await expect(page.getByRole('button', { name: /copy link/ })).toBeVisible();
    });

    test('renders an Expressive Code block in the article', async ({ page }) => {
      await expect(page.locator('article pre').first()).toBeVisible();
    });

    test('shows the on-this-page TOC', async ({ page }) => {
      await expect(page.locator('[data-toc]')).toBeVisible();
    });

    if (newestHashtags.length > 0) {
      test('"Filed under" lists the post hashtags', async ({ page }) => {
        await expect(page.getByText('Filed under')).toBeVisible();
        await expect(page.getByText(`#${newestHashtags[0]}`).first()).toBeVisible();
      });
    }
  });
}
