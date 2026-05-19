export function isActivePath(href: string, currentPath: string): boolean {
  return href === '/' ? currentPath === '/' : currentPath.startsWith(href);
}
