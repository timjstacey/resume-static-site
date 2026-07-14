---
title: Where Slack Put AI Agents in Its E2E Testing Stack
date: 2026-07-15
tag: Strategy
excerpt: 'Slack ran more than 200 end-to-end workflows through AI agents to map where intent-driven tests beat brittle scripts and where the price per run keeps scripts in charge.'
readMins: 4
hashtags: [TestAutomation, Playwright, AgenticTesting, E2ETesting, AI]
preview:
  - ['$', 'cat slack-agentic-e2e-testing-stack.md']
  - ['#', '# Where agents fit in the E2E stack']
  - [' ', '']
  - [' ', 'Slack ran 200+ end-to-end workflows']
  - [' ', 'through AI agents and published the results.']
  - [' ', '']
  - [' ', 'A scripted step fails when a selector moves.']
  - [' ', 'An agent given the goal looks for another']
  - [' ', 'route. It costs $15-30 and ten minutes a run.']
linkedinPost: |
  Slack's engineering team ran more than 200 end-to-end workflows through AI agents and published where the agents helped and what they cost.

  A scripted end-to-end test walks one path through the UI: fill this field, click that button, assert this row. Move the button and the test fails on the missing selector, even though the feature still works. An agentic test carries an objective instead. The agent reads the goal, works the UI or the API to reach it, checks the state at each step, and looks for another route when an element moved.

  Slack tested three drivers. Playwright MCP was the most reliable: near-zero failures on simple scenarios and 0 to 12 percent on complex flows. The Playwright CLI failed 12 to 20 percent of the time, mostly on auth handling, navigation timing, and session instability rather than model reasoning. Agent-generated Playwright tests held on simple flows at about 8 percent but degraded to roughly 48 percent on complex ones.

  The resilience has a bill. An agent run cost 15 to 30 dollars and took over ten minutes, against cents and seconds for a scripted run. Runs are also nondeterministic: the workflow stayed consistent, login to search to result, but the exact action sequence changed run to run.

  Slack kept deterministic tests as the primary gate for critical logic and contract correctness, and put agents in the end-to-end layer where UI churn makes scripts brittle. Put agents where a moved button should not fail a test. Keep scripts where you need the same path proven cheaply on every commit.

  Read the full write-up: https://tim.sillysamoyed.com/blog/slack-agentic-e2e-testing-stack

  #TestAutomation #Playwright #AgenticTesting #E2ETesting #AI
---

```txt title="two-ways-to-write-one-test.txt"
# Scripted: one fixed path through the UI
await page.getByPlaceholder('Search').fill('quarterly report');
await page.getByRole('button', { name: 'Search' }).click();
await expect(page.getByRole('listitem').first()).toContainText('report');

# Agentic: the objective, no path
"Search the workspace for 'quarterly report' and confirm a
 matching message shows up in the results."
```

Slack's engineering team ran more than 200 end-to-end workflows through AI agents and wrote down what broke, what held, and what it cost. [The write-up](https://slack.engineering/agentic-testing-where-agents-fit-in-the-e2e-testing-stack/) reports the runs across three setups and lands on a boundary for where an agent earns its place. The number to start with: an agent run cost $15 to $30 and took over ten minutes, against a scripted run that finishes in seconds for cents.

## The test carries an objective, not a path

A scripted end-to-end test names every step. Fill the search box, click the button, assert the first result. [InfoQ's summary](https://www.infoq.com/news/2026/07/slack-agentic-e2e-testing-ui/) frames the failure the team wanted to fix: those tests break on user-interface or service changes rather than on real regressions, and each break costs an engineer time to chase. Move the search button and the selector goes missing, so the test fails on a feature that still works.

An agentic test carries the goal. The agent reads the objective, works the UI or the API to reach it, checks the application state at each step, and looks for another route when an element moved. Slack draws the line this way: a deterministic test validates one journey through the UI, while an agent validates whether the goal state can still be reached. The scripted run proves a path. The agent proves the outcome survives a path that shifted under it.

> A scripted test proves one route works. An agent proves the goal is still reachable when the route moves.

## Three drivers, three failure rates

Slack ran the 200-plus workflows across three configurations in test workspaces on non-production data, and the driver decided the reliability.

The **Playwright MCP** setup was the steadiest. It held near-zero failures on simple scenarios and stayed within 0 to 12 percent on complex flows. The MCP surface hands the agent structured page state to reason over, so the model spends its budget on the goal instead of on parsing raw output.

The **Playwright CLI** setup failed 12 to 20 percent of runs. Slack traced most of those failures to execution plumbing — authentication handling, navigation timing, session instability — rather than to the model's reasoning. The agent could pick the right action and still lose the run to a session that dropped underneath it.

**Agent-generated Playwright tests** held on simple flows at roughly 8 percent, then degraded to about 48 percent on complex ones. Ask an agent to emit a fixed script and you inherit the brittleness of a script plus the variance of the thing that wrote it. On a long workflow, one stale assumption baked into the generated code fails the run.

## What the resilience costs

The price tag reads $15 to $30 per agent run at over ten minutes each. Set that against a `constant` scripted suite that a runner clears in seconds, and the agent is three orders of magnitude more expensive per execution. That gap alone rules the agent out of the commit-gate loop where a suite runs on every push.

The runs also refuse to repeat themselves. Across executions the overall workflow stayed consistent — login, search, result, clear — but the exact sequence of actions changed run to run, even when the final outcome was correct. A scripted green tells you the same path passed again. An agent green tells you the goal was reachable this time, by some route. You cannot diff two agent runs the way you diff two scripted ones, so a flake investigation starts without the fixed trace you would reach for first.

## Where the agent earns its place

Slack keeps agentic testing as an addition on top of the existing suite, not a swap for it. Deterministic tests stay the primary mechanism for critical logic and contract correctness: they run fast, cost little, and reproduce the same path on every commit, which is what a merge gate needs. The agent goes into the end-to-end layer, aimed at the workflows most sensitive to UI and structural change — the ones where a scripted test spends its life failing on moved elements instead of real bugs. Slack also points the agents at exploring complex UI behaviour, debugging flaky workflows, and reproducing production issues, jobs a fixed script was never built to do.

The split follows the cost curve. Put a $20, ten-minute, nondeterministic runner on the check that runs a thousand times a day and you have bought yourself a slow, expensive gate that flakes. Put it on the brittle E2E flow that a selector change breaks every sprint, and you have traded a recurring maintenance tax for a run that adapts on its own. Match the tool to the churn: scripts where the path is stable and the feedback has to be cheap, agents where the path moves and a moved button should not read as a failure.
