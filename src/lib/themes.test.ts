import { describe, it, expect } from 'vitest';
import {
  FLAVORS,
  FLAVOR_IDS,
  THEME_TRIGGER_LABEL,
  isFlavorId,
  resolveFlavor,
  flavorFromClasses,
  rovingIndex,
} from './themes';

describe('themes', () => {
  it('lists the four Catppuccin flavours in palette order', () => {
    expect(FLAVORS.map((f) => f.id)).toEqual(['latte', 'frappe', 'macchiato', 'mocha']);
  });

  it('gives each flavour a label and a hex bg', () => {
    for (const f of FLAVORS) {
      expect(f.label.length).toBeGreaterThan(0);
      expect(f.bg).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it('exposes the theme trigger label', () => {
    expect(THEME_TRIGGER_LABEL).toBe('Color theme');
  });

  it('FLAVOR_IDS mirrors the flavour ids', () => {
    expect(FLAVOR_IDS).toEqual(['latte', 'frappe', 'macchiato', 'mocha']);
  });
});

describe('isFlavorId', () => {
  it('accepts the four valid ids', () => {
    for (const id of FLAVOR_IDS) expect(isFlavorId(id)).toBe(true);
  });

  it.each([null, undefined, '', 'dark', 'Mocha'])('rejects %p', (v) => {
    expect(isFlavorId(v as string | null | undefined)).toBe(false);
  });
});

describe('resolveFlavor', () => {
  it('honours a valid stored flavour over the OS preference', () => {
    expect(resolveFlavor('macchiato', true)).toBe('macchiato');
    expect(resolveFlavor('frappe', false)).toBe('frappe');
  });

  it('falls back to latte when the OS prefers light and nothing is stored', () => {
    expect(resolveFlavor(null, true)).toBe('latte');
  });

  it('falls back to mocha when the OS does not prefer light', () => {
    expect(resolveFlavor(null, false)).toBe('mocha');
    expect(resolveFlavor(undefined, false)).toBe('mocha');
  });

  it('ignores an invalid stored value and uses the preference', () => {
    expect(resolveFlavor('neon', true)).toBe('latte');
    expect(resolveFlavor('neon', false)).toBe('mocha');
  });
});

describe('flavorFromClasses', () => {
  it('returns the first flavour class present', () => {
    expect(flavorFromClasses(['min-h-screen', 'frappe', 'text-ctp-text'])).toBe('frappe');
  });

  it('defaults to mocha when no flavour class is present', () => {
    expect(flavorFromClasses(['foo', 'bar'])).toBe('mocha');
    expect(flavorFromClasses([])).toBe('mocha');
  });
});

describe('rovingIndex', () => {
  it('ArrowDown advances and wraps at the end', () => {
    expect(rovingIndex(4, 0, 'ArrowDown')).toBe(1);
    expect(rovingIndex(4, 3, 'ArrowDown')).toBe(0);
  });

  it('ArrowUp retreats and wraps at the start', () => {
    expect(rovingIndex(4, 1, 'ArrowUp')).toBe(0);
    expect(rovingIndex(4, 0, 'ArrowUp')).toBe(3);
  });

  it('Home/End jump to the bounds', () => {
    expect(rovingIndex(4, 2, 'Home')).toBe(0);
    expect(rovingIndex(4, 2, 'End')).toBe(3);
  });

  it('returns null for a non-navigation key', () => {
    expect(rovingIndex(4, 2, 'Enter')).toBeNull();
  });

  it('returns null for an empty list', () => {
    expect(rovingIndex(0, 0, 'ArrowDown')).toBeNull();
  });
});
