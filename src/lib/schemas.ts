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

export const JobSchema = z.object({
  company: z.string().min(1),
  role: z.string().min(1),
  url: z.string().optional(),
  applied: yamlDate,
  status: JobStatusSchema,
  notes: z.string().optional(),
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
});

export const ProjectsSchema = z.array(ProjectSchema);

// --- Resume ---

const ContactSchema = z.object({
  email: z.email(),
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
  contact: ContactSchema,
  experience: z.array(ExperienceSchema),
  education: z.array(EducationSchema),
  skills: z.array(SkillCategorySchema),
});

export type JobStatus = z.infer<typeof JobStatusSchema>;
export type Job = z.infer<typeof JobSchema>;
export type ProjectStatus = z.infer<typeof ProjectStatusSchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type Resume = z.infer<typeof ResumeSchema>;
