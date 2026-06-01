import { describe, expect, it } from 'vitest';
import { inWindow, pageCount, pageView } from './blogPagination';

describe('pageCount', () => {
  it('rounds partial pages up', () => {
    expect(pageCount(9, 10)).toBe(1);
    expect(pageCount(11, 10)).toBe(2);
    expect(pageCount(20, 10)).toBe(2);
    expect(pageCount(21, 10)).toBe(3);
  });

  it('is at least 1 even with no rows', () => {
    expect(pageCount(0, 10)).toBe(1);
  });

  it('guards a zero/negative page size', () => {
    expect(pageCount(50, 0)).toBe(1);
    expect(pageCount(50, -5)).toBe(1);
  });
});

describe('pageView — single page', () => {
  it('hides the nav when everything fits on one page', () => {
    const v = pageView({ total: 9, pageSize: 10, currentPage: 0, filterActive: false });
    expect(v.showNav).toBe(false);
    expect(v.totalPages).toBe(1);
    // This is the case that shipped dormant: 9 rows, PAGE_SIZE 10 → no nav.
  });

  it('disables both controls on a lone page', () => {
    const v = pageView({ total: 9, pageSize: 10, currentPage: 0, filterActive: false });
    expect(v.prevDisabled).toBe(true);
    expect(v.nextDisabled).toBe(true);
  });
});

describe('pageView — multiple pages', () => {
  it('shows the nav once rows overflow a page', () => {
    const v = pageView({ total: 25, pageSize: 10, currentPage: 0, filterActive: false });
    expect(v.showNav).toBe(true);
    expect(v.totalPages).toBe(3);
  });

  it('windows the first page and disables prev only', () => {
    const v = pageView({ total: 25, pageSize: 10, currentPage: 0, filterActive: false });
    expect(v.start).toBe(0);
    expect(v.end).toBe(10);
    expect(v.prevDisabled).toBe(true);
    expect(v.nextDisabled).toBe(false);
  });

  it('windows a middle page with both controls enabled', () => {
    const v = pageView({ total: 25, pageSize: 10, currentPage: 1, filterActive: false });
    expect(v.start).toBe(10);
    expect(v.end).toBe(20);
    expect(v.prevDisabled).toBe(false);
    expect(v.nextDisabled).toBe(false);
  });

  it('disables next only on the last page', () => {
    const v = pageView({ total: 25, pageSize: 10, currentPage: 2, filterActive: false });
    expect(v.start).toBe(20);
    expect(v.end).toBe(30);
    expect(v.prevDisabled).toBe(false);
    expect(v.nextDisabled).toBe(true);
  });
});

describe('pageView — clamping', () => {
  it('clamps an out-of-range page up to the last page', () => {
    const v = pageView({ total: 25, pageSize: 10, currentPage: 9, filterActive: false });
    expect(v.currentPage).toBe(2);
    expect(v.nextDisabled).toBe(true);
  });

  it('clamps a negative page to the first page', () => {
    const v = pageView({ total: 25, pageSize: 10, currentPage: -3, filterActive: false });
    expect(v.currentPage).toBe(0);
    expect(v.prevDisabled).toBe(true);
  });
});

describe('pageView — filter active', () => {
  it('hides the nav and spans every row', () => {
    const v = pageView({ total: 25, pageSize: 10, currentPage: 1, filterActive: true });
    expect(v.showNav).toBe(false);
    expect(v.start).toBe(0);
    expect(v.end).toBe(25);
  });
});

describe('inWindow', () => {
  const v = pageView({ total: 25, pageSize: 10, currentPage: 1, filterActive: false });

  it('includes rows inside the window bounds', () => {
    expect(inWindow(10, v)).toBe(true);
    expect(inWindow(19, v)).toBe(true);
  });

  it('excludes rows outside the window bounds', () => {
    expect(inWindow(9, v)).toBe(false);
    expect(inWindow(20, v)).toBe(false);
  });
});
