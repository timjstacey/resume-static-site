import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import { REPO_URLS } from './repoList';

interface ProjectEntry {
  repo?: string;
}

describe('REPO_URLS', () => {
  it('matches the repo: fields in projects.yml (no drift)', () => {
    const projects = parse(readFileSync(join(process.cwd(), 'src', 'data', 'projects.yml'), 'utf-8')) as ProjectEntry[];
    const fromYaml = projects.map((p) => p.repo).filter((r): r is string => Boolean(r));
    expect(new Set(REPO_URLS)).toEqual(new Set(fromYaml));
  });
});
