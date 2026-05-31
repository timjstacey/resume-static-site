import { defineEcConfig } from 'astro-expressive-code';
import { pluginLineNumbers } from '@expressive-code/plugin-line-numbers';

// Expressive Code config lives here (not in astro.config.mjs) because the
// `<Code>` component on /testing needs options that survive being passed
// through the renderer — and `themeCssSelector` is a function, which is only
// allowed from this file. The `expressiveCode()` integration auto-loads it.
export default defineEcConfig({
  // All four Catppuccin flavours; the active one is driven by the class
  // Base.astro adds to <html> (.latte/.frappe/.macchiato/.mocha), not a media
  // query — so code blocks re-theme with the rest of the page (closes #69).
  themes: ['catppuccin-latte', 'catppuccin-frappe', 'catppuccin-macchiato', 'catppuccin-mocha'],
  useDarkModeMediaQuery: false,
  themeCssSelector: (theme) => `.${theme.name.replace('catppuccin-', '')}`,
  plugins: [pluginLineNumbers()],
  defaultProps: {
    // Gutter line numbers off by default; opt in per-block with showLineNumbers.
    showLineNumbers: false,
  },
  styleOverrides: {
    borderRadius: '10px',
    borderColor: 'var(--catppuccin-color-surface1)',
    frames: {
      shadowColor: 'rgba(0,0,0,0.32)',
      editorActiveTabIndicatorTopColor: 'var(--catppuccin-color-peach)',
    },
  },
});
