---
title: GitHub Code Quality Goes Paid July 20. The Quality Gate Splits Next.
date: 2026-07-19
tag: Tools
excerpt: 'GitHub starts billing Code Quality at $10 per active committer on July 20, and the maintainability half of your PR gate turns into a per-repo budget decision.'
readMins: 4
hashtags: [CodeQuality, CICD, StaticAnalysis, QualityGates, DevOps]
preview:
  - ['$', 'cat github-code-quality-goes-paid.md']
  - ['#', '# The quality gate gets a price tag']
  - [' ', '']
  - [' ', 'July 20: GitHub Code Quality leaves']
  - [' ', 'preview and starts billing $10 per']
  - [' ', 'active committer, per enabled repo.']
  - [' ', '']
  - [' ', 'The maintainability half of your PR gate']
  - [' ', 'becomes a line item. Plan for the split.']
linkedinPost: |
  On July 20, GitHub Code Quality leaves public preview and starts billing. The price is 10 dollars per active committer per month on every enabled repository, plus metered charges for the AI-powered analysis and GitHub Actions minutes for each CodeQL run. An active committer is anyone who pushed a commit to the repo in the last 90 days.

  Code Quality is a separate product from Code Security. It scans for maintainability and reliability problems: dead code paths, complex functions, unreachable error handlers, coverage gaps. Security keeps the vulnerabilities. Since March 2026 you can turn each one on without the other, and GitHub priced them apart on purpose.

  A week before launch, GitHub shipped a license-estimate tool that counts your committers and projects the cost. A vendor that ships a calculator days before billing expects the price to decide adoption.

  Expect the maintainability half of your PR gate to split teams into two camps over the next two quarters. Teams already paying for Advanced Security fold Code Quality in as one more seat. Teams watching per-committer cost rebuild that gate from tools they already run: a linter with complexity and dead-code rules, coverage from their suite, and mutation testing for the reliability signal coverage cannot give.

  Before the 20th: run the license estimate against your committer count, scope the decision per repo instead of org-wide, and decide the security gate and the quality gate apart.

  Read the full write-up: https://tim.sillysamoyed.com/blog/github-code-quality-goes-paid

  #CodeQuality #CICD #StaticAnalysis #QualityGates #DevOps
---

```txt title="what-changes-july-20.txt"
Before July 20   CodeQL quality queries run free in public preview
After July 20    $10 / active committer / month, per enabled repo
               + metered AI analysis (Copilot Autofix, AI detection)
               + GitHub Actions minutes for each CodeQL run

active committer = one commit pushed to the repo in the last 90 days
```

On July 20, 2026, [GitHub Code Quality leaves public preview and starts charging](https://github.blog/changelog/2026-06-16-github-code-quality-generally-available-july-20-2026/). The price is $10 per active committer per month on every enabled repository, with metered charges on top for the AI-powered analysis and Actions minutes for each CodeQL run. Over the next two quarters, expect the maintainability half of your pull-request gate to split your fleet into two camps: teams that fold Code Quality into their GitHub seat spend, and teams that rebuild that gate from tools they already run in their own Actions minutes.

## What GitHub put behind the meter

Code Quality scans for the problems that make code expensive to change rather than dangerous to ship. [GitHub's docs](https://docs.github.com/en/code-security/concepts/about-code-quality) name the targets: dead code paths, complex functions, unreachable error handlers, and test coverage gaps. Code Security keeps the vulnerabilities; Code Quality takes maintainability and reliability. Enable it and two analyses run against your diff. Deterministic CodeQL quality queries flag the structural issues, and an LLM-powered pass adds findings the deterministic engine cannot reach. A per-repository dashboard scores maintainability and reliability so you can point remediation at the worst files.

This is a standalone product. You do not need a Copilot or a Code Security license to turn it on, and since March 2026 GitHub lets enterprise policy manage Code Security and Code Quality as separate toggles. The preview drew more than 10,000 enterprises, who used it to enforce quality gates and track coverage without paying for it. That free window closes on the 20th.

## The signals already pointing to the split

GitHub shipped a [license-estimate tool into public preview on July 13](https://github.blog/changelog/2026-07-13-github-code-quality-license-estimate-in-public-preview/), a week before the paid launch. The tool counts your active committers and projects the monthly cost. A vendor that builds you a calculator for a product days before billing expects the price to decide adoption. Read that as GitHub telling you the number matters.

Three more signals point the same way. The billing unit is the active committer, defined as anyone who pushed a commit to the repo in the last 90 days, which copies the seat model GitHub already uses for Copilot and Advanced Security. The AI analysis bills as metered usage on top of the seat, so the more you lean on Autofix and AI detection, the more the gate costs per month. And the deterministic CodeQL run draws Actions minutes from the same budget your pipelines already compete over. The March 2026 move to separate Code Security from Code Quality in policy was the setup: GitHub split the two so it could price them apart.

> The maintainability gate stopped being a free byproduct of running CodeQL. On July 20 it becomes a per-repo budget decision you make on purpose.

## Where each team lands

Teams already paying for Advanced Security will read Code Quality as one more seat on a bill they reconcile every month. The dashboards, the LLM findings, and the native PR gating buy back the integration work of stitching maintainability signals in by hand, and the marginal seat cost clears the bar. For a shop standardized on the GitHub platform, the paid product is the path of least resistance.

Teams watching per-committer costs will rebuild the maintainability gate from parts they already own. A linter with complexity and dead-code rules covers a slice of what the CodeQL quality queries flag, and it runs on the Actions minutes you already pay for. Coverage gaps come from the coverage tool in your suite. For the reliability signal that a line-coverage number cannot give you, mutation testing scores whether your tests would catch a real regression, which is the gap [a coverage gate leaves open](https://tim.sillysamoyed.com/blog/your-coverage-gate-rewards-tests-that-assert-nothing). Assemble those and you hold a maintainability gate without a new seat charge, at the cost of wiring and maintaining it yourself.

The [cost breakdown from DevOps.com](https://devops.com/github-code-quality-moves-to-general-availability-bringing-new-costs-and-capabilities/) frames the trade the same way: the base seat is predictable, the AI usage and Actions minutes are the variable your finance team will ask about. In either camp, the security decision and the quality decision come apart. CodeQL vulnerability scanning stays where it was; the maintainability gate is now a separate purchase you can decline per repo.

## What to do before the 20th

Run the license estimate against your active-committer count this week, before billing starts, so the first invoice holds no surprises. Scope the decision to the repositories that need it rather than flipping it on org-wide, since the charge lands per enabled repo and a low-churn service does not earn the seat. Then decide the two gates apart: keep CodeQL security scanning, and choose the maintainability gate on its own merits now that GitHub has priced it as its own thing. If you already gate on coverage and mutation score in your own pipeline, you may find you bought that reliability signal a long time ago.
