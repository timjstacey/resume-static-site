---
title: Your coverage gate rewards tests that assert nothing
date: 2026-06-16
tag: Strategy
excerpt: 'Line coverage counts execution, not checking. A test that runs your code and asserts nothing still passes an 85 percent gate.'
readMins: 6
hashtags: [TestAutomation, CodeCoverage, MutationTesting, SoftwareTesting, CICD]
preview:
  - ['$', 'cat coverage-gate-rewards-empty-tests.md']
  - ['#', '# Your coverage gate rewards empty tests']
  - [' ', '']
  - [' ', 'CI fails any PR that drops line coverage']
  - [' ', 'below 85 percent. You call that gate proof']
  - [' ', 'the suite stays honest.']
  - [' ', '']
  - [' ', 'You can pass it with tests that run your']
  - [' ', 'code and assert nothing at all.']
---

```ts title="payment.test.ts"
import { test } from 'vitest';
import { chargeCard } from './payment';

// This test covers every line of chargeCard. It checks nothing.
// Your 85% gate goes green and your suite proves the code ran.
test('charges a card', async () => {
  await chargeCard({ amount: 4200, token: 'tok_visa' });
});
```

Your CI fails any pull request that drops line coverage below 85 percent, and your team reads that gate as proof the suite stays honest. The test above passes it while verifying nothing. Coverage counts a line as covered the moment a test executes it. The test never has to check the result. Call a function, ignore what it returns, and the number climbs.

## Coverage counts execution, not checking

A coverage tool watches which lines run during a test. It cannot see whether you asserted on the outcome. So a developer racing the gate writes tests that exercise code paths and skip the assertions, the build passes, and the suite says nothing about whether the code works. [HackerNoon makes the case that 100 percent line coverage is a vanity metric](https://hackernoon.com/why-100percent-test-coverage-is-a-vanity-metric) for this reason, and [QA.tech argues the same point from the test-design side](https://www.qa.tech/blog/why-100-test-coverage-isnt-the-goal): a high percentage tells you the code ran under test, not that a failure would surface.

Ratcheting makes the problem worse. A gate that fails the build whenever coverage drops below the previous run pushes developers to add tests for the number, not for the behaviour. SonarQube popularised this pattern, and it enforces a percentage rather than assertion quality. The team chases a metric that an empty test satisfies.

Branch coverage tightens the count without fixing the gap. It tracks which logic paths ran, so an `if` with no test for its `else` shows up as uncovered. [A walkthrough of line versus branch coverage](https://medium.com/@sauradipta/line-vs-branch-coverage-which-metric-actually-guarantees-code-quality-32294f8fae14) shows branch coverage catching cases line coverage misses. It still measures execution. A branch can run without a single assertion on what it produced.

## Mutation testing measures what coverage skips

Mutation testing asks the question coverage cannot: would a test catch the bug? The tool makes a small change to your code, flips a `>` into a `>=`, swaps a `+` for a `-`, deletes a line, then reruns your suite. A test that fails has caught the change. A test that stays green ran the mutated line and never verified it. [Stryker's documentation on mutant states](https://stryker-mutator.io/docs/mutation-testing-elements/mutant-states-and-metrics/) names the two outcomes: a killed mutant means a test caught the mutation, a surviving mutant marks a line your tests execute but never check.

Stryker covers JavaScript and .NET; PIT covers Java. Point one at the empty test above and every mutant survives. The test runs `chargeCard` and asserts nothing, so flipping the amount comparison or dropping the charge call changes no test result. Coverage scored that line at 100 percent. Mutation testing scores it at zero.

```ts title="payment.test.ts"
import { expect, test } from 'vitest';
import { chargeCard } from './payment';

// Now a mutant that drops the charge, or flips the amount, fails this test.
test('charges the exact amount once', async () => {
  const receipt = await chargeCard({ amount: 4200, token: 'tok_visa' });
  expect(receipt.charged).toBe(4200);
  expect(receipt.attempts).toBe(1);
});
```

## Read the mutation score, not the coverage bar

Mutation score is the percent of mutants your suite kills. [Test Unity's 2026 metrics guide](https://blog.testunity.com/test-metrics-kpis-measure-qa-success/) reads a score under 70 percent as a weak suite, and a [2026 Stryker walkthrough for .NET and Python](https://johal.in/mutation-testing-with-stryker-net-and-python-coverage-2026/) pushes past 80 percent on the modules that carry risk. The number maps onto something coverage never could: the fraction of injected defects your tests would have stopped.

> Two modules can both report 90 percent line coverage. One kills 85 percent of mutants and one kills 30 percent. Coverage rates them as equal. Only one of them would catch the bug you ship next week.

The gap between the two numbers is the part of your suite that runs code without checking it. A wide gap, high coverage and a low mutation score, is the signature of tests written for the gate.

## Point the tool at the code that carries risk

Mutation testing costs runtime: the tool reruns your suite once per mutant, so a full pass over a large repo runs long. Treat it as a scalpel. Point Stryker at your payment and auth modules first, the code where a silent defect costs real money or leaks data. Run it, list the surviving mutants, and fix each one. Every fix adds the assertion your coverage number let you skip. [A 2026 Stryker guide on oneuptime](https://oneuptime.com/blog/post/2026-01-25-mutation-testing-with-stryker/view) walks the loop: run, read the survivors, write the missing assertion, rerun.

The survivors read like a to-do list for your suite. A surviving mutant on a boundary check tells you no test exercises the edge. A surviving mutant on a return value tells you no test reads what the function hands back. You write the assertion the mutant exposed, kill it, and move to the next.

## Gate on whether a test would catch the bug

The number that matters ships in production: the defect escape rate, the share of bugs that reach users instead of dying in CI. [Forestwalk argues that test coverage alone will not save you from a suite that proves nothing](https://forestwalk.ai/blog/test-coverage-wont-save-you-from-incoherence/), and the escape rate is how you measure the difference. Run Stryker on a critical module, fix the survivors, and watch the bugs caught before release climb while the ones users hit fall.

Coverage keeps a job. A line at zero coverage never ran under any test, and that signal still earns its place. The argument is against wiring the merge gate to a coverage percentage that an assertion-free test satisfies. Gate the code that carries risk on its mutation score, track the escape rate as the outcome, and let coverage report what ran rather than decide what merges.

I first shared this [on LinkedIn](https://www.linkedin.com/feed/update/urn:li:share:7472785453163753472).
