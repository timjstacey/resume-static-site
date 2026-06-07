---
title: Retrying a flaky test deletes the evidence of a real bug
date: 2026-06-07
tag: Strategy
excerpt: 'A bug that fails one run in four passes CI 99.6 percent of the time under three retries. Quarantine the test instead and keep the signal.'
readMins: 5
hashtags: [TestAutomation, FlakyTests, CICD, SoftwareTesting, DevOps]
preview:
  - ['$', 'cat retries-hide-real-bugs.md']
  - ['#', '# Retries delete the evidence']
  - [' ', '']
  - [' ', 'A test fails. You rerun it. It passes.']
  - [' ', 'The reflex is to wrap it in retryTimes']
  - [' ', 'and move on.']
  - [' ', '']
  - [' ', 'Run it three times and you throw away the']
  - [' ', 'proof that a real bug exists...']
---

```ts title="jest.setup.ts"
// A test failed, then passed on rerun. The reflex is to wrap it.
// A bug that fails one run in four now passes CI 99.6% of the time.
jest.retryTimes(3);
```

A test fails. You rerun it. It passes. You wrap it in `retryTimes`, label it flaky, and move on. That label costs you the one thing the red run gave you: proof that something underneath is broken.

## The math hides a quarter of your users

Run a test three times and a single green counts as a pass. A defect that fails one run in four still clears that bar 99.6 percent of the time. [Mergify ran the numbers on `jest.retryTimes()`](https://mergify.com/blog/why-jest-retrytimes-hides-bugs): three retries turn a 25 percent failure rate into a 0.4 percent chance the suite ever goes red. CI reports green while a quarter of your users hit the bug on their first try.

The scale of the masking surprised the teams who measured it. A study across 200+ teams found that 60 to 70 percent of failures engineers had filed as flaky traced back to real production bugs the retry logic had buried, [as Katalon's flaky-test teardown reports](https://katalon.com/resources-center/blog/flaky-tests-in-test-automation). The rerun did not stabilise the test. It silenced a defect.

## Most flakes are timing bugs in disguise

The word flaky frames the failure as random. The data frames it as concurrency. [TestDino's 2026 flaky-test benchmark](https://testdino.com/blog/flaky-test-benchmark) puts 45 percent of flaky cases on async wait problems and another 20 percent on race conditions. Two thirds of your flakes are timing defects, and timing defects ship to production, where real users race the same code paths your test does.

That cost compounds across the org. The same benchmark tracks Google spending around 2 percent of total coding time chasing flakes, about $120K a year for a 50-developer team. A blanket retry hides the bill instead of paying it down. You keep the green dashboard and keep funding the investigation that never ends.

## Retry buries the signal; quarantine keeps it

Retrying answers one question: can this test ever pass? Quarantine answers the question you care about: is the code under it broken? Pull the unstable test out of the blocking path so it stops gating deploys, keep running it on every commit so you still collect failure data, and attach a deadline so someone owns the fix. [Minware's quarantine guide](https://www.minware.com/guide/best-practices/flaky-test-quarantine) frames the deadline as the part that matters. A quarantine with no clock becomes a graveyard.

> A blind rerun throws away the failing run. Quarantine files it. The first hides the bug; the second hands it to someone with a due date.

The teams running this at scale built tooling around it. [Atlassian's Flakinator](https://www.atlassian.com/blog/atlassian-engineering/taming-test-flakiness-how-we-built-a-scalable-tool-to-detect-and-manage-flaky-tests) detects unstable tests, quarantines them, and recovered more than 22,000 builds that would have failed on flake alone. [Slack runs auto-detection plus suppression](https://slack.engineering/handling-flaky-tests-at-scale-auto-detection-suppression/) rather than blind reruns, so a flagged test leaves the merge gate but stays under observation. Microsoft cut flakiness 18 percent in six months with a fix-or-delete-in-two-weeks rule. The pattern holds across all three: take the test off the gate, keep the data, set the clock.

## A quarantine lane with a deadline

You can build the lane with the runner you already have. Route flagged specs into a non-blocking project that still runs and still reports, then track each one against an SLA so it cannot sit forever.

```ts title="playwright.config.ts"
export default defineConfig({
  projects: [
    {
      name: 'blocking',
      // The suite that gates merge. No retries: a red run blocks the PR.
      testIgnore: /.*\.quarantine\.spec\.ts/,
      retries: 0,
    },
    {
      name: 'quarantine',
      // Off the gate, still running. Failures collect data, not block deploys.
      testMatch: /.*\.quarantine\.spec\.ts/,
      retries: 0,
    },
  ],
});
```

Setting `retries: 0` on both lanes matters. A retry in the quarantine lane recreates the original problem one layer down, smoothing over the failure you moved the test there to study. Let it fail honestly and read the pattern.

The deadline lives next to the test, not in someone's memory:

```ts title="checkout.quarantine.spec.ts" showLineNumbers
// QUARANTINED 2026-06-07 — owner: @tim — fix-by 2026-06-21
// Symptom: fails ~1 run in 4 under parallel workers.
// Hypothesis: cart total reads before the discount mutation settles.
test('checkout applies the loyalty discount', async ({ page }) => {
  // ...
});
```

When the fix-by date passes, the test comes back to the blocking lane or it gets deleted. A quarantine that outlives its deadline is a retry wearing a different name.

## Start with the next flake

The next time a test fails and passes on rerun, stop before you reach for `retryTimes`. Read the failing run: which assertion, which worker, which wait. Two thirds of the time the answer is a race in the code, not noise in the test. Move the test to a quarantine lane, write the symptom and a fix-by date at the top, and put the timing defect on someone's board. The dashboard goes green either way. One green means you fixed the bug; the other means you hid it from a quarter of your users.

I first shared this [on LinkedIn](https://www.linkedin.com/feed/update/urn:li:share:7469531451395555329).
