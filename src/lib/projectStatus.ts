import type { ProjectStatus } from './schemas';

export const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  active: 'Active',
  wip: 'WIP',
  archived: 'Archived',
};

export const PROJECT_STATUS_COLOUR: Record<ProjectStatus, string> = {
  active: 'text-ctp-green',
  wip: 'text-ctp-yellow',
  archived: 'text-ctp-overlay2',
};
