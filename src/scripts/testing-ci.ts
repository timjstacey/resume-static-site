import { stepDuration } from '../lib/ciGates';
import type { CiSnapshot } from '../lib/schemas';
import { hydrate } from './hydrate';

// /testing CI strip + gate/layer durations. Scoped to <main> so the shared
// data-ci-branch hook doesn't resolve to the footer's copy.
const root = document.querySelector('main');
const runColor = (r: string) => (r === 'pass' ? 'green' : r === 'flake' ? 'yellow' : 'red');
const set = (sel: string, text: string) => {
  const el = root?.querySelector<HTMLElement>(sel);
  if (el) el.textContent = text;
};

void hydrate<CiSnapshot>(
  '/api/ci-snapshot',
  (ci) => {
    set('[data-ci-branch]', ci.branch);
    set('[data-ci-passing]', ci.passing ? 'passing' : 'failing');
    set('[data-ci-commitago]', ci.commitAgo);
    set('[data-ci-sha]', `#${ci.sha}`);
    set('[data-ci-message]', ci.commitMessage);
    set('[data-ci-p50]', ci.p50);
    set('[data-ci-p50delta]', ci.p50Delta);
    set('[data-ci-p95]', ci.p95);
    set('[data-ci-p95delta]', ci.p95Delta);
    set('[data-ci-clean]', String(ci.runs.filter((r) => r === 'pass').length));

    const runsEl = root?.querySelector<HTMLElement>('[data-ci-runs]');
    if (runsEl) {
      runsEl.replaceChildren(
        ...ci.runs.map((r) => {
          const sq = document.createElement('span');
          sq.className = 'h-3.5 w-3.5 rounded-[3px]';
          sq.style.background = `var(--catppuccin-color-${runColor(r)})`;
          return sq;
        })
      );
    }

    // Gate + layer durations re-resolve against the fresh ci.gates map.
    for (const el of root?.querySelectorAll<HTMLElement>('[data-gate-dur]') ?? []) {
      const dur = stepDuration(ci.gates, el.dataset.gateWf ?? '', el.dataset.gateStep ?? '');
      el.textContent = dur ? `✓ ${dur}` : '— no data';
      el.classList.toggle('text-ctp-green', dur !== null);
      el.classList.toggle('text-ctp-overlay1', dur === null);
    }
    for (const el of root?.querySelectorAll<HTMLElement>('[data-layer-dur]') ?? []) {
      const dur = stepDuration(ci.gates, el.dataset.gateWf ?? '', el.dataset.gateStep ?? '');
      el.textContent = dur ? ` · ${dur}` : '';
    }
  },
  ['[data-ci-passing]', '[data-ci-sha]', '[data-ci-message]', '[data-ci-runs]', '[data-ci-p50]', '[data-ci-p95]']
);
