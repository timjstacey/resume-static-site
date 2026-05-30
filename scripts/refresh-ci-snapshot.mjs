#!/usr/bin/env node
// Regenerates src/data/ci-snapshot.json from the live GitHub Actions API.
// Run nightly by .github/workflows/refresh-ci-snapshot.yml (or locally with
// `pnpm ci:refresh`). Requires the `gh` CLI authed with repo + actions:read.
//
// Maps the last 10 `ci.yml` runs into the snapshot the footer + /testing strip
// read, so the displayed CI signal tracks reality instead of freezing at the
// last commit. Run-attempt > 1 that still succeeded is counted as a "flake".
import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(fileURLToPath(import.meta.url), '../..');
const OUT = path.join(ROOT, 'src', 'data', 'ci-snapshot.json');
const WORKFLOW = 'ci.yml';
const WINDOW = 10;

const repo = process.env.GITHUB_REPOSITORY || sh('gh repo view --json nameWithOwner -q .nameWithOwner').trim();

function sh(cmd) {
  return execSync(cmd, { cwd: ROOT, encoding: 'utf-8', stdio: ['ignore', 'pipe', 'inherit'] });
}

function ghJson(apiPath) {
  return JSON.parse(sh(`gh api ${apiPath}`));
}

function relTime(iso) {
  const secs = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  const mins = Math.floor(secs / 60);
  const hrs = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);
  if (days >= 1) return `${days}d ago`;
  if (hrs >= 1) return `${hrs}h ago`;
  if (mins >= 1) return `${mins}m ago`;
  return 'just now';
}

function fmtDur(secs) {
  const m = Math.floor(secs / 60);
  const s = Math.round(secs % 60);
  if (m === 0) return `${s}s`;
  return `${m}m${String(s).padStart(2, '0')}s`;
}

function fmtDelta(secs) {
  const sign = secs >= 0 ? '+' : '-';
  return `${sign}${Math.abs(Math.round(secs))}s`;
}

function percentile(sorted, p) {
  if (sorted.length === 0) return 0;
  const idx = Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1);
  return sorted[Math.max(0, idx)];
}

function classify(run) {
  if (run.conclusion === 'success') return run.run_attempt > 1 ? 'flake' : 'pass';
  return 'fail';
}

function durationSecs(run) {
  return Math.max(0, (new Date(run.updated_at).getTime() - new Date(run.run_started_at).getTime()) / 1000);
}

// Most recent completed ci.yml runs, newest first.
const all = ghJson(`repos/${repo}/actions/workflows/${WORKFLOW}/runs?status=completed&per_page=${WINDOW * 2}`);
const runs = (all.workflow_runs ?? []).filter((r) => r.run_started_at && r.updated_at);
if (runs.length === 0) throw new Error(`no completed ${WORKFLOW} runs found for ${repo}`);

const latest = runs[0];
const current = runs.slice(0, WINDOW);
const previous = runs.slice(WINDOW, WINDOW * 2);

// Strip reads runs oldest → newest (left → right), so reverse the window.
const runMarks = current.map(classify).reverse();

const curDur = current.map(durationSecs).sort((a, b) => a - b);
const prevDur = previous.map(durationSecs).sort((a, b) => a - b);
const p50 = percentile(curDur, 50);
const p95 = percentile(curDur, 95);
const prevP50 = prevDur.length ? percentile(prevDur, 50) : p50;
const prevP95 = prevDur.length ? percentile(prevDur, 95) : p95;

// Latest commit on the default branch (drives sha/message/commitAgo).
const head = ghJson(`repos/${repo}/commits/${latest.head_branch === 'main' ? latest.head_sha : 'main'}`);

const snapshot = {
  branch: 'main',
  passing: latest.conclusion === 'success',
  sha: head.sha.slice(0, 7),
  commitMessage: head.commit.message.split('\n')[0],
  commitAgo: relTime(head.commit.author.date),
  lastDeployAgo: relTime(latest.updated_at),
  runs: runMarks,
  p50: fmtDur(p50),
  p95: fmtDur(p95),
  p50Delta: fmtDelta(p50 - prevP50),
  p95Delta: fmtDelta(p95 - prevP95),
};

writeFileSync(OUT, JSON.stringify(snapshot, null, 2) + '\n');
console.log(`wrote ${path.relative(ROOT, OUT)}:`, JSON.stringify(snapshot));
