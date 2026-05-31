import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { PostSchema } from './lib/schemas';

// Blog posts. Each post auto-illustrates via its `preview` terminal lines:
// tuples of [prefix, text] where prefix is "$" (shell), "#" (markdown heading),
// or " " (body line). `tag` is the primary category (drives the accent colour);
// `hashtags` carry over from the source LinkedIn post and drive the /blog Tags
// sidebar. The schema lives in lib/schemas.ts so it can be unit-tested.
const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: PostSchema,
});

export const collections = { posts };
