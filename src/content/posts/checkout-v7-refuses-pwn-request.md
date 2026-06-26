---
title: Checkout v7 refuses the pwn request by default
date: 2026-06-25
tag: Tools
excerpt: 'actions/checkout v7 refuses to fetch fork pull request code under pull_request_target, closing the most copied half of the pwn request attack.'
readMins: 4
hashtags: [GitHubActions, CICD, DevSecOps, SupplyChainSecurity, DevOps]
preview:
  - ['$', 'cat checkout-v7-refuses-pwn-request.md']
  - ['#', '# Checkout v7 refuses the pwn request']
  - [' ', '']
  - [' ', 'A privileged trigger, a checkout of the']
  - [' ', "fork's code, then a build step that runs"]
  - [' ', 'it. That pattern leaked secrets for years.']
  - [' ', '']
  - [' ', 'On June 18 actions/checkout v7 started']
  - [' ', 'refusing the fork checkout by default.']
linkedinPost: |
  GitHub flipped a default on June 18 that quietly closes the most copied supply-chain footgun in CI.

  actions/checkout v7 now refuses, by default, to fetch fork pull request code when a workflow runs on pull_request_target. That trigger runs in your base branch with your secrets and a GITHUB_TOKEN that can write. Teams add a checkout of the PR head to lint a contributor's code, and the privileged job runs scripts an attacker put in a fork's package.json. GitHub Security Lab has tracked this class for years.

  Three things to know:

  1. The job still runs. Only the fork-code fetch stops. One flag, allow-unsafe-pr-checkout, reopens it, and now you have to write and defend that line in review.

  2. The backport lands July 16. Workflows pinned to a floating tag like actions/checkout@v4 pick it up automatically. Workflows pinned to a full SHA do not, so the teams who hardened by pinning are the ones the backport skips. Audit those by hand.

  3. v7 guards its own checkout, not the class. A run block that pulls a fork branch with git or the gh CLI and runs it walks right past the default, and triggers like issue_comment stay open.

  Treat it as one fewer footgun. Keep the privileged job and the contributor's code in separate workflows, hold secrets out of any job that touches fork code, and scope the token down.

  Read the full write-up: https://tim.sillysamoyed.com/blog/checkout-v7-refuses-pwn-request

  #GitHubActions #CICD #DevSecOps #SupplyChainSecurity #DevOps
---

```yaml title=".github/workflows/ci.yml"
# The pattern attackers look for: privileged trigger, fork code, then run it.
on: pull_request_target
jobs:
  build:
    steps:
      - uses: actions/checkout@v4
        with:
          ref: ${{ github.event.pull_request.head.sha }}
      - run: npm install && npm test # runs the fork's package.json scripts
```

On June 18, 2026, GitHub shipped `actions/checkout` v7 and changed what the action does by default under one trigger that has leaked repository secrets for years. The action refuses to fetch fork pull request code when a workflow runs on `pull_request_target` or on `workflow_run`. [GitHub's changelog](https://github.blog/changelog/2026-06-18-safer-pull_request_target-defaults-for-github-actions-checkout/) files the move under safer `pull_request_target` defaults. It closes the most copied half of the attack the field calls the pwn request.

## What pull_request_target hands an attacker

A workflow that triggers on `pull_request_target` runs in the context of your base branch, with your secrets and a `GITHUB_TOKEN` that holds write access. The trigger exists for a reason: it lets a workflow label or comment on a pull request from a fork without exposing those secrets to the fork. [GitHub Security Lab spelled out the danger](https://securitylab.github.com/resources/github-actions-preventing-pwn-requests/) once teams push the trigger past that job. A maintainer adds a checkout of the pull request head so the workflow can lint or test the contributor's code, and the privileged job runs code an attacker wrote.

Open a pull request from a fork whose `package.json` scripts or Makefile carry a malicious command, and that command runs with the base repository's token and secrets. [GitHub's own guidance on securely using `pull_request_target`](https://docs.github.com/en/actions/reference/security/securely-using-pull_request_target) traces the class back through a string of supply-chain incidents and assigns it tracking IDs like GHSL-2020-249. The combination of the privileged trigger and the fork checkout is the whole attack.

## What v7 refuses, and the flag that overrides it

v7 blocks the checkout step at the center of that pattern. When a workflow runs on `pull_request_target`, or on `workflow_run` firing off a `pull_request` event, the action refuses to check out anything that resolves to a fork pull request: a `ref` matching `refs/pull/<number>/head` or `refs/pull/<number>/merge`, or a head or merge commit SHA that belongs to a fork PR. [The Hacker News writeup](https://thehackernews.com/2026/06/github-updates-actionscheckout-to-block.html) lists the conditions. The job still starts and the rest of the steps run. The dangerous fetch stops.

One flag overrides it. Setting `allow-unsafe-pr-checkout` restores the old behavior, so a team that has isolated its secrets and audited the workflow keeps an explicit escape hatch. The default moves from open to closed. Reopening it now costs a line you write into the workflow and defend in review, instead of a fetch that happened on its own.

## The backport reaches pinned workflows on July 16

v7 protects the workflows that upgrade to it, and not the rest. GitHub set July 16, 2026 to backport the refusal to every supported major version. A workflow pinned to a floating tag like `actions/checkout@v4` picks up the new default on that date with no edit from you. A workflow pinned to a full commit SHA or an exact minor version stays on its old behavior until someone bumps it, through Dependabot or by hand.

Pinning to a SHA is the supply-chain hardening most security guides push, so the teams who pinned most carefully are the ones the backport skips. Walk your workflows, find the ones that pin a SHA and run on `pull_request_target`, and upgrade those yourself rather than waiting for a date that will pass them by.

## Credentials move out of .git/config

v7 ships a second change worth the upgrade. Earlier versions stored the token from `persist-credentials` inside `.git/config` in the workspace, where a later step or a piece of checked-out code could read it. v7 writes that credential to a separate file under `$RUNNER_TEMP`. A build script can no longer print `.git/config` to lift the token out of a job that kept credentials around for a later push. The [actions/checkout repository](https://github.com/actions/checkout) carries the v7 notes for both changes.

## The pattern v7 does not catch

> v7 closes the copy-paste pwn request. It does not close the class.

The action guards its own checkout. It cannot guard a `run` block that pulls untrusted code by hand. A step that calls `git fetch` on the pull request head, or uses the `gh` CLI to download a fork's branch, and then runs it, walks straight past the new default. Triggers other than `pull_request_target` carry the same risk and stay open. A workflow that fires on `issue_comment` and acts on the comment author's code is a pwn request v7 never inspects.

Treat the upgrade as one fewer footgun, and keep building the architecture that holds when the footgun comes back under a different name. Split the privileged job and the contributor's code into separate workflows. Hold secrets out of any job that touches fork code. Scope `GITHUB_TOKEN` down to the permissions the job needs. v7 turns the unsafe path into an opt-in. The safe shape of the pipeline is still yours to draw.
