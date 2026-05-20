import { describe, it, expect } from 'vitest';
import { getResume, getProjects, getJobs } from './data';

describe('getResume', () => {
  it('returns valid resume with required fields', () => {
    const resume = getResume();
    expect(resume.name).toBeTruthy();
    expect(resume.tagline).toBeDefined();
    expect(resume.experience.length).toBeGreaterThan(0);
    expect(resume.skills.length).toBeGreaterThan(0);
  });

  it('each experience entry has valid start date', () => {
    const resume = getResume();
    for (const exp of resume.experience) {
      expect(exp.start).toMatch(/^\d{4}-\d{2}$/);
    }
  });
});

describe('getProjects', () => {
  it('returns non-empty array of valid projects', () => {
    const projects = getProjects();
    expect(projects.length).toBeGreaterThan(0);
    for (const p of projects) {
      expect(p.name).toBeTruthy();
      expect(['active', 'wip', 'archived']).toContain(p.status);
    }
  });
});

describe('getJobs', () => {
  it('returns non-empty array of valid jobs', () => {
    const jobs = getJobs();
    expect(jobs.length).toBeGreaterThan(0);
    for (const j of jobs) {
      expect(j.company).toBeTruthy();
      expect(j.applied).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});
