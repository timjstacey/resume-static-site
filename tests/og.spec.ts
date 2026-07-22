import { test, expect } from '@playwright/test';
import { readdirSync } from 'node:fs';

// Resolve the newest post slug by reading the markdown sources directly —
// posts.ts imports `astro:content` which only resolves inside the Astro runtime.
const POSTS_DIR = 'src/content/posts';
const newestSlug = readdirSync(POSTS_DIR)
  .filter((f) => f.endsWith('.md'))
  .map((f) => ({
    slug: f.replace(/\.md$/, ''),
  }))[// Sort descending by slug name (date-prefixed slugs are chronological; for
// non-prefixed slugs we fall back to picking the first available).
0]?.slug;

// The OG route only exists when posts are present.
if (newestSlug) {
  test.describe('OG snippet image route', () => {
    test('renders an Expressive Code block inside the og-card at 1200×630', async ({ page }) => {
      await page.goto(`/blog/${newestSlug}/og`);

      // The og-card container must be present.
      const card = page.getByTestId('og-card');
      await expect(card).toBeVisible();

      // The Expressive Code block must be inside the card.
      const codeBlock = card.locator('.expressive-code');
      await expect(codeBlock).toBeVisible();

      // The card must be exactly 1200×630 px — this is the OG image size contract.
      const box = await card.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.width).toBe(1200);
      expect(box!.height).toBe(630);
    });

    test('og-card contains a footer with the brand domain', async ({ page }) => {
      await page.goto(`/blog/${newestSlug}/og`);
      const card = page.getByTestId('og-card');
      await expect(card.getByText('tim.sillysamoyed.com/blog')).toBeVisible();
    });

    test('html element has mocha class for always-dark rendering', async ({ page }) => {
      await page.goto(`/blog/${newestSlug}/og`);
      const html = page.locator('html');
      await expect(html).toHaveClass(/mocha/);
    });
  });
}
