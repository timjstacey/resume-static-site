import type { Post } from './posts';
import type { FeedPost } from './feeds';

// Shared feed identity + the CollectionEntry → FeedPost mapper. Kept apart from
// the pure builders in feeds.ts (this side touches the posts collection type).
export const FEED_META = {
  title: 'Tim Stacey — Field notes',
  description: 'Field notes on testing and quality engineering by Tim Stacey.',
  site: 'https://tim.sillysamoyed.com',
} as const;

export const toFeedPosts = (posts: Post[]): FeedPost[] =>
  posts.map((p) => ({
    slug: p.id,
    title: p.data.title,
    date: p.data.date,
    excerpt: p.data.excerpt,
    hashtags: p.data.hashtags,
  }));
