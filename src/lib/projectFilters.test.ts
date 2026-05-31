import { describe, it, expect } from 'vitest';
import { PROJECT_FILTERS } from './projectFilters';
import { getProjects } from './data';

describe('PROJECT_FILTERS', () => {
  it('brackets the lang pills with all/pinned', () => {
    expect(PROJECT_FILTERS[0]).toBe('all');
    expect(PROJECT_FILTERS[PROJECT_FILTERS.length - 1]).toBe('pinned');
  });

  it('derives the middle pills from the distinct project langs (lowercased, sorted, deduped)', () => {
    const expected = [
      ...new Set(
        getProjects()
          .map((p) => p.lang)
          .filter(Boolean) as string[]
      ),
    ]
      .map((l) => l.toLowerCase())
      .sort();
    expect(PROJECT_FILTERS.slice(1, -1)).toEqual(expected);
  });

  it('surfaces a pill for every lang in the data', () => {
    for (const p of getProjects()) {
      if (p.lang) expect(PROJECT_FILTERS).toContain(p.lang.toLowerCase());
    }
  });
});
