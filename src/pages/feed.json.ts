import type { APIContext } from 'astro';
import { getPosts } from '../lib/posts';
import { FEED_META, toFeedPosts } from '../lib/feedSource';
import { buildJsonFeed, feedItems } from '../lib/feeds';

// JSON Feed 1.1 (excerpt-only). Object built in lib/feeds.ts (unit-tested).
export async function GET(context: APIContext) {
  const site = context.site?.toString() ?? FEED_META.site;
  const items = feedItems(toFeedPosts(await getPosts()), site);
  return new Response(JSON.stringify(buildJsonFeed(items, { ...FEED_META, site }), null, 2), {
    headers: { 'Content-Type': 'application/feed+json; charset=utf-8' },
  });
}
