import type { Job, Resume } from './schemas';

const ACTIVE_STATUSES = new Set<Job['status']>(['Applied', 'Screening', 'Interviewing', 'Offered']);

export function activePipeline(jobs: Job[]): number {
  return jobs.filter((j) => ACTIVE_STATUSES.has(j.status)).length;
}

export function yearsOfExp(experience: Resume['experience']): number {
  const earliest = experience.map((e) => new Date(e.start + '-01')).reduce((a, b) => (a < b ? a : b));
  return Math.floor((Date.now() - earliest.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
}
