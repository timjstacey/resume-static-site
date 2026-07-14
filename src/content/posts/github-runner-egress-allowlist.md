---
title: Give Your GitHub-Hosted Runner an Egress Allowlist
date: 2026-07-14
tag: Practice
excerpt: 'A compromised action can read your CI secrets, but it still has to send them somewhere off the runner, and an egress allowlist closes that exit.'
readMins: 4
hashtags: [GitHubActions, CICD, DevSecOps, SupplyChainSecurity, DevOps]
preview:
  - ['$', 'cat github-runner-egress-allowlist.md']
  - ['#', '# Give your runner an egress allowlist']
  - [' ', '']
  - [' ', 'A GitHub-hosted runner can reach any']
  - [' ', 'address on the internet by default.']
  - [' ', '']
  - [' ', 'A poisoned dependency reads your secrets,']
  - [' ', 'then sends them to an address it picks.']
  - [' ', '']
  - [' ', 'Name the hosts the job needs. Drop']
  - [' ', 'the rest.']
linkedinPost: |
  A GitHub-hosted runner starts every job with open outbound network access. It can reach any address on the internet, and by default no rule narrows that. The gap opens when a step runs code you did not write: a transitive npm dependency, a third-party action pinned to a tag, a postinstall script. Give that code your CI secrets and one open path out, and it can read a token and send it to an address it picks.

  An egress allowlist closes the second half. The runner reaches the hosts the job needs and drops everything else.

  The path to one, on the runners you have today:

  1. Start in audit, not block. Harden-Runner from StepSecurity watches every outbound connection and maps it back to the step and job that opened it, without blocking anything. Run your pipeline and read the report.

  2. Stop pinning traffic to IP ranges. GitHub's recommended IP-address list for hosted-runner private networking closes on or after July 1, 2026. Hard-coded ranges break when Azure rotates them. Allowlist by domain from the meta endpoint instead, which GitHub keeps current.

  3. Turn the audit log into an allowlist. List the hosts the report showed, switch the policy to block, and every connection to an address you never named fails and leaves a trace.

  This closes the exit. Pinning an action to a SHA and scoping the run token guard the entrance and the credential. The allowlist guards the way out: a poisoned script can still read a secret, but its request to an attacker's domain never connects.

  GitHub is folding the same control into the runner with a native egress firewall on its 2026 Actions security roadmap.

  Read the full write-up: https://tim.sillysamoyed.com/blog/github-runner-egress-allowlist

  #GitHubActions #CICD #DevSecOps #SupplyChainSecurity #DevOps
---

```yaml title=".github/workflows/ci.yml"
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: step-security/harden-runner@f808768d1510423e83855289c910610ca9b43176 # v2.17.0
        with:
          egress-policy: audit # log every outbound connection, block nothing yet
      - uses: actions/checkout@v4
      - run: npm ci && npm test
```

A GitHub-hosted runner starts every job with open outbound access. It can reach any address on the internet, and by default no rule narrows that. The gap opens when a step runs code you did not write: a transitive npm dependency, a third-party action pinned to a tag, a postinstall script. Hand that code your CI secrets and one open path out, and it can read a token from the environment and send it to an address it picks. An egress allowlist closes the second half. The runner reaches the hosts the job needs and drops everything else. [Harden-Runner](https://github.com/step-security/harden-runner) from StepSecurity does this on today's runners, and GitHub is building the same control into the platform. The steps below get you from open access to a named allowlist.

## See where the runner phones home

Start in audit, not block. The snippet above adds Harden-Runner with `egress-policy: audit`, which watches every outbound connection the job makes, builds a baseline, and maps each connection back to the step and job that opened it. Nothing gets blocked yet. Run your pipeline a few times and read the network report. You get the real list of hosts your build touches: `api.github.com`, `registry.npmjs.org`, `objects.githubusercontent.com`, your package registry, whatever an integration test calls. Guess that list up front and block on the guess, and you strand a legitimate step. Measure it first, then write the rule against data.

## Stop pinning traffic to IP ranges

If you already restrict runner egress, you might be doing it with an IP allowlist. That road is closing. GitHub's recommended IP-address list for hosted-runner private networking closes on or after July 1, 2026, and [Ken Muse's writeup](https://www.kenmuse.com/blog/restricting-ip-access-on-github-hosted-runners/) explains why the static approach broke before the deadline: hard-code those ranges in Terraform or an Azure VNET template and your traffic fails the day Azure rotates them, because nothing keeps your copy current. Allowlist by domain instead. [GitHub's private-networking docs](https://docs.github.com/en/organizations/managing-organization-settings/configuring-private-networking-for-github-hosted-runners-in-your-organization) point you at the meta endpoint, [`https://api.github.com/meta`](https://api.github.com/meta), where the `domains.actions_inbound.full_domains` section lists the exact domains Actions needs. GitHub updates that endpoint as the requirements change, so a domain rule tracks the platform without a manual edit.

## Turn the audit log into an allowlist

Write the rule from the report. Take the hosts the audit run surfaced, list them as the allowed set, and switch the policy from `audit` to `block`.

```yaml title=".github/workflows/ci.yml"
- uses: step-security/harden-runner@f808768d1510423e83855289c910610ca9b43176 # v2.17.0
  with:
    egress-policy: block
    allowed-endpoints: >
      api.github.com:443
      github.com:443
      registry.npmjs.org:443
      objects.githubusercontent.com:443
```

The firewall drops any connection the job opens that is not on the list and records it, so a request to an address you never named fails and leaves a trace. Keep the list to what the job needs. A build job and a deploy job reach different hosts, so give each its own allowlist rather than one broad rule they share.

## The exit is what this closes

> A stolen secret does nothing until it leaves the runner. The allowlist removes the exit.

The rest of the supply-chain conversation guards the entrance. Pinning an action to a full commit SHA and scoping the run token control what code executes and what credential it holds. A network allowlist guards the way out. A poisoned postinstall script can still read a token that sits in the environment while the job runs. With `block` on, its request to an attacker's domain never connects, and the secret stays on the runner. Harden-Runner builds its whole model around this leg: it watches network egress, file writes, and process activity to catch exfiltration as it happens, and ties each event back to the step that caused it.

## Where GitHub is taking this

Third-party agents cover today. GitHub is folding the control into the runner. The [2026 Actions security roadmap](https://github.blog/news-insights/product-news/whats-coming-to-our-github-actions-2026-security-roadmap/), published March 30, describes a native egress firewall for hosted runners that runs at Layer 7 outside the runner VM, so it holds even when an attacker gains root inside the job. The adoption path matches the one above: start in audit, watch real traffic, then enforce. Its policies cover allowed domains, IP ranges, HTTP methods, and TLS, and the firewall correlates every request to the run, job, step, and command that made it. GitHub closed an [earlier roadmap item](https://github.com/github/roadmap/issues/821) for a runner-group allowlist as not planned back in 2023, so the native firewall is the answer it committed to this time. Until it reaches general availability, Harden-Runner gives you the audit-then-block path on the runners you already run.

Add Harden-Runner in `audit` mode to one workflow today and run it a few times. Read the network report, keep the hosts the job needs, and flip that job to `block`. You end with a runner that reaches the hosts you named and no others. A token that leaks from that runner has nowhere to go.
