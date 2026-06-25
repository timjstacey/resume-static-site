import { describe, expect, it } from 'vitest';
import {
  CiRunSchema,
  CiSnapshotSchema,
  JobSchema,
  JobSourceSchema,
  JobStatusSchema,
  JobsSchema,
  PostSchema,
  PostTagSchema,
  ProjectSchema,
  ProjectStatsSchema,
  ProjectStatusSchema,
  ProjectsSchema,
  ResumeSchema,
  TestingSchema,
} from './schemas';

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

describe('JobSourceSchema', () => {
  it('accepts the four known sources', () => {
    for (const source of ['Seek', 'LinkedIn', 'Jobgether', 'Other']) {
      expect(() => JobSourceSchema.parse(source)).not.toThrow();
    }
  });

  it('rejects an unknown source', () => {
    expect(() => JobSourceSchema.parse('Indeed')).toThrow();
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

  it('coerces a YAML Date in updatedAt to YYYY-MM-DD', () => {
    const result = ProjectSchema.parse({ ...validProject, updatedAt: new Date('2026-05-27') });
    expect(result.updatedAt).toBe('2026-05-27');
  });

  it('rejects a malformed updatedAt', () => {
    expect(() => ProjectSchema.parse({ ...validProject, updatedAt: '4d ago' })).toThrow();
  });

  it('rejects missing name', () => {
    expect(() => ProjectSchema.parse({ ...validProject, name: '' })).toThrow();
  });
});

describe('ProjectsSchema', () => {
  it('parses an array of projects', () => {
    expect(() => ProjectsSchema.parse([validProject])).not.toThrow();
  });

  it('rejects an array with an invalid entry', () => {
    expect(() => ProjectsSchema.parse([validProject, { name: 'x' }])).toThrow();
  });
});

describe('ProjectStatsSchema', () => {
  const valid = {
    'https://github.com/timjstacey/resume-static-site': { stars: 3, forks: 1, updatedAt: '2026-05-31' },
  };

  it('parses a repo → stats record', () => {
    expect(() => ProjectStatsSchema.parse(valid)).not.toThrow();
  });

  it('parses an empty record', () => {
    expect(() => ProjectStatsSchema.parse({})).not.toThrow();
  });

  it('coerces a YAML Date in updatedAt to YYYY-MM-DD', () => {
    const parsed = ProjectStatsSchema.parse({ repo: { stars: 0, forks: 0, updatedAt: new Date('2026-05-27') } });
    expect(parsed.repo!.updatedAt).toBe('2026-05-27');
  });

  it('rejects a non-integer star count', () => {
    expect(() => ProjectStatsSchema.parse({ repo: { stars: 1.5, forks: 0, updatedAt: '2026-05-27' } })).toThrow();
  });

  it('rejects a missing field', () => {
    expect(() => ProjectStatsSchema.parse({ repo: { stars: 1, forks: 0 } })).toThrow();
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

const validPost = {
  title: 'Playwright agents and the new QA skills gap',
  date: new Date('2026-05-10'),
  tag: 'Tools',
  excerpt: 'Three agents in the test runner.',
  readMins: 6,
  preview: [
    ['$', 'cat playwright-ai-agents.md'],
    ['#', '# Title'],
  ],
  hashtags: ['Playwright', 'AI'],
};

describe('PostSchema', () => {
  it('accepts a fully-formed post', () => {
    expect(() => PostSchema.parse(validPost)).not.toThrow();
  });

  it('defaults hashtags to [] when omitted', () => {
    const noHashtags: Record<string, unknown> = { ...validPost };
    delete noHashtags.hashtags;
    expect(PostSchema.parse(noHashtags).hashtags).toEqual([]);
  });

  it('rejects an unknown tag', () => {
    expect(() => PostSchema.parse({ ...validPost, tag: 'News' })).toThrow();
  });

  it('rejects a non-integer readMins', () => {
    expect(() => PostSchema.parse({ ...validPost, readMins: 6.5 })).toThrow();
  });

  it('rejects a string date (frontmatter must yield a Date)', () => {
    expect(() => PostSchema.parse({ ...validPost, date: '2026-05-10' })).toThrow();
  });

  it('rejects malformed preview tuples', () => {
    expect(() => PostSchema.parse({ ...validPost, preview: [['$']] })).toThrow();
  });

  it('accepts an optional linkedinPost summary', () => {
    const withSummary = {
      ...validPost,
      linkedinPost: 'New write-up on seeding Playwright suites. Full post: https://tim.sillysamoyed.com/blog/x',
    };
    expect(() => PostSchema.parse(withSummary)).not.toThrow();
  });

  it('rejects a non-string linkedinPost', () => {
    expect(() => PostSchema.parse({ ...validPost, linkedinPost: 42 })).toThrow();
  });
});

describe('PostTagSchema', () => {
  it('accepts the five categories', () => {
    for (const tag of ['Strategy', 'Practice', 'Meta', 'Team', 'Tools']) {
      expect(() => PostTagSchema.parse(tag)).not.toThrow();
    }
  });

  it('rejects an unknown tag', () => {
    expect(() => PostTagSchema.parse('News')).toThrow();
  });
});

const validTesting = {
  routing: [{ project: 'content', device: 'Desktop Chrome', engine: 'chromium', specs: ['home'] }],
  workflows: [{ file: 'ci.yml', accent: 'peach', on: 'pull_request', steps: [{ name: 'lint', match: 'Lint' }] }],
};

describe('TestingSchema', () => {
  it('parses a valid testing config', () => {
    expect(() => TestingSchema.parse(validTesting)).not.toThrow();
  });

  it('rejects an unknown engine', () => {
    const bad = { ...validTesting, routing: [{ ...validTesting.routing[0], engine: 'blink' }] };
    expect(() => TestingSchema.parse(bad)).toThrow();
  });

  it('rejects a workflow step missing its match', () => {
    const bad = { ...validTesting, workflows: [{ ...validTesting.workflows[0], steps: [{ name: 'lint' }] }] };
    expect(() => TestingSchema.parse(bad)).toThrow();
  });
});

describe('CiRunSchema', () => {
  it('accepts pass, flake, fail', () => {
    for (const run of ['pass', 'flake', 'fail']) {
      expect(() => CiRunSchema.parse(run)).not.toThrow();
    }
  });

  it('rejects an unknown run result', () => {
    expect(() => CiRunSchema.parse('error')).toThrow();
  });
});

const validSnapshot = {
  branch: 'main',
  passing: true,
  sha: 'abc1234',
  commitMessage: 'fix: thing',
  commitAgo: '2h ago',
  lastDeployAgo: '1h ago',
  runs: ['pass', 'flake', 'pass'],
  p50: '3m',
  p95: '5m',
  p50Delta: '-4s',
  p95Delta: '+1s',
};

describe('CiSnapshotSchema', () => {
  it('parses a valid snapshot', () => {
    expect(() => CiSnapshotSchema.parse(validSnapshot)).not.toThrow();
  });

  it('rejects an invalid run result in the runs array', () => {
    expect(() => CiSnapshotSchema.parse({ ...validSnapshot, runs: ['pass', 'boom'] })).toThrow();
  });

  it('rejects a non-boolean passing flag', () => {
    expect(() => CiSnapshotSchema.parse({ ...validSnapshot, passing: 'yes' })).toThrow();
  });

  it('accepts an optional gates map (workflow → step → duration)', () => {
    const withGates = { ...validSnapshot, gates: { 'ci.yml': { Lint: '11s', Build: '24s' } } };
    expect(() => CiSnapshotSchema.parse(withGates)).not.toThrow();
  });

  it('rejects a gates duration that is not a string', () => {
    const bad = { ...validSnapshot, gates: { 'ci.yml': { Lint: 11 } } };
    expect(() => CiSnapshotSchema.parse(bad)).toThrow();
  });
});
