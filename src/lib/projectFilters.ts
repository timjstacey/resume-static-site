// Filter pills shown on the projects page. Single source of truth so the page
// and its e2e spec stay in sync. 'all' shows everything; 'pinned' matches the
// pinned flag; the rest match a tag or language token (lowercased).
export const PROJECT_FILTERS = ['all', 'typescript', 'astro', 'python', 'pinned'] as const;

export type ProjectFilter = (typeof PROJECT_FILTERS)[number];
