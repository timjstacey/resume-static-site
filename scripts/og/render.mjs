#!/usr/bin/env node
// Renders OG snippet images for blog posts.
// Loads /blog/SLUG/og against pnpm preview (port 4322), screenshots the
// #og-card element, and writes public/og/SLUG.png.
//
// Usage:
//   node scripts/og/render.mjs              # render all posts
//   node scripts/og/render.mjs --slug SLUG  # render one post
//
// Prerequisite: run `pnpm build && pnpm preview &` before calling this script.
import { chromium } from '@playwright/test';
import { mkdirSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(fileURLToPath(import.meta.url), '../../..');
const OUT_DIR = path.join(ROOT, 'public', 'og');
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:4322';

mkdirSync(OUT_DIR, { recursive: true });

// Parse --slug argument.
const slugArgIdx = process.argv.indexOf('--slug');
const singleSlug = slugArgIdx !== -1 ? process.argv[slugArgIdx + 1] : null;

// Derive slugs from src/content/posts/*.md when not given a single slug.
function allSlugs() {
  const postsDir = path.join(ROOT, 'src', 'content', 'posts');
  return readdirSync(postsDir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace(/\.md$/, ''));
}

const slugs = singleSlug ? [singleSlug] : allSlugs();

if (slugs.length === 0) {
  console.error('No slugs found. Check src/content/posts/ or your --slug argument.');
  process.exit(1);
}

console.log(`Rendering ${slugs.length} OG image(s) from ${BASE_URL} ...`);

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1200, height: 630 },
});

let failed = 0;
for (const slug of slugs) {
  const url = `${BASE_URL}/blog/${slug}/og`;
  const outFile = path.join(OUT_DIR, `${slug}.png`);
  try {
    const page = await context.newPage();
    await page.goto(url, { waitUntil: 'networkidle' });
    const card = page.locator('#og-card');
    await card.waitFor({ state: 'visible' });
    await card.screenshot({ path: outFile });
    await page.close();
    console.log(`  wrote ${path.relative(ROOT, outFile)}`);
  } catch (err) {
    console.error(`  FAILED ${slug}: ${String(err instanceof Error ? err.message : err)}`);
    failed++;
  }
}

await browser.close();

if (failed > 0) {
  console.error(`${failed} image(s) failed.`);
  process.exit(1);
}

console.log('Done.');
