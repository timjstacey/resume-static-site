# Research: GitHub Code Quality Goes Paid July 20. The Quality Gate Splits Next.

**Date range:** 2026-06-21 to 2026-07-19

## Summary

GitHub Code Quality moves from public preview to general availability on July 20,
2026, and starts billing that day. This is the freshness anchor: the license-estimate
tool landed in public preview on 2026-07-13 (within the 7-day Tier 3 window), a tell
that GitHub expects price to gate adoption.

Key facts (sourced):

- **What it is.** Code Quality is a product separate from Code Security. It scans for
  maintainability and reliability problems — dead code paths, overly complex functions,
  unreachable error handlers, test coverage gaps — where Code Security scans for
  vulnerabilities. When enabled, two analyses run: deterministic CodeQL quality queries,
  and LLM-powered analysis for insights the deterministic engine misses. Repository
  dashboards track maintainability and reliability scores.
- **Unbundled from security.** Since March 2026, enterprise policy manages the two
  independently — Code Security without Code Quality, or the reverse. No Copilot or Code
  Security license is required to use Code Quality.
- **Pricing.** $10 per active committer per month on enabled repositories, plus
  usage-based charges for AI-powered capabilities (Copilot code review, AI-assisted
  detection, Copilot Autofix). Deterministic CodeQL analysis also consumes GitHub Actions
  minutes. Active committer = someone whose commit was pushed to the repo in the last 90
  days, regardless of when it was originally authored.
- **Preview scale.** More than 10,000 enterprises used the public preview to detect
  maintainability/reliability issues, enforce quality gates, and track code coverage.
- **Billing timing.** No billing during public preview; charges begin July 20, 2026.

Angle (Prediction archetype): GitHub priced the quality dimension of the PR gate that
used to fall to the ecosystem. Forecast over the next 6-12 months: the quality gate
bifurcates into teams that fold Code Quality into their GitHub seat spend and teams that
rebuild the maintainability gate from OSS they already run in their own Actions minutes
(linters/complexity rules, mutation testing, coverage). Security and quality become
separate budget decisions now that GitHub separated the products.

## Sources

- https://github.blog/changelog/2026-06-16-github-code-quality-generally-available-july-20-2026/
- https://github.blog/changelog/2026-07-13-github-code-quality-license-estimate-in-public-preview/
- https://docs.github.com/en/code-security/concepts/about-code-quality
- https://docs.github.com/en/billing/concepts/product-billing/github-code-quality
- https://devops.com/github-code-quality-moves-to-general-availability-bringing-new-costs-and-capabilities/
