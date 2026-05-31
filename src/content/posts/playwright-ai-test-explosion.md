---
title: When AI can write every test, what ships to CI is the job
date: 2026-05-24
tag: Strategy
excerpt: 'AI-generated Playwright tests flake under 1.5%. The new problem is test explosion, and coverage intent is still yours to define.'
readMins: 6
hashtags: [Playwright, TestAutomation, SoftwareTesting, AI, CICD]
preview:
  - ['$', 'cat playwright-ai-test-explosion.md']
  - ['#', '# Test explosion']
  - [' ', '']
  - [' ', 'AI-generated Playwright tests flake under']
  - [' ', '1.5% with role-based locators. Generation']
  - [' ', 'is solved.']
  - [' ', '']
  - [' ', 'The new problem: agents can cover every']
  - [' ', 'route and edge case. You decide which']
  - [' ', 'belong in CI...']
---

AI-generated Playwright tests flake under 1.5% when teams use role-based locators and structured output, per [TestDino's generation benchmarks](https://testdino.com/blog/ai-test-generation-tools). The generation problem is solved.

## The new problem is volume

[Currents.dev calls it test explosion](https://currents.dev/posts/state-of-playwright-ai-ecosystem-in-2026): agents can generate coverage for every route, form, and edge case your app exposes. Your team then decides which of those belong in CI, which are redundant, and what your coverage signal means beyond a raw test count. A suite that triples overnight is not three times the confidence.

## A gate that treats generated code like written code

The production pattern holding up is reliability gating. AI drafts the test, an engineer reviews the PR, and the test holds in CI for five to ten passing runs before it earns a merge-gate slot:

```ts title=".github/workflows/quarantine.md"
// New AI-drafted specs run in a quarantine project first.
// Promote to the blocking suite only after 5-10 green runs.
{ name: 'quarantine', testMatch: /.*\.ai\.spec\.ts/, retries: 0 }
```

Same bar as code you wrote by hand. A test that cannot stay green for a week does not get to block a deploy.

## Coverage intent is the hard part

AI asserts what shows on screen. It cannot tell whether that outcome is correct without a human-defined pass/fail rule. Generating a checkout-flow test takes seconds; defining what a correct checkout looks like takes someone who knows the business rule and writes it down. A £0.00 total is a valid free order or a pricing bug, and only your domain answers that.

> Agents amplify whatever foundation you give them. With inconsistent locators, they generate ten failing tests where one used to live, and brittle fixtures get exercised at scale before anyone notices.

## Spend the recovered time on intent

The [2026 ecosystem survey](https://currents.dev/posts/state-of-playwright-ai-ecosystem-in-2026) and [BuildBetter's guide](https://blog.buildbetter.ai/playwright-test-generation-with-ai-complete-2026-guide) both arrive at the same place: generation is cheap, judgment is not. Roundups from [QA Wolf](https://www.qawolf.com/blog/the-12-best-ai-testing-tools-in-2026) and [Qate](https://qate.ai/blog/playwright-vs-ai-testing) compare the tools, but the [Playwright release notes](https://playwright.dev/docs/release-notes) make the foundation point concrete: role-based locators and structured output are what keep generated tests stable.

Your AI tools can draft a full suite by morning. What earns a slot in CI, and what a green run is allowed to mean, stays your call.
