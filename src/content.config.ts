import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Blog posts. Each post auto-illustrates via its `preview` terminal lines:
// tuples of [prefix, text] where prefix is "$" (shell), "#" (markdown heading),
// or " " (body line).
const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    date: z.date(),
    tag: z.enum(['Strategy', 'Practice', 'Meta', 'Team', 'Tools']),
    excerpt: z.string(),
    readMins: z.number().int(),
    preview: z.array(z.tuple([z.string(), z.string()])),
  }),
});

export const collections = { posts };
