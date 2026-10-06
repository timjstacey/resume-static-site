import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';
import {
  CiSnapshotSchema,
  HuntSchema,
  JobsSchema,
  ProjectsSchema,
  ProjectStatsSchema,
  ResumeSchema,
  TestingSchema,
} from './schemas';
import type { CiSnapshot, Hunt, Job, JobSource, JobStatus, Project, ProjectStats, Resume, Testing } from './schemas';

function dataPath(filename: string): string {
  return join(process.cwd(), 'src', 'data', filename);
}

function loadYaml(filename: string): unknown {
  return parse(readFileSync(dataPath(filename), 'utf-8'));
}

export function getResume(): Resume {
  return ResumeSchema.parse(loadYaml('resume.yml'));
}

export function getProjectStats(): ProjectStats {
  return ProjectStatsSchema.parse(JSON.parse(readFileSync(dataPath('project-stats.json'), 'utf-8')));
}

// Merge generated GitHub stats (keyed by repo URL) onto the hand-authored
// projects. A project with no repo, or no matching stats entry, is left as-is.
export function mergeProjectStats(projects: Project[], stats: ProjectStats): Project[] {
  return projects.map((p) => {
    const s = p.repo ? stats[p.repo] : undefined;
    return s ? { ...p, stars: s.stars, forks: s.forks, updatedAt: s.updatedAt } : p;
  });
}

export function getProjects(): Project[] {
  const projects = ProjectsSchema.parse(loadYaml('projects.yml'));
  return mergeProjectStats(projects, getProjectStats());
}

const GHOST_AFTER_DAYS = 28;

export function effectiveJobStatus(job: Job, now: Date): JobStatus {
  if (job.status === 'Applied') {
    const diffDays = (now.getTime() - new Date(job.applied).getTime()) / (86400 * 1000);
    if (diffDays >= GHOST_AFTER_DAYS) return 'Ghosted';
  }
  return job.status;
}

// Fall back to the source named in free-text notes ("Applied via Seek").
export function deriveSource(job: Job): JobSource | undefined {
  if (job.source) return job.source;
  const notes = job.notes?.toLowerCase() ?? '';
  if (notes.includes('seek')) return 'Seek';
  if (notes.includes('linkedin')) return 'LinkedIn';
  if (notes.includes('jobgether')) return 'Jobgether';
  return undefined;
}

export function getHunt(): Hunt {
  return HuntSchema.parse(loadYaml('hunt.yml'));
}

// The clock the ghost rule runs against: frozen at closedAt once the hunt is closed.
export function huntClock(hunt: Hunt, now: Date): Date {
  if (hunt.state === 'active') return now;
  return new Date(hunt.closedAt + 'T00:00:00Z');
}

// Strip everything that identifies the employer (closed hunts are anonymised).
export function redactJob(job: Job): Job {
  return { ...job, company: '', url: undefined, notes: undefined };
}

export function getJobs(now: Date = new Date(), hunt: Hunt = getHunt()): Job[] {
  const clock = huntClock(hunt, now);
  return JobsSchema.parse(loadYaml('jobs.yml')).map((j) => {
    const job = { ...j, status: effectiveJobStatus(j, clock), source: deriveSource(j) };
    return hunt.state === 'closed' ? redactJob(job) : job;
  });
}

export function getTesting(): Testing {
  return TestingSchema.parse(loadYaml('testing.yml'));
}

export function getCiSnapshot(): CiSnapshot {
  return CiSnapshotSchema.parse(JSON.parse(readFileSync(dataPath('ci-snapshot.json'), 'utf-8')));
}
