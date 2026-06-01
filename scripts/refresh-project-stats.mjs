#!/usr/bin/env node
// Regenerates src/data/project-stats.json from the live GitHub repos API.
// Run nightly by .github/workflows/refresh-project-stats.yml (or locally with
// `pnpm projects:refresh`). Requires the `gh` CLI authed with repo:read.
//
// For every `repo:` URL in projects.yml it fetches stargazers_count,
// forks_count and pushed_at, keyed by the repo URL. getProjects() merges these
// onto the hand-authored projects, so the cards show real counts instead of
// hand-maintained guesses.
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';

const ROOT = path.resolve(fileURLToPath(import.meta.url), '../..');
const PROJECTS = path.join(ROOT, 'src', 'data', 'projects.yml');
const OUT = path.join(ROOT, 'src', 'data', 'project-stats.json');

function sh(cmd) {
  return execSync(cmd, { cwd: ROOT, encoding: 'utf-8', stdio: ['ignore', 'pipe', 'inherit'] });
}

function nameWithOwner(repoUrl) {
  const m = repoUrl.match(/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?\/?$/);
  return m ? `${m[1]}/${m[2]}` : null;
}

const projects = parse(readFileSync(PROJECTS, 'utf-8'));
const stats = {};

for (const p of projects) {
  if (!p.repo) continue;
  const slug = nameWithOwner(p.repo);
  if (!slug) {
    console.warn(`skip: cannot parse owner/repo from ${p.repo}`);
    continue;
  }
  const r = JSON.parse(sh(`gh api repos/${slug} --jq '{stars: .stargazers_count, forks: .forks_count, pushed: .pushed_at}'`));
  stats[p.repo] = {
    stars: r.stars,
    forks: r.forks,
    updatedAt: r.pushed.slice(0, 10),
  };
  console.log(`${slug}: ★${r.stars} ⑃${r.forks} ${stats[p.repo].updatedAt}`);
}

// Stable key order so the diff is minimal between runs.
const ordered = Object.fromEntries(Object.keys(stats).sort().map((k) => [k, stats[k]]));
writeFileSync(OUT, JSON.stringify(ordered, null, 2) + '\n');
console.log(`wrote ${path.relative(ROOT, OUT)} (${Object.keys(ordered).length} repos)`);
