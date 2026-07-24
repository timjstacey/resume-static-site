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
