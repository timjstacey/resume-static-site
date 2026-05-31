import type { APIContext } from 'astro';
import { getPosts } from '../lib/posts';

const TITLE = 'Tim Stacey — Field notes';
const DESCRIPTION = 'Field notes on testing and quality engineering by Tim Stacey.';
const SITE = 'https://tim.sillysamoyed.com';

// JSON Feed 1.1 (excerpt-only). https://www.jsonfeed.org/version/1.1/
export async function GET(context: APIContext) {
  const site = (context.site?.toString() ?? SITE).replace(/\/$/, '');
  const posts = await getPosts();

  const feed = {
    version: 'https://jsonfeed.org/version/1.1',
    title: TITLE,
    description: DESCRIPTION,
    home_page_url: `${site}/blog`,
    feed_url: `${site}/feed.json`,
    authors: [{ name: 'Tim Stacey', url: site }],
    items: posts.map((post) => ({
      id: `${site}/blog/${post.id}`,
      url: `${site}/blog/${post.id}`,
      title: post.data.title,
      summary: post.data.excerpt,
      date_published: post.data.date.toISOString(),
      tags: post.data.hashtags,
    })),
  };

  return new Response(JSON.stringify(feed, null, 2), {
    headers: { 'Content-Type': 'application/feed+json; charset=utf-8' },
  });
}
