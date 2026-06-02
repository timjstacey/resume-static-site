import { describe, expect, it } from 'vitest';
import {
  columnOf,
  epicColorFor,
  jobKey,
  priorityFor,
  SOURCE_ACCENT,
  withKeys,
  jobCardMatches,
  anyJobFilterActive,
  type JobCardData,
  type JobFilterCriteria,
} from './jobhunt';
import type { Job } from './schemas';

const card: JobCardData = { search: 'senior engineer acme', company: 'Acme', priority: 'high', source: 'Seek' };
const noFilter: JobFilterCriteria = { q: '', epic: '', prio: '', source: '' };

function makeJob(overrides: Partial<Job> = {}): Job {
  return { company: 'Acme', role: 'Engineer', applied: '2026-01-01', status: 'Applied', ...overrides };
}

describe('epicColorFor', () => {
  it('is deterministic — same company → same colour', () => {
    expect(epicColorFor('Sony')).toBe(epicColorFor('Sony'));
  });

  it('returns a known Catppuccin accent key', () => {
    const accents = new Set([
      'lavender',
      'peach',
      'teal',
      'pink',
      'yellow',
      'sapphire',
      'mauve',
      'green',
      'maroon',
      'flamingo',
      'sky',
      'rosewater',
    ]);
    expect(accents.has(epicColorFor('Whatever Corp'))).toBe(true);
  });
});

describe('priorityFor', () => {
  it.each([
    ['Test Architect', 'highest'],
    ['Program Test Manager', 'highest'],
    ['Lead QE', 'highest'],
    ['Senior Automation Engineer', 'high'],
    ['Test Analyst', 'low'],
    ['Quality Engineer', 'medium'],
  ] as const)('%s → %s', (role, expected) => {
    expect(priorityFor(role)).toBe(expected);
  });

  it('architect/program/lead beat senior when both present', () => {
    expect(priorityFor('Senior Lead Architect')).toBe('highest');
  });
});

describe('columnOf', () => {
  it.each([
    ['Applied', 'applied'],
    ['Screening', 'screening'],
    ['Interviewing', 'interviewing'],
    ['Offered', 'offered'],
  ] as const)('%s → %s', (status, col) => {
    expect(columnOf(status)).toBe(col);
  });

  it.each(['Rejected', 'Withdrawn', 'Ghosted'] as const)('%s → closed', (status) => {
    expect(columnOf(status)).toBe('closed');
  });
});

describe('jobKey', () => {
  it('formats as JOB-n', () => {
    expect(jobKey(7)).toBe('JOB-7');
  });
});

describe('withKeys', () => {
  it('assigns 1 to the earliest application', () => {
    const jobs = [
      makeJob({ company: 'B', applied: '2026-03-01' }),
      makeJob({ company: 'A', applied: '2026-01-01' }),
      makeJob({ company: 'C', applied: '2026-02-01' }),
    ];
    const keyed = withKeys(jobs);
    expect(keyed.find((j) => j.company === 'A')!.key).toBe(1);
    expect(keyed.find((j) => j.company === 'C')!.key).toBe(2);
    expect(keyed.find((j) => j.company === 'B')!.key).toBe(3);
  });

  it('preserves input order', () => {
    const jobs = [makeJob({ company: 'B', applied: '2026-03-01' }), makeJob({ company: 'A', applied: '2026-01-01' })];
    expect(withKeys(jobs).map((j) => j.company)).toEqual(['B', 'A']);
  });
});

describe('SOURCE_ACCENT', () => {
  it('maps known sources to accents', () => {
    expect(SOURCE_ACCENT.Seek).toBe('peach');
    expect(SOURCE_ACCENT.LinkedIn).toBe('blue');
    expect(SOURCE_ACCENT.Jobgether).toBe('green');
  });
});

describe('jobCardMatches', () => {
  it('shows every card when no filter is set', () => {
    expect(jobCardMatches(card, noFilter)).toBe(true);
  });

  it('matches the search query against the haystack (substring)', () => {
    expect(jobCardMatches(card, { ...noFilter, q: 'senior' })).toBe(true);
    expect(jobCardMatches(card, { ...noFilter, q: 'acme' })).toBe(true);
    expect(jobCardMatches(card, { ...noFilter, q: 'manager' })).toBe(false);
  });

  it('matches epic/priority/source by exact equality', () => {
    expect(jobCardMatches(card, { ...noFilter, epic: 'Acme' })).toBe(true);
    expect(jobCardMatches(card, { ...noFilter, epic: 'Globex' })).toBe(false);
    expect(jobCardMatches(card, { ...noFilter, prio: 'high' })).toBe(true);
    expect(jobCardMatches(card, { ...noFilter, prio: 'low' })).toBe(false);
    expect(jobCardMatches(card, { ...noFilter, source: 'Seek' })).toBe(true);
    expect(jobCardMatches(card, { ...noFilter, source: 'LinkedIn' })).toBe(false);
  });

  it('ANDs all active criteria — one miss hides the card', () => {
    expect(jobCardMatches(card, { q: 'senior', epic: 'Acme', prio: 'high', source: 'Seek' })).toBe(true);
    expect(jobCardMatches(card, { q: 'senior', epic: 'Acme', prio: 'low', source: 'Seek' })).toBe(false);
  });
});

describe('anyJobFilterActive', () => {
  it('is false when nothing is set', () => {
    expect(anyJobFilterActive(noFilter)).toBe(false);
  });

  it.each([
    ['q', { ...noFilter, q: 'x' }],
    ['epic', { ...noFilter, epic: 'Acme' }],
    ['prio', { ...noFilter, prio: 'high' }],
    ['source', { ...noFilter, source: 'Seek' }],
  ] as const)('is true when %s is set', (_field, criteria) => {
    expect(anyJobFilterActive(criteria)).toBe(true);
  });
});
