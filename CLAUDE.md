# Resume Static Site

Personal resume + job-application tracker. Static site hosted on Cloudflare Pages at https://tim.sillysamoyed.com (set via `site:` in `astro.config.mjs`).

## Tech Stack

### Dependencies

| Package                              | Version | Purpose                                                          |
| ------------------------------------ | ------- | ---------------------------------------------------------------- |
| astro                                | 6.3.5   | Static site framework                                            |
| @astrojs/rss                         | 4.0.18  | RSS 2.0 feed generation (`/rss.xml`)                             |
| tailwindcss                          | 4.3.0   | Utility-first styling                                            |
| @tailwindcss/vite                    | 4.3.0   | Tailwind 4 Vite plugin (Astro integration)                       |
| @catppuccin/tailwindcss              | 1.0.0   | Catppuccin themes (all 4 flavours)                               |
| astro-expressive-code                | 0.42.0  | Code-block rendering (Shiki frames, themes)                      |
| @expressive-code/plugin-line-numbers | 0.42.0  | Optional gutter line numbers for code blocks                     |
| rehype-external-links                | 3.0.0   | New-tab + safe `rel` + ↗ marker on external links in post bodies |
| zod                                  | 4.4.3   | Data schema validation                                           |
| yaml                                 | 2.9.0   | YAML parser for data file loading                                |

### Dev Dependencies

| Package                     | Version | Purpose                                              |
| --------------------------- | ------- | ---------------------------------------------------- |
| pnpm                        | 10.33.0 | Package manager                                      |
| typescript                  | 6.0.3   | Type safety                                          |
| prettier                    | 3.8.3   | Code formatter                                       |
| prettier-plugin-astro       | 0.14.1  | Prettier support for .astro files                    |
| prettier-plugin-tailwindcss | 0.8.0   | Tailwind class sorting (TW4, official Tailwind Labs) |
| eslint                      | 10.4.0  | Linter                                               |
| typescript-eslint           | 8.59.4  | TypeScript ESLint rules                              |
| eslint-plugin-astro         | 1.7.0   | ESLint rules for .astro files                        |
| @astrojs/check              | 0.9.9   | Astro + TS type checking (`astro check`)             |
| husky                       | 9.1.7   | Git hooks                                            |
| lint-staged                 | 17.0.5  | Run linters on staged files only                     |
| vitest                      | 4.1.7   | Unit test runner                                     |
| @vitest/coverage-v8         | 4.1.7   | V8 coverage provider for `pnpm test:coverage`        |
| @playwright/test            | 1.60.x  | E2E test runner                                      |
| eslint-plugin-playwright    | 2.10.x  | Lint rules for Playwright tests                      |
| sharp                       | 0.34.5  | Image processing (Astro asset pipeline)              |
| @types/node                 | 25.9.0  | Node.js type definitions                             |

### Tailwind setup

Tailwind 4 CSS-first — no `tailwind.config.js`. Wired via `@tailwindcss/vite` in `astro.config.mjs`.

Global CSS at `src/styles/global.css`:

```css
@import 'tailwindcss';
@import '@catppuccin/tailwindcss/mocha.css';
```

The shipped `mocha.css` file defines all four flavour classes (`.latte`, `.frappe`, `.macchiato`, `.mocha`) plus custom variants — one import covers every theme. Active flavour is selected by adding the class to `<html>`; the inline script in `Base.astro` picks from `localStorage` (`ctp-flavor` key) or `prefers-color-scheme`, and `ThemePicker.astro` lets the user switch at runtime.

Import the global stylesheet in `src/layouts/Base.astro`. Use `ctp-` prefixed utilities everywhere (`bg-ctp-base`, `text-ctp-text`, etc). No raw hex values in components.

## Pages

| Route          | File                          | Purpose                                                         |
| -------------- | ----------------------------- | --------------------------------------------------------------- |
| `/`            | `src/pages/index.astro`       | Hero, bio, quick stats, CTA links                               |
| `/resume`      | `src/pages/resume.astro`      | Full resume from data                                           |
| `/projects`    | `src/pages/projects.astro`    | Project portfolio from data                                     |
| `/blog`        | `src/pages/blog.astro`        | Blog index — featured post, published rows                      |
| `/blog/[slug]` | `src/pages/blog/[slug].astro` | Single post — hero, rendered markdown body, TOC rail, prev/next |
| `/job-hunt`    | `src/pages/job-hunt.astro`    | Job hunt dashboard                                              |
| `/testing`     | `src/pages/testing.astro`     | Test strategy narrative + build-time stats (portfolio)          |
| `/rss.xml`     | `src/pages/rss.xml.ts`        | RSS 2.0 feed of posts (excerpt-only)                            |
| `/atom.xml`    | `src/pages/atom.xml.ts`       | Atom 1.0 feed of posts (excerpt-only)                           |
| `/feed.json`   | `src/pages/feed.json.ts`      | JSON Feed 1.1 of posts (excerpt-only)                           |

## Job Application Statuses

| Status       | Catppuccin colour  | Meaning                      |
| ------------ | ------------------ | ---------------------------- |
| Applied      | Blue `#89b4fa`     | Submitted, awaiting response |
| Screening    | Sapphire `#74c7ec` | Recruiter/phone screen       |
| Interviewing | Peach `#fab387`    | Active interview rounds      |
| Offered      | Green `#a6e3a1`    | Offer received               |
| Rejected     | Red `#f38ba8`      | Application declined         |
| Withdrawn    | Overlay2 `#9399b2` | User withdrew                |
| Ghosted      | Mauve `#cba6f7`    | No response after follow-ups |

`Applied` entries auto-promote to `Ghosted` at render time when `today - applied >= 28 days`. YAML is not mutated — `getJobs()` in `src/lib/data.ts` derives the display status via `effectiveJobStatus(job, now)`. Reserve `lastContact` (optional field, unused in v1) for future mid-funnel auto-ghosting.

## Data Files

Single source of truth — edit these to update the site. No CMS, no database.

```
src/data/
  resume.yml      # experience, education, skills, contact
  projects.yml    # project name, description, URL, tags, status
  jobs.yml        # job applications + status
```

Zod schemas in `src/lib/schemas.ts` validate all three at build time. Build fails on invalid data.

### jobs.yml entry shape

```yaml
- company: Acme Corp
  role: Senior Engineer
  url: https://acme.com
  applied: '2026-05-01' # must be quoted — bare dates parse as JS Date objects
  status: Interviewing
  notes: ''
  lastContact: '2026-05-10' # optional; reserved for future mid-funnel auto-ghost logic
  source: Seek # optional — Seek | LinkedIn | Jobgether | Other; derived from notes when unset
```

### resume.yml shape

```yaml
name: ''
tagline: ''
bio: '' # optional — longer-form intro for the home page
contact:
  email: ''
  github: ''
  linkedin: ''
experience:
  - company: ''
    role: ''
    start: 2023-01 # YYYY-MM string
    end: present # YYYY-MM or literal 'present'
    bullets: []
education: # optional block
  - institution: ''
    degree: ''
    year: 2020
skills:
  - category: Languages
    items: []
```

### projects.yml entry shape

```yaml
- name: ''
  description: ''
  url: ''
  repo: '' # GitHub URL — the key that project-stats.json is merged on
  tags: []
  status: active # active | wip | archived
  # Hand-authored metadata (all optional):
  pinned: true # surfaces a ★ PIN badge + counts toward the "pinned" summary
  lang: TypeScript # language brand dot (see lib/langColors.ts)
```

`stars`, `forks`, and `updatedAt` are **not** in `projects.yml` — they live in
the generated `src/data/project-stats.json` (keyed by `repo` URL), refreshed
nightly from the live GitHub API and merged onto each project by `getProjects()`
via `mergeProjectStats()`. The card derives the "2d ago" label + recency sort
from the merged `updatedAt`. Regenerate with `pnpm projects:refresh`; do not
hand-edit. `⑃` in the card footer is the **forks** count.

```json
// src/data/project-stats.json — generated, do not hand-edit
{
  "https://github.com/timjstacey/resume-static-site": { "stars": 0, "forks": 0, "updatedAt": "2026-05-31" }
}
```

### Blog data (`src/content/posts/*.md`)

Posts use an Astro **content collection** (`src/content.config.ts`). Each post's
frontmatter: `title`, `date`, `tag` (`Strategy | Practice | Meta | Team | Tools`),
`excerpt`, `readMins`, `preview` — a list of `[prefix, text]` tuples where
the prefix is `"$"` (shell), `"#"` (markdown heading), or `" "` (body line) — and
`hashtags` (string list, defaults to `[]`). The `<TerminalWindow>` renderer turns
`preview` into the post's auto-illustrated cover.

`tag` is the primary category and drives the accent colour. `hashtags` carry over
from the source LinkedIn post (the LPG `blog` skill copies the post's footer tags,
`#` stripped) and drive the `/blog` Tags sidebar via `hashtagCounts()` in
`src/lib/blog.ts`; each hashtag gets a stable accent from a palette hash.

The post **body** is plain markdown beneath the frontmatter. `src/pages/blog/[slug].astro`
renders it with `render()` from `astro:content` (`<Content />`) — no hand-written HTML.
Body prose is styled via scoped `.prose :global(...)` rules in that page; fenced code
blocks are owned by **Expressive Code** (do not restyle `<pre>`). Write the post's lead
code fence as its visual hero — there is no hero imagery. The on-this-page TOC is built
from the collection entry's `getHeadings()` (`<h2>`s).

External links in a post body are rewritten at build time by **`rehype-external-links`**
(configured in `astro.config.mjs` under `markdown.rehypePlugins`): every absolute
`http(s)` anchor gets `target="_blank" rel="noopener noreferrer"` plus a trailing `↗`
marker (`span.external-arrow`, styled in `blog/[slug].astro`). So posts — including
routine-generated ones — just author normal markdown links; the new-tab rule and icon
are enforced by the build, not by the author. Component links use the same convention
via `Button.astro` (auto-detects external `href` through `isExternalUrl()` in `lib/links.ts`).

Expressive Code is configured in **`ec.config.mjs`** (repo root, not `astro.config.mjs` —
the `<Code>` component rejects non-serializable options like `themeCssSelector`). It
registers all four Catppuccin Shiki themes and emits a per-flavour CSS selector
(`.latte`/`.frappe`/`.macchiato`/`.mocha`) matching the class `Base.astro` puts on
`<html>`, so code blocks re-theme with the rest of the page.

### testing.yml + ci-snapshot.json

`src/data/testing.yml` holds the `/testing` page's routing matrix (one row per
Playwright project: `project / device / engine / specs`) and CI gate pipelines
(`file / accent / on / steps[]`). Each step is `{ name, match }` — `name` is the
card label, `match` is the **GitHub Actions step name** whose real duration is
merged in from `ci-snapshot.json` `gates` (steps carry no hardcoded duration).
Keep `match` in sync with the step names in `.github/workflows/*.yml`.

`src/data/ci-snapshot.json` holds CI signals (`branch`, `passing`, `sha`,
`commitMessage`, `commitAgo`, `lastDeployAgo`, `runs[]`, `p50`, `p95`, deltas)
plus `gates` — real per-step durations from the latest successful run of each
gate workflow, keyed `workflow file → GHA step name → duration`. The
`/testing` gate cards resolve each `testing.yml` step's `match` against `gates`
via `stepDuration()` (`src/lib/ciGates.ts`), falling back to "— no data" when a
step has no measured timing. Regenerated from the live GitHub Actions API by
`pnpm ci:refresh` (`scripts/refresh-ci-snapshot.mjs`), run nightly by the
`refresh-ci-snapshot.yml` workflow which commits the refresh straight to `main`
(via `VERSION_BUMP_TOKEN`, like `refresh-test-stats.yml`) — do not hand-edit or
fake these.

## Component Architecture

```
src/
  assets/
    profile.jpg         # hero portrait (Astro asset pipeline / sharp)
  styles/
    global.css          # @import tailwindcss + catppuccin (all flavours)
  layouts/
    Base.astro          # <html>, <head>, nav, footer — imports global.css, inline theme bootstrap
  components/
    Nav.astro           # top nav: brand block, mono links, active peach state, mobile drawer
    ThemePicker.astro   # Catppuccin flavour selector — swatch pill + role=menu arrow-key nav
    Footer.astro        # 4-column mono footer (build/ci/tests/©) — numbers from package.json + ci-snapshot + testStats
    SectionLabel.astro  # section kicker: accent bar + uppercase mono label (shared primitive)
    Button.astro        # primary (peach/crust) + ghost variants
    Chip.astro          # tinted accent pill / neutral surface0 pill
    Card.astro          # mantle panel, surface0 border, optional top-accent
    TerminalWindow.astro # chrome bar + body slot (blog preview, whoami, code window)
    StatStrip.astro     # 4-up stats grid wrapper
    StatCard.astro      # single stat: index + display number + label, optional top accent
    PostCard.astro      # blog post teaser card (home "From the blog" + blog index)
    JiraColumn.astro    # job-hunt board column: accent header + count pill + cards + dashed create
    JiraCard.astro      # job-hunt issue card: company epic pill, role, key/priority/source footer
    ProjectCard.astro   # single project card
    ResumeSection.astro # section wrapper (title + slot)
  content.config.ts     # Astro content collection config — blog `posts`
  content/
    posts/*.md          # blog posts — frontmatter (title/date/tag/readMins/preview) + body
  pages/
    index.astro
    resume.astro
    projects.astro
    blog.astro          # blog index (new)
    blog/[slug].astro   # single post — renders markdown body via render()/<Content />
    job-hunt.astro
    testing.astro
  data/
    resume.yml
    projects.yml
    jobs.yml
    testing.yml         # /testing routing matrix + CI gate pipelines
    ci-snapshot.json    # generated CI signals (branch/sha/last-10-runs/p50/p95 + per-step gate durations) — refresh nightly (pnpm ci:refresh)
    project-stats.json  # generated GitHub stars/forks/updatedAt per repo — refresh nightly (pnpm projects:refresh)
  lib/
    schemas.ts          # Zod schemas + inferred types for all data files
    data.ts             # getResume/getProjects/getJobs/getTesting/getCiSnapshot/getProjectStats loaders + mergeProjectStats
    posts.ts            # getPosts() — blog content-collection loader (date-desc)
    nav.ts              # NAV_ITEMS + isActivePath() + trapFocusTarget() — mobile-drawer focus-trap math (unit-tested)
    links.ts            # isExternalUrl() — external-link detection for new-tab handling in Button (unit-tested)
    ciGates.ts          # stepDuration() — resolve a /testing gate step's real duration from ci-snapshot `gates` (unit-tested)
    format.ts           # fmtYM() YYYY-MM → "Jan 2023"; daysAgo()/fmtRelative() ISO date → recency + "2d ago"
    stats.ts            # activePipeline(), yearsOfExp() — home-page stats
    jobhunt.ts          # priorityFor/epicColorFor/columnOf/jobKey/withKeys + jobCardMatches/anyJobFilterActive + isIllegalMove — board logic, filter predicate, read-only-drag rule (unit-tested)
    blog.ts             # hashtagCounts() + archive() — blog sidebar aggregation
    blogPagination.ts   # pageView()/pageCount()/inWindow() — /blog published-list paging math (unit-tested)
    toc.ts              # activeHeadingId() + pinExpired() — post TOC scrollspy selection + pin-window timing (unit-tested)
    feeds.ts            # pure RSS/Atom/JSON feed builders (unit-tested)
    feedSource.ts       # FEED_META + CollectionEntry→FeedPost mapper for the feed endpoints
    langColors.ts       # LANG_COLORS — language brand dots for the projects grid
    projectFilters.ts   # PROJECT_FILTERS — all + langs (derived from data) + pinned; shared by projects page + e2e spec (re-exports projectMatch)
    projectMatch.ts     # projectMatchesFilter()/tagParam()/compareByUpdated() — pure projects grid filter/sort, data-free for the client bundle (unit-tested)
    themes.ts           # FLAVORS/FLAVOR_IDS + THEME_TRIGGER_LABEL + resolveFlavor()/flavorFromClasses()/rovingIndex() — theme bootstrap + picker keyboard nav (unit-tested)
    projectStatus.ts    # PROJECT_STATUS_LABEL / _COLOUR maps — shared by ProjectCard + tests
    copy.ts             # Page heading strings shared between pages + tests
    testStats.ts        # Generated test counts surfaced on /testing — `pnpm stats:refresh` (auto-run on spec changes by refresh-test-stats.yml)
    *.test.ts           # vitest unit tests colocated with each lib module
tests/                  # Playwright E2E specs (one per page + responsive + nav)
```

## Issue Tracking

Open work is tracked at https://github.com/timjstacey/resume-static-site/issues. Initial build issues (#1–#8: setup, layout, schemas, pages, dashboard, deployment) are all closed; new work lands as fresh issues.

## Branching & Commits

Branch off `main`. Name branches `type/issue#-slug`:

- `type` is the Conventional Commit type — `feat | fix | chore | docs | refactor | test | ci | perf`, plus `claude` for automated Claude Code routine PRs (the blog cross-post routine can only push `claude/`-prefixed branches).
- `issue#` is the GitHub issue the work closes; **omit it** (giving `type/slug`) only when there is no issue.
- `slug` is a short kebab-case summary.

```
feat/68-ci-snapshot-refresh    # issue-linked
fix/48-icon-colours            # issue-linked
chore/add-mit-license          # no issue → type/slug
claude/blog-some-post          # automated blog routine PR
```

Commits follow [Conventional Commits](https://www.conventionalcommits.org) (`type(scope): subject`). This is not cosmetic: `version-bump.yml` derives the semver bump from the merged commit subjects — `feat`→minor, `fix`/`perf`→patch, `type!:` or a `BREAKING CHANGE` footer→major, anything else (`chore`/`docs`/`ci`/`test`/`refactor`)→no bump. Pick the type with the intended release impact in mind.

PRs target `main` and are **rebase-merged** (enforced by the `protected-branches` ruleset; squash/merge-commit are disabled). Link the issue with `Closes #N` in the PR body.

## Keeping CLAUDE.md and README.md in sync

`CLAUDE.md` (this file) is the canonical guide for AI assistants and contributors making changes. `README.md` is the public-facing summary for visitors and new contributors. Treat both as part of the change, not separate docs work. The triggers below are scoped to concrete actions — when the action fires, update both files in the same commit.

| Trigger                                                                                       | `CLAUDE.md`                                                         | `README.md`                                                               |
| --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Dep added / removed / version-bumped in `package.json`                                        | Update the matching row in Dependencies / Dev Dependencies          | Update the Stack line if it's a top-level technology                      |
| File added / removed / renamed under `src/{components,layouts,lib,pages,data,styles,assets}/` | Update the Component Architecture block                             | Update the Project Structure block if the directory is listed             |
| New / removed workflow under `.github/workflows/`                                             | Update the CI table                                                 | Update the CI and Deployment table                                        |
| New / removed `pnpm` script in `package.json`                                                 | Update the Commands block                                           | Update the Commands table                                                 |
| New / changed git hook in `.husky/`                                                           | Update the Git Hooks table                                          | Update the Contributing section if the hook user-facing behaviour changes |
| Schema change in `src/lib/schemas.ts` (new field, optional → required, enum added)            | Update the matching `*.yml` shape block under Data Files            | No change (README links to `CLAUDE.md#data-files`)                        |
| New page route under `src/pages/`                                                             | Update the Pages table                                              | Update the Pages table                                                    |
| New `JobStatus` / `ProjectStatus` enum value                                                  | Update the Job Application Statuses table (status, colour, meaning) | No change                                                                 |
| Hosting / domain change (e.g. switch from CF Pages)                                           | Update intro paragraph + CI section                                 | Update intro paragraph + Live URL + CI and Deployment section             |

`scripts/ci/check-claude-md.sh` runs in CI on every PR. It fails the build when deps, source files, workflows, husky hooks, or `pnpm` scripts drift from either doc, and when `README.md` is missing entirely. The script is the safety net for contributors who bypass Claude — the scoped triggers above are the primary mechanism.

## Content Writing

Always invoke the `stop-slop` skill before writing or finalising any user-facing prose: project descriptions, page copy, bio text, taglines, card content, or any other text a visitor will read. This removes AI writing patterns (filler adverbs, passive voice, em dashes, formulaic structures) before the content lands in a file.

```
/stop-slop <draft text>
```

## Playwright Screenshots

When using the `mcp__playwright__browser_take_screenshot` tool, always save to `.playwright-mcp/` — it is gitignored. Use a relative filename with that prefix:

```
filename: ".playwright-mcp/my-screenshot.png"
```

Never save screenshots to the repo root or any other directory.

## Commands

```bash
pnpm dev           # dev server at localhost:4321
pnpm build         # static output → dist/
pnpm preview       # preview built site at localhost:4322 (separate port so a stray preview never squats dev/e2e on 4321)
pnpm typecheck     # astro check — full TS diagnostics across all .astro/.ts files
pnpm test          # vitest run — unit tests (schemas, nav logic)
pnpm test:coverage # vitest run --coverage — unit tests + V8 coverage gate (text/html/lcov)
pnpm test:e2e      # playwright — E2E tests (requires dev server or auto-starts it)
pnpm lint          # run ESLint — fails on any warning (--max-warnings 0)
pnpm lint:fix      # run ESLint with auto-fix (also --max-warnings 0)
pnpm stats:refresh # regenerate src/lib/testStats.ts from current spec inventory
pnpm ci:refresh    # regenerate src/data/ci-snapshot.json (CI strip + per-step gate durations) from the live Actions API
pnpm projects:refresh # regenerate src/data/project-stats.json from the live GitHub repos API
```

## Git Hooks

Managed by husky.

| Hook       | Runs            | What                                                                                                                                                                                                                                                 |
| ---------- | --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| pre-commit | on `git commit` | lint-staged: `eslint --fix --max-warnings 0` + `prettier --write` on staged `.astro`/`.ts`/`.tsx`; `prettier --write` on staged `.css`/`.json`/`.md`/`.yaml`/`.yml`. The `--max-warnings 0` blocks the commit if any warning remains after auto-fix. |
| pre-push   | on `git push`   | Validates the branch name against `type/issue#-slug` (rejects the push otherwise; `main` exempt), then `pnpm typecheck` — blocks push on type errors                                                                                                 |

## Linting

**ESLint warnings are treated as errors.** `pnpm lint` runs with `--max-warnings 0`,
so any warning fails the lint step — locally, on pre-commit (lint-staged auto-fixes
what it can, then blocks the commit if a warning remains), and in CI (`ci.yml` runs
`pnpm lint`). Fix every warning at the time you write the code; never commit one and
never silence a rule wholesale. A scoped `// eslint-disable-next-line <rule> -- <reason>`
is allowed only where the rule is genuinely wrong for that line, and must carry the
`-- reason`.

## Testing

Every code change ships with test coverage. **Prefer a unit test** (Vitest, a
colocated `*.test.ts` next to the module); add an **e2e test** (Playwright, under
`tests/`) only when the behaviour genuinely needs a browser — DOM wiring,
navigation, focus, viewport/layout. Unit first, e2e as the fallback, not the
default.

- **Make logic unit-testable.** Keep decision logic pure and in `src/lib/`
  (e.g. `toc.ts`, `feeds.ts`, `jobhunt.ts`, `stats.ts`). When the logic lives in
  an `.astro` `<script>`, extract the pure part into a `lib/` function and import
  it back, so the page stays thin glue and the rule gets a unit test. Tag such
  modules `(unit-tested)` in the Component Architecture list.
- **A bug fix adds a failing-first test.** Write (or tighten) a unit test that
  fails on the old code and passes on the fix — if the existing test couldn't
  have caught the regression, the test is wrong, not just missing. Watch for a
  test that _encodes_ the bug (asserts the broken behaviour) and fix it too.
- **Reach for e2e only for the un-unit-testable slice.** Render/interaction that
  can't be exercised without a DOM goes in a Playwright spec; the underlying rule
  it depends on should still have its own unit test.
- **Always invoke the `playwright-expert` skill when writing or editing
  Playwright tests.** It carries the Page Object Model, anti-flake, and selector
  conventions — load it before touching anything under `tests/`, not after.
- **Selector hierarchy — `getByRole` first, `getByTestId` second, anything else
  only with a reason.**
  1. **`getByRole`** with an accessible name is the default. Give the element a
     real role/name (heading, button, link, `region`/`navigation` with an
     `aria-label`) so the spec asserts what the user perceives.
  2. **`getByTestId`** when there's no meaningful role/name. Add the `data-testid`
     to the component — changing markup to make it targetable is the right move.
  3. **Everything else** (`getByText`, `getByLabel`, CSS `.locator()`) only when
     justified, with a short `// reason` if it isn't obvious. `getByText` is fine
     when the text comes from **known data/config** (asserting that data rendered);
     it is **not** fine to hardcode a literal UI string when a role or id is
     trivial to add. CSS `.locator()` is for genuinely structural checks — counting
     a set by a contract `data-*` attr, asserting a class/attribute, scoping a tag
     under a stable parent — never as a stand-in for a role/testid on a targetable
     element. Never use `nth-child`, positional, or shifting-text selectors.
- **Cover every Zod schema.** Each schema in `src/lib/schemas.ts` gets a case in
  `schemas.test.ts` — at least one valid parse and one rejected-invalid parse
  (bad enum value, missing required field, malformed date). Add or update the
  case in the same change that adds or edits the schema. The build only catches
  malformed _data_ against the current schema; tests are what catch a schema
  that's too loose or wrong.
- **Refresh the counts.** New or removed specs change the generated totals — run
  `pnpm stats:refresh` so `src/lib/testStats.ts` matches, or the `/testing` page
  and its e2e assertions drift (and the PR's Playwright run fails).

## CI

GitHub Actions workflows live in `.github/workflows/`.

| Workflow                    | Trigger                                                                                  | What                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| --------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ci.yml`                    | `pull_request` → `main`                                                                  | `./scripts/ci/check-claude-md.sh` → `pnpm lint` → `pnpm test:coverage` (V8 coverage gate, thresholds in `vitest.config.ts`) → `pnpm typecheck` → `pnpm build`                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `playwright.yml`            | `pull_request` → `main` / manual                                                         | Waits for the Cloudflare Pages preview deploy via `scripts/ci/wait-for-cf-preview.sh`, then runs Playwright against the preview URL. `workflow_dispatch` takes a `base_url` input instead.                                                                                                                                                                                                                                                                                                                                                                                               |
| `refresh-ci-snapshot.yml`   | nightly cron (`0 6 * * *`) / manual                                                      | Runs `pnpm ci:refresh` to regenerate `src/data/ci-snapshot.json` from the live Actions API (CI strip signals + real per-step `gates` durations for the `/testing` CI-gate cards), then commits it straight to `main` (via `VERSION_BUMP_TOKEN`, like `refresh-test-stats.yml`) if it changed — no PR. `version-bump.yml` paths-ignores the file so the commit never bumps the version. Keeps the footer + `/testing` CI strip and gate timings from going stale.                                                                                                                         |
| `refresh-project-stats.yml` | nightly cron (`15 6 * * *`) / manual                                                     | Runs `pnpm projects:refresh` to regenerate `src/data/project-stats.json` (stars/forks/updatedAt per repo) from the live GitHub repos API, then commits it straight to `main` (via `VERSION_BUMP_TOKEN`, like `refresh-test-stats.yml`) if it changed — no PR. `version-bump.yml` ignores the file so the refresh never bumps the version.                                                                                                                                                                                                                                                |
| `refresh-test-stats.yml`    | `push` → `main` (`paths: tests/**`, `**/*.test.ts`, `playwright.config.ts`) / manual     | Runs `pnpm stats:refresh` to regenerate `src/lib/testStats.ts` (the `/testing` unit/E2E counts) whenever specs change, then commits it back to `main` via `VERSION_BUMP_TOKEN` if it changed. The commit touches only `testStats.ts`, which matches neither this workflow's `paths` filter (no self-trigger) nor version-bump's `paths-ignore` (no bump no-op).                                                                                                                                                                                                                          |
| `version-bump.yml`          | `push` → `main` (`paths-ignore: ci-snapshot.json`, `project-stats.json`, `testStats.ts`) | Reads the merged commits via Conventional Commits — `feat`→minor, `fix`/`perf`→patch, `feat!`/`BREAKING CHANGE`→major, anything else→no bump — then `npm version <level> --no-git-tag-version` and commits the bump back to `main`. The bump commit deliberately omits `[skip ci]` (Cloudflare Pages honors it, which would stop the footer version from ever deploying); its `chore(release)` subject re-runs this workflow once as a no-op rather than looping. The `paths-ignore` keeps the generated-file refreshes (ci-snapshot, project-stats, test stats) from triggering a bump. |

Playwright projects (see `playwright.config.ts`) route specs by `testMatch` so each spec runs only where it's meaningful:

| Project                    | Device          | Specs                                        |
| -------------------------- | --------------- | -------------------------------------------- |
| `content`                  | Desktop Chrome  | `home`, `jobs`, `projects`, `resume`, `a11y` |
| `a11y-chromium`            | Desktop Chrome  | `nav`, `theme-picker`                        |
| `a11y-firefox`             | Desktop Firefox | `nav`, `theme-picker`                        |
| `a11y-webkit`              | Desktop Safari  | `nav`, `theme-picker`                        |
| `responsive-mobile-chrome` | Pixel 5         | `responsive`                                 |
| `responsive-mobile-safari` | iPhone 13       | `responsive`                                 |
| `responsive-tablet-safari` | iPad Pro 11     | `responsive`                                 |

Content rendering is identical across engines, so it runs once. Keyboard/focus behaviour varies, so a11y specs run on all three engines. Viewport-dependent layout runs on mobile + tablet only. Locally `pnpm test:e2e` reuses an existing dev server or starts one; in CI `PLAYWRIGHT_BASE_URL` is injected and the auto-start `webServer` block is skipped.

> **Server hygiene (read before debugging "wrong" e2e results).** The local `webServer` block uses `reuseExistingServer: true`, so Playwright silently reuses **whatever** is already on `localhost:4321` — including a stale `astro dev` left over from a previous run or a manual background launch. A squatter started before your latest edits serves pre-change HTML, which shows up as bogus e2e failures (e.g. an attribute that "should" be there reading `null`). If results look wrong, kill stray servers first: `pkill -f astro.mjs` (or `pkill -f "astro dev"`), then re-run. `pnpm preview` runs on **4322** specifically so a forgotten preview can never squat the dev/e2e port. When you start a dev server yourself for screenshots etc., kill it when done.

Node version is pinned via `.nvmrc` (currently `v24.13.0`); pnpm version is pinned via `packageManager` in `package.json` (`10.33.0`).

## Analytics

Umami Cloud — privacy-first, cookieless, no consent banner, no sampling (real
time-on-page / engagement). `Base.astro` injects the tracking script **only when
`UMAMI_WEBSITE_ID` is set at build time**, so local dev and the per-PR preview
deploys (id unset) never report. Set the id on the Cloudflare Pages **Production**
environment only (from the Umami Cloud dashboard → website settings; it's public,
it ships in the page HTML). `UMAMI_SRC` is optional and defaults to the US host
`https://cloud.umami.is/script.js` — set it to `https://eu.umami.is/script.js` for
the EU region. `.env.example` documents both variables.

We moved off Cloudflare Web Analytics (issue #88): CF's per-hostname auto-injection
never covered the `tim.` subdomain, and the Pages Web Analytics toggle threw
`Error creating Web Analytics entry` with duplicate entries (CF backend bug). The
manual CF beacon was the prototyped fallback; Umami Cloud replaces it with the same
one-script footprint plus real engagement metrics CF couldn't give.

## Verification Checklist

- [ ] `pnpm dev` starts with no console errors
- [ ] `bg-ctp-base` / `text-ctp-text` resolve in Tailwind
- [ ] All 4 nav links route correctly, active state visible
- [ ] All 7 job statuses render with correct Catppuccin colours
- [ ] Dashboard stats bar counts match data file entries
- [ ] Status filter works without page reload
- [ ] Resume prints cleanly (`Cmd+P`)
- [ ] Build passes: `pnpm build` exits 0
- [ ] Mobile layout: nav, cards, resume sections all readable
- [ ] Deploy: push to `main` triggers build + publishes to Pages URL
