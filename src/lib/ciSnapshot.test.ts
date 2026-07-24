import { describe, expect, it } from 'vitest';
import {
  buildCiSnapshot,
  classify,
  durationSecs,
  fmtDelta,
  fmtDur,
  gatesFromJobs,
  percentile,
  relTime,
  type HeadCommit,
  type RawJob,
  type RawRun,
} from './ciSnapshot';

const NOW = new Date('2026-06-01T12:00:00Z').getTime();

describe('relTime', () => {
  it('labels sub-minute as just now', () => {
    expect(relTime('2026-06-01T11:59:30Z', NOW)).toBe('just now');
  });
  it('uses minutes, hours, then days', () => {
    expect(relTime('2026-06-01T11:30:00Z', NOW)).toBe('30m ago');
    expect(relTime('2026-06-01T09:00:00Z', NOW)).toBe('3h ago');
    expect(relTime('2026-05-30T12:00:00Z', NOW)).toBe('2d ago');
  });
  it('clamps future dates to just now', () => {
    expect(relTime('2026-06-02T12:00:00Z', NOW)).toBe('just now');
  });
});

describe('fmtDur', () => {
  it('formats seconds and minutes', () => {
    expect(fmtDur(0)).toBe('0s');
    expect(fmtDur(41)).toBe('41s');
    expect(fmtDur(106)).toBe('1m46s');
    expect(fmtDur(600)).toBe('10m00s');
  });
});

describe('fmtDelta', () => {
  it('carries a sign and rounds', () => {
    expect(fmtDelta(0)).toBe('+0s');
    expect(fmtDelta(1.4)).toBe('+1s');
    expect(fmtDelta(-1.6)).toBe('-2s');
  });
});

describe('percentile', () => {
  it('handles empty, single, and typical', () => {
    expect(percentile([], 50)).toBe(0);
    expect(percentile([5], 95)).toBe(5);
    expect(percentile([1, 2, 3, 4], 50)).toBe(2);
    expect(percentile([1, 2, 3, 4], 95)).toBe(4);
  });
});

describe('classify', () => {
  it('maps conclusion + attempt to a result', () => {
    expect(classify({ conclusion: 'success', run_attempt: 1 })).toBe('pass');
    expect(classify({ conclusion: 'success', run_attempt: 2 })).toBe('flake');
    expect(classify({ conclusion: 'failure', run_attempt: 1 })).toBe('fail');
  });
});

describe('durationSecs', () => {
  it('computes clamped elapsed seconds', () => {
    expect(durationSecs({ run_started_at: '2026-06-01T00:00:00Z', updated_at: '2026-06-01T00:01:00Z' })).toBe(60);
    expect(durationSecs({ run_started_at: '2026-06-01T00:01:00Z', updated_at: '2026-06-01T00:00:00Z' })).toBe(0);
  });
});

describe('gatesFromJobs', () => {
  it('keeps successful timed steps and skips the rest', () => {
    const jobs: RawJob[] = [
      {
        steps: [
          {
            name: 'Lint',
            conclusion: 'success',
            started_at: '2026-06-01T00:00:00Z',
            completed_at: '2026-06-01T00:00:11Z',
          },
          {
            name: 'Flaky',
            conclusion: 'failure',
            started_at: '2026-06-01T00:00:00Z',
            completed_at: '2026-06-01T00:00:05Z',
          },
          { name: 'Skipped', conclusion: 'success', started_at: null, completed_at: null },
        ],
      },
      {},
    ];
    expect(gatesFromJobs(jobs)).toEqual({ Lint: '11s' });
  });
});

function run(over: Partial<RawRun>): RawRun {
  return {
    conclusion: 'success',
    run_attempt: 1,
    run_started_at: '2026-06-01T00:00:00Z',
    updated_at: '2026-06-01T00:01:00Z',
    head_branch: 'main',
    head_sha: 'abcdef1234567890',
    ...over,
  };
}

const HEAD: HeadCommit = {
  sha: 'deadbeefcafebabe',
  commit: { message: 'feat: a thing\n\nbody line', author: { date: '2026-06-01T09:00:00Z' } },
};

describe('buildCiSnapshot', () => {
  it('throws on empty runs', () => {
    expect(() => buildCiSnapshot({ runs: [], head: HEAD, gates: {} })).toThrow();
  });

  it('assembles the snapshot shape', () => {
    const runs = [
      run({ conclusion: 'success', run_attempt: 1 }),
      run({ conclusion: 'failure', run_attempt: 1 }),
      run({ conclusion: 'success', run_attempt: 2 }),
    ];
    const snap = buildCiSnapshot({ runs, head: HEAD, gates: { 'ci.yml': { Lint: '11s' } }, window: 10, now: NOW });
    expect(snap.branch).toBe('main');
    expect(snap.passing).toBe(true);
    expect(snap.sha).toBe('deadbee');
    expect(snap.commitMessage).toBe('feat: a thing');
    expect(snap.commitAgo).toBe('3h ago');
    // runs reversed oldest→newest: [pass, fail, flake] -> [flake, fail, pass]
    expect(snap.runs).toEqual(['flake', 'fail', 'pass']);
    expect(snap.gates).toEqual({ 'ci.yml': { Lint: '11s' } });
    expect(typeof snap.p50).toBe('string');
    expect(snap.p50Delta.startsWith('+') || snap.p50Delta.startsWith('-')).toBe(true);
  });

  it('reports failing when the latest run did not succeed', () => {
    const snap = buildCiSnapshot({ runs: [run({ conclusion: 'failure' })], head: HEAD, gates: {}, now: NOW });
    expect(snap.passing).toBe(false);
  });
});
