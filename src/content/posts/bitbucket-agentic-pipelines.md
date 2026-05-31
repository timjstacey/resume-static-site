---
title: Bitbucket Agentic Pipelines automates the chores
date: 2026-05-17
tag: Tools
excerpt: 'Define an agent block in bitbucket-pipelines.yml, scope it, tie it to an event. It drafts the docs and the coverage gaps; you review.'
readMins: 6
hashtags: [Bitbucket, DevOps, CICD, TestAutomation, SoftwareDevelopment, Playwright]
preview:
  - ['$', 'cat bitbucket-agentic-pipelines.md']
  - ['#', '# Bitbucket Agentic Pipelines']
  - [' ', '']
  - [' ', '84% of developer time goes to tasks']
  - [' ', 'outside writing code, per IDC. Docs,']
  - [' ', 'flag cleanup, release notes, triage.']
  - [' ', '']
  - [' ', 'Atlassian put an agent block in the']
  - [' ', 'pipeline file to take the first draft...']
---

[IDC puts 84%](https://www.atlassian.com/blog/bitbucket/introducing-agentic-pipelines-ai-automation) of developer time on work outside writing code: keeping READMEs current, cleaning up feature flags, generating release notes, triaging security findings. Atlassian's answer is [Bitbucket Agentic Pipelines](https://community.atlassian.com/forums/Pipelines-articles/Introducing-Agentic-Pipelines-in-Bitbucket-open-beta/ba-p/3221308), now in open beta.

## An agent block in the pipeline file

You declare an agent next to your existing jobs in `bitbucket-pipelines.yml`, give it a prompt and scope constraints, then tie it to an event or schedule:

```yaml title="bitbucket-pipelines.yml"
pipelines:
  pull-requests:
    '**':
      - agent:
          name: docs-sync
          prompt: 'Update the README and CHANGELOG to match this diff.'
          scope: ['README.md', 'CHANGELOG.md']
          on: merged
```

On a merged PR, the agent reads the diff, updates the relevant docs, and opens a pull request back to your branch. It carries read-only access, and every change runs through your normal review. You merge, or you do not.

## Six chores ship today

The beta covers keeping READMEs in sync, fixing security vulnerabilities, cleaning up feature flags, generating release notes, summarizing large PRs, and finding test-coverage gaps. The last one matters for test teams: point the coverage-gap agent at your CI reports, and it raises a PR with extra tests against the low-coverage modules. A Playwright suite with thin coverage on a checkout module gets a drafted spec to review rather than a backlog ticket.

> Automate the chores that matter but never make the sprint. Engineers review everything; the agent owns the first draft.

## The setup cost

You need a paid Bitbucket Cloud plan and a Rovo Dev license, and the current agent runs Atlassian's Rovo Dev model. Claude Code CLI support sits on the roadmap. This is the same direction [GitHub took with agentic workflows](https://github.blog/changelog/2026-02-13-github-agentic-workflows-are-now-in-technical-preview/), and [the broader pattern](https://www.deployhq.com/blog/agentic-workflows-explained-ai-agents-cicd-pipelines) is consistent: scope the agent narrowly, gate it behind review, and let it clear the work that quietly drains a sprint.

The scope is deliberate. The agent does not decide what ships. It hands you a first draft of the work you keep postponing, and you decide what is worth merging.
