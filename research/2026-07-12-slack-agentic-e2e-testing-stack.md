# Research: Where Slack Put AI Agents in Its E2E Testing Stack

**Date range:** 2026-06-14 to 2026-07-12

## Summary

Slack's engineering team published "Agentic Testing: Where Agents Fit in the
E2E Testing Stack" (covered by InfoQ in July 2026). They ran more than 200
agentic end-to-end workflows across three setups to measure where AI agents
help and what they cost.

Core mechanism:

- An agentic test is expressed as an objective/intent, not a fixed script. The
  agent interprets the intent, interacts through UI or API surfaces, evaluates
  application state at each step, and tries alternate paths when an element
  moves instead of failing on a missing selector.
- Traditional E2E validates a specific journey through the UI. Agent-driven
  execution validates whether a goal state can still be reached.

The 200+ runs used three configurations, with these failure rates:

- Playwright MCP: near-zero failure on simple scenarios, 0–12% on complex
  flows. Most reliable configuration.
- Playwright CLI: ~12–20% failure, mostly execution issues (authentication
  handling, navigation timing, session instability), not model reasoning.
- Agent-generated Playwright tests: ~8% on simple flows, ~48% on complex flows.

Cost and determinism:

- Agent runs cost $15–30 each and take over 10 minutes, against cents and
  seconds for a scripted run.
- Runs are nondeterministic: the overall workflow stays consistent (e.g. login
  → search → result → clear) but the exact action sequence varies across runs,
  even when the outcome is correct.

Positioning: complementary, not a replacement. Deterministic tests stay the
primary mechanism for critical logic and contract correctness (fast, cheap,
repeatable in CI). Agentic execution sits in the E2E layer where UI/structural
churn makes scripted tests brittle — exploring complex UI, debugging flaky
workflows, reproducing production issues.

## Sources

- https://slack.engineering/agentic-testing-where-agents-fit-in-the-e2e-testing-stack/
- https://www.infoq.com/news/2026/07/slack-agentic-e2e-testing-ui/
