// Pure helpers for the OG snippet image route and render script.
// Kept free of Astro runtime imports so they unit-test directly.

export interface SnippetBlock {
  lang: string;
  title: string;
  code: string;
}

/**
 * Canonical path for a post's hand-authored OG snippet.
 * The file may not exist — the route falls back to pickHeroFence.
 */
export function ogSnippetPath(slug: string): string {
  return `src/og-snippets/${slug}.ts`;
}

/**
 * Extract the first fenced code block from a markdown body.
 * Returns { lang, title, code } or null when no fence is found.
 *
 * Handles:
 *   ```lang title="file.ext"
 *   ...code...
 *   ```
 * The title attribute is optional; lang defaults to '' when absent.
 */
export function pickHeroFence(markdownBody: string): SnippetBlock | null {
  // Match opening fence: backticks, optional lang, optional attrs, then code until closing fence.
  const fenceRe = /^```([^\s`]*)?([^\n]*)?\n([\s\S]*?)^```/m;
  const match = fenceRe.exec(markdownBody);
  if (!match) return null;

  const lang = (match[1] ?? '').trim();
  const attrLine = (match[2] ?? '').trim();
  const code = match[3] ?? '';

  // Extract title="..." from the attribute line, if present.
  const titleMatch = /title="([^"]*)"/.exec(attrLine);
  const title = titleMatch ? titleMatch[1]! : '';

  return { lang, title, code };
}

/**
 * Derive the frame title shown in the Expressive Code window chrome.
 * Priority: snippet block title → slug.ts fallback.
 */
export function ogTitle(slug: string, snippet: SnippetBlock | null): string {
  if (snippet?.title) return snippet.title;
  return `${slug}.ts`;
}
