import { describe, it, expect } from 'vitest';
import { JOBS_HEADING } from './copy';

describe('copy', () => {
  it('exposes the job-hunt heading shared by the page + its spec', () => {
    expect(JOBS_HEADING).toBe('Job Hunt');
  });
});
