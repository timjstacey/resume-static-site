import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPosts } from '../lib/posts';
import { FEED_META, toFeedPosts } from '../lib/feedSource';
import { feedItems, rssItems } from '../lib/feeds';

// RSS 2.0 feed (excerpt-only). Item shaping lives in lib/feeds.ts (unit-tested).
export async function GET(context: APIContext) {
  const site = context.site?.toString() ?? FEED_META.site;
  const items = feedItems(toFeedPosts(await getPosts()), site);
  return rss({
    title: FEED_META.title,
    description: FEED_META.description,
    site,
    items: rssItems(items),
  });
}
