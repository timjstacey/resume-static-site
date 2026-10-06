import { readFileSync } from 'node:fs';
import { parse } from 'yaml';
import { describe, it, expect } from 'vitest';
import {
  getResume,
  getProjects,
  getJobs,
  getHunt,
  huntClock,
  redactJob,
  effectiveJobStatus,
  deriveSource,
  getTesting,
  getCiSnapshot,
  getProjectStats,
  mergeProjectStats,
} from './data';
import type { Hunt, Job, Project, ProjectStats } from './schemas';

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
    const jobs = getJobs(new Date('2026-10-07T00:00:00Z'), { state: 'active' });
    expect(jobs.length).toBeGreaterThan(0);
    for (const j of jobs) {
      expect(j.company).toBeTruthy();
      expect(j.applied).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  // Fixture invariant: the source YAML must carry an Applied and a Rejected
  // entry to feed the ghost auto-promotion path and the board's filter flow.
  // Assert on the RAW source, not getJobs() — the latter ages Applied → Ghosted
  // at 28 days (effectiveJobStatus), so an entry-level `getJobs().some(Applied)`
  // check is wall-clock-coupled and breaks as real applications age out. That
  // is expected behaviour, not a fixture regression.
  const rawJobs = parse(readFileSync('src/data/jobs.yml', 'utf-8')) as { status: string }[];

  it('source jobs.yml contains at least one Applied entry (ghost-path fixture)', () => {
    expect(rawJobs.some((j) => j.status === 'Applied')).toBe(true);
  });

  it('source jobs.yml contains at least one Rejected entry (filter spec fixture)', () => {
    expect(rawJobs.some((j) => j.status === 'Rejected')).toBe(true);
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

const CLOSED: Hunt = { state: 'closed', closedAt: '2026-10-07' };
const ACTIVE: Hunt = { state: 'active' };

describe('getHunt', () => {
  it('parses the repo hunt.yml into a valid Hunt', () => {
    const hunt = getHunt();
    expect(['active', 'closed']).toContain(hunt.state);
    if (hunt.state === 'closed') expect(hunt.closedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('huntClock', () => {
  it('returns closedAt at UTC midnight when closed', () => {
    const clock = huntClock(CLOSED, new Date('2030-01-01T12:00:00Z'));
    expect(clock.toISOString()).toBe('2026-10-07T00:00:00.000Z');
  });

  it('returns now when active', () => {
    const now = new Date('2030-01-01T12:00:00Z');
    expect(huntClock(ACTIVE, now)).toBe(now);
  });
});

describe('redactJob', () => {
  it('blanks company, url and notes, keeping everything else', () => {
    const job = makeJob({
      company: 'Secret Co',
      url: 'https://secret.example',
      notes: 'Applied via Seek',
      source: 'Seek',
      role: 'QA Lead',
      status: 'Rejected',
    });
    const r = redactJob(job);
    expect(r.company).toBe('');
    expect(r.url).toBeUndefined();
    expect(r.notes).toBeUndefined();
    expect(r.role).toBe('QA Lead');
    expect(r.status).toBe('Rejected');
    expect(r.applied).toBe('2026-01-01');
    expect(r.source).toBe('Seek');
  });

  it('does not mutate the input', () => {
    const job = makeJob({ url: 'https://x.example', notes: 'n' });
    redactJob(job);
    expect(job.company).toBe('Acme');
    expect(job.url).toBe('https://x.example');
    expect(job.notes).toBe('n');
  });
});

describe('getJobs(now, hunt)', () => {
  const raw = parse(readFileSync('src/data/jobs.yml', 'utf-8')) as {
    company: string;
    applied: string;
    status: string;
  }[];
  const DAY = 86400 * 1000;

  it('closed: blanks company/url/notes on every job but keeps a derived source', () => {
    const jobs = getJobs(new Date('2030-01-01T00:00:00Z'), CLOSED);
    expect(jobs).toHaveLength(raw.length);
    for (const j of jobs) {
      expect(j.company).toBe('');
      expect(j.url).toBeUndefined();
      expect(j.notes).toBeUndefined();
    }
    expect(jobs.some((j) => j.source !== undefined)).toBe(true);
  });

  it('closed: freezes the ghost clock at closedAt regardless of now', () => {
    const far = getJobs(new Date('2035-01-01T00:00:00Z'), CLOSED);
    const near = getJobs(new Date('2026-10-07T00:00:00Z'), CLOSED);
    expect(far.map((j) => j.status)).toEqual(near.map((j) => j.status));
    const closedMs = new Date('2026-10-07T00:00:00Z').getTime();
    raw.forEach((r, i) => {
      if (r.status !== 'Applied') return;
      const age = (closedMs - new Date(r.applied).getTime()) / DAY;
      expect(far[i]!.status).toBe(age >= 28 ? 'Ghosted' : 'Applied');
    });
  });

  it('active: keeps company and ages Applied against now', () => {
    const early = getJobs(new Date('2026-05-19T00:00:00Z'), ACTIVE);
    const late = getJobs(new Date('2035-01-01T00:00:00Z'), ACTIVE);
    expect(early.map((j) => j.company)).toEqual(raw.map((r) => r.company));
    expect(late.every((j) => j.status !== 'Applied')).toBe(true);
    expect(early.some((j) => j.status === 'Applied')).toBe(true);
  });

  it('zero-arg call still works', () => {
    expect(getJobs().length).toBe(raw.length);
  });
});
