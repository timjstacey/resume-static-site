export const NAV_ITEMS = [
  { href: '/', label: '~' },
  { href: '/resume', label: 'Resume' },
  { href: '/projects', label: 'Projects' },
  { href: '/blog', label: 'Blog' },
  { href: '/job-hunt', label: 'Job Hunt' },
  { href: '/testing', label: 'Testing' },
] as const;

export function isActivePath(href: string, currentPath: string): boolean {
  if (href === '/') return currentPath === '/';
  return currentPath === href || currentPath.startsWith(href + '/');
}

/**
 * Focus-trap target for the mobile drawer's Tab handling. `activeIndex` is the
 * focused item's index within the drawer (-1 when focus is outside it). Returns
 * the index to move focus to, or `null` to let the browser advance Tab normally:
 *  - focus outside the drawer → first item (pull it back in);
 *  - Shift+Tab on the first item → last item (wrap backwards);
 *  - Tab on the last item → first item (wrap forwards);
 *  - otherwise → null (no wrap needed).
 */
export function trapFocusTarget(length: number, activeIndex: number, shift: boolean): number | null {
  if (length === 0) return null;
  if (activeIndex === -1) return 0;
  if (shift && activeIndex === 0) return length - 1;
  if (!shift && activeIndex === length - 1) return 0;
  return null;
}
