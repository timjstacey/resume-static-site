import { describe, expect, it } from 'vitest';
import { isActivePath, trapFocusTarget } from './nav';

describe('isActivePath', () => {
  it('home matches exact /', () => {
    expect(isActivePath('/', '/')).toBe(true);
  });

  it('home does not match sub-paths', () => {
    expect(isActivePath('/', '/resume')).toBe(false);
  });

  it('non-root matches its own path', () => {
    expect(isActivePath('/resume', '/resume')).toBe(true);
  });

  it('non-root matches nested path', () => {
    expect(isActivePath('/jobs', '/jobs/123')).toBe(true);
  });

  it('non-root does not match unrelated path', () => {
    expect(isActivePath('/resume', '/projects')).toBe(false);
  });

  it('non-root does not match partial prefix', () => {
    expect(isActivePath('/job', '/jobs')).toBe(false);
  });
});

describe('trapFocusTarget', () => {
  it('pulls focus into the drawer when it is currently outside', () => {
    expect(trapFocusTarget(5, -1, false)).toBe(0);
    expect(trapFocusTarget(5, -1, true)).toBe(0);
  });

  it('wraps Shift+Tab from the first item to the last', () => {
    expect(trapFocusTarget(5, 0, true)).toBe(4);
  });

  it('wraps Tab from the last item to the first', () => {
    expect(trapFocusTarget(5, 4, false)).toBe(0);
  });

  it('returns null in the middle (let the browser advance)', () => {
    expect(trapFocusTarget(5, 2, false)).toBeNull();
    expect(trapFocusTarget(5, 2, true)).toBeNull();
  });

  it('does not wrap Tab on the first item or Shift+Tab on the last', () => {
    expect(trapFocusTarget(5, 0, false)).toBeNull();
    expect(trapFocusTarget(5, 4, true)).toBeNull();
  });

  it('returns null for an empty drawer', () => {
    expect(trapFocusTarget(0, -1, false)).toBeNull();
  });
});
