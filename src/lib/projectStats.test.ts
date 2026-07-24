import { describe, expect, it } from 'vitest';
import { buildProjectStats, nameWithOwner } from './projectStats';

describe('nameWithOwner', () => {
  it('parses a plain repo URL', () => {
    expect(nameWithOwner('https://github.com/timjstacey/resume-static-site')).toBe('timjstacey/resume-static-site');
  });
  it('strips a .git suffix and a trailing slash', () => {
    expect(nameWithOwner('https://github.com/o/r.git')).toBe('o/r');
    expect(nameWithOwner('https://github.com/o/r/')).toBe('o/r');
  });
  it('returns null for a non-github URL', () => {
    expect(nameWithOwner('https://gitlab.com/o/r')).toBeNull();
  });
});

describe('buildProjectStats', () => {
  it('keys by repo URL, truncates the date, sorts keys', () => {
    const stats = buildProjectStats([
      { repo: 'https://github.com/o/z', raw: { stars: 3, forks: 1, pushed: '2026-05-31T10:00:00Z' } },
      { repo: 'https://github.com/o/a', raw: { stars: 0, forks: 0, pushed: '2026-01-02T00:00:00Z' } },
    ]);
    expect(Object.keys(stats)).toEqual(['https://github.com/o/a', 'https://github.com/o/z']);
    expect(stats['https://github.com/o/z']).toEqual({ stars: 3, forks: 1, updatedAt: '2026-05-31' });
    expect(stats['https://github.com/o/a']!.updatedAt).toBe('2026-01-02');
  });

  it('returns an empty record for no entries', () => {
    expect(buildProjectStats([])).toEqual({});
  });
});
