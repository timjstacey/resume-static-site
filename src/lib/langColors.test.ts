import { describe, it, expect } from 'vitest';
import { langColor, LANG_COLORS } from './langColors';

describe('langColor', () => {
  it('returns the brand hex for a known language', () => {
    expect(langColor('TypeScript')).toBe('#3178c6');
    expect(langColor('Shell')).toBe('#89e051');
  });

  it('falls back to overlay2 for an unknown language', () => {
    expect(langColor('Brainfuck')).toBe('#9399b2');
  });

  it('falls back when the language is undefined', () => {
    expect(langColor(undefined)).toBe('#9399b2');
  });

  it('every mapped colour is a hex string', () => {
    for (const hex of Object.values(LANG_COLORS)) {
      expect(hex).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });
});
