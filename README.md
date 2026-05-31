# resume-static-site

Source for my personal resume and job-application tracker. Static site, built with Astro and Tailwind, themed with Catppuccin, deployed to Cloudflare Pages. Content lives in three YAML files under `src/data`. Zod validates them at build time, so a typo breaks the build instead of the page.

Live at **https://tim.sillysamoyed.com**.

## Pages

| Route          | Purpose                                            |
| -------------- | -------------------------------------------------- |
| `/`            | Hero, bio, quick stats, links to other pages       |
| `/resume`      | Full resume rendered from `src/data/resume.yml`    |
| `/projects`    | Project portfolio from `src/data/projects.yml`     |
| `/blog`        | Blog index — featured post, published list         |
| `/blog/[slug]` | Single post — rendered markdown, code blocks, TOC  |
| `/job-hunt`    | Job hunt dashboard from `src/data/jobs.yml`        |
| `/testing`     | Test pyramid, project routing, CI pipeline writeup |

## Stack

Astro 6 · Tailwind 4 (CSS-first, no config file) · `@catppuccin/tailwindcss` (4 flavours, runtime switcher) · Expressive Code (Shiki code blocks, Catppuccin themes) · Zod · TypeScript · Vitest · Playwright · Cloudflare Pages.

Full version table lives in [`CLAUDE.md`](./CLAUDE.md#tech-stack).

## Local development

### Prerequisites

You need Node 24+ and pnpm 10.33.0. Run `nvm use` to pick up `.nvmrc`, then `corepack enable` to get pnpm on PATH.

### Setup

```bash
git clone git@github.com:timjstacey/resume-static-site.git
cd resume-static-site
pnpm install
pnpm dev   # http://localhost:4321
```

### Commands

| Command              | What                                                                |
| -------------------- | ------------------------------------------------------------------- |
| `pnpm dev`           | Dev server at `localhost:4321` with HMR                             |
| `pnpm build`         | Static output to `dist/`                                            |
| `pnpm preview`       | Serve the built site locally                                        |
| `pnpm typecheck`     | `astro check` across all `.astro` / `.ts` files                     |
| `pnpm test`          | Vitest unit tests (`src/lib/*.test.ts`)                             |
| `pnpm test:coverage` | Vitest unit tests + V8 coverage report (gate; thresholds in config) |
| `pnpm test:e2e`      | Playwright E2E (auto-starts dev server, or reuses if running)       |
| `pnpm lint`          | ESLint                                                              |
| `pnpm lint:fix`      | ESLint with `--fix`                                                 |
| `pnpm stats:refresh` | Regenerate `src/lib/testStats.ts` from current spec inventory       |
| `pnpm ci:refresh`    | Regenerate `src/data/ci-snapshot.json` from the live Actions API    |

## Project structure

```
src/
  assets/        profile image
  styles/        global.css — Tailwind + Catppuccin import
  layouts/       Base.astro — html shell, theme bootstrap, nav, footer
  components/    Nav, ThemePicker, StatusBadge, JobCard, ProjectCard, ResumeSection
  pages/         index, resume, projects, job-hunt, testing
  data/          resume.yml, projects.yml, jobs.yml — content lives here
  lib/           schemas (Zod), data loaders, nav helper, date format, stats
tests/           Playwright E2E specs
scripts/ci/      CI helper scripts (CF preview wait, CLAUDE.md drift check)
```

## Data

Three YAML files under `src/data` drive the site: `resume.yml` (experience, education, skills, contact), `projects.yml` (portfolio entries), and `jobs.yml` (applications + status). Zod schemas in `src/lib/schemas.ts` check each file at build time. An invalid entry fails the build.

Shape details and field-by-field examples live in [`CLAUDE.md`](./CLAUDE.md#data-files).

## Testing

Every change ships with test coverage, unit-first: Vitest unit tests colocated in `src/lib/*.test.ts`, with Playwright E2E reserved for behaviour that needs a browser. Playwright runs specs from `tests/` across seven projects, each scoped to the specs that benefit from it: content rendering on Chromium, keyboard/focus on Chromium + Firefox + WebKit, and responsive layout on Pixel 5 + iPhone 13 + iPad Pro 11. See [`CLAUDE.md`](./CLAUDE.md#testing) for the coverage policy and [`CLAUDE.md`](./CLAUDE.md#ci) for the full routing table.

```bash
pnpm test         # unit
pnpm test:e2e     # E2E (all projects)
```

## CI and deployment

Push to `main` and Cloudflare Pages builds + publishes to https://tim.sillysamoyed.com. Pull requests get a preview deploy at a commit-pinned `*.pages.dev` URL; the Playwright workflow waits for that URL and runs E2E against it.

GitHub Actions workflows:

| Workflow                  | Trigger                    | Steps                                                                                                       |
| ------------------------- | -------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `ci.yml`                  | PR → `main`                | `check-claude-md.sh` → `pnpm lint` → `pnpm test:coverage` (coverage gate) → `pnpm typecheck` → `pnpm build` |
| `playwright.yml`          | PR → `main`                | Wait for Cloudflare preview → run Playwright against the preview URL (all projects)                         |
| `refresh-ci-snapshot.yml` | nightly cron               | Regenerate `src/data/ci-snapshot.json` from the live Actions API, then open a PR                            |
| `refresh-test-stats.yml`  | push → `main` (test files) | Regenerate `src/lib/testStats.ts` (the `/testing` counts) when specs change, commit back to `main`          |
| `version-bump.yml`        | push → `main`              | Bump `package.json` version from Conventional Commits (feat→minor, fix→patch, `!`/BREAKING→major)           |

## Contributing

Personal site, but issues and PRs are open. File one at https://github.com/timjstacey/resume-static-site/issues if you spot a bug or have a suggestion.

Branch off `main` as `type/issue#-slug` (e.g. `fix/48-icon-colours`; drop the issue number when there isn't one). Commits follow [Conventional Commits](https://www.conventionalcommits.org) — the type drives the automated version bump, so `feat` → minor, `fix` → patch, `!`/`BREAKING CHANGE` → major. PRs target `main`, get rebase-merged, and should say `Closes #N`. See [`CLAUDE.md`](./CLAUDE.md#branching--commits) for the full rules.

The pre-commit hook runs lint-staged (ESLint + Prettier on staged files). The pre-push hook validates the branch name (`type/issue#-slug`) and runs `pnpm typecheck`. Both block on failure.

## For AI assistants

[`CLAUDE.md`](./CLAUDE.md) is the canonical project guide for Claude Code and other AI assistants. It covers the full tech stack with versions, data shapes, component architecture, scoped rules for keeping the docs in sync with the codebase, and the deterministic drift check that CI runs on every PR.

## License

[MIT](./LICENSE) © Tim Stacey. Site code is free to use, modify, and redistribute. Personal content (bio, resume data, profile image) is shared under the same terms but please don't pass it off as your own.
