# Resume Static Site

Personal resume + job-application tracker. Static site, hosted on GitHub Pages or Cloudflare Pages.

## Tech Stack

| Tool | Purpose |
|---|---|
| Astro 4.x | Static site framework |
| Tailwind CSS 3.x | Utility-first styling |
| @catppuccin/tailwindcss | Catppuccin Mocha colour plugin |
| TypeScript 5.x + Zod | Type-safe data schemas |

Tailwind config — `tailwind.config.mjs`:
```js
import catppuccin from "@catppuccin/tailwindcss"
export default {
  plugins: [catppuccin({ defaultFlavour: "mocha" })]
}
```

Use `ctp-` prefixed utilities everywhere (`bg-ctp-base`, `text-ctp-text`, etc). No raw hex values in components.

## Pages

| Route | File | Purpose |
|---|---|---|
| `/` | `src/pages/index.astro` | Hero, bio, quick stats, CTA links |
| `/resume` | `src/pages/resume.astro` | Full resume from data |
| `/projects` | `src/pages/projects.astro` | Project portfolio from data |
| `/jobs` | `src/pages/jobs.astro` | Job application dashboard |

## Job Application Statuses

| Status | Catppuccin colour | Meaning |
|---|---|---|
| Applied | Blue `#89b4fa` | Submitted, awaiting response |
| Screening | Sapphire `#74c7ec` | Recruiter/phone screen |
| Interviewing | Peach `#fab387` | Active interview rounds |
| Offered | Green `#a6e3a1` | Offer received |
| Rejected | Red `#f38ba8` | Application declined |
| Withdrawn | Overlay2 `#9399b2` | User withdrew |
| Ghosted | Mauve `#cba6f7` | No response after follow-ups |

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
  applied: 2026-05-01
  status: Interviewing
  notes: ""
```

### resume.yml shape
```yaml
name: ""
tagline: ""
contact:
  email: ""
  github: ""
  linkedin: ""
experience:
  - company: ""
    role: ""
    start: 2023-01
    end: present
    bullets: []
education:
  - institution: ""
    degree: ""
    year: 2020
skills:
  - category: Languages
    items: []
```

### projects.yml entry shape
```yaml
- name: ""
  description: ""
  url: ""
  repo: ""
  tags: []
  status: active   # active | wip | archived
```

## Component Architecture

```
src/
  layouts/
    Base.astro          # <html>, <head>, nav, footer
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
    schemas.ts          # Zod schemas for all data files
```

## Implementation Order

Issues are tracked at https://github.com/timjstacey/resume-static-site/issues

```
#1  Project setup (Astro + Tailwind + Catppuccin)
#2  Base layout and navigation
#3  Data schemas and sample content
      ↓ unblock all page issues
#4  Resume page          ─┐
#5  Projects page         ├─ parallel
#7  Home / about page    ─┘
#6  Job application dashboard   (depends on #3 StatusBadge)
#8  Deployment setup             (after all pages done)
```

## Commands

```bash
npm run dev       # dev server at localhost:4321
npm run build     # static output → dist/
npm run preview   # preview built site locally
```

## Verification Checklist

- [ ] `npm run dev` starts with no console errors
- [ ] `bg-ctp-base` / `text-ctp-text` resolve in Tailwind
- [ ] All 4 nav links route correctly, active state visible
- [ ] All 7 job statuses render with correct Catppuccin colours
- [ ] Dashboard stats bar counts match data file entries
- [ ] Status filter works without page reload
- [ ] Resume prints cleanly (`Cmd+P`)
- [ ] Build passes: `npm run build` exits 0
- [ ] Mobile layout: nav, cards, resume sections all readable
- [ ] Deploy: push to `main` triggers build + publishes to Pages URL
