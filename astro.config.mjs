import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import expressiveCode from 'astro-expressive-code';
import rehypeExternalLinks from 'rehype-external-links';

export default defineConfig({
  site: 'https://tim.sillysamoyed.com',
  output: 'static',
  // Expressive Code options live in ./ec.config.mjs (required for the <Code>
  // component, which can't take non-serializable options like themeCssSelector).
  integrations: [expressiveCode()],
  markdown: {
    // Issue #124: every external link in a post body opens in a new tab with a
    // safe rel. Runs on the rendered hast, rewriting only absolute http(s)
    // anchors — relative ("./x") and in-page ("#slug") links are untouched.
    // This makes the rule self-enforcing for routine-generated posts.
    // `content` appends a ↗ marker (matching the site's manual external-link
    // arrow convention) so readers see the link leaves the site / opens a tab.
    rehypePlugins: [
      [
        rehypeExternalLinks,
        {
          target: '_blank',
          rel: ['noopener', 'noreferrer'],
          protocols: ['http', 'https'],
          content: {
            type: 'element',
            tagName: 'span',
            properties: { className: ['external-arrow'], ariaHidden: 'true' },
            children: [{ type: 'text', value: '↗' }],
          },
        },
      ],
    ],
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
