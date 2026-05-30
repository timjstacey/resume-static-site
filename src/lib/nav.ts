import { FEATURES } from './features';

const ALL_NAV_ITEMS = [
  { href: '/', label: '~' },
  { href: '/resume', label: 'Resume' },
  { href: '/projects', label: 'Projects' },
  { href: '/blog', label: 'Blog' },
  { href: '/job-hunt', label: 'Job Hunt' },
  { href: '/testing', label: 'Testing' },
] as const;

// Blog hides until content lands — flip FEATURES.blog to re-expose the link.
export const NAV_ITEMS = ALL_NAV_ITEMS.filter((item) => item.href !== '/blog' || FEATURES.blog);

export function isActivePath(href: string, currentPath: string): boolean {
  if (href === '/') return currentPath === '/';
  return currentPath === href || currentPath.startsWith(href + '/');
}
