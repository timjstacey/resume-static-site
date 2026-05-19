import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';
import { JobsSchema, ProjectsSchema, ResumeSchema } from './schemas';
import type { Job, Project, Resume } from './schemas';

function loadYaml(filename: string): unknown {
  return parse(readFileSync(join(process.cwd(), 'src', 'data', filename), 'utf-8'));
}

export function getResume(): Resume {
  return ResumeSchema.parse(loadYaml('resume.yml'));
}

export function getProjects(): Project[] {
  return ProjectsSchema.parse(loadYaml('projects.yml'));
}

export function getJobs(): Job[] {
  return JobsSchema.parse(loadYaml('jobs.yml'));
}
