import type { Job, JobStatus } from './schemas';

// Catppuccin accent KEYS (not hex) so components resolve them via `ctp-*`
// classes and the theme picker keeps working across all flavours.
export type CtpAccent =
  | 'lavender'
  | 'peach'
  | 'teal'
  | 'pink'
  | 'yellow'
  | 'sapphire'
  | 'mauve'
  | 'green'
  | 'maroon'
  | 'flamingo'
  | 'sky'
  | 'rosewater'
  | 'red'
  | 'blue'
  | 'overlay1'
  | 'overlay2';

const EPIC_COLORS: CtpAccent[] = [
  'lavender',
  'peach',
  'teal',
  'pink',
  'yellow',
  'sapphire',
  'mauve',
  'green',
  'maroon',
  'flamingo',
  'sky',
  'rosewater',
];

// Stable per-company swatch — deterministic by name (same company → same colour).
export function epicColorFor(name: string): CtpAccent {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return EPIC_COLORS[h % EPIC_COLORS.length]!;
}

export type Priority = 'highest' | 'high' | 'medium' | 'low';

// Priority inference — what role is most worth chasing.
export function priorityFor(role: string): Priority {
  const t = role.toLowerCase();
  if (t.includes('architect') || t.includes('program') || t.includes('lead')) return 'highest';
  if (t.includes('senior')) return 'high';
  if (t.includes('analyst')) return 'low';
  return 'medium';
}

export const PRIORITY: Record<Priority, { color: CtpAccent; label: string; icon: string }> = {
  highest: { color: 'red', label: 'Highest', icon: '⏫' },
  high: { color: 'maroon', label: 'High', icon: '↑' },
  medium: { color: 'yellow', label: 'Medium', icon: '=' },
  low: { color: 'sapphire', label: 'Low', icon: '↓' },
};

export type ColumnId = 'applied' | 'screening' | 'interviewing' | 'offered' | 'closed';

export const STATUS_COLUMNS: { id: ColumnId; label: string; accent: CtpAccent }[] = [
  { id: 'applied', label: 'Applied', accent: 'blue' },
  { id: 'screening', label: 'Screening', accent: 'peach' },
  { id: 'interviewing', label: 'Interviewing', accent: 'mauve' },
  { id: 'offered', label: 'Offered', accent: 'green' },
  { id: 'closed', label: 'Closed', accent: 'overlay1' },
];

const CLOSED: JobStatus[] = ['Rejected', 'Withdrawn', 'Ghosted'];

// Map a job's (effective) status to its board column.
export function columnOf(status: JobStatus): ColumnId {
  if (CLOSED.includes(status)) return 'closed';
  return status.toLowerCase() as ColumnId;
}

// Closed-column sub-status pill metadata.
export const SUB_STATUS: Partial<Record<JobStatus, { color: CtpAccent; label: string }>> = {
  Rejected: { color: 'red', label: 'Rejected' },
  Withdrawn: { color: 'overlay2', label: 'Withdrawn' },
  Ghosted: { color: 'mauve', label: 'Ghosted' },
};

// Application source → chip accent (Seek peach, LinkedIn blue, Jobgether green).
export const SOURCE_ACCENT: Record<string, CtpAccent> = {
  Seek: 'peach',
  LinkedIn: 'blue',
  Jobgether: 'green',
  Other: 'overlay2',
};

// Board card's filterable fields (mirrors the card's data-* attributes).
export interface JobCardData {
  /** Lowercased haystack — role + company — for the search box. */
  search: string;
  company: string;
  priority: string;
  source: string;
}

// Active filter criteria from the board controls (empty string = unset).
export interface JobFilterCriteria {
  /** Lowercased search query. */
  q: string;
  epic: string;
  prio: string;
  source: string;
}

// A card is shown when it satisfies every active (non-empty) criterion.
export function jobCardMatches(d: JobCardData, c: JobFilterCriteria): boolean {
  return (
    (!c.q || d.search.includes(c.q)) &&
    (!c.epic || d.company === c.epic) &&
    (!c.prio || d.priority === c.prio) &&
    (!c.source || d.source === c.source)
  );
}

// Whether any filter criterion is set (drives the "✕ clear" button visibility).
export function anyJobFilterActive(c: JobFilterCriteria): boolean {
  return Boolean(c.q || c.epic || c.prio || c.source);
}

// JIRA-style issue key. `n` is the application's chronological order (earliest = 1).
export function jobKey(n: number): string {
  return `JOB-${n}`;
}

// Assign chronological keys: earliest `applied` date = 1.
export function withKeys(jobs: Job[]): (Job & { key: number })[] {
  const ordered = [...jobs].sort((a, b) => a.applied.localeCompare(b.applied));
  const keyOf = new Map(ordered.map((j, i) => [j, i + 1] as const));
  return jobs.map((j) => ({ ...j, key: keyOf.get(j)! }));
}
