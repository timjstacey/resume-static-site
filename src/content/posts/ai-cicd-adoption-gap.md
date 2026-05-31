---
title: 90% use AI in the IDE; the pipeline is another story
date: 2026-05-19
tag: Strategy
excerpt: 'JetBrains data: daily AI in the editor, almost none in CI/CD. The trust gap closes when AI reduces noise instead of adding it.'
readMins: 6
hashtags: [CICD, DevOps, TestAutomation, SoftwareDevelopment, AITesting]
preview:
  - ['$', 'cat ai-cicd-adoption-gap.md']
  - ['#', '# AI in the IDE, not the pipeline']
  - [' ', '']
  - [' ', '90% of developers use AI daily. 73% of']
  - [' ', 'their orgs run zero AI inside CI/CD.']
  - [' ', '']
  - [' ', 'An IDE suggestion is free to reject. A']
  - [' ', 'pipeline result decides what ships. The']
  - [' ', 'bar for trust is higher there...']
---

90% of developers use AI tools at work every day. 73% of their organizations run zero AI inside CI/CD pipelines. [JetBrains published the gap in April](https://blog.jetbrains.com/teamcity/2026/04/ai-in-devops/), drawing on three surveys; the AI Pulse round put the pipeline abstention rate higher still, at 78.2%.

## Why the pipeline holds out

An IDE suggestion costs nothing to reject. A pipeline result decides what ships, so teams need reproducible, auditable signals before they let AI near it. The reasons track that: [60% of organizations](https://www.helpnetsecurity.com/2026/04/24/ai-in-ci-cd-engineering-teams/) holding back cite unclear use cases, 36% cite lack of trust in AI output, and 33% cite data privacy. None of those soften with a better autocomplete.

## Failure diagnosis goes first

When AI does enter CI/CD, teams reach for failure diagnosis. [TeamCity 2026.1](https://blog.jetbrains.com/teamcity/2025/10/the-state-of-cicd/), released this month, added MCP server support so an agent parses a failing build and surfaces probable root causes without leaving the terminal:

```jsonc title=".mcp.json"
{
  "servers": {
    "teamcity": { "url": "https://ci.example.com/mcp" },
  },
}
```

Point your editor's agent at that server, and a red build comes back with a ranked set of likely causes instead of a 4,000-line log.

## CloudBees takes the other lever: run less

[CloudBees Smart Tests](https://www.cloudbees.com/blog/ai-is-writing-more-code-your-ci-pipeline-cant-keep-up) skips irrelevant tests rather than diagnosing failures. Their production benchmarks put roughly a third of CI failures as flaky, triggered by infrastructure noise rather than code changes. AI-driven selection reads the diff and runs only the tests tied to that change, which cuts both runtime and false alarms.

> Reducing noise is how AI earns pipeline trust. A tool that makes the build quieter gets adopted; one that adds another unexplained verdict does not.

## The next gap to close

Every commit you push today already runs AI-generated code through your pipeline. The open question is whether AI helps decide which tests to run and why a build failed. Start where the risk is low and the payback is legible: failure diagnosis and test selection both reduce noise, and [independent roundups](https://northflank.com/blog/top-ai-tools-cicd-pipeline-automation) show that is where the early adopters landed. Earn trust with quieter builds, then widen the remit.
