import { describe, it, expect, beforeEach, vi } from 'vitest';

// `posts.ts` imports `astro:content`, a virtual module that only resolves in the
// Astro runtime — mock it so the sort logic can be unit-tested.
const { getCollection } = vi.hoisted(() => ({ getCollection: vi.fn() }));
vi.mock('astro:content', () => ({ getCollection }));

import { getPosts } from './posts';

describe('getPosts', () => {
  beforeEach(() => getCollection.mockReset());

  it('returns posts newest-first by date', async () => {
    getCollection.mockResolvedValue([
      { id: 'a', data: { date: new Date('2026-01-01') } },
      { id: 'b', data: { date: new Date('2026-05-01') } },
      { id: 'c', data: { date: new Date('2026-03-01') } },
    ]);
    const posts = await getPosts();
    expect(posts.map((p) => p.id)).toEqual(['b', 'c', 'a']);
  });

  it('returns an empty array when there are no posts', async () => {
    getCollection.mockResolvedValue([]);
    expect(await getPosts()).toEqual([]);
  });
});
