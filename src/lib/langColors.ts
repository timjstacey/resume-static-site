// Language brand colours for the projects-grid language dot. These are fixed
// GitHub-style brand hexes (not Catppuccin theme tokens), so they stay constant
// across flavours by design.
export const LANG_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f7df1e',
  HCL: '#844fba',
  Java: '#b07219',
  Scala: '#c22d40',
  Astro: '#ff5d01',
  Python: '#3572a5',
  Go: '#00add8',
  Rust: '#dea584',
  Shell: '#89e051',
};

export function langColor(lang: string | undefined): string {
  return (lang && LANG_COLORS[lang]) || '#9399b2';
}
