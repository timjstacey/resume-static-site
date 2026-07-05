---
title: Let a flake-rate metric build your quarantine list
date: 2026-07-05
tag: Practice
excerpt: 'A hand-kept flaky-test list goes stale the day you save it. Score each test flake rate in Prometheus and a query keeps the quarantine list current for you.'
readMins: 5
hashtags: [FlakyTests, TestAutomation, CICD, Prometheus, TestObservability]
preview:
  - ['$', 'cat flake-rate-metric-quarantine-list.md']
  - ['#', '# Let a metric build your quarantine list']
  - [' ', '']
  - [' ', 'You keep a flaky-test list somewhere and']
  - [' ', 'update it once. Six weeks on you gate merges']
  - [' ', 'off data that went stale.']
  - [' ', '']
  - [' ', 'Your CI already knows which tests pass and']
  - [' ', 'fail. Let a flake-rate query keep the list...']
linkedinPost: |
  When a test starts failing at random, you mark it and move on: a flaky comment and a test.skip at the top of the spec. Those skips pile up across the suite, and you revisit them once. Weeks later, half of them name races someone already fixed, still skipped and dropping coverage, while last Tuesday's flake is not skipped yet and breaks the merge. Your skip list drifted from the suite the week after you wrote it.

  Red Hat published a walkthrough for a quarantine system that reads a metric instead. Your CI already records which tests passed and failed. Push those results into Prometheus, and one recording rule scores every test's flake rate: one minus its pass ratio over a 30-day window.

  The pieces:

  1. A reporter pushes two counters per run, total runs and passes, to a Pushgateway.
  2. A rule flags any test failing more than 1 run in 5, with a floor of 10 runs so a bad afternoon on a shared runner cannot quarantine a test.
  3. The controller separates regressions from flakes. A test that fails every single run is broken, so it stays on the gate and blocks the PR.
  4. A query writes the quarantine list the runner reads. When a fix lands and the pass rate climbs, the test drops off the list and rejoins the gate on its own.

  No one edits a file to add a flake or retire it. Grafana plots each test's 30-day trend, so you tell a slow regression from noise.

  Full write-up, with the reporter and the PromQL:
  https://tim.sillysamoyed.com/blog/flake-rate-metric-quarantine-list

  #FlakyTests #TestAutomation #CICD #Prometheus #TestObservability
---

```yaml title="flake-rate.rules.yml"
# One rule scores the whole suite. A test is flaky when it fails
# more than 1 run in 5, measured across the last 30 days.
- record: test:flake_rate:30d
  expr: 1 - (
      sum by (test) (increase(test_pass_total[30d]))
    / sum by (test) (increase(test_run_total[30d]))
  )
```

When a test starts failing at random, you mark it and move on: a `// flaky` comment and a `test.skip` at the top of the spec. Those skips pile up across the suite, and you revisit them once. Six weeks on, half of them name races someone already fixed, still skipped and quietly dropping coverage, while the flake that started last Tuesday is not skipped yet and breaks the merge. Your skip list drifted from the suite the week after you wrote it.

A metric does not go stale. Your CI already records which tests passed and which failed on every run. Push those results into Prometheus, score each test's failure rate, and let a query decide which tests belong in quarantine. The list rebuilds on every run, and no one edits a file to add or drop a test. [Red Hat's June walkthrough](https://developers.redhat.com/articles/2026/06/29/build-dynamic-e2e-test-quarantine-system-prometheus-grafana) wires this up against a Prometheus-backed cluster and Grafana. Here is the shape of it.

## Export every test result as a metric

Two counters carry the whole decision: how many times each test ran, and how many of those runs it passed. A Playwright reporter increments both on `onTestEnd`, tagged with the test's full title so every result lands against one time series.

```ts title="metrics-reporter.ts"
import type { Reporter, TestCase, TestResult } from '@playwright/test/reporter';
import { Counter, Pushgateway, register } from 'prom-client';

const runs = new Counter({ name: 'test_run_total', help: 'runs', labelNames: ['test'] });
const passes = new Counter({ name: 'test_pass_total', help: 'passes', labelNames: ['test'] });

export default class MetricsReporter implements Reporter {
  onTestEnd(test: TestCase, result: TestResult) {
    const id = test.titlePath().join(' > ');
    runs.inc({ test: id });
    if (result.status === 'passed') passes.inc({ test: id });
  }
  async onEnd() {
    const gateway = new Pushgateway('http://pushgateway:9091', [], register);
    await gateway.pushAdd({ jobName: 'e2e' });
  }
}
```

CI runners come and go, and Prometheus scrapes targets that stay put. So a run pushes its counts to a [Pushgateway](https://prometheus.io/docs/practices/pushing/) at the end, and Prometheus reads them from there. One reporter, two counters, and every run leaves a trail the query can read later.

## Score the flake rate with one rule

Flake rate is the share of runs a test failed: one minus its pass ratio. A recording rule computes it across a 30-day window for the whole suite, so the number sits ready before any query asks for it. Red Hat sets the quarantine line at 0.2. A test that fails more than one run in five over that window has earned a look.

Two guards keep the rule honest. The 30-day window absorbs a bad afternoon on a shared runner instead of reacting to it. A floor of 10 runs stops a test that ran twice from crossing the line on a single red result. A test needs a real history of mixed outcomes before the rule calls it flaky, which keeps the noise of a slow week out of your quarantine set.

## Keep regressions on the gate

A test that fails every run scores a flake rate near 1.0. It clears the 0.2 line, and quarantining it would be the worst move on the board: you would pull a test off the gate at the moment it started catching a real bug. A consistent failure is a regression, not a flake, and it belongs in front of the PR where it blocks the merge.

The controller reads the shape of the failures, not the count alone. A test that mixes passes and failures is flaky. A test whose recent runs are all red is broken. Red Hat's controller queries Prometheus, then excludes the all-red tests before it writes the quarantine set, so a regression stays on the gate and a flake steps aside.

## Generate the list, hand it to the runner

One query returns the tests that cross the threshold with enough history behind them. The controller writes their names to a file the runner reads on the next run.

```bash title="quarantine.sh"
# Ask Prometheus which tests earned quarantine, write the list the runner reads.
curl -s "$PROM/api/v1/query" --data-urlencode \
  'query=(test:flake_rate:30d > 0.2) and (test:run_count:30d >= 10)' \
  | jq -r '.data.result[].metric.test' > quarantine.txt
```

The runner skips those tests on the blocking path, then runs them in a second job that reports without gating. The skip keeps flaky noise out of your merge signal. The second job keeps the counters climbing, so the metric that quarantined a test goes on watching it.

```ts title="quarantine.fixture.ts"
import { test as base } from '@playwright/test';
import { readFileSync } from 'node:fs';

const quarantined = new Set(readFileSync('quarantine.txt', 'utf8').split('\n'));

export const test = base;
test.beforeEach(async ({}, testInfo) => {
  const id = testInfo.titlePath.join(' > ');
  test.skip(quarantined.has(id), 'quarantined by flake rate');
});
```

## Let the metric release the test

Someone fixes the race the test kept losing. Its next runs pass, its pass ratio climbs, and its flake rate slides back under 0.2. The next time the controller runs its query, the test drops out of `quarantine.txt` and rejoins the gate. Recovery costs no one a pull request.

> A hand-kept list needs a human to add a flake and another to retire it. A metric does both from the same runs your suite already produces.

Grafana carries the view. A [Red Hat alerting rule](https://developers.redhat.com/articles/2026/06/29/build-dynamic-e2e-test-quarantine-system-prometheus-grafana) fires when a test first crosses 0.2, so the team meets a new flake the day it shows up. A dashboard plots each test's 30-day trend, which separates a slow regression climbing toward 1.0 from a flake bouncing around 0.3. You read the shape and decide whether to fix the test or fix the code under it.

## Start with the reporter

Add the metrics reporter to one CI job this week and let it collect for a month. The flake rate means nothing until the 30-day window and 10-run floor fill in, so the sooner the counters start, the sooner your query has a history to read. Write the recording rule, set the line at 0.2, and point the controller at Prometheus. From there the quarantine list runs itself: it pulls a test off the gate the run it turns flaky, and it hands the test back the run someone fixes it.
