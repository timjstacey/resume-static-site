import { z } from 'zod';

// YAML parsers auto-cast bare dates (2026-05-01) to Date objects — normalise back to string
const yamlDate = z.preprocess(
  (val) => (val instanceof Date ? val.toISOString().slice(0, 10) : val),
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD')
);

const yearMonth = z.string().regex(/^\d{4}-\d{2}$/, 'Expected YYYY-MM');

// --- Jobs ---

export const JobStatusSchema = z.enum([
  'Applied',
  'Screening',
  'Interviewing',
  'Offered',
  'Rejected',
  'Withdrawn',
  'Ghosted',
]);

export const JobSourceSchema = z.enum(['Seek', 'LinkedIn', 'Jobgether', 'Other']);

export const JobSchema = z.object({
  company: z.string().min(1),
  role: z.string().min(1),
  url: z.string().optional(),
  applied: yamlDate,
  status: JobStatusSchema,
  notes: z.string().optional(),
  lastContact: yamlDate.optional(),
  source: JobSourceSchema.optional(),
});

export const JobsSchema = z.array(JobSchema);

// --- Projects ---

export const ProjectStatusSchema = z.enum(['active', 'wip', 'archived']);

export const ProjectSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  url: z.string().optional(),
  repo: z.string().optional(),
  tags: z.array(z.string()),
  status: ProjectStatusSchema,
  // Hand-authored redesign metadata.
  pinned: z.boolean().optional(),
  lang: z.string().optional(),
  // GitHub stats — not in projects.yml; merged in from project-stats.json by
  // getProjects() (keyed on `repo`). Optional so a repo-less project still parses.
  stars: z.number().int().optional(),
  forks: z.number().int().optional(),
  updatedAt: yamlDate.optional(),
});

export const ProjectsSchema = z.array(ProjectSchema);

// --- Project stats (generated: src/data/project-stats.json, keyed by repo URL) ---
// Live GitHub counts, refreshed nightly by scripts/refresh-project-stats.mjs —
// do not hand-edit. Merged onto projects by getProjects().

export const ProjectStatsSchema = z.record(
  z.string(),
  z.object({
    stars: z.number().int(),
    forks: z.number().int(),
    updatedAt: yamlDate,
  })
);

// --- Resume ---

const ContactSchema = z.object({
  email: z.email().optional(),
  github: z.string().optional(),
  linkedin: z.string().optional(),
});

const ExperienceSchema = z.object({
  company: z.string().min(1),
  role: z.string().min(1),
  start: yearMonth,
  end: z.union([yearMonth, z.literal('present')]),
  bullets: z.array(z.string()),
});

const EducationSchema = z.object({
  institution: z.string().min(1),
  degree: z.string().min(1),
  year: z.number().int(),
});

const SkillCategorySchema = z.object({
  category: z.string().min(1),
  items: z.array(z.string()),
});

export const ResumeSchema = z.object({
  name: z.string().min(1),
  tagline: z.string(),
  bio: z.string().optional(),
  contact: ContactSchema,
  experience: z.array(ExperienceSchema),
  education: z.array(EducationSchema).optional(),
  skills: z.array(SkillCategorySchema),
});

// --- Blog tags (posts content collection) ---

export const PostTagSchema = z.enum(['Strategy', 'Practice', 'Meta', 'Team', 'Tools']);

// --- Blog posts (the `posts` content collection in content.config.ts) ---
// `preview` tuples are [prefix, text] (prefix "$" | "#" | " "). `hashtags`
// carry over from the source LinkedIn post and default to [] for hand-written
// posts. `date` is a Date — YAML frontmatter casts bare dates for us.
export const PostSchema = z.object({
  title: z.string(),
  date: z.date(),
  tag: PostTagSchema,
  excerpt: z.string(),
  readMins: z.number().int(),
  preview: z.array(z.tuple([z.string(), z.string()])),
  hashtags: z.array(z.string()).default([]),
  // Set by the blog routine when this post was cross-posted from a LinkedIn post.
  // `notify-linkedin.yml` reads them on merge to comment the blog link back on the
  // original LinkedIn post. Omitted for hand-written posts.
  linkedinUrl: z.url().optional(),
  linkedinComment: z.string().optional(),
});

// --- Testing page config (routing matrix + CI gate pipelines) ---

const RoutingRowSchema = z.object({
  project: z.string().min(1),
  device: z.string().min(1),
  engine: z.enum(['chromium', 'firefox', 'webkit']),
  specs: z.array(z.string()),
});

const WorkflowStepSchema = z.object({
  name: z.string().min(1), // display label on the gate card
  match: z.string().min(1), // GitHub Actions step name to read the real duration from (ci-snapshot `gates`)
});

const WorkflowSchema = z.object({
  file: z.string().min(1),
  accent: z.string().min(1),
  on: z.string().min(1),
  steps: z.array(WorkflowStepSchema),
});

export const TestingSchema = z.object({
  routing: z.array(RoutingRowSchema),
  workflows: z.array(WorkflowSchema),
});

// --- CI snapshot (static; refreshed by a nightly job later) ---

export const CiRunSchema = z.enum(['pass', 'flake', 'fail']);

export const CiSnapshotSchema = z.object({
  branch: z.string().min(1),
  passing: z.boolean(),
  sha: z.string().min(1),
  commitMessage: z.string(),
  commitAgo: z.string(),
  lastDeployAgo: z.string(),
  runs: z.array(CiRunSchema),
  p50: z.string(),
  p95: z.string(),
  p50Delta: z.string(),
  p95Delta: z.string(),
  // Real per-step durations from the latest successful run of each workflow,
  // keyed workflow file → GHA step name → formatted duration (e.g. "11s").
  // Optional: an older snapshot (or a renamed step) degrades to a "—" on the
  // gate card rather than breaking the build.
  gates: z.record(z.string(), z.record(z.string(), z.string())).optional(),
});

export type JobStatus = z.infer<typeof JobStatusSchema>;
export type JobSource = z.infer<typeof JobSourceSchema>;
export type Job = z.infer<typeof JobSchema>;
export type ProjectStatus = z.infer<typeof ProjectStatusSchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type ProjectStats = z.infer<typeof ProjectStatsSchema>;
export type Resume = z.infer<typeof ResumeSchema>;
export type PostTag = z.infer<typeof PostTagSchema>;
export type PostFrontmatter = z.infer<typeof PostSchema>;
export type Testing = z.infer<typeof TestingSchema>;
export type CiRun = z.infer<typeof CiRunSchema>;
export type CiSnapshot = z.infer<typeof CiSnapshotSchema>;
