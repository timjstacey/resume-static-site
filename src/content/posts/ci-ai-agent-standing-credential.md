---
title: Your CI's AI agent was running on a standing credential
date: 2026-07-07
tag: Tools
excerpt: 'Running Copilot CLI in GitHub Actions used to need a stored personal access token; the CLI now reads the run built-in GITHUB_TOKEN, a credential that expires with the job.'
readMins: 4
hashtags: [GitHubActions, DevSecOps, CICD, Copilot, DevOps]
preview:
  - ['$', 'cat ci-ai-agent-standing-credential.md']
  - ['#', '# The agent ran on a standing credential']
  - [' ', '']
  - [' ', 'To run Copilot CLI in Actions you stored']
  - [' ', 'a personal access token as a secret.']
  - [' ', 'User-bound, long-lived, over-scoped.']
  - [' ', '']
  - [' ', 'On July 2 the CLI started reading the']
  - [' ', "run's built-in GITHUB_TOKEN instead."]
linkedinPost: |
  On July 2, GitHub changed how Copilot CLI authenticates inside Actions. It now reads the workflow's built-in GITHUB_TOKEN, so the CLI runs with no personal access token. GitHub files the change under removing the risk of managing long-lived PATs for automations at scale.

  The PAT that step used to carry was the real problem. Drop a classic PAT into secrets.COPILOT_PAT and the CI job acts as you, with your whole account access. It does not expire unless you set an expiry, so it sits in the repo as a standing credential every job can read. The blast radius grows with the agent: a linter reads code, but an agent that triages issues and opens pull requests writes, and a prompt-injection payload in an issue body has a real credential to spend.

  GitHub already issues a credential scoped to the job. The GITHUB_TOKEN is minted at the start of each run, scoped to the one repo, permissioned by the permissions block you declare, and it expires when the job ends. Add copilot-requests: write to the job and the CLI reads it. No secret to store or rotate.

  The run token shrinks the credential. It does not shrink the agent. Scope the permissions block to the job's real need and treat the prompt as untrusted input, the same way you treat fork code.

  A credential in CI should belong to the job, carry only the permissions the job needs, and expire when the job ends. Audit your workflows for the secrets.SOMETHING_PAT still standing there.

  Read the full write-up: https://tim.sillysamoyed.com/blog/ci-ai-agent-standing-credential

  #GitHubActions #DevSecOps #CICD #Copilot #DevOps
---

```yaml title=".github/workflows/triage.yml"
# The old shape: an AI agent in CI, authenticated by a stored PAT.
jobs:
  triage:
    steps:
      - uses: actions/checkout@v7
      - run: copilot -p "triage this issue and open a PR"
        env:
          GITHUB_TOKEN: ${{ secrets.COPILOT_PAT }} # a standing credential
```

On July 2, 2026, GitHub changed how Copilot CLI authenticates inside Actions. [The changelog](https://github.blog/changelog/2026-07-02-copilot-cli-no-longer-needs-a-personal-access-token-in-github-actions/) says the CLI now reads the workflow's built-in `GITHUB_TOKEN`, so it runs with no personal access token. GitHub files the move under removing "the operational and security risks of managing long-lived PATs for automations at scale." The PAT that step used to carry is the failure worth looking at.

## The stored PAT is a standing credential

A classic PAT carries one user's account access. Drop it into `secrets.COPILOT_PAT` and the CI job acts as that user. [GitHub's own docs on PATs](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens) note a token does not expire unless you set an expiry, so it sits in the repository as a credential every job on the branch can read. Rotate it and every automation wired to the same token breaks at once. A fine-grained PAT narrows the scopes, and it is still a person's credential living past the one job that spends it.

The blast radius grows with the agent. A linter reads code. An agent that triages issues and opens pull requests writes. Hand that agent a broad, long-lived token and a prompt-injection payload in an issue body has a real credential to spend. GitHub names the class in the changelog: managing long-lived PATs for automations at scale is the cost the new default removes.

## The token GitHub mints for the run

GitHub already issues a credential scoped to the job. At the start of every workflow run it mints an installation access token and exposes it as `GITHUB_TOKEN`. [The automatic token authentication docs](https://docs.github.com/en/actions/security-guides/automatic-token-authentication) spell out its bounds: the token is scoped to the one repository the workflow runs in, its permissions come from the `permissions:` key you declare in the workflow, and it expires when the job finishes or after 24 hours, whichever comes first.

Set against a stored PAT, the run token inverts the three properties that made the PAT a liability. It belongs to the run instead of a person, it dies when the job ends, and it carries only the scope you wrote in `permissions:`. A leaked `GITHUB_TOKEN` is worthless the moment the job stops.

## Wiring Copilot CLI to the run token

Add `copilot-requests: write` to the job's permissions and Copilot CLI authenticates with the built-in token. [The changelog](https://github.blog/changelog/2026-07-02-copilot-cli-no-longer-needs-a-personal-access-token-in-github-actions/) confirms no PAT and no extra secret to store or rotate.

```yaml title=".github/workflows/triage.yml"
jobs:
  triage:
    permissions:
      contents: read
      issues: write
      pull-requests: write
      copilot-requests: write # lets the CLI spend AI credits on the run token
    steps:
      - uses: actions/checkout@v7
      - run: copilot -p "triage this issue and open a PR"
        # no env: GITHUB_TOKEN, the CLI reads the run's own token
```

Two setup facts come with it. Run `copilot update` or `npm install -g @github/copilot` first, since the token path needs a recent CLI. And in an org-owned repository the AI credits the CLI spends bill to the organization. GitHub gates that behind the "Allow use of Copilot CLI billed to the organization" policy, which is on by default when the "Copilot CLI" policy is enabled.

## What the run token does not fix

> The run token shrinks the credential. It does not shrink the agent.

Give the token `issues: write` and `pull-requests: write` and the agent can still open a pull request you never asked for, off a poisoned issue. Scope the `permissions:` block to the job's real need and treat the prompt as untrusted input, the same way you treat fork code. The ephemeral token caps the damage at one run. It does not decide what the run may do.

The run token is also repo-scoped. An automation that reaches into a second repository cannot ride `GITHUB_TOKEN` there. That job needs a credential scoped to both repos, and a GitHub App installation token fits it better than a user PAT: it belongs to an app, carries its own permissions, and expires on its own. Reach for a PAT last, not first.

The rule that survives this release is older than the release. A credential in CI should belong to the job, carry only the permissions the job needs, and expire when the job ends. Copilot CLI reading `GITHUB_TOKEN` makes that the default for one common case. Audit the rest of your workflows for the `secrets.SOMETHING_PAT` still standing there, and swap each one for a token that dies with its run.
