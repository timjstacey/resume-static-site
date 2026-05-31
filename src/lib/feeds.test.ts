import { describe, expect, it } from 'vitest';
import { buildAtom, buildJsonFeed, feedItems, rssItems, type FeedMeta, type FeedPost } from './feeds';

const meta: FeedMeta = {
  title: 'Field notes',
  description: 'Testing & quality.',
  site: 'https://tim.sillysamoyed.com/', // trailing slash on purpose
};

const posts: FeedPost[] = [
  {
    slug: 'playwright-ai-agents',
    title: 'Playwright agents & the "QA" gap',
    date: new Date('2026-05-10T00:00:00Z'),
    excerpt: 'Three agents in the runner.',
    hashtags: ['Playwright', 'AI'],
  },
  {
    slug: 'hooks-not-heroes',
    title: 'Hooks, not heroes',
    date: new Date('2026-05-01T00:00:00Z'),
    excerpt: 'A ladder of cheap checks.',
    hashtags: [],
  },
];

describe('feedItems', () => {
  it('builds absolute post URLs and trims a trailing slash from site', () => {
    const items = feedItems(posts, meta.site);
    expect(items[0]!.url).toBe('https://tim.sillysamoyed.com/blog/playwright-ai-agents');
  });

  it('preserves input order', () => {
    const items = feedItems(posts, meta.site);
    expect(items.map((i) => i.url)).toEqual([
      'https://tim.sillysamoyed.com/blog/playwright-ai-agents',
      'https://tim.sillysamoyed.com/blog/hooks-not-heroes',
    ]);
  });
});

describe('rssItems', () => {
  it('maps to the @astrojs/rss item shape with hashtags as categories', () => {
    const [first] = rssItems(feedItems(posts, meta.site));
    expect(first).toEqual({
      title: 'Playwright agents & the "QA" gap',
      link: 'https://tim.sillysamoyed.com/blog/playwright-ai-agents',
      pubDate: new Date('2026-05-10T00:00:00Z'),
      description: 'Three agents in the runner.',
      categories: ['Playwright', 'AI'],
    });
  });
});

describe('buildAtom', () => {
  const xml = buildAtom(feedItems(posts, meta.site), { ...meta, site: meta.site });

  it('is a well-formed Atom feed with self + blog links', () => {
    expect(xml).toContain('<feed xmlns="http://www.w3.org/2005/Atom">');
    expect(xml).toContain('<link href="https://tim.sillysamoyed.com/atom.xml" rel="self"/>');
    expect(xml).toContain('<id>https://tim.sillysamoyed.com/blog/playwright-ai-agents</id>');
  });

  it('escapes XML-special characters in titles', () => {
    expect(xml).toContain('<title>Playwright agents &amp; the &quot;QA&quot; gap</title>');
    expect(xml).not.toContain('"QA"</title>');
  });

  it('emits a category per hashtag', () => {
    expect(xml).toContain('<category term="Playwright"/>');
    expect(xml).toContain('<category term="AI"/>');
  });

  it('falls back to "now" for the updated stamp when there are no items', () => {
    const empty = buildAtom([], { ...meta, site: meta.site });
    expect(empty).toContain('<feed xmlns="http://www.w3.org/2005/Atom">');
    expect(empty).toMatch(/<updated>\d{4}-\d{2}-\d{2}T/);
  });
});

describe('buildJsonFeed', () => {
  const feed = buildJsonFeed(feedItems(posts, meta.site), { ...meta, site: meta.site });

  it('declares JSON Feed 1.1 with feed + home URLs', () => {
    expect(feed.version).toBe('https://jsonfeed.org/version/1.1');
    expect(feed.feed_url).toBe('https://tim.sillysamoyed.com/feed.json');
    expect(feed.home_page_url).toBe('https://tim.sillysamoyed.com/blog');
  });

  it('maps items with ISO dates, absolute URLs, and hashtags as tags', () => {
    expect(feed.items[0]).toMatchObject({
      id: 'https://tim.sillysamoyed.com/blog/playwright-ai-agents',
      url: 'https://tim.sillysamoyed.com/blog/playwright-ai-agents',
      title: 'Playwright agents & the "QA" gap',
      date_published: '2026-05-10T00:00:00.000Z',
      tags: ['Playwright', 'AI'],
    });
  });
});
