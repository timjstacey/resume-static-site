// Thin DOM glue over the pure rules in lib/projectMatch.ts (tag-match predicate,
// ?tag= param derivation, recency comparator) — all unit-tested — plus live-stats
// hydration over the SSG baseline.
import { projectMatchesFilter, tagParam, compareByUpdated } from '../lib/projectMatch';
import { daysAgo, fmtRelative } from '../lib/format';
import type { ProjectStats } from '../lib/schemas';
import { hydrate } from './hydrate';

const buttons = Array.from(document.querySelectorAll<HTMLElement>('[data-filter]'));
const select = document.querySelector<HTMLSelectElement>('[data-filter-select]');
const cards = Array.from(document.querySelectorAll<HTMLElement>('[data-project]'));
const empty = document.getElementById('empty-state');

// Subtle cross-fade on filter + sort changes via the View Transitions API;
// instant fallback when unsupported or the user prefers reduced motion.
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const doc = document as Document & { startViewTransition?: (cb: () => void) => void };
function withTransition(fn: () => void) {
  if (reduceMotion.matches || !doc.startViewTransition) fn();
  else doc.startViewTransition(fn);
}

function apply(filter: string) {
  let shown = 0;
  for (const card of cards) {
    const tags = (card.getAttribute('data-tags') || '').split(' ');
    const match = projectMatchesFilter(tags, filter);
    card.classList.toggle('hidden', !match);
    if (match) shown++;
  }
  for (const b of buttons) {
    if (b.dataset.filter === filter) b.setAttribute('data-active', '');
    else b.removeAttribute('data-active');
  }
  if (select && select.value !== filter) select.value = filter;
  if (empty) empty.classList.toggle('hidden', shown !== 0);
  const url = new URL(window.location.href);
  const param = tagParam(filter);
  if (param === null) url.searchParams.delete('tag');
  else url.searchParams.set('tag', param);
  history.replaceState(null, '', url);
}

for (const b of buttons) {
  b.addEventListener('click', () => withTransition(() => apply(b.dataset.filter ?? 'all')));
}

if (select) {
  select.addEventListener('change', () => withTransition(() => apply(select.value)));
}

const initial = new URL(window.location.href).searchParams.get('tag');
apply(initial && buttons.some((b) => b.dataset.filter === initial) ? initial : 'all');

// Sort by recency (data-updated = days ago). Toggle desc/asc.
const grid = document.getElementById('project-grid');
const sortBtn = document.getElementById('sort-btn');
const arrow = document.getElementById('sort-arrow');
let desc = true; // ↓ = most recent first
function sort() {
  const ordered = cards
    .slice()
    .sort((a, b) =>
      compareByUpdated(Number(a.getAttribute('data-updated')), Number(b.getAttribute('data-updated')), desc)
    );
  for (const card of ordered) grid?.appendChild(card);
  if (arrow) arrow.textContent = desc ? '↓' : '↑';
}
if (sortBtn && grid) {
  sortBtn.addEventListener('click', () => {
    desc = !desc;
    withTransition(sort);
  });
  sort();
}

// Live-stats hydration — overlay fresh project-stats on the SSG baseline, then
// re-sort by the fresh recency. hydrate() owns the fetch + skeleton clearing.
void hydrate<ProjectStats>(
  '/api/project-stats',
  (stats) => {
    let freshTotal = 0;
    for (const card of cards) {
      const repo = card.getAttribute('data-repo');
      if (!repo) continue;
      const s = stats[repo];
      if (!s) continue;
      card.setAttribute('data-stars', String(s.stars));
      card.setAttribute('data-updated', String(daysAgo(s.updatedAt)));
      const statEl = card.querySelector<HTMLElement>('[data-project-stats]');
      if (statEl) statEl.textContent = `★${s.stars} · ⑃${s.forks} · ${fmtRelative(s.updatedAt)}`;
      freshTotal += s.stars;
    }
    const totalEl = document.querySelector<HTMLElement>('[data-total-stars]');
    if (totalEl) totalEl.textContent = String(freshTotal);
    sort();
  },
  ['[data-project-stats]', '[data-total-stars]']
);
