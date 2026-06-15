---
title: Five steps to a GitHub merge queue that does not stall
date: 2026-06-14
tag: Practice
excerpt: 'A merge queue tests each PR against the ones ahead of it before it lands. Five setup steps keep it moving instead of stalling the day you turn it on.'
readMins: 6
hashtags: [GitHubActions, CICD, MergeQueue, DevOps, DeveloperExperience]
preview:
  - ['$', 'cat github-merge-queue-five-steps.md']
  - ['#', '# A merge queue that does not stall']
  - [' ', '']
  - [' ', 'Your team merges enough PRs a day that']
  - [' ', 'main breaks from changes that each passed']
  - [' ', 'CI on their own.']
  - [' ', '']
  - [' ', 'The queue tests every PR against the ones']
  - [' ', 'ahead before it lands. Five steps keep it']
  - [' ', 'moving...']
---

```yaml title=".github/workflows/ci.yml"
on:
  pull_request:
  merge_group: # without this line the queue waits forever

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm test
```

Your team merges enough PRs a day that main breaks from changes that each passed CI on their own. Two green branches stack into a red trunk. GitHub's merge queue closes that gap: it builds a merge group from your PR plus the ones ahead of it, runs CI against that combination, and lands the batch only when the combined result stays green. The [GitHub docs](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/managing-a-merge-queue) cover the mechanics. The five steps below cover the traps that stall the queue the first day you enable it.

## Add the merge_group trigger to your required workflow

Branch protection waits for your required checks to report on the merge group. Most CI workflows fire on `pull_request` and nothing else, so the merge group never receives a status. The queue forms, waits for a check that will not arrive, and holds the PR. This is the single most common merge-queue failure, and the fix is one line: add `merge_group` to the workflow's `on:` block, as the hero snippet above shows.

[7tech walks through the trigger gap](https://www.7tech.co.in/github-merge-queue-workflow-rulesets-merge-group-ci/) and [Mergify's setup guide](https://mergify.com/blog/enable-github-merge-queue-actions-setup) lands on the same first step. Add the trigger to every workflow whose checks you mark required, not the test workflow alone. A required lint job that skips `merge_group` stalls the queue the same way a missing test job does.

## Keep the required set lean

Branch protection blocks the merge until every required check reports green against the merge group. Put a 20-minute end-to-end suite in that set and every merge waits 20 minutes behind it, queued PRs included. Keep the blocking set to the fast signals: unit tests, type checking, lint, security scans. Move end-to-end runs, visual regression, and performance suites to a post-merge job or an environment gate so they verify the deploy without gating each merge.

[Tenki's setup notes](https://tenki.cloud/blog/github-merge-queue-setup) draw the same line between blocking and informational checks. The queue already serialises your merges. A bloated required set serialises them behind your slowest job, and the velocity you turned the queue on for drains away.

## Quarantine flaky tests before you switch it on

The queue reruns the whole merge group when one test flakes. A single unstable test in the blocking set taxes every PR stacked behind it, and a flake in a five-PR group evicts the batch and rebuilds it. Audit the suite first: run it 20 times, and send any test that fails once to a quarantine lane until someone fixes it. Turn the queue on against a suite you trust to stay green.

> A flaky test costs you one red run on a normal merge. Inside the queue it costs you the whole group, on every batch it touches. Clear the flakes before you serialise on them.

[Graphite's writeup on automated merge queues](https://cms.gitar.ai/automated-merge-queues-graphite-2026/) makes test stability the precondition rather than a follow-up. A queue amplifies whatever reliability your suite already has, up or down.

## Freeze your required job names

Rulesets match required checks by name. The match is a plain string against the status the job reports. Rename a required job in the workflow and leave the ruleset pointing at the old name, and the queue waits on a status that no longer reports, with no error to explain the wait. [7tech flags this same silent friction](https://www.7tech.co.in/github-merge-queue-workflow-rulesets-merge-group-ci/) in rulesets.

Treat a required job's name as an interface. Change it and update the ruleset in the same PR, the way you would update a caller when you rename a function.

## Keep force-pushes off queued PRs

On May 4 2026 a team logged a queued PR where a force-push to the branch dispatched zero CI on the new SHA. GitHub fired no `pull_request` synchronize event, so no workflow ran. The queue held the old green result for about 30 minutes, then evicted the PR on stale checks. The [community discussion](https://github.com/orgs/community/discussions/194832) traces the sequence, and [DevActivity broke down why the force-push skips CI](https://devactivity.com/posts/apps-tools/github-merge-queue-s-silent-fails-why-force-pushes-break-ci-and-productivity/). A PR sitting in `AWAITING_CHECKS` or `QUEUED` carries CI state the queue trusts, and a force-push invalidates the code under that state without refreshing it.

Push your fixes while the PR sits outside the queue. Rebase, amend, and force-push before you add it, then let the queue take a SHA whose checks match its code.

## Start with step one

Teams that get the setup right buy back real time. Ramp reported a [74 percent drop in median time between merges](https://humanwhocodes.com/blog/2026/04/improving-developer-velocity-github-merge-queue/) after adopting a merge queue, with engineers merging close to three times faster. That payoff depends on the queue moving, and the queue moves once the five traps above are closed.

Open your required workflow and add `merge_group` to the `on:` block today. That one line clears the failure that strands most first-day queues. Trim the required set, quarantine your flakes, freeze your job names, and keep force-pushes off queued PRs, and the queue does the job you turned it on for: it keeps main green while your team keeps merging.

I first shared this [on LinkedIn](https://www.linkedin.com/feed/update/urn:li:share:7472081159451987968).
