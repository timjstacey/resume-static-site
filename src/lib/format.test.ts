import { describe, it, expect } from 'vitest';
import { fmtYM } from './format';

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
