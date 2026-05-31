import type { APIContext } from 'astro';
import { getPosts } from '../lib/posts';

const TITLE = 'Tim Stacey — Field notes';
const SUBTITLE = 'Field notes on testing and quality engineering by Tim Stacey.';
const SITE = 'https://tim.sillysamoyed.com';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Atom 1.0 feed (excerpt-only), hand-built — no official Astro helper.
export async function GET(context: APIContext) {
  const site = (context.site?.toString() ?? SITE).replace(/\/$/, '');
  const posts = await getPosts();
  const updated = (posts[0]?.data.date ?? new Date()).toISOString();

  const entries = posts
    .map((post) => {
      const url = `${site}/blog/${post.id}`;
      const categories = post.data.hashtags.map((h) => `    <category term="${esc(h)}"/>`).join('\n');
      return `  <entry>
    <title>${esc(post.data.title)}</title>
    <link href="${url}"/>
    <id>${url}</id>
    <updated>${post.data.date.toISOString()}</updated>
    <summary>${esc(post.data.excerpt)}</summary>
${categories}
  </entry>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${esc(TITLE)}</title>
  <subtitle>${esc(SUBTITLE)}</subtitle>
  <link href="${site}/atom.xml" rel="self"/>
  <link href="${site}/blog"/>
  <id>${site}/blog</id>
  <updated>${updated}</updated>
  <author><name>Tim Stacey</name></author>
${entries}
</feed>
`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/atom+xml; charset=utf-8' },
  });
}
