// Pure feed builders, kept free of `astro:content` so they unit-test directly.
// The /rss.xml, /atom.xml, /feed.json endpoints map their collection entries to
// FeedPost and call these.

export interface FeedPost {
  slug: string;
  title: string;
  date: Date;
  excerpt: string;
  hashtags: string[];
}

export interface FeedMeta {
  title: string;
  description: string;
  site: string;
}

export interface FeedItem {
  title: string;
  url: string;
  date: Date;
  excerpt: string;
  hashtags: string[];
}

const trimSlash = (s: string) => s.replace(/\/$/, '');

const xmlEscape = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Normalise posts into feed items with absolute post URLs (input order preserved).
export function feedItems(posts: FeedPost[], site: string): FeedItem[] {
  const base = trimSlash(site);
  return posts.map((p) => ({
    title: p.title,
    url: `${base}/blog/${p.slug}`,
    date: p.date,
    excerpt: p.excerpt,
    hashtags: p.hashtags,
  }));
}

// Item shape consumed by @astrojs/rss `rss({ items })`.
export function rssItems(items: FeedItem[]) {
  return items.map((i) => ({
    title: i.title,
    link: i.url,
    pubDate: i.date,
    description: i.excerpt,
    categories: i.hashtags,
  }));
}

// Atom 1.0 document.
export function buildAtom(items: FeedItem[], meta: FeedMeta): string {
  const site = trimSlash(meta.site);
  const updated = (items[0]?.date ?? new Date()).toISOString();
  const entries = items
    .map((i) => {
      const categories = i.hashtags.map((h) => `    <category term="${xmlEscape(h)}"/>`).join('\n');
      return `  <entry>
    <title>${xmlEscape(i.title)}</title>
    <link href="${i.url}"/>
    <id>${i.url}</id>
    <updated>${i.date.toISOString()}</updated>
    <summary>${xmlEscape(i.excerpt)}</summary>
${categories}
  </entry>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${xmlEscape(meta.title)}</title>
  <subtitle>${xmlEscape(meta.description)}</subtitle>
  <link href="${site}/atom.xml" rel="self"/>
  <link href="${site}/blog"/>
  <id>${site}/blog</id>
  <updated>${updated}</updated>
  <author><name>Tim Stacey</name></author>
${entries}
</feed>
`;
}

// JSON Feed 1.1 object. https://www.jsonfeed.org/version/1.1/
export function buildJsonFeed(items: FeedItem[], meta: FeedMeta) {
  const site = trimSlash(meta.site);
  return {
    version: 'https://jsonfeed.org/version/1.1',
    title: meta.title,
    description: meta.description,
    home_page_url: `${site}/blog`,
    feed_url: `${site}/feed.json`,
    authors: [{ name: 'Tim Stacey', url: site }],
    items: items.map((i) => ({
      id: i.url,
      url: i.url,
      title: i.title,
      summary: i.excerpt,
      date_published: i.date.toISOString(),
      tags: i.hashtags,
    })),
  };
}
