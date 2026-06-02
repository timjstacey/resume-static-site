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

/**
 * Recency comparator over "days ago" values (the card's `data-updated`).
 * `desc` = most recent first (smaller days-ago sorts first).
 */
export function compareByUpdated(aDays: number, bDays: number, desc: boolean): number {
  return desc ? aDays - bDays : bDays - aDays;
}
