import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Blog posts. Each post auto-illustrates via its `preview` terminal lines:
// tuples of [prefix, text] where prefix is "$" (shell), "#" (markdown heading),
// or " " (body line). `tag` is the primary category (drives the accent colour);
// `hashtags` carry over from the source LinkedIn post and drive the /blog Tags
// sidebar.
const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    date: z.date(),
    tag: z.enum(['Strategy', 'Practice', 'Meta', 'Team', 'Tools']),
    excerpt: z.string(),
    readMins: z.number().int(),
    preview: z.array(z.tuple([z.string(), z.string()])),
    hashtags: z.array(z.string()).default([]),
  }),
});

export const collections = { posts };
