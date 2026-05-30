# Resume Static Site

Personal resume + job-application tracker. Static site hosted on Cloudflare Pages at https://tim.sillysamoyed.com (set via `site:` in `astro.config.mjs`).

## Tech Stack

### Dependencies

| Package                 | Version | Purpose                                    |
| ----------------------- | ------- | ------------------------------------------ |
| astro                   | 6.3.5   | Static site framework                      |
| tailwindcss             | 4.3.0   | Utility-first styling                      |
| @tailwindcss/vite       | 4.3.0   | Tailwind 4 Vite plugin (Astro integration) |
| @catppuccin/tailwindcss | 1.0.0   | Catppuccin themes (all 4 flavours)         |
| zod                     | 4.4.3   | Data schema validation                     |
| yaml                    | 2.9.0   | YAML parser for data file loading          |

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
| vitest                      | 4.1.6   | Unit test runner                                     |
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

| Route       | File                       | Purpose                                                |
| ----------- | -------------------------- | ------------------------------------------------------ |
| `/`         | `src/pages/index.astro`    | Hero, bio, quick stats, CTA links                      |
| `/resume`   | `src/pages/resume.astro`   | Full resume from data                                  |
| `/projects` | `src/pages/projects.astro` | Project portfolio from data                            |
| `/blog`     | `src/pages/blog.astro`     | Blog index — featured post, published rows, drafts     |
| `/job-hunt` | `src/pages/job-hunt.astro` | Job hunt dashboard                                     |
| `/testing`  | `src/pages/testing.astro`  | Test strategy narrative + build-time stats (portfolio) |

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
  repo: ''
  tags: []
  status: active # active | wip | archived
  # Redesign metadata — all optional, static, hand-maintained (no live GitHub API):
  pinned: true # surfaces a ★ PIN badge + counts toward the "pinned" summary
  lang: TypeScript # language brand dot (see lib/langColors.ts)
  stars: 14
  forks: 2
  updated: 2d ago # free-text "last commit" label shown in the card footer
```

### Blog data (`src/content/posts/*.md` + `src/data/drafts.yml`)

Posts use an Astro **content collection** (`src/content.config.ts`). Each post's
frontmatter: `title`, `date`, `tag` (`Strategy | Practice | Meta | Team | Tools`),
`excerpt`, `readMins`, and `preview` — a list of `[prefix, text]` tuples where
the prefix is `"$"` (shell), `"#"` (markdown heading), or `" "` (body line). The
`<TerminalWindow>` renderer turns `preview` into the post's auto-illustrated cover.

`src/data/drafts.yml` drives the "drafts in flight" cards: `title`, `tag`,
`status` (`idea | drafting | editing`), `note`.

### testing.yml + ci-snapshot.json

`src/data/testing.yml` holds the `/testing` page's routing matrix (one row per
Playwright project: `project / device / engine / specs`) and CI gate pipelines
(`file / accent / on / steps[]`). Keep in sync with `playwright.config.ts` and
`.github/workflows/`.

`src/data/ci-snapshot.json` holds CI signals (`branch`, `passing`, `sha`,
`commitMessage`, `commitAgo`, `lastDeployAgo`, `runs[]`, `p50`, `p95`, deltas).
Regenerated from the live GitHub Actions API by `pnpm ci:refresh`
(`scripts/refresh-ci-snapshot.mjs`), run nightly by the `refresh-ci-snapshot.yml`
workflow which opens a PR with the bump — do not hand-edit or fake these.

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
    job-hunt.astro
    testing.astro
  data/
    resume.yml
    projects.yml
    jobs.yml
    drafts.yml          # blog "drafts in flight" (idea | drafting | editing)
    testing.yml         # /testing routing matrix + CI gate pipelines
    ci-snapshot.json    # static CI signals (branch/sha/last-10-runs/p50/p95) — refresh nightly
  lib/
    schemas.ts          # Zod schemas + inferred types for all data files
    data.ts             # getResume/getProjects/getJobs/getDrafts/getTesting/getCiSnapshot loaders
    posts.ts            # getPosts() — blog content-collection loader (date-desc)
    nav.ts              # NAV_ITEMS list + isActivePath() helper
    format.ts           # fmtYM() — YYYY-MM → "Jan 2023" (en-GB)
    stats.ts            # activePipeline(), yearsOfExp() — home-page stats
    jobhunt.ts          # priorityFor/epicColorFor/columnOf/jobKey/withKeys — JIRA board logic
    blog.ts             # tagCounts() + archive() — blog sidebar aggregation
    langColors.ts       # LANG_COLORS — language brand dots for the projects grid
    projectFilters.ts   # PROJECT_FILTERS list — shared by projects page + e2e spec
    features.ts         # FEATURES flags — soft-hide WIP sections (currently: blog)
    themes.ts           # FLAVORS list + THEME_TRIGGER_LABEL — shared by ThemePicker + tests
    projectStatus.ts    # PROJECT_STATUS_LABEL / _COLOUR maps — shared by ProjectCard + tests
    copy.ts             # Page heading strings shared between pages + tests
    testStats.ts        # Generated test counts surfaced on /testing — refresh with `pnpm stats:refresh`
    *.test.ts           # vitest unit tests colocated with each lib module
tests/                  # Playwright E2E specs (one per page + responsive + nav)
```

## Issue Tracking

Open work is tracked at https://github.com/timjstacey/resume-static-site/issues. Initial build issues (#1–#8: setup, layout, schemas, pages, dashboard, deployment) are all closed; new work lands as fresh issues.

## Branching & Commits

Branch off `main`. Name branches `type/issue#-slug`:

- `type` is the Conventional Commit type — `feat | fix | chore | docs | refactor | test | ci | perf`.
- `issue#` is the GitHub issue the work closes; **omit it** (giving `type/slug`) only when there is no issue.
- `slug` is a short kebab-case summary.

```
feat/68-ci-snapshot-refresh    # issue-linked
fix/48-icon-colours            # issue-linked
chore/add-mit-license          # no issue → type/slug
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
pnpm preview       # preview built site locally
pnpm typecheck     # astro check — full TS diagnostics across all .astro/.ts files
pnpm test          # vitest run — unit tests (schemas, nav logic)
pnpm test:e2e      # playwright — E2E tests (requires dev server or auto-starts it)
pnpm lint          # run ESLint
pnpm lint:fix      # run ESLint with auto-fix
pnpm stats:refresh # regenerate src/lib/testStats.ts from current spec inventory
pnpm ci:refresh    # regenerate src/data/ci-snapshot.json from the live Actions API
```

## Git Hooks

Managed by husky.

| Hook       | Runs            | What                                                                                                                                                 |
| ---------- | --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| pre-commit | on `git commit` | lint-staged: `eslint --fix` + `prettier --write` on staged `.astro`/`.ts`/`.tsx`; `prettier --write` on staged `.css`/`.json`/`.md`/`.yaml`/`.yml`   |
| pre-push   | on `git push`   | Validates the branch name against `type/issue#-slug` (rejects the push otherwise; `main` exempt), then `pnpm typecheck` — blocks push on type errors |

## CI

GitHub Actions workflows live in `.github/workflows/`.

| Workflow                  | Trigger                                                     | What                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ------------------------- | ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ci.yml`                  | `pull_request` → `main`                                     | `./scripts/ci/check-claude-md.sh` → `pnpm lint` → `pnpm test` → `pnpm typecheck` → `pnpm build`                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `playwright.yml`          | `pull_request` → `main` / manual                            | Waits for the Cloudflare Pages preview deploy via `scripts/ci/wait-for-cf-preview.sh`, then runs Playwright against the preview URL. `workflow_dispatch` takes a `base_url` input instead.                                                                                                                                                                                                                                                                                                                                                         |
| `refresh-ci-snapshot.yml` | nightly cron (`0 6 * * *`) / manual                         | Runs `pnpm ci:refresh` to regenerate `src/data/ci-snapshot.json` from the live Actions API, then opens a PR with the bump if it changed. Keeps the footer + `/testing` CI strip from going stale.                                                                                                                                                                                                                                                                                                                                                  |
| `version-bump.yml`        | `push` → `main` (`paths-ignore: src/data/ci-snapshot.json`) | Reads the merged commits via Conventional Commits — `feat`→minor, `fix`/`perf`→patch, `feat!`/`BREAKING CHANGE`→major, anything else→no bump — then `npm version <level> --no-git-tag-version` and commits the bump back to `main`. The bump commit deliberately omits `[skip ci]` (Cloudflare Pages honors it, which would stop the footer version from ever deploying); its `chore(release)` subject re-runs this workflow once as a no-op rather than looping. The `paths-ignore` keeps the nightly ci-snapshot refresh from triggering a bump. |

Playwright projects (see `playwright.config.ts`) route specs by `testMatch` so each spec runs only where it's meaningful:

| Project                    | Device          | Specs                                |
| -------------------------- | --------------- | ------------------------------------ |
| `content`                  | Desktop Chrome  | `home`, `jobs`, `projects`, `resume` |
| `a11y-chromium`            | Desktop Chrome  | `nav`, `theme-picker`                |
| `a11y-firefox`             | Desktop Firefox | `nav`, `theme-picker`                |
| `a11y-webkit`              | Desktop Safari  | `nav`, `theme-picker`                |
| `responsive-mobile-chrome` | Pixel 5         | `responsive`                         |
| `responsive-mobile-safari` | iPhone 13       | `responsive`                         |
| `responsive-tablet-safari` | iPad Pro 11     | `responsive`                         |

Content rendering is identical across engines, so it runs once. Keyboard/focus behaviour varies, so a11y specs run on all three engines. Viewport-dependent layout runs on mobile + tablet only. Locally `pnpm test:e2e` reuses an existing dev server or starts one; in CI `PLAYWRIGHT_BASE_URL` is injected and the auto-start `webServer` block is skipped.

Node version is pinned via `.nvmrc` (currently `v24.13.0`); pnpm version is pinned via `packageManager` in `package.json` (`10.33.0`).

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
