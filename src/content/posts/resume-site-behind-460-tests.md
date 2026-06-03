---
title: My resume site ships behind 460 tests
date: 2026-06-04
tag: Meta
excerpt: 'A personal resume site, gated by 247 unit tests and 213 browser tests across three engines, with six workflows that keep its own data fresh.'
readMins: 6
hashtags: [Astro, StaticSite, Playwright, ContinuousIntegration, TestAutomation]
preview:
  - ['$', 'cat resume-site-behind-460-tests.md']
  - ['#', '# My resume site ships behind 460 tests']
  - [' ', '']
  - [' ', 'Four lines of YAML are the whole job']
  - [' ', 'tracker. No database, no CMS. Edit the']
  - [' ', 'file, Astro rebuilds, Cloudflare deploys.']
  - [' ', '']
  - [' ', '247 unit tests and 213 browser tests']
  - [' ', 'stand between a typo and production...']
---

```yaml title="src/data/jobs.yml"
- company: Acme Corp
  role: Senior Engineer
  applied: '2026-05-01'
  status: Applied
```

Those four lines are the whole job tracker. No database, no CMS. I edit the YAML, [Astro](https://astro.build/) rebuilds the static site, and Cloudflare Pages publishes it. A [Zod](https://zod.dev/) schema validates every entry at build time, so a malformed date or a status outside the allowed set fails the build instead of shipping a broken card.

The site at [tim.sillysamoyed.com](https://tim.sillysamoyed.com) began as a one-page resume and grew into something I run like a small product. Each page reads from data, every behaviour carries a test, and six GitHub Actions workflows keep the whole thing honest.

## Every page reads from data

Three YAML files feed the site: `resume.yml`, `projects.yml`, and `jobs.yml`. The pages hold layout and styling; the content lives in the data. Change a job status in one place and the board, the counts, and the feeds all move with it.

The job board borrows Jira's shape: a column per status, a card per application. One rule does work I would otherwise forget to do by hand. An `Applied` entry flips to `Ghosted` once it has sat 28 days without a reply.

```ts title="src/lib/data.ts"
export function effectiveJobStatus(job: Job, now: Date): JobStatus {
  if (job.status === 'Applied' && daysSince(job.applied, now) >= 28) {
    return 'Ghosted';
  }
  return job.status;
}
```

The YAML never mutates. `getJobs()` derives the display status at render time, so the source file stays a clean record of what I submitted and the board shows the truth about who went quiet.

## The pages, and why each one exists

The [home page](https://tim.sillysamoyed.com/) carries the bio and a stat strip that counts years of experience and the active pipeline straight from the data. The [resume](https://tim.sillysamoyed.com/resume) renders the full CV and prints clean when a recruiter hits Cmd+P.

The [projects grid](https://tim.sillysamoyed.com/projects) pulls stars, forks, and a "2 days ago" recency label from a generated `project-stats.json`, refreshed every night from the GitHub API. I never hand-edit those numbers. The [job-hunt board](https://tim.sillysamoyed.com/job-hunt) is the tracker above. The [blog](https://tim.sillysamoyed.com/blog) is an Astro content collection, and this post lives in it.

The [testing page](https://tim.sillysamoyed.com/testing) is the odd one. It documents the test strategy and shows live counts pulled from the suite at build time, plus real per-step durations from the last green CI run. A page about the tests, fed by the tests.

Three feed endpoints round it out: [RSS](https://tim.sillysamoyed.com/rss.xml), Atom, and JSON Feed, each built from the same posts.

## Tests come in two layers

The rule I hold to: unit first, browser second. Decision logic moves into `src/lib/` as a pure function with a colocated `*.test.ts`, so a [Vitest](https://vitest.dev/) case can exercise it with no DOM. The 28-day ghosting rule, the nav focus-trap math, the blog paging, the theme-picker keyboard navigation all live as pure functions and carry their own tests. That comes to 247 unit tests across 20 files.

Browser tests cover the slice that needs a real page: navigation, focus, viewport layout, the drawer that opens below 425px. [Playwright](https://playwright.dev/) handles those, 213 of them across 11 specs.

A bug fix ships with a test that fails on the old code and passes on the new. If the existing tests could not have caught the regression, the gap is the point.

## One spec, seven projects, three engines

Run all 11 specs against all 7 Playwright projects and you get 784 test runs. Most of that is waste. Content renders the same in Chrome, Firefox, and Safari, so the content specs run once. Keyboard and focus behaviour drifts between engines, so the a11y specs run on all three. Layout depends on viewport, so the responsive specs run on mobile and tablet.

```ts title="playwright.config.ts"
{
  name: 'a11y-firefox',
  use: devices['Desktop Firefox'],
  testMatch: /(nav|theme-picker)\.spec\.ts/,
},
```

Routing each spec to where it earns its run cuts 784 down to 213. The coverage I care about stays; the redundant Chrome-versus-Firefox reruns of identical HTML go.

## The pipeline gates every merge

A pull request into `main` runs `ci.yml`: a doc-sync check, then lint with zero tolerance for warnings, then the unit suite under a V8 coverage gate, then a full TypeScript typecheck, then the build. Any step fails and the merge stops.

The browser suite runs in its own workflow. `playwright.yml` waits for the Cloudflare Pages preview deploy, then points Playwright at the live preview URL, so the tests hit the same static output a visitor would.

```yaml title=".github/workflows/ci.yml"
- run: ./scripts/ci/check-claude-md.sh
- run: pnpm lint
- run: pnpm test:coverage
- run: pnpm typecheck
- run: pnpm build
```

The doc-sync check is the one I reach for most. It fails the build when a dependency, source file, workflow, or script drifts out of step with the README and the contributor guide, so the docs cannot rot while the code moves.

## The site keeps itself current

Three nightly workflows commit generated data straight to `main`. One refreshes the GitHub stars and forks on the projects grid. One refreshes the CI snapshot that feeds the footer and the testing page. One regenerates the test counts whenever a spec changes, so the numbers on the testing page match the suite that produced them.

A fourth workflow reads the merged commits and bumps the version from the Conventional Commit type: `feat` earns a minor, `fix` a patch, a breaking change a major. The footer version moves on its own as I merge.

> The data refreshes itself, the version bumps itself, and the docs fail the build when they drift. The work I do by hand stays small.

That is the whole site: data in YAML, logic in tested functions, a pipeline that blocks a bad merge, and a set of robots that keep the generated parts fresh. The source is open at [github.com/timjstacey/resume-static-site](https://github.com/timjstacey/resume-static-site).
