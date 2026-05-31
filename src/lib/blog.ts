import type { Draft, PostTag } from './schemas';

export interface PostLike {
  tag: PostTag;
  date: Date;
}

export interface TagCount {
  tag: PostTag;
  count: number;
}

// Tag occurrences across published posts + drafts, ranked most-used first.
export function tagCounts(posts: PostLike[], drafts: Draft[]): TagCount[] {
  const counts = new Map<PostTag, number>();
  for (const p of posts) counts.set(p.tag, (counts.get(p.tag) ?? 0) + 1);
  for (const d of drafts) counts.set(d.tag, (counts.get(d.tag) ?? 0) + 1);
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

export interface HashtagCount {
  tag: string;
  count: number;
}

// Hashtag occurrences across published posts, ranked most-used first. These
// carry over from the source LinkedIn post and drive the /blog Tags sidebar.
export function hashtagCounts(posts: { hashtags: string[] }[]): HashtagCount[] {
  const counts = new Map<string, number>();
  for (const p of posts) for (const h of p.hashtags) counts.set(h, (counts.get(h) ?? 0) + 1);
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

export interface ArchiveMonth {
  month: string;
  count: number;
}

export interface ArchiveYear {
  year: number;
  count: number;
  months: ArchiveMonth[];
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Year → month breakdown of published posts, newest year first.
export function archive(posts: PostLike[]): ArchiveYear[] {
  const byYear = new Map<number, Map<number, number>>();
  for (const p of posts) {
    const y = p.date.getFullYear();
    const m = p.date.getMonth();
    if (!byYear.has(y)) byYear.set(y, new Map());
    const months = byYear.get(y)!;
    months.set(m, (months.get(m) ?? 0) + 1);
  }
  return [...byYear.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([year, months]) => ({
      year,
      count: [...months.values()].reduce((a, b) => a + b, 0),
      months: [...months.entries()].sort((a, b) => b[0] - a[0]).map(([m, count]) => ({ month: MONTHS[m]!, count })),
    }));
}
