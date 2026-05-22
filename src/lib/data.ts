import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';
import { JobsSchema, ProjectsSchema, ResumeSchema } from './schemas';
import type { Job, JobStatus, Project, Resume } from './schemas';

function loadYaml(filename: string): unknown {
  return parse(readFileSync(join(process.cwd(), 'src', 'data', filename), 'utf-8'));
}

export function getResume(): Resume {
  return ResumeSchema.parse(loadYaml('resume.yml'));
}

export function getProjects(): Project[] {
  return ProjectsSchema.parse(loadYaml('projects.yml'));
}

const GHOST_AFTER_DAYS = 28;

export function effectiveJobStatus(job: Job, now: Date): JobStatus {
  if (job.status === 'Applied') {
    const diffDays = (now.getTime() - new Date(job.applied).getTime()) / (86400 * 1000);
    if (diffDays >= GHOST_AFTER_DAYS) return 'Ghosted';
  }
  return job.status;
}

export function getJobs(): Job[] {
  const now = new Date();
  return JobsSchema.parse(loadYaml('jobs.yml')).map((j) => ({
    ...j,
    status: effectiveJobStatus(j, now),
  }));
}
