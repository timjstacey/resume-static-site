// Pure filter/sort rules for the projects grid. Kept free of any data.ts (and
// therefore node:fs) import so projects.astro's client `<script>` can bundle
// them. PROJECT_FILTERS (the data-derived pill list) lives in ./projectFilters.

/** A project's tag tokens match a filter when the filter is 'all' or present. */
export function projectMatchesFilter(tags: readonly string[], filter: string): boolean {
  return filter === 'all' || tags.includes(filter);
}

/** `?tag=` value for a filter; `null` means drop the param (the default view). */
export function tagParam(filter: string): string | null {
  return filter === 'all' ? null : filter;
}

/** A card's sort inputs: `data-updated` (days ago) + its display name. */
export interface UpdatedSortKey {
  days: number;
  name: string;
}

/**
 * Recency comparator over "days ago" values (the card's `data-updated`).
 * `desc` = most recent first (smaller days-ago sorts first).
 *
 * `days` is floored to whole days, so two repos pushed on the same date tie.
 * Name breaks the tie, and the whole comparison — tiebreak included — flips
 * with `desc`, so toggling the control is an exact reversal of the grid rather
 * than a stable sort that leaves tied cards where they were.
 */
export function compareByUpdated(a: UpdatedSortKey, b: UpdatedSortKey, desc: boolean): number {
  const cmp = a.days - b.days || a.name.localeCompare(b.name);
  return desc ? cmp : -cmp;
}
