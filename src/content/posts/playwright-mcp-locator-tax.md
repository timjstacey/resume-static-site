---
title: The locator tax nobody puts in the budget
date: 2026-05-12
tag: Strategy
excerpt: 'Broken-test triage is a staffing decision disguised as a process one. Here is the cost, and where AI self-healing pays it back.'
readMins: 6
hashtags: [EngineeringLeadership, SoftwareEngineering, TestAutomation, DevProductivity, QualityAssurance]
preview:
  - ['$', 'cat playwright-mcp-locator-tax.md']
  - ['#', '# The locator tax nobody budgets']
  - [' ', '']
  - [' ', 'Two or three senior engineers on test']
  - [' ', 'maintenance run $75k-$120k a year. That']
  - [' ', 'is a staffing decision wearing a process']
  - [' ', 'costume.']
  - [' ', '']
  - [' ', 'AI agents now read browser intent, not']
  - [' ', 'CSS selectors. The math changes...']
---

Two or three senior engineers on test maintenance cost $75,000 to $120,000 a year. That is a staffing decision wearing a process costume, and it rarely shows up as a line item.

## The cost hides in the sprint

[Bug0 put numbers](https://bug0.com/blog/playwright-mcp-changes-ai-testing-2026) to what most engineering managers already feel: broken-test triage is high-cost, low-leverage work. Industry data puts the flaky-test tax around $2,200 per developer per month in large enterprises, and [Functionize traces](https://www.functionize.com/blog/the-flaky-test-problem-root-cause-and-how-ai-solves-it) most of it to selectors that break when the UI shifts.

You see the bill as slow sprints, senior engineers pulled off feature work, and QA leads triaging red builds instead of reviewing coverage. None of that lands in a maintenance budget, so the spend stays invisible until you measure it.

## What changed: agents read intent, not selectors

A class rename breaks a CSS selector. It does not change what the element is. Agents that read the accessibility tree repair the test against intent and flag the cases where the product actually regressed. The difference is which layer the test binds to:

```ts title="locator-strategy.ts"
// Brittle: binds to markup that refactors break
page.locator('.btn-primary.checkout-cta');

// Durable: binds to what the user sees, what an agent can re-derive
page.getByRole('button', { name: 'Pay now' });
```

[Forrester estimates](https://www.buildmvpfast.com/blog/ai-testing-automation-self-healing-qa-maintenance-2026) self-healing tooling cuts those maintenance costs by more than half, and the [2026 Playwright ecosystem survey](https://currents.dev/posts/state-of-playwright-ai-ecosystem-in-2026) reports the same direction across teams.

## Model the token cost before you scale

Self-healing is not free. Plan for roughly 114K tokens per AI-assisted test run at CI scale. On a 500-test suite run daily, that adds up to a real bill, so treat it like any other infra cost. Pilot on a stable subset, measure the triage hours you recover, then expand to the suites that churn most.

> The engineers you pay senior rates should review genuine regressions. If their weeks go to CSS-rename fallout, the case for self-healing closes fast.

## The decision

Frame it as headcount, not tooling. Two senior engineers freed from selector triage is the return; the token spend and a pilot are the cost. [Qadence](https://www.qadence.ai/blog/ai-quality-assurance-testing) and [TestDino](https://testdino.com/blog/playwright-ai-ecosystem) both land on the same split: let agents handle the mechanical repair, keep humans on the judgment calls. Run the pilot, recover the hours, and put the recovered time where it earns more than green builds.
