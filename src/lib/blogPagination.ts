// Client-side pagination math for the /blog published list. Pure so it can be
// unit-tested; the DOM wiring (toggling `hidden`/`disabled`/`aria-current`,
// view transitions, scroll) lives in the blog.astro `<script>`.

export interface PageView {
  /** Clamped page index actually in effect. */
  currentPage: number;
  /** Total pages for the given row count + page size (>= 1). */
  totalPages: number;
  /** Inclusive start row index of the current page window. */
  start: number;
  /** Exclusive end row index of the current page window. */
  end: number;
  /** Pagination nav should be shown (more than one page AND no tag filter). */
  showNav: boolean;
  /** "prev" control is disabled (on the first page). */
  prevDisabled: boolean;
  /** "next" control is disabled (on the last page). */
  nextDisabled: boolean;
}

/** Number of pages needed for `total` rows at `pageSize` per page (>= 1). */
export function pageCount(total: number, pageSize: number): number {
  if (pageSize <= 0) return 1;
  return Math.max(1, Math.ceil(total / pageSize));
}

/**
 * Derive the full view state for the published list. When a tag filter is
 * active the window spans every row (the filter, not the page, decides
 * visibility) and the nav hides — pagination and filtering are mutually
 * exclusive views over the same rows.
 */
export function pageView(opts: {
  total: number;
  pageSize: number;
  currentPage: number;
  filterActive: boolean;
}): PageView {
  const { total, pageSize, filterActive } = opts;
  const totalPages = pageCount(total, pageSize);
  const currentPage = Math.min(Math.max(opts.currentPage, 0), totalPages - 1);

  if (filterActive) {
    return {
      currentPage,
      totalPages,
      start: 0,
      end: total,
      showNav: false,
      prevDisabled: currentPage === 0,
      nextDisabled: currentPage === totalPages - 1,
    };
  }

  const start = currentPage * pageSize;
  return {
    currentPage,
    totalPages,
    start,
    end: start + pageSize,
    showNav: totalPages > 1,
    prevDisabled: currentPage === 0,
    nextDisabled: currentPage === totalPages - 1,
  };
}

/** Whether row `idx` falls inside the current page window. */
export function inWindow(idx: number, view: PageView): boolean {
  return idx >= view.start && idx < view.end;
}
