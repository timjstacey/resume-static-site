import { describe, it, expect } from 'vitest';
import { projectMatchesFilter, tagParam, compareByUpdated } from './projectMatch';

describe('projectMatchesFilter', () => {
  it("'all' matches everything, including a tagless project", () => {
    expect(projectMatchesFilter(['typescript', 'pinned'], 'all')).toBe(true);
    expect(projectMatchesFilter([], 'all')).toBe(true);
  });

  it('matches when the tag token is present', () => {
    expect(projectMatchesFilter(['typescript', 'pinned'], 'pinned')).toBe(true);
    expect(projectMatchesFilter(['shell'], 'shell')).toBe(true);
  });

  it('does not match when the tag token is absent', () => {
    expect(projectMatchesFilter(['typescript'], 'python')).toBe(false);
    expect(projectMatchesFilter([], 'pinned')).toBe(false);
  });
});

describe('tagParam', () => {
  it("drops the param for 'all'", () => {
    expect(tagParam('all')).toBeNull();
  });

  it('passes any other filter through', () => {
    expect(tagParam('shell')).toBe('shell');
    expect(tagParam('pinned')).toBe('pinned');
  });
});

describe('compareByUpdated', () => {
  it('desc puts the more recent (smaller days-ago) first', () => {
    expect(compareByUpdated(2, 10, true)).toBeLessThan(0);
    expect(compareByUpdated(10, 2, true)).toBeGreaterThan(0);
  });

  it('asc reverses the order', () => {
    expect(compareByUpdated(2, 10, false)).toBeGreaterThan(0);
    expect(compareByUpdated(10, 2, false)).toBeLessThan(0);
  });

  it('is stable (0) for equal recency', () => {
    expect(compareByUpdated(5, 5, true)).toBe(0);
    expect(compareByUpdated(5, 5, false)).toBe(0);
  });

  it('sorts a list most-recent-first under desc', () => {
    const days = [10, 2, 99999, 5];
    expect([...days].sort((a, b) => compareByUpdated(a, b, true))).toEqual([2, 5, 10, 99999]);
  });
});
