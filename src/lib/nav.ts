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
