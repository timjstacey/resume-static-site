// Link semantics shared by components (and mirrored by the rehype-external-links
// markdown pass). Pure + DOM-free so it unit-tests and runs at SSR build time.

/**
 * Whether an href points off-site and should open in a new tab.
 *
 * External === an absolute http(s) URL. Internal app routes ("/blog"),
 * in-page anchors ("#slug"), relative paths ("./x"), and non-http schemes
 * (`mailto:`, `tel:`) are NOT new-tab candidates — a `target="_blank"` on a
 * mailto just leaves a dead blank tab.
 */
export function isExternalUrl(href: string | undefined | null): boolean {
  if (!href) return false;
  return /^https?:\/\//i.test(href.trim());
}
