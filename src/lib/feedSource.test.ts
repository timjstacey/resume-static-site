import { describe, it, expect } from 'vitest';
import { FEED_META, toFeedPosts } from './feedSource';
import type { Post } from './posts';

const posts = [
  {
    id: 'playwright-ai-agents',
    data: {
      title: 'Playwright agents',
      date: new Date('2026-05-10'),
      excerpt: 'Three agents in the runner.',
      hashtags: ['Playwright', 'AI'],
    },
  },
] as unknown as Post[];

describe('feedSource', () => {
  it('exposes the shared feed identity', () => {
    expect(FEED_META.site).toBe('https://tim.sillysamoyed.com');
    expect(FEED_META.title.length).toBeGreaterThan(0);
  });

  it('maps a collection entry to a FeedPost (id → slug)', () => {
    expect(toFeedPosts(posts)).toEqual([
      {
        slug: 'playwright-ai-agents',
        title: 'Playwright agents',
        date: new Date('2026-05-10'),
        excerpt: 'Three agents in the runner.',
        hashtags: ['Playwright', 'AI'],
      },
    ]);
  });

  it('maps an empty list to an empty list', () => {
    expect(toFeedPosts([])).toEqual([]);
  });
});
