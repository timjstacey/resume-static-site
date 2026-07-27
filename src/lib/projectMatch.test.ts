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
  const key = (days: number, name = 'x') => ({ days, name });

  it('desc puts the more recent (smaller days-ago) first', () => {
    expect(compareByUpdated(key(2), key(10), true)).toBeLessThan(0);
    expect(compareByUpdated(key(10), key(2), true)).toBeGreaterThan(0);
  });

  it('asc reverses the order', () => {
    expect(compareByUpdated(key(2), key(10), false)).toBeGreaterThan(0);
    expect(compareByUpdated(key(10), key(2), false)).toBeLessThan(0);
  });

  it('breaks a same-day tie by name, flipping with the direction', () => {
    expect(compareByUpdated(key(0, 'alpha'), key(0, 'beta'), true)).toBeLessThan(0);
    expect(compareByUpdated(key(0, 'alpha'), key(0, 'beta'), false)).toBeGreaterThan(0);
    expect(compareByUpdated(key(5, 'same'), key(5, 'same'), true)).toBe(0);
  });

  it('sorts a list most-recent-first under desc', () => {
    const days = [10, 2, 99999, 5].map((d) => key(d));
    expect([...days].sort((a, b) => compareByUpdated(a, b, true)).map((k) => k.days)).toEqual([2, 5, 10, 99999]);
  });

  // The grid's contract: toggling the control reverses what's on screen. With
  // tied days-ago a stable sort would leave the tied pair in place and break it.
  it('toggling direction exactly reverses a list containing a tie', () => {
    const keys = [key(0, 'LinkedIn Post Generator'), key(0, 'Resume Static Site'), key(60, 'Agent Sandbox')];
    const descOrder = [...keys].sort((a, b) => compareByUpdated(a, b, true)).map((k) => k.name);
    const ascOrder = [...keys].sort((a, b) => compareByUpdated(a, b, false)).map((k) => k.name);
    expect(ascOrder).toEqual([...descOrder].reverse());
  });
});
