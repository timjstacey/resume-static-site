---
title: Three caching changes that take 80% off a GitHub Actions build
date: 2026-06-04
tag: Practice
excerpt: 'A cached ~/.npm drops a cold Node install from four minutes to thirty seconds, and two more cache changes take the rest of the pipeline down with it.'
readMins: 4
hashtags: [GitHubActions, CICD, DevOps, SoftwareDevelopment, TestAutomation]
preview:
  - ['$', 'cat github-actions-cache-strategy.md']
  - ['#', '# Three caching changes']
  - [' ', '']
  - [' ', 'A Node install in GitHub Actions hits']
  - [' ', 'the registry every push, 3 to 4 minutes']
  - [' ', 'a run. Cache ~/.npm and the same install']
  - [' ', 'drops to 15 to 30 seconds.']
  - [' ', '']
  - [' ', 'Three changes build on that step, and']
  - [' ', 'a team lands all three in an afternoon.']
---

```yaml title=".github/workflows/ci.yml"
- name: Cache npm
  uses: actions/cache@v4
  with:
    path: ~/.npm
    key: npm-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      npm-
- run: npm ci
```

A Node install in GitHub Actions runs `npm ci` against the registry on every push, and that download costs you 3 to 4 minutes a run. The `actions/cache` step above stores `~/.npm` between runs and hands it back on a hit, which drops the same install to 15 to 30 seconds. You add six lines and reclaim most of your install time. Three changes build on that step, and a team can land all three in an afternoon.

## Cache on the lock file hash

The cache key decides whether you get a hit. Key it to `hashFiles('**/package-lock.json')` so the hash changes only when a dependency changes. Most teams touch the lock file a few times a month, so this key lands a hit on 70 to 90 percent of runs. [The dependency-caching walkthrough on dev.to](https://dev.to/alex_aslam/optimizing-cicd-pipelines-slash-build-times-with-smarter-dependency-caching-59na) measures the same drop: a cold `npm install` of 3 to 4 minutes falls to under 30 seconds once the cache restores.

Cache `~/.npm`, the global npm download cache, and let `npm ci` assemble `node_modules` from it. Caching `node_modules` itself looks faster, and it breaks the moment you add a Linux and Windows matrix, because the tree holds platform-specific binaries that don't transfer across runners. [Easton's cache-strategy post](https://eastondev.com/blog/en/posts/dev/20260407-github-actions-cache-strategy/) walks the same trade-off and lands on caching the download directory for the same reason.

## Add restore-keys for partial hits

A single dependency bump rewrites the lock file hash, and your exact key misses. Without a fallback the run pays the full cold install. `restore-keys` gives you the recovery path:

```yaml title=".github/workflows/ci.yml"
- name: Cache npm
  uses: actions/cache@v4
  with:
    path: ~/.npm
    key: npm-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      npm-
```

On a miss, the cache matches the `npm-` prefix and restores the most recent entry under it. `npm ci` then downloads the handful of packages that changed and reuses the rest. You skip 80 percent of the downloads on a run that would have started from zero. [The build-cache techniques roundup](https://medium.com/@Rohan_Dutt/10-techniques-for-managing-build-cache-in-ci-cd-pipelines-a694c4b7758d) treats this partial-restore pattern as the default for any lock-file-driven cache.

## Cache Docker layers, then order the Dockerfile

A container build that rebuilds every layer runs 8 minutes or more. The GitHub Actions cache backend stores Docker layers once you point `buildx` at it:

```yaml title=".github/workflows/ci.yml"
- name: Build image
  uses: docker/build-push-action@v6
  with:
    cache-from: type=gha
    cache-to: type=gha,mode=max
```

`mode=max` caches every intermediate layer, not the final image alone, so an unchanged base and dependency layer restore from the cache and the build jumps to your changed code. The same container build drops to under 2 minutes.

Layer order decides the payoff. Put the instructions that change least often near the top of the Dockerfile and the commit-specific copy near the bottom:

```dockerfile title="Dockerfile"
FROM node:24-slim
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
```

Docker invalidates every layer below the first one that changes. Copy `package*.json` and run `npm ci` before you copy the source, and a code-only commit reuses the dependency layer. Reverse the two lines and every commit reinstalls from scratch. [The CI/CD performance-optimization writeup](https://dasroot.net/posts/2026/04/ci-cd-performance-optimization-faster-builds-deployments/) ties the same ordering rule to its largest single saving.

> Count the minutes a cold run spends downloading and rebuilding. That number is your ceiling, and dependency plus layer caching takes most of it back.

## Where the gains compound

Stack the three and the numbers move together. One [pipeline-optimization roundup](https://www.askantech.com/cicd-pipeline-optimization-reduce-build-times/) records 45-minute pipelines dropping to 8 and 15-minute Node pipelines to under 3 once caching covers both dependencies and Docker layers.

A monorepo extends the same idea past a single repo. Turborepo's remote cache shares task output across every CI run and every developer, so one job reuses a build another machine already ran. [Mercari's engineering team enabled remote caching in February 2026](https://engineering.mercari.com/en/blog/entry/20260216-turborepo-remote-cache-accelerating-ci-to-move-fast/) and reported Turbo task duration down 50 percent and total job duration down 30 percent.

One caveat rides along with heavy caching: a stale or poisoned cache serves the wrong artifact and hides a real failure. [Datadog's team documents purging the CI cache](https://www.datadoghq.com/blog/cache-purge-ci-cd/) when a build behaves in a way the source doesn't explain. Bump a version segment in your cache key when you need a clean slate, and tie the key to the lock file the rest of the time.

## Start with the lock file step

You don't need the whole stack on day one. Open your workflow, add the six-line `actions/cache` step before `npm ci`, key it to the lock file hash, and commit. That one step cuts install time by 60 percent or more before you touch Docker or your monorepo tooling. Add `restore-keys` next, then layer caching once a container build sits on your critical path.

I first shared this [on LinkedIn](https://www.linkedin.com/feed/update/urn:li:share:7468453622109024256).
