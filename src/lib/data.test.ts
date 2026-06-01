import { describe, it, expect } from 'vitest';
import {
  getResume,
  getProjects,
  getJobs,
  effectiveJobStatus,
  deriveSource,
  getTesting,
  getCiSnapshot,
  getProjectStats,
  mergeProjectStats,
} from './data';
import type { Job, Project, ProjectStats } from './schemas';

function makeJob(overrides: Partial<Job> = {}): Job {
  return { company: 'Acme', role: 'Engineer', applied: '2026-01-01', status: 'Applied', ...overrides };
}

describe('getResume', () => {
  it('returns valid resume with required fields', () => {
    const resume = getResume();
    expect(resume.name).toBeTruthy();
    expect(resume.tagline).toBeDefined();
    expect(resume.experience.length).toBeGreaterThan(0);
    expect(resume.skills.length).toBeGreaterThan(0);
  });

  it('each experience entry has valid start date', () => {
    const resume = getResume();
    for (const exp of resume.experience) {
      expect(exp.start).toMatch(/^\d{4}-\d{2}$/);
    }
  });

  it('each skill category has at least one item', () => {
    const resume = getResume();
    for (const group of resume.skills) {
      expect(group.items.length, `skills["${group.category}"] must have at least one item`).toBeGreaterThan(0);
    }
  });
});

describe('getProjects', () => {
  it('returns non-empty array of valid projects', () => {
    const projects = getProjects();
    expect(projects.length).toBeGreaterThan(0);
    for (const p of projects) {
      expect(p.name).toBeTruthy();
      expect(['active', 'wip', 'archived']).toContain(p.status);
    }
  });
});

describe('getJobs', () => {
  it('returns non-empty array of valid jobs', () => {
    const jobs = getJobs();
    expect(jobs.length).toBeGreaterThan(0);
    for (const j of jobs) {
      expect(j.company).toBeTruthy();
      expect(j.applied).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  // The Playwright filter spec needs both an Applied and a Rejected entry to
  // exercise the hide/show flow. Treat their presence as a fixture invariant.
  it('contains at least one Applied entry (filter spec fixture)', () => {
    const jobs = getJobs();
    expect(jobs.some((j) => j.status === 'Applied')).toBe(true);
  });

  it('contains at least one Rejected entry (filter spec fixture)', () => {
    const jobs = getJobs();
    expect(jobs.some((j) => j.status === 'Rejected')).toBe(true);
  });
});

describe('effectiveJobStatus', () => {
  const now = new Date('2026-01-29');

  it('Applied < 28 days → stays Applied', () => {
    // 2026-01-02 to 2026-01-29 = 27 days
    expect(effectiveJobStatus(makeJob({ applied: '2026-01-02' }), now)).toBe('Applied');
  });

  it('Applied > 28 days → becomes Ghosted', () => {
    // 2025-12-31 to 2026-01-29 = 29 days
    expect(effectiveJobStatus(makeJob({ applied: '2025-12-31' }), now)).toBe('Ghosted');
  });

  it('Applied exactly 28 days → becomes Ghosted (inclusive boundary)', () => {
    // 2026-01-01 to 2026-01-29 = 28 days
    expect(effectiveJobStatus(makeJob({ applied: '2026-01-01' }), now)).toBe('Ghosted');
  });

  it.each(['Screening', 'Interviewing', 'Offered', 'Rejected', 'Withdrawn', 'Ghosted'] as const)(
    '%s untouched at any age',
    (status) => {
      expect(effectiveJobStatus(makeJob({ applied: '2020-01-01', status }), now)).toBe(status);
    }
  );
});

describe('deriveSource', () => {
  it('prefers the explicit source field', () => {
    expect(deriveSource(makeJob({ source: 'LinkedIn', notes: 'found on seek' }))).toBe('LinkedIn');
  });

  it.each([
    ['Applied via Seek', 'Seek'],
    ['saw it on LinkedIn', 'LinkedIn'],
    ['Jobgether listing', 'Jobgether'],
  ] as const)('derives %s → %s from notes', (notes, expected) => {
    expect(deriveSource(makeJob({ notes }))).toBe(expected);
  });

  it('returns undefined when nothing matches', () => {
    expect(deriveSource(makeJob({ notes: 'cold email' }))).toBeUndefined();
  });

  it('returns undefined when notes are absent', () => {
    expect(deriveSource(makeJob())).toBeUndefined();
  });
});

describe('getTesting', () => {
  it('loads + validates testing.yml', () => {
    const t = getTesting();
    expect(Array.isArray(t.routing)).toBe(true);
    expect(Array.isArray(t.workflows)).toBe(true);
  });
});

describe('getCiSnapshot', () => {
  it('loads + validates ci-snapshot.json', () => {
    const snap = getCiSnapshot();
    expect(typeof snap.branch).toBe('string');
    expect(typeof snap.passing).toBe('boolean');
    expect(Array.isArray(snap.runs)).toBe(true);
  });
});

describe('getProjectStats', () => {
  it('loads + validates project-stats.json', () => {
    const stats = getProjectStats();
    for (const s of Object.values(stats)) {
      expect(Number.isInteger(s.stars)).toBe(true);
      expect(Number.isInteger(s.forks)).toBe(true);
      expect(s.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});

describe('mergeProjectStats', () => {
  const base = (over: Partial<Project> = {}): Project => ({
    name: 'P',
    description: '',
    tags: [],
    status: 'active',
    repo: 'https://github.com/x/y',
    ...over,
  });
  const stats: ProjectStats = { 'https://github.com/x/y': { stars: 9, forks: 2, updatedAt: '2026-05-31' } };

  it('merges stats onto a project whose repo matches', () => {
    const p = mergeProjectStats([base()], stats)[0]!;
    expect(p).toMatchObject({ stars: 9, forks: 2, updatedAt: '2026-05-31' });
  });

  it('leaves a project with a repo but no matching stats unchanged', () => {
    const p = mergeProjectStats([base({ repo: 'https://github.com/a/b' })], stats)[0]!;
    expect(p.stars).toBeUndefined();
  });

  it('leaves a project with no repo unchanged', () => {
    const p = mergeProjectStats([base({ repo: undefined })], stats)[0]!;
    expect(p.stars).toBeUndefined();
  });

  it('reflects the merge through getProjects', () => {
    const projects = getProjects();
    for (const p of projects) {
      if (p.repo) {
        expect(Number.isInteger(p.stars)).toBe(true);
        expect(p.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
    }
  });
});
