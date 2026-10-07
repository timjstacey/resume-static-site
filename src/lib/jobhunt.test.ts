import { describe, expect, it } from 'vitest';
import {
  availability,
  columnOf,
  epicColorFor,
  jobKey,
  priorityFor,
  SOURCE_ACCENT,
  withKeys,
  jobCardMatches,
  anyJobFilterActive,
  isIllegalMove,
  huntRetro,
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

describe('isIllegalMove', () => {
  it('is a move when dropped on a different column', () => {
    expect(isIllegalMove('applied', 'screening')).toBe(true);
    expect(isIllegalMove('closed', 'offered')).toBe(true);
  });

  it('is not a move when dropped back on its own column', () => {
    expect(isIllegalMove('applied', 'applied')).toBe(false);
  });

  it('is not a move when there is no column target', () => {
    expect(isIllegalMove('applied', null)).toBe(false);
    expect(isIllegalMove('applied', undefined)).toBe(false);
    expect(isIllegalMove('applied', '')).toBe(false);
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

describe('huntRetro', () => {
  const CLOSED_AT = '2026-10-07';

  it('returns zeros and no sources for an empty list', () => {
    expect(huntRetro([], CLOSED_AT)).toEqual({
      total: 0,
      responses: 0,
      responseRate: 0,
      interviews: 0,
      offers: 0,
      openAtClose: 0,
      daysToClose: 0,
      bySource: [],
    });
  });

  it('counts each status bucket', () => {
    const jobs = [
      makeJob({ status: 'Applied' }),
      makeJob({ status: 'Ghosted' }),
      makeJob({ status: 'Withdrawn' }),
      makeJob({ status: 'Screening' }),
      makeJob({ status: 'Interviewing' }),
      makeJob({ status: 'Offered' }),
      makeJob({ status: 'Rejected' }),
    ];
    const r = huntRetro(jobs, CLOSED_AT);
    expect(r.total).toBe(7);
    expect(r.responses).toBe(4); // Screening, Interviewing, Offered, Rejected
    expect(r.interviews).toBe(3); // Screening, Interviewing, Offered
    expect(r.offers).toBe(1);
    expect(r.openAtClose).toBe(3); // Applied, Screening, Interviewing
    expect(r.responseRate).toBe(57); // 4/7 = 57.14
  });

  it('rounds the response rate half up', () => {
    const jobs = [makeJob({ status: 'Rejected' }), makeJob({ status: 'Applied' }), makeJob({ status: 'Applied' })];
    expect(huntRetro(jobs, CLOSED_AT).responseRate).toBe(33); // 33.33
    const two = [
      makeJob({ status: 'Rejected' }),
      makeJob({ status: 'Applied' }),
      makeJob({ status: 'Applied' }),
      makeJob({ status: 'Applied' }),
      makeJob({ status: 'Applied' }),
      makeJob({ status: 'Applied' }),
      makeJob({ status: 'Applied' }),
      makeJob({ status: 'Applied' }),
    ];
    expect(huntRetro(two, CLOSED_AT).responseRate).toBe(13); // 12.5 rounds up
  });

  it('is 100 when every job got a response', () => {
    expect(huntRetro([makeJob({ status: 'Offered' })], CLOSED_AT).responseRate).toBe(100);
  });

  it('computes whole days from the earliest applied date to closedAt', () => {
    const jobs = [
      makeJob({ applied: '2026-09-01' }),
      makeJob({ applied: '2026-08-08' }),
      makeJob({ applied: '2026-09-30' }),
    ];
    expect(huntRetro(jobs, CLOSED_AT).daysToClose).toBe(60); // Aug 8 -> Oct 7
  });

  it('groups by source with Other fallback, sorted applied desc then source asc', () => {
    const jobs = [
      makeJob({ source: 'Seek', status: 'Rejected' }),
      makeJob({ source: 'Seek', status: 'Applied' }),
      makeJob({ source: 'Seek', status: 'Screening' }),
      makeJob({ source: 'LinkedIn', status: 'Applied' }),
      makeJob({ source: 'Jobgether', status: 'Offered' }),
      makeJob({ status: 'Applied' }),
      makeJob({ status: 'Ghosted' }),
    ];
    expect(huntRetro(jobs, CLOSED_AT).bySource).toEqual([
      { source: 'Seek', applied: 3, responses: 2 },
      { source: 'Other', applied: 2, responses: 0 },
      { source: 'Jobgether', applied: 1, responses: 1 },
      { source: 'LinkedIn', applied: 1, responses: 0 },
    ]);
  });
});

describe('availability', () => {
  it('active hunt: open now', () => {
    expect(availability({ state: 'active' })).toEqual({
      open: true,
      accent: 'green',
      badge: 'OPEN',
      headline: 'Now',
      caption: 'open to offers',
      notice: 'available now',
    });
  });

  it('closed hunt with availableFrom: booked until that date', () => {
    expect(availability({ state: 'closed', closedAt: '2026-10-07', availableFrom: '2027-04-27' })).toEqual({
      open: false,
      accent: 'yellow',
      badge: 'BOOKED',
      headline: '27 Apr',
      caption: 'available from 27 Apr 2027',
      notice: 'from 27 Apr 2027',
    });
  });

  it('closed hunt without availableFrom: booked, no date', () => {
    expect(availability({ state: 'closed', closedAt: '2026-10-07' })).toMatchObject({
      open: false,
      headline: 'Booked',
      caption: 'not taking offers',
      notice: 'n/a',
    });
  });
});
