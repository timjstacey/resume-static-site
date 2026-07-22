import { test, expect } from '@playwright/test';
import { readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Pick any one post slug by reading the markdown sources directly — posts.ts
// imports `astro:content`, which only resolves inside the Astro runtime. The OG
// route exists for every post, so which slug we sample does not matter; take the
// first. Absolute path so the read never silently returns [] if the CWD shifts.
const POSTS_DIR = path.resolve(fileURLToPath(import.meta.url), '../../src/content/posts');
const postSlug = readdirSync(POSTS_DIR)
  .filter((f) => f.endsWith('.md'))
  .map((f) => f.replace(/\.md$/, ''))[0];

// The OG route only exists when posts are present.
if (postSlug) {
  test.describe('OG snippet image route', () => {
    test('renders an Expressive Code block inside the og-card at 1200×630', async ({ page }) => {
      await page.goto(`/blog/${postSlug}/og`);

      // The og-card container must be present.
      const card = page.getByTestId('og-card');
      await expect(card).toBeVisible();

      // The Expressive Code block must be inside the card.
      const codeBlock = card.locator('.expressive-code');
      await expect(codeBlock).toBeVisible();

      // The card must be exactly 1200×630 px — this is the OG image size contract.
      // Optional chaining (not a non-null assertion): a null box fails the
      // toBe checks, and it keeps a conditional out of the test body.
      const box = await card.boundingBox();
      expect(box?.width).toBe(1200);
      expect(box?.height).toBe(630);
    });

    test('og-card contains a footer with the brand domain', async ({ page }) => {
      await page.goto(`/blog/${postSlug}/og`);
      const card = page.getByTestId('og-card');
      await expect(card.getByText('tim.sillysamoyed.com/blog')).toBeVisible();
    });

    test('html element has mocha class for always-dark rendering', async ({ page }) => {
      await page.goto(`/blog/${postSlug}/og`);
      const html = page.locator('html');
      await expect(html).toHaveClass(/mocha/);
    });
  });
}
