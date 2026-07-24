// Pure transforms for building a CiSnapshot from raw GitHub Actions API data.
// Ported from scripts/refresh-ci-snapshot.mjs so the same logic runs at the
// edge (functions/api/ci-snapshot.ts) and is unit-testable. No fetch, no fs —
// the caller supplies already-fetched raw shapes.
import type { CiSnapshot } from './schemas';

export type RunResult = 'pass' | 'flake' | 'fail';

// Minimal shapes of the GitHub Actions API responses we read.
export interface RawRun {
  conclusion: string;
  run_attempt: number;
  run_started_at: string;
  updated_at: string;
  head_branch: string;
  head_sha: string;
}

export interface RawJobStep {
  name: string;
  conclusion: string;
  started_at: string | null;
  completed_at: string | null;
}

export interface RawJob {
  steps?: RawJobStep[];
}

export interface HeadCommit {
  sha: string;
  commit: { message: string; author: { date: string } };
}

export function relTime(iso: string, now: number = Date.now()): string {
  const secs = Math.max(0, Math.floor((now - new Date(iso).getTime()) / 1000));
  const mins = Math.floor(secs / 60);
  const hrs = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);
  if (days >= 1) return `${days}d ago`;
  if (hrs >= 1) return `${hrs}h ago`;
  if (mins >= 1) return `${mins}m ago`;
  return 'just now';
}

export function fmtDur(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = Math.round(secs % 60);
  if (m === 0) return `${s}s`;
  return `${m}m${String(s).padStart(2, '0')}s`;
}

export function fmtDelta(secs: number): string {
  const sign = secs >= 0 ? '+' : '-';
  return `${sign}${Math.abs(Math.round(secs))}s`;
}

export function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1);
  return sorted[Math.max(0, idx)] ?? 0;
}

export function classify(run: { conclusion: string; run_attempt: number }): RunResult {
  if (run.conclusion === 'success') return run.run_attempt > 1 ? 'flake' : 'pass';
  return 'fail';
}

export function durationSecs(run: { run_started_at: string; updated_at: string }): number {
  return Math.max(0, (new Date(run.updated_at).getTime() - new Date(run.run_started_at).getTime()) / 1000);
}

// Per-step durations from a workflow run's jobs, keyed by GHA step name →
// formatted duration. Skips steps that failed or lack timestamps.
export function gatesFromJobs(jobs: RawJob[]): Record<string, string> {
  const steps: Record<string, string> = {};
  for (const job of jobs) {
    for (const step of job.steps ?? []) {
      if (step.conclusion !== 'success' || !step.started_at || !step.completed_at) continue;
      const secs = Math.max(0, (new Date(step.completed_at).getTime() - new Date(step.started_at).getTime()) / 1000);
      steps[step.name] = fmtDur(secs);
    }
  }
  return steps;
}

// Assemble the snapshot the footer + /testing strip read. `runs` must be the
// completed ci.yml runs, newest first, already filtered to those carrying both
// run_started_at and updated_at.
export function buildCiSnapshot(opts: {
  runs: RawRun[];
  head: HeadCommit;
  gates: Record<string, Record<string, string>>;
  window?: number;
  now?: number;
}): CiSnapshot {
  const { runs, head, gates } = opts;
  const window = opts.window ?? 10;
  const now = opts.now ?? Date.now();

  if (runs.length === 0) throw new Error('no completed runs to build a snapshot from');

  const latest = runs[0]!;
  const current = runs.slice(0, window);
  const previous = runs.slice(window, window * 2);

  // Strip reads runs oldest → newest (left → right), so reverse the window.
  const runMarks = current.map(classify).reverse();

  const curDur = current.map(durationSecs).sort((a, b) => a - b);
  const prevDur = previous.map(durationSecs).sort((a, b) => a - b);
  const p50 = percentile(curDur, 50);
  const p95 = percentile(curDur, 95);
  const prevP50 = prevDur.length ? percentile(prevDur, 50) : p50;
  const prevP95 = prevDur.length ? percentile(prevDur, 95) : p95;

  return {
    branch: 'main',
    passing: latest.conclusion === 'success',
    sha: head.sha.slice(0, 7),
    commitMessage: head.commit.message.split('\n')[0] ?? '',
    commitAgo: relTime(head.commit.author.date, now),
    lastDeployAgo: relTime(latest.updated_at, now),
    runs: runMarks,
    p50: fmtDur(p50),
    p95: fmtDur(p95),
    p50Delta: fmtDelta(p50 - prevP50),
    p95Delta: fmtDelta(p95 - prevP95),
    gates,
  };
}
