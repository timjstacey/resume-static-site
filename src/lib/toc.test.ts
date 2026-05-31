import { describe, it, expect } from 'vitest';
import { activeHeadingId, type HeadingPos } from './toc';

const headings: HeadingPos[] = [
  { id: 'a', top: -200 },
  { id: 'b', top: -50 },
  { id: 'c', top: 400 },
];

describe('activeHeadingId', () => {
  it('returns null when there are no headings', () => {
    expect(activeHeadingId([], { offset: 100, atBottom: false })).toBeNull();
  });

  it('defaults to the first heading before anything passes the offset line', () => {
    const top = [
      { id: 'a', top: 300 },
      { id: 'b', top: 600 },
    ];
    expect(activeHeadingId(top, { offset: 100, atBottom: false })).toBe('a');
  });

  it('picks the last heading whose top has scrolled past the offset', () => {
    // a (-200) and b (-50) are past the 100px line; c (400) is not.
    expect(activeHeadingId(headings, { offset: 100, atBottom: false })).toBe('b');
  });

  it('treats a heading exactly on the offset line as passed', () => {
    const onLine = [
      { id: 'a', top: -10 },
      { id: 'b', top: 100 },
    ];
    expect(activeHeadingId(onLine, { offset: 100, atBottom: false })).toBe('b');
  });

  it('forces the final heading when scrolled to the bottom (the last-item bug)', () => {
    // Even though c has not crossed the line, being at the bottom selects it.
    expect(activeHeadingId(headings, { offset: 100, atBottom: true })).toBe('c');
  });
});
