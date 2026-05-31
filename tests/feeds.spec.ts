import { test, expect } from '@playwright/test';
import { readFileSync, readdirSync } from 'node:fs';
import { parse } from 'yaml';

// Feed content correctness is covered by src/lib/feeds.test.ts (unit). This is a
// thin smoke check: the routes serve, with the right content-type, listing posts.
// Feeds are NOT behind FEATURES.blog — the endpoints always emit — they just need
// a post to list, so gate only on post presence.
const POSTS_DIR = 'src/content/posts';
const postFiles = readdirSync(POSTS_DIR).filter((f) => f.endsWith('.md'));
const newestSlug = postFiles
  .map((f) => ({
    slug: f.replace(/\.md$/, ''),
    date: (parse(readFileSync(`${POSTS_DIR}/${f}`, 'utf-8').split('---')[1]!) as { date: string }).date,
  }))
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]?.slug;

if (postFiles.length > 0) {
  const feeds = [
    { path: '/rss.xml', type: 'xml' },
    { path: '/atom.xml', type: 'xml' },
    { path: '/feed.json', type: 'json' },
  ];

  test.describe('Feeds', () => {
    for (const { path, type } of feeds) {
      test(`${path} serves a feed listing the newest post`, async ({ request }) => {
        const res = await request.get(path);
        expect(res.status()).toBe(200);
        expect(res.headers()['content-type']).toContain(type);
        expect(await res.text()).toContain(`/blog/${newestSlug}`);
      });
    }
  });
}
