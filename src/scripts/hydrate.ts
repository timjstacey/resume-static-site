import { fetchStatsOnce, STATS_TIMEOUT_MS } from '../lib/statsClient';

// Shared client hydration for the live-stats surfaces. Fetches the endpoint once
// (deduped per URL across surfaces via fetchStatsOnce), applies the fresh data on
// success, and always clears the loading skeletons — so a 5s timeout or a failure
// reveals the server-rendered baseline. The page-specific DOM writes live in the
// `apply` callback; this wrapper owns the fetch + skeleton lifecycle so it isn't
// repeated per surface.
export async function hydrate<T>(url: string, apply: (data: T) => void, skeletonSelectors: string[]): Promise<void> {
  const data = await fetchStatsOnce<T>(url, STATS_TIMEOUT_MS);
  if (data) apply(data);
  for (const sel of skeletonSelectors) {
    for (const el of document.querySelectorAll(sel)) el.classList.remove('stat-skeleton');
  }
}
