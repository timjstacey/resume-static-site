# Resume Static Site

Personal resume + job-application tracker. Static site, hosted on GitHub Pages or Cloudflare Pages.

## Tech Stack

### Dependencies

| Package                 | Version | Purpose                                    |
| ----------------------- | ------- | ------------------------------------------ |
| astro                   | 6.3.5   | Static site framework                      |
| tailwindcss             | 4.3.0   | Utility-first styling                      |
| @tailwindcss/vite       | 4.3.0   | Tailwind 4 Vite plugin (Astro integration) |
| @catppuccin/tailwindcss | 1.0.0   | Catppuccin Mocha colour theme              |
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
| @types/node                 | 25.9.0  | Node.js type definitions                             |

### Tailwind setup

Tailwind 4 CSS-first — no `tailwind.config.js`. Wired via `@tailwindcss/vite` in `astro.config.mjs`.

Global CSS at `src/styles/global.css`:

```css
@import 'tailwindcss';
@import '@catppuccin/tailwindcss/mocha.css';
```

Import this file in `src/layouts/Base.astro`. Use `ctp-` prefixed utilities everywhere (`bg-ctp-base`, `text-ctp-text`, etc). No raw hex values in components.

## Pages

| Route       | File                       | Purpose                           |
| ----------- | -------------------------- | --------------------------------- |
| `/`         | `src/pages/index.astro`    | Hero, bio, quick stats, CTA links |
| `/resume`   | `src/pages/resume.astro`   | Full resume from data             |
| `/projects` | `src/pages/projects.astro` | Project portfolio from data       |
| `/jobs`     | `src/pages/jobs.astro`     | Job application dashboard         |

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
```

### resume.yml shape

```yaml
name: ''
tagline: ''
contact:
  email: ''
  github: ''
  linkedin: ''
experience:
  - company: ''
    role: ''
    start: 2023-01
    end: present
    bullets: []
education:
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
```

## Component Architecture

```
src/
  styles/
    global.css          # @import tailwindcss + catppuccin mocha
  layouts/
    Base.astro          # <html>, <head>, nav, footer — imports global.css
  components/
    Nav.astro           # top nav, active-page highlight
    StatusBadge.astro   # coloured pill for job status
    JobCard.astro       # single job application card
    ProjectCard.astro   # single project card
    ResumeSection.astro # section wrapper (title + slot)
  pages/
    index.astro
    resume.astro
    projects.astro
    jobs.astro
  data/
    resume.yml
    projects.yml
    jobs.yml
  lib/
    schemas.ts          # Zod schemas + inferred types for all data files
    data.ts             # getResume() / getProjects() / getJobs() loaders
    nav.ts              # isActivePath() helper
```

## Implementation Order

Issues are tracked at https://github.com/timjstacey/resume-static-site/issues

```
#1  Project setup (Astro + Tailwind + Catppuccin)       ✓ done
#3  Base layout and navigation                           ✓ done
#2  Data schemas and sample content                      ✓ done
      ↓ unblock all page issues
#4  Resume page          ─┐
#5  Projects page         ├─ parallel
#7  Home / about page    ─┘
#6  Job application dashboard   (depends on #3 StatusBadge)
#8  Deployment setup             (after all pages done)
```

## Playwright Screenshots

When using the `mcp__playwright__browser_take_screenshot` tool, always save to `.playwright-mcp/` — it is gitignored. Use a relative filename with that prefix:

```
filename: ".playwright-mcp/my-screenshot.png"
```

Never save screenshots to the repo root or any other directory.

## Commands

```bash
pnpm dev          # dev server at localhost:4321
pnpm build        # static output → dist/
pnpm preview      # preview built site locally
pnpm typecheck    # astro check — full TS diagnostics across all .astro/.ts files
pnpm test         # vitest run — unit tests (schemas, nav logic)
pnpm lint         # run ESLint
pnpm lint:fix     # run ESLint with auto-fix
```

## Git Hooks

Managed by husky.

| Hook       | Runs            | What                                                                                                                                               |
| ---------- | --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| pre-commit | on `git commit` | lint-staged: `eslint --fix` + `prettier --write` on staged `.astro`/`.ts`/`.tsx`; `prettier --write` on staged `.css`/`.json`/`.md`/`.yaml`/`.yml` |
| pre-push   | on `git push`   | `pnpm typecheck` — blocks push on type errors                                                                                                      |

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
