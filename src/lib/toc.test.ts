import { describe, it, expect } from 'vitest';
import { activeHeadingId, pinExpired, type HeadingPos } from './toc';

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

  it('honours a clicked heading over the bottom guard (the second-from-bottom bug)', () => {
    // Clicking a heading that bottoms the page out must land on it, not on the
    // last heading the atBottom guard would otherwise force.
    expect(activeHeadingId(headings, { offset: 100, atBottom: true, pinned: 'b' })).toBe('b');
  });

  it('ignores a pinned id that is not a real heading', () => {
    expect(activeHeadingId(headings, { offset: 100, atBottom: true, pinned: 'gone' })).toBe('c');
  });

  it('falls through to the scroll position when nothing is pinned', () => {
    expect(activeHeadingId(headings, { offset: 100, atBottom: false, pinned: null })).toBe('b');
  });
});

describe('pinExpired', () => {
  const PIN_WINDOW = 800;

  it('is not expired within the settle window', () => {
    expect(pinExpired(500, 0, PIN_WINDOW)).toBe(false);
  });

  it('is not expired exactly on the boundary', () => {
    expect(pinExpired(800, 0, PIN_WINDOW)).toBe(false);
  });

  it('is expired once past the window', () => {
    expect(pinExpired(801, 0, PIN_WINDOW)).toBe(true);
  });
});
