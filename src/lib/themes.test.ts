import { describe, it, expect } from 'vitest';
import { FLAVORS, THEME_TRIGGER_LABEL } from './themes';

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
});
