export function fmtYM(ym: string): string {
  const [year, month] = ym.split('-');
  return new Date(Number(year), Number(month) - 1).toLocaleDateString('en-GB', {
    month: 'short',
    year: 'numeric',
  });
}

const DAY_MS = 86_400_000;

// Whole days between an ISO date (YYYY-MM-DD) and now, clamped at 0. Drives the
// projects-grid recency sort — replaces the old free-text regex parse.
export function daysAgo(iso: string, now: Date = new Date()): number {
  return Math.max(0, Math.floor((now.getTime() - new Date(iso).getTime()) / DAY_MS));
}

// Compact "time ago" label for the project card footer: today / 3d ago /
// 2w ago / 5mo ago / 1y ago. Derived from the same ISO date, so the label and
// the sort never drift.
export function fmtRelative(iso: string, now: Date = new Date()): string {
  const days = daysAgo(iso, now);
  if (days === 0) return 'today';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}
