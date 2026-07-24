// Cloudflare Pages Function: builds src/data/project-stats.json's shape live
// from the GitHub repos API and edge-caches it 24h. Replaces the nightly
// refresh-project-stats.yml push to main. Public data — no token. The client
// (/projects) merges this over the committed baseline and re-sorts by recency.
import { buildProjectStats, nameWithOwner, type RawRepo } from '../../src/lib/projectStats';
import { REPO_URLS } from '../../src/lib/repoList';

type GhInit = RequestInit & { cf?: { cacheTtl?: number; cacheEverything?: boolean } };

interface GhRepo {
  stargazers_count: number;
  forks_count: number;
  pushed_at: string;
}

async function fetchRepo(slug: string): Promise<RawRepo> {
  const res = await fetch(`https://api.github.com/repos/${slug}`, {
    headers: { 'User-Agent': 'resume-static-site-edge', Accept: 'application/vnd.github+json' },
    cf: { cacheTtl: 86400, cacheEverything: true },
  } as GhInit);
  if (!res.ok) throw new Error(`GitHub ${res.status} for repos/${slug}`);
  const r = (await res.json()) as GhRepo;
  return { stars: r.stargazers_count, forks: r.forks_count, pushed: r.pushed_at };
}

export const onRequestGet: PagesFunction = async () => {
  try {
    const slugs = REPO_URLS.map((repo) => ({ repo, slug: nameWithOwner(repo) })).filter(
      (e): e is { repo: string; slug: string } => e.slug !== null
    );
    const entries = await Promise.all(slugs.map(async ({ repo, slug }) => ({ repo, raw: await fetchRepo(slug) })));
    const stats = buildProjectStats(entries);
    return new Response(JSON.stringify(stats), {
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'public, s-maxage=86400, max-age=3600',
      },
    });
  } catch {
    return new Response('upstream error', { status: 502 });
  }
};
