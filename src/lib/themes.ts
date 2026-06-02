export const FLAVORS = [
  { id: 'latte', label: 'Latte', bg: '#eff1f5' },
  { id: 'frappe', label: 'Frappé', bg: '#303446' },
  { id: 'macchiato', label: 'Macchiato', bg: '#24273a' },
  { id: 'mocha', label: 'Mocha', bg: '#1e1e2e' },
] as const;

export type FlavorId = (typeof FLAVORS)[number]['id'];

export const THEME_TRIGGER_LABEL = 'Color theme';

export const FLAVOR_IDS: readonly FlavorId[] = FLAVORS.map((f) => f.id);

const FLAVOR_ID_SET = new Set<string>(FLAVOR_IDS);

export function isFlavorId(value: string | null | undefined): value is FlavorId {
  return value != null && FLAVOR_ID_SET.has(value);
}

/**
 * Initial flavour for the anti-FOUC bootstrap: a stored choice wins, else the
 * OS colour-scheme preference (light → latte, otherwise mocha).
 *
 * Deliberately duplicated inline in `Base.astro` — that bootstrap is a
 * render-blocking inline `<script>` that runs before hydration and so cannot
 * import a bundled module. This is the unit-tested source of truth for the rule.
 */
export function resolveFlavor(stored: string | null | undefined, prefersLight: boolean): FlavorId {
  if (isFlavorId(stored)) return stored;
  return prefersLight ? 'latte' : 'mocha';
}

/** First flavour class present among the given class names, else `mocha`. */
export function flavorFromClasses(classNames: Iterable<string>): FlavorId {
  for (const name of classNames) if (isFlavorId(name)) return name;
  return 'mocha';
}

/**
 * Roving-focus target index for the theme menu's keyboard nav. Returns the next
 * index (wrapping at both ends) for Arrow/Home/End, or `null` when the key is
 * not a navigation key (caller leaves focus alone).
 */
export function rovingIndex(length: number, current: number, key: string): number | null {
  if (length <= 0) return null;
  switch (key) {
    case 'ArrowDown':
      return (current + 1) % length;
    case 'ArrowUp':
      return (current - 1 + length) % length;
    case 'Home':
      return 0;
    case 'End':
      return length - 1;
    default:
      return null;
  }
}
