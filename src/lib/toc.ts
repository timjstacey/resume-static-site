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
  /** Page is scrolled to the bottom. */
  atBottom: boolean;
  /**
   * A heading the reader explicitly jumped to via a TOC click, still in effect
   * (not yet scrolled away from). It wins outright — without it, clicking a
   * heading near the end that bottoms the page out would land on `atBottom` and
   * highlight the *last* heading instead of the one clicked.
   */
  pinned?: string | null;
}

/**
 * The active TOC heading. Precedence:
 *  1. an in-effect `pinned` click target (disambiguates the cramped last screen,
 *     where scroll position alone can't tell the last two headings apart);
 *  2. at the bottom of the page, the final heading (it can sit too low to ever
 *     cross the offset line on its own);
 *  3. otherwise the last heading whose top has scrolled past the offset line.
 */
export function activeHeadingId(headings: HeadingPos[], opts: ActiveOpts): string | null {
  if (headings.length === 0) return null;
  if (opts.pinned != null && headings.some((h) => h.id === opts.pinned)) return opts.pinned;
  if (opts.atBottom) return headings[headings.length - 1]!.id;
  let current = headings[0]!.id;
  for (const h of headings) {
    if (h.top - opts.offset <= 0) current = h.id;
    else break;
  }
  return current;
}
