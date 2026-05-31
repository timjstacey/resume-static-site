import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPosts } from '../lib/posts';

const TITLE = 'Tim Stacey — Field notes';
const DESCRIPTION = 'Field notes on testing and quality engineering by Tim Stacey.';
const SITE = 'https://tim.sillysamoyed.com';

// RSS 2.0 feed (excerpt-only). Items link to the rendered post pages.
export async function GET(context: APIContext) {
  const posts = await getPosts();
  return rss({
    title: TITLE,
    description: DESCRIPTION,
    site: context.site ?? SITE,
    items: posts.map((post) => ({
      title: post.data.title,
      link: `/blog/${post.id}`,
      pubDate: post.data.date,
      description: post.data.excerpt,
      categories: post.data.hashtags,
    })),
  });
}
