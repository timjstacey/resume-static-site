// Scrollspy selection for the blog post "On this page" TOC. Pure so it can be
// unit-tested; the DOM measurement + scroll wiring lives in blog/[slug].astro.

export interface HeadingPos {
  id: string;
  /** getBoundingClientRect().top — viewport-relative, in px. */
  top: number;
}

export interface ActiveOpts {
  /** Distance below the viewport top where a heading counts as "current". */
  offset: number;
  /** Page is scrolled to the bottom — force the final heading active. */
  atBottom: boolean;
}

/**
 * The active TOC heading: the last one whose top has scrolled past the offset
 * line. When the page is at the bottom the final heading wins outright — it can
 * sit too low to ever cross the line, which is why the last item used to
 * highlight the heading above it.
 */
export function activeHeadingId(headings: HeadingPos[], opts: ActiveOpts): string | null {
  if (headings.length === 0) return null;
  if (opts.atBottom) return headings[headings.length - 1]!.id;
  let current = headings[0]!.id;
  for (const h of headings) {
    if (h.top - opts.offset <= 0) current = h.id;
    else break;
  }
  return current;
}
