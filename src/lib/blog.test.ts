import { describe, expect, it } from 'vitest';
import { archive, hashtagCounts, type PostLike } from './blog';

const posts: PostLike[] = [
  { tag: 'Strategy', date: new Date('2026-05-24') },
  { tag: 'Practice', date: new Date('2026-05-11') },
  { tag: 'Meta', date: new Date('2026-04-02') },
  { tag: 'Strategy', date: new Date('2025-12-10') },
];

describe('hashtagCounts', () => {
  it('counts hashtags across posts, ranked desc then alpha', () => {
    const result = hashtagCounts([{ hashtags: ['Playwright', 'AI'] }, { hashtags: ['Playwright', 'Testing'] }]);
    expect(result[0]).toEqual({ tag: 'Playwright', count: 2 });
    expect(result.map((t) => t.tag)).toEqual(['Playwright', 'AI', 'Testing']);
  });

  it('returns empty for no posts', () => {
    expect(hashtagCounts([])).toEqual([]);
  });
});

describe('archive', () => {
  it('groups by year newest-first with month breakdown', () => {
    const result = archive(posts);
    expect(result[0]!.year).toBe(2026);
    expect(result[0]!.count).toBe(3);
    expect(result[0]!.months[0]).toEqual({ month: 'May', count: 2 });
    expect(result[0]!.months[1]).toEqual({ month: 'Apr', count: 1 });
    expect(result[1]).toEqual({ year: 2025, count: 1, months: [{ month: 'Dec', count: 1 }] });
  });
});
