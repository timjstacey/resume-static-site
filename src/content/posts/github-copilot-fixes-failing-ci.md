---
title: One click to fix a failing GitHub Actions run
date: 2026-05-21
tag: Tools
excerpt: 'Fix with Copilot puts a cloud agent on the failure: it investigates, pushes a fix, reruns CI, and tags you for review.'
readMins: 5
hashtags: [GitHubActions, CICD, TestAutomation, DevOps, SoftwareDevelopment, Playwright]
preview:
  - ['$', 'cat github-copilot-fixes-failing-ci.md']
  - ['#', '# One-click fixes for failing Actions']
  - [' ', '']
  - [' ', 'A job fails. You click Fix with Copilot.']
  - [' ', 'The cloud agent investigates, pushes a']
  - [' ', 'fix, reruns CI, tags you for review.']
  - [' ', '']
  - [' ', 'The threshold shift matters more than the']
  - [' ', 'button: a CI fix now costs one click...']
---

You open a failing GitHub Actions run and click **Fix with Copilot**. The cloud agent investigates the failure in its own environment, pushes a fix to your branch, reruns your CI to confirm it, and tags you for review. [GitHub shipped this on May 18th](https://github.blog/changelog/2026-05-18-one-click-fixes-for-failing-actions-with-copilot-cloud-agent) for Copilot Business and Enterprise.

## Where the button lives

It appears on the workflow-run logs page, on the failure itself. The agent handles what GitHub calls "simple but time-consuming work": fixing tests, correcting linter failures. It reruns the pipeline before it tags you, so the fix arrives already validated rather than as a hopeful diff.

[Since March](https://github.blog/changelog/2026-03-24-ask-copilot-to-make-changes-to-any-pull-request) you could trigger the same loop from a PR comment:

```text
@copilot Fix the failing tests
```

May's change moves the entry point onto the failure, so you act where you already are instead of opening a PR to ask.

## Why Playwright teams feel this

A locator breaks in CI. Someone clones the branch, reproduces it locally, pushes a one-line fix, waits for the rerun. That sequence is a bounded failure with a clear scope, which is what the agent handles well. The round-trip also got shorter: [cloud agent startup dropped 50% in March](https://github.blog/changelog/2026-04-27-copilot-cloud-agent-starts-20-faster-with-actions-custom-images) and another 20% in April.

> The threshold shift matters more than the feature. When a CI fix costs one click instead of thirty minutes, you stop filing brittle tests under "normal maintenance."

## Turn it on, keep the gate

An administrator enables the cloud agent before the button shows up on workflow logs, and the [setup docs](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/cloud-agent/start-copilot-sessions) cover the steps. The agent pushes to your branch and tags you; your review still decides what merges. Treat it as a fast first responder for bounded failures, and keep your judgment on the ones that are not.
