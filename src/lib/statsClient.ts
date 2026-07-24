// Client-side helper for hydrating live stats over the SSG baseline. Fetches an
// /api/* edge endpoint with a hard timeout; returns null on timeout, non-ok, or
// any error so the caller can keep the committed baseline it rendered.

export const STATS_TIMEOUT_MS = 5000;

export async function fetchJsonWithTimeout<T>(
  url: string,
  timeoutMs: number,
  fetchImpl: typeof fetch = fetch
): Promise<T | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetchImpl(url, { signal: controller.signal });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

// Per-URL in-flight/resolved promise cache. The site is an MPA (full page loads),
// so this map lives for a single page load — long enough to dedupe requests for
// the same endpoint from multiple surfaces (the footer and the /testing CI strip
// both want /api/ci-snapshot on the /testing page), and it resets on the next
// navigation so a page never serves stale data.
const inflight = new Map<string, Promise<unknown>>();

export function fetchStatsOnce<T>(
  url: string,
  timeoutMs: number = STATS_TIMEOUT_MS,
  fetchImpl: typeof fetch = fetch
): Promise<T | null> {
  const existing = inflight.get(url);
  if (existing) return existing as Promise<T | null>;
  const p = fetchJsonWithTimeout<T>(url, timeoutMs, fetchImpl);
  inflight.set(url, p);
  return p;
}
