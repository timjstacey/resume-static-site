import type { APIContext } from 'astro';
import { getPosts } from '../lib/posts';
import { FEED_META, toFeedPosts } from '../lib/feedSource';
import { buildAtom, feedItems } from '../lib/feeds';

// Atom 1.0 feed (excerpt-only). Document built in lib/feeds.ts (unit-tested).
export async function GET(context: APIContext) {
  const site = context.site?.toString() ?? FEED_META.site;
  const items = feedItems(toFeedPosts(await getPosts()), site);
  return new Response(buildAtom(items, { ...FEED_META, site }), {
    headers: { 'Content-Type': 'application/atom+xml; charset=utf-8' },
  });
}
