// Cloudflare Pages Function: builds src/data/ci-snapshot.json's shape live from
// the GitHub Actions API and edge-caches it 24h. Replaces the nightly
// refresh-ci-snapshot.yml push to main. All endpoints are public — no token.
// The client (footer + /testing) fetches this over the committed baseline.
import { buildCiSnapshot, gatesFromJobs, type HeadCommit, type RawRun } from '../../src/lib/ciSnapshot';

const REPO = 'timjstacey/resume-static-site';
const WORKFLOW = 'ci.yml';
const WINDOW = 10;
const GATE_WORKFLOWS = ['ci.yml', 'playwright.yml'];

// GitHub rejects API requests without a User-Agent (403). The `cf` fetch option
// edge-caches the upstream response for 24h so GitHub is hit ~once/day.
type GhInit = RequestInit & { cf?: { cacheTtl?: number; cacheEverything?: boolean } };

async function ghJson<T>(path: string): Promise<T> {
  const res = await fetch(`https://api.github.com/${path}`, {
    headers: { 'User-Agent': 'resume-static-site-edge', Accept: 'application/vnd.github+json' },
    cf: { cacheTtl: 86400, cacheEverything: true },
  } as GhInit);
  if (!res.ok) throw new Error(`GitHub ${res.status} for ${path}`);
  return res.json() as Promise<T>;
}

async function gatesFor(file: string): Promise<Record<string, string>> {
  const res = await ghJson<{ workflow_runs?: { id: number }[] }>(
    `repos/${REPO}/actions/workflows/${file}/runs?status=success&per_page=1`
  );
  const runId = res.workflow_runs?.[0]?.id;
  if (!runId) return {};
  const { jobs = [] } = await ghJson<{ jobs?: Parameters<typeof gatesFromJobs>[0] }>(
    `repos/${REPO}/actions/runs/${runId}/jobs`
  );
  return gatesFromJobs(jobs);
}

export const onRequestGet: PagesFunction = async () => {
  try {
    const all = await ghJson<{ workflow_runs?: RawRun[] }>(
      `repos/${REPO}/actions/workflows/${WORKFLOW}/runs?status=completed&per_page=${WINDOW * 2}`
    );
    const runs = (all.workflow_runs ?? []).filter((r) => r.run_started_at && r.updated_at);
    if (runs.length === 0) throw new Error(`no completed ${WORKFLOW} runs`);

    const head = await ghJson<HeadCommit>(`repos/${REPO}/commits/main`);

    const gateEntries = await Promise.all(GATE_WORKFLOWS.map(async (wf) => [wf, await gatesFor(wf)] as const));
    const gates = Object.fromEntries(gateEntries);

    const snapshot = buildCiSnapshot({ runs, head, gates });
    return new Response(JSON.stringify(snapshot), {
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'public, s-maxage=86400, max-age=3600',
      },
    });
  } catch {
    return new Response('upstream error', { status: 502 });
  }
};
