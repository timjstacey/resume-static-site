export const FLAVORS = [
  { id: 'latte', label: 'Latte', bg: '#eff1f5' },
  { id: 'frappe', label: 'Frappé', bg: '#303446' },
  { id: 'macchiato', label: 'Macchiato', bg: '#24273a' },
  { id: 'mocha', label: 'Mocha', bg: '#1e1e2e' },
] as const;

export type FlavorId = (typeof FLAVORS)[number]['id'];

export const THEME_TRIGGER_LABEL = 'Color theme';
