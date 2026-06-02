import { describe, it, expect } from 'vitest';
import { stepDuration } from './ciGates';

const gates = {
  'ci.yml': { Lint: '11s', Build: '24s' },
  'playwright.yml': { 'Run pnpm exec playwright test': '1m38s' },
};

describe('stepDuration', () => {
  it('returns the duration for a matched workflow + step', () => {
    expect(stepDuration(gates, 'ci.yml', 'Lint')).toBe('11s');
    expect(stepDuration(gates, 'playwright.yml', 'Run pnpm exec playwright test')).toBe('1m38s');
  });

  it('returns null when the step is not in the workflow map', () => {
    expect(stepDuration(gates, 'ci.yml', 'Typecheck')).toBeNull();
  });

  it('returns null when the workflow is absent', () => {
    expect(stepDuration(gates, 'release.yml', 'Build')).toBeNull();
  });

  it('returns null when gates is undefined (older snapshot)', () => {
    expect(stepDuration(undefined, 'ci.yml', 'Lint')).toBeNull();
  });
});
