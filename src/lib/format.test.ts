import { describe, it, expect } from 'vitest';
import { fmtYM, daysAgo, fmtRelative } from './format';

describe('fmtYM', () => {
  it('formats January correctly', () => {
    expect(fmtYM('2025-01')).toBe('Jan 2025');
  });

  it('formats December correctly', () => {
    expect(fmtYM('2023-12')).toBe('Dec 2023');
  });

  it('formats mid-year month correctly', () => {
    expect(fmtYM('2022-06')).toBe('Jun 2022');
  });

  it('handles year boundary correctly', () => {
    expect(fmtYM('2000-01')).toBe('Jan 2000');
  });
});

describe('daysAgo', () => {
  const now = new Date('2026-05-31T12:00:00Z');

  it('counts whole days between an ISO date and now', () => {
    expect(daysAgo('2026-05-29', now)).toBe(2);
    expect(daysAgo('2026-05-24', now)).toBe(7);
    expect(daysAgo('2026-05-10', now)).toBe(21);
  });

  it('returns 0 for today', () => {
    expect(daysAgo('2026-05-31', now)).toBe(0);
  });

  it('clamps future dates to 0', () => {
    expect(daysAgo('2026-06-15', now)).toBe(0);
  });
});

describe('fmtRelative', () => {
  const now = new Date('2026-05-31T12:00:00Z');

  it('labels same-day as today', () => {
    expect(fmtRelative('2026-05-31', now)).toBe('today');
  });

  it('uses days under a week', () => {
    expect(fmtRelative('2026-05-29', now)).toBe('2d ago');
  });

  it('uses weeks under a month', () => {
    expect(fmtRelative('2026-05-24', now)).toBe('1w ago');
    expect(fmtRelative('2026-05-10', now)).toBe('3w ago');
  });

  it('uses months under a year', () => {
    expect(fmtRelative('2026-02-20', now)).toBe('3mo ago');
  });

  it('uses years past 365 days', () => {
    expect(fmtRelative('2025-05-31', now)).toBe('1y ago');
  });
});
