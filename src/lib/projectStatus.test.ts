import { describe, it, expect } from 'vitest';
import { PROJECT_STATUS_LABEL, PROJECT_STATUS_COLOUR } from './projectStatus';

describe('projectStatus maps', () => {
  it('labels each status', () => {
    expect(PROJECT_STATUS_LABEL).toEqual({ active: 'Active', wip: 'WIP', archived: 'Archived' });
  });

  it('maps each status to a ctp text colour', () => {
    for (const colour of Object.values(PROJECT_STATUS_COLOUR)) {
      expect(colour).toMatch(/^text-ctp-/);
    }
  });

  it('covers the same three statuses in both maps', () => {
    expect(Object.keys(PROJECT_STATUS_COLOUR).sort()).toEqual(Object.keys(PROJECT_STATUS_LABEL).sort());
  });
});
