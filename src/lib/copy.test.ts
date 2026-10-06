import { describe, it, expect } from 'vitest';
import { JOBS_ACTIVE_HEADING, JOBS_HEADING, JOBS_RETRO_HEADING } from './copy';

describe('copy', () => {
  it('exposes the job-hunt heading shared by the page + its spec', () => {
    expect(JOBS_HEADING).toBe('Job Hunt');
  });

  it('exposes the active-mode job-hunt heading', () => {
    expect(JOBS_ACTIVE_HEADING).toBe('Active Pipeline');
  });

  it('exposes the closed-mode retro heading', () => {
    expect(JOBS_RETRO_HEADING).toBe('Sprint Retro');
  });
});
