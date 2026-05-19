import { describe, expect, it } from 'vitest';
import { isActivePath } from './nav';

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
