// Pure transforms for building ProjectStats from raw GitHub repos API data.
// Ported from scripts/refresh-project-stats.mjs so the same logic runs at the
// edge (functions/api/project-stats.ts) and is unit-testable.
import type { ProjectStats } from './schemas';

export interface RawRepo {
  stars: number;
  forks: number;
  pushed: string;
}

export function nameWithOwner(repoUrl: string): string | null {
  const m = repoUrl.match(/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?\/?$/);
  return m ? `${m[1]}/${m[2]}` : null;
}

// Build the repo-URL-keyed stats record. Keys are sorted alphabetically for a
// stable, minimal-diff output — matching the refresh script's `ordered`.
export function buildProjectStats(entries: { repo: string; raw: RawRepo }[]): ProjectStats {
  const stats: ProjectStats = {};
  for (const { repo, raw } of entries) {
    stats[repo] = {
      stars: raw.stars,
      forks: raw.forks,
      updatedAt: raw.pushed.slice(0, 10),
    };
  }
  const ordered: ProjectStats = {};
  for (const key of Object.keys(stats).sort()) {
    ordered[key] = stats[key]!;
  }
  return ordered;
}
