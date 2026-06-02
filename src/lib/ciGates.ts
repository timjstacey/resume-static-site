import type { CiSnapshot } from './schemas';

/**
 * Real duration for a CI-gate step, resolved from the snapshot's `gates` map
 * (workflow file → GHA step name → formatted duration). Returns `null` when the
 * snapshot has no timing for that step (old snapshot, renamed/removed step), so
 * the card can fall back to a placeholder instead of showing `undefined`.
 */
export function stepDuration(gates: CiSnapshot['gates'], file: string, match: string): string | null {
  return gates?.[file]?.[match] ?? null;
}
