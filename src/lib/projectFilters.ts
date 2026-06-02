import { getProjects } from './data';

// Distinct languages present in the data, lowercased + sorted. Derived from the
// YAML rather than hardcoded, so adding a project with a new `lang` surfaces a
// matching filter pill automatically — no second file to remember to edit.
const langs = [
  ...new Set(
    getProjects()
      .map((p) => p.lang)
      .filter((l): l is string => Boolean(l))
  ),
]
  .map((l) => l.toLowerCase())
  .sort();

// Filter pills shown on the projects page. Single source of truth so the page
// and its e2e spec stay in sync. 'all' shows everything; 'pinned' matches the
// pinned flag; each lang matches a tag or language token (lowercased).
export const PROJECT_FILTERS: readonly string[] = ['all', ...langs, 'pinned'];

export type ProjectFilter = string;

// The pure filter/sort rules live in ./projectMatch (no data.ts import) so the
// browser bundle for projects.astro can use them without pulling in node:fs.
export { projectMatchesFilter, tagParam, compareByUpdated } from './projectMatch';
