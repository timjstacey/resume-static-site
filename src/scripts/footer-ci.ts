import type { CiSnapshot } from '../lib/schemas';
import { hydrate } from './hydrate';

// Footer CI block hydration. Scoped to <footer>: the /testing CI strip shares the
// data-ci-branch hook, so a document-wide query would grab the wrong element.
const root = document.querySelector('footer');
const status = root?.querySelector<HTMLElement>('[data-ci-status]') ?? null;
const word = root?.querySelector<HTMLElement>('[data-ci-word]') ?? null;
const branch = root?.querySelector<HTMLElement>('[data-ci-branch]') ?? null;
const deploy = root?.querySelector<HTMLElement>('[data-ci-deploy]') ?? null;

void hydrate<CiSnapshot>(
  '/api/ci-snapshot',
  (ci) => {
    if (word) word.textContent = ci.passing ? 'green' : 'failing';
    if (branch) branch.textContent = ci.branch;
    if (deploy) deploy.textContent = ci.lastDeployAgo;
    status?.classList.toggle('text-ctp-green', ci.passing);
    status?.classList.toggle('text-ctp-red', !ci.passing);
  },
  ['[data-ci-status]', '[data-ci-deploy]']
);
