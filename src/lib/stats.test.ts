import { describe, it, expect, vi, afterEach } from 'vitest';
import { activePipeline, yearsOfExp } from './stats';
import type { Job, Resume } from './schemas';

const makeJob = (status: Job['status']): Job => ({
  company: 'Acme',
  role: 'Engineer',
  applied: '2026-01-01',
  status,
});

describe('activePipeline', () => {
  it('counts Applied, Screening, Interviewing, Offered as active', () => {
    const jobs: Job[] = [
      makeJob('Applied'),
      makeJob('Screening'),
      makeJob('Interviewing'),
      makeJob('Offered'),
      makeJob('Rejected'),
      makeJob('Withdrawn'),
      makeJob('Ghosted'),
    ];
    expect(activePipeline(jobs)).toBe(4);
  });

  it('returns 0 when no active jobs', () => {
    expect(activePipeline([makeJob('Rejected'), makeJob('Ghosted')])).toBe(0);
  });

  it('returns 0 for empty list', () => {
    expect(activePipeline([])).toBe(0);
  });
});

const makeExperience = (start: string, end: string | 'present'): Resume['experience'][number] => ({
  company: 'Acme',
  role: 'Engineer',
  start,
  end,
  bullets: [],
});

describe('yearsOfExp', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('calculates years from earliest start date', () => {
    vi.setSystemTime(new Date('2026-01-01'));
    const exp = [makeExperience('2021-01', 'present'), makeExperience('2023-06', 'present')];
    expect(yearsOfExp(exp)).toBe(4);
  });

  it('floors partial years', () => {
    vi.setSystemTime(new Date('2026-06-15'));
    const exp = [makeExperience('2024-01', 'present')];
    expect(yearsOfExp(exp)).toBe(2);
  });

  it('handles single entry', () => {
    vi.setSystemTime(new Date('2026-01-01'));
    const exp = [makeExperience('2023-01', 'present')];
    expect(yearsOfExp(exp)).toBe(3);
  });
});
