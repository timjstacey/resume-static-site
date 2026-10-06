import type { Hunt, Job, JobStatus } from './schemas';

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

// Whether a drag drop is an attempted cross-column move (the board is read-only,
// so this is what triggers the "no permission" toast). A drop with no column
// target, or back onto the card's own column, is not a move.
export function isIllegalMove(from: string, to: string | null | undefined): boolean {
  return !!to && to !== from;
}

// Assign chronological keys: earliest `applied` date = 1.
export function withKeys(jobs: Job[]): (Job & { key: number })[] {
  const ordered = [...jobs].sort((a, b) => a.applied.localeCompare(b.applied));
  const keyOf = new Map(ordered.map((j, i) => [j, i + 1] as const));
  return jobs.map((j) => ({ ...j, key: keyOf.get(j)! }));
}

export interface HuntRetro {
  total: number;
  responses: number;
  responseRate: number;
  interviews: number;
  offers: number;
  openAtClose: number;
  daysToClose: number;
  bySource: { source: string; applied: number; responses: number }[];
}

const RESPONDED: JobStatus[] = ['Screening', 'Interviewing', 'Offered', 'Rejected'];
const INTERVIEWED: JobStatus[] = ['Screening', 'Interviewing', 'Offered'];
const OPEN: JobStatus[] = ['Applied', 'Screening', 'Interviewing'];

// Retrospective numbers for a closed hunt: funnel counts, days from first
// application to close, and a per-source breakdown.
export function huntRetro(jobs: Job[], closedAt: string): HuntRetro {
  const total = jobs.length;
  const responses = jobs.filter((j) => RESPONDED.includes(j.status)).length;
  const earliest = jobs.map((j) => j.applied).sort()[0];
  const daysToClose = earliest
    ? Math.floor((Date.parse(`${closedAt}T00:00:00Z`) - Date.parse(`${earliest}T00:00:00Z`)) / 86_400_000)
    : 0;

  const sources = new Map<string, { source: string; applied: number; responses: number }>();
  for (const j of jobs) {
    const source = j.source ?? 'Other';
    const row = sources.get(source) ?? { source, applied: 0, responses: 0 };
    row.applied += 1;
    if (RESPONDED.includes(j.status)) row.responses += 1;
    sources.set(source, row);
  }

  return {
    total,
    responses,
    responseRate: total === 0 ? 0 : Math.round((responses / total) * 100),
    interviews: jobs.filter((j) => INTERVIEWED.includes(j.status)).length,
    offers: jobs.filter((j) => j.status === 'Offered').length,
    openAtClose: jobs.filter((j) => OPEN.includes(j.status)).length,
    daysToClose,
    bySource: [...sources.values()].sort((a, b) => b.applied - a.applied || a.source.localeCompare(b.source)),
  };
}

// Availability copy for the home "availability.json" card and the resume status
// line. An active hunt is open now; a closed one is booked until `availableFrom`.
export interface Availability {
  open: boolean;
  accent: CtpAccent;
  badge: string;
  headline: string;
  caption: string;
  notice: string;
}

function fmtDay(iso: string, withYear: boolean): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    ...(withYear && { year: 'numeric' }),
    timeZone: 'UTC',
  });
}

export function availability(hunt: Hunt): Availability {
  if (hunt.state === 'active') {
    return {
      open: true,
      accent: 'green',
      badge: 'OPEN',
      headline: 'Now',
      caption: 'open to offers',
      notice: 'available now',
    };
  }
  if (!hunt.availableFrom) {
    return {
      open: false,
      accent: 'yellow',
      badge: 'BOOKED',
      headline: 'Booked',
      caption: 'not taking offers',
      notice: 'n/a',
    };
  }
  const full = fmtDay(hunt.availableFrom, true);
  return {
    open: false,
    accent: 'yellow',
    badge: 'BOOKED',
    headline: fmtDay(hunt.availableFrom, false),
    caption: `available from ${full}`,
    notice: `from ${full}`,
  };
}
