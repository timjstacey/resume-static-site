import { describe, expect, it, vi } from 'vitest';
import { fetchJsonWithTimeout } from './statsClient';

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
