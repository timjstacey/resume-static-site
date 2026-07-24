import { describe, expect, it, vi } from 'vitest';
import { fetchJsonWithTimeout, fetchStatsOnce } from './statsClient';

function okResponse(body: unknown): Response {
  return { ok: true, json: async () => body } as unknown as Response;
}

describe('fetchJsonWithTimeout', () => {
  it('returns parsed JSON on a successful response', async () => {
    const fake = vi.fn(async () => okResponse({ a: 1 }));
    await expect(fetchJsonWithTimeout<{ a: number }>('/api/x', 5000, fake as unknown as typeof fetch)).resolves.toEqual(
      {
        a: 1,
      }
    );
  });

  it('returns null on a non-ok response', async () => {
    const fake = vi.fn(async () => ({ ok: false, json: async () => ({}) }) as unknown as Response);
    await expect(fetchJsonWithTimeout('/api/x', 5000, fake as unknown as typeof fetch)).resolves.toBeNull();
  });

  it('returns null when fetch throws', async () => {
    const fake = vi.fn(async () => {
      throw new Error('network');
    });
    await expect(fetchJsonWithTimeout('/api/x', 5000, fake as unknown as typeof fetch)).resolves.toBeNull();
  });

  it('aborts and returns null when the request outlives the timeout', async () => {
    // Fetch that only settles when its abort signal fires — proves the timeout
    // triggers the abort and we resolve null rather than hang.
    const fake = (_url: string, init?: { signal?: AbortSignal }) =>
      new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => reject(new Error('aborted')));
      });
    await expect(fetchJsonWithTimeout('/api/x', 5, fake as unknown as typeof fetch)).resolves.toBeNull();
  });
});

describe('fetchStatsOnce', () => {
  // Unique URLs per test: the in-flight cache is module-level and persists across
  // tests in this file.
  it('dedupes concurrent requests for the same URL to one fetch', async () => {
    const fake = vi.fn(async () => okResponse({ v: 1 }));
    const [a, b] = await Promise.all([
      fetchStatsOnce<{ v: number }>('/api/dedupe-1', 5000, fake as unknown as typeof fetch),
      fetchStatsOnce<{ v: number }>('/api/dedupe-1', 5000, fake as unknown as typeof fetch),
    ]);
    expect(fake).toHaveBeenCalledTimes(1);
    expect(a).toEqual({ v: 1 });
    expect(b).toEqual({ v: 1 });
  });

  it('reuses the resolved result on a later call for the same URL', async () => {
    const fake = vi.fn(async () => okResponse({ v: 2 }));
    await fetchStatsOnce('/api/dedupe-2', 5000, fake as unknown as typeof fetch);
    await fetchStatsOnce('/api/dedupe-2', 5000, fake as unknown as typeof fetch);
    expect(fake).toHaveBeenCalledTimes(1);
  });

  it('fetches separately for different URLs', async () => {
    const fake = vi.fn(async () => okResponse({ v: 3 }));
    await fetchStatsOnce('/api/dedupe-3a', 5000, fake as unknown as typeof fetch);
    await fetchStatsOnce('/api/dedupe-3b', 5000, fake as unknown as typeof fetch);
    expect(fake).toHaveBeenCalledTimes(2);
  });

  it('defaults the timeout when omitted', async () => {
    const fake = vi.fn(async () => okResponse({ v: 4 }));
    await expect(
      fetchStatsOnce<{ v: number }>('/api/dedupe-4', undefined, fake as unknown as typeof fetch)
    ).resolves.toEqual({ v: 4 });
  });
});
