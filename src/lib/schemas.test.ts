import { describe, expect, it } from 'vitest';
import { JobSchema, JobStatusSchema, JobsSchema, ProjectSchema, ProjectStatusSchema, ResumeSchema } from './schemas';

describe('JobStatusSchema', () => {
  const validStatuses = [
    'Applied',
    'Screening',
    'Interviewing',
    'Offered',
    'Rejected',
    'Withdrawn',
    'Ghosted',
  ] as const;

  it('accepts all 7 valid statuses', () => {
    for (const status of validStatuses) {
      expect(() => JobStatusSchema.parse(status)).not.toThrow();
    }
  });

  it('rejects unknown status', () => {
    expect(() => JobStatusSchema.parse('Pending')).toThrow();
  });
});

const validJob = {
  company: 'Acme Corp',
  role: 'Engineer',
  applied: '2026-05-01',
  status: 'Applied',
};

describe('JobSchema', () => {
  it('parses a minimal valid job entry', () => {
    expect(() => JobSchema.parse(validJob)).not.toThrow();
  });

  it('accepts optional url and notes', () => {
    const job = { ...validJob, url: 'https://example.com', notes: 'A note' };
    expect(() => JobSchema.parse(job)).not.toThrow();
  });

  it('coerces YAML Date object to YYYY-MM-DD string', () => {
    const result = JobSchema.parse({ ...validJob, applied: new Date('2026-05-01') });
    expect(result.applied).toBe('2026-05-01');
  });

  it('rejects invalid date format', () => {
    expect(() => JobSchema.parse({ ...validJob, applied: '01/05/2026' })).toThrow();
  });

  it('rejects missing required fields', () => {
    expect(() => JobSchema.parse({ company: 'Acme' })).toThrow();
  });

  it('rejects invalid status', () => {
    expect(() => JobSchema.parse({ ...validJob, status: 'Pending' })).toThrow();
  });
});

describe('JobsSchema', () => {
  it('parses an array of jobs', () => {
    expect(() => JobsSchema.parse([validJob])).not.toThrow();
  });

  it('parses an empty array', () => {
    expect(() => JobsSchema.parse([])).not.toThrow();
  });
});

describe('ProjectStatusSchema', () => {
  it('accepts active, wip, archived', () => {
    for (const status of ['active', 'wip', 'archived']) {
      expect(() => ProjectStatusSchema.parse(status)).not.toThrow();
    }
  });

  it('rejects unknown status', () => {
    expect(() => ProjectStatusSchema.parse('live')).toThrow();
  });
});

const validProject = {
  name: 'My Project',
  description: 'A test project',
  tags: ['TypeScript'],
  status: 'active',
};

describe('ProjectSchema', () => {
  it('parses a minimal valid project', () => {
    expect(() => ProjectSchema.parse(validProject)).not.toThrow();
  });

  it('accepts optional url and repo', () => {
    const project = { ...validProject, url: 'https://example.com', repo: 'https://github.com/x/y' };
    expect(() => ProjectSchema.parse(project)).not.toThrow();
  });

  it('rejects missing name', () => {
    expect(() => ProjectSchema.parse({ ...validProject, name: '' })).toThrow();
  });
});

const validResume = {
  name: 'Tim Stacey',
  tagline: 'Software Engineer',
  contact: { email: 'tim@example.com' },
  experience: [{ company: 'Acme', role: 'Engineer', start: '2022-01', end: 'present', bullets: [] }],
  education: [{ institution: 'Uni', degree: 'BSc CS', year: 2017 }],
  skills: [{ category: 'Languages', items: ['TypeScript'] }],
};

describe('ResumeSchema', () => {
  it('parses a valid resume', () => {
    expect(() => ResumeSchema.parse(validResume)).not.toThrow();
  });

  it('accepts end date as YYYY-MM', () => {
    const resume = {
      ...validResume,
      experience: [{ ...validResume.experience[0], end: '2023-06' }],
    };
    expect(() => ResumeSchema.parse(resume)).not.toThrow();
  });

  it('rejects invalid email', () => {
    const resume = { ...validResume, contact: { email: 'not-an-email' } };
    expect(() => ResumeSchema.parse(resume)).toThrow();
  });

  it('rejects invalid start date format', () => {
    const resume = {
      ...validResume,
      experience: [{ ...validResume.experience[0], start: '2022' }],
    };
    expect(() => ResumeSchema.parse(resume)).toThrow();
  });

  it('rejects empty name', () => {
    expect(() => ResumeSchema.parse({ ...validResume, name: '' })).toThrow();
  });
});
