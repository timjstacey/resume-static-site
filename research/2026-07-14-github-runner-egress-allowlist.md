# Research: Give Your GitHub-Hosted Runner an Egress Allowlist

**Date range:** 2026-06-16 to 2026-07-14

## Summary

Priority ladder outcome:

- Tier 1 (Playwright release): latest is 1.61.1 / 1.61.0 — already in the ledger
  (2026-06-30 passkey post). No new release. 1.62.0-alpha exists (Snyk,
  2026-07-06) but is a pre-release, not postable.
- Tier 2 (k6 release): latest is v2.1.0 — already in the ledger (2026-07-02
  feature-flags post). No new release.
- Tier 3 (last-week web search): topic selected — controlling outbound network
  egress from GitHub-hosted runners. Anchored on a live, dated migration event
  (the recommended runner IP-address list closing on/after 2026-07-01) plus the
  native egress firewall on GitHub's 2026 Actions security roadmap.

Archetype: Playbook (last three in ledger = Failure mode, Teardown, Contrarian
take — all excluded this run). Tag: Practice (hands-on how-to).

Ledger-freshness check: the existing GitHub Actions security posts cover the
_entry_ side of supply-chain risk — checkout v7 refusing pwn requests
(2026-06-25) and the Copilot CLI dropping a standing PAT credential
(2026-07-07). This post covers the _exit_ side: stopping a compromised action or
dependency from exfiltrating secrets over the network. Distinct mechanism, no
overlap.

Key facts (each traced to a source below):

- The recommended IP-address list/template for GitHub-hosted runner private
  networking is closing on or after 2026-07-01. Hard-coded IP allowlists
  (Terraform, Azure VNET) break when the underlying Azure ranges rotate.
  Recommended replacement: domain allowlisting from the GitHub meta endpoint
  (`https://api.github.com/meta`, `domains.actions_inbound.full_domains`), which
  GitHub keeps current. (Ken Muse; GitHub Docs)
- Harden-Runner (StepSecurity) does egress control today: `egress-policy: audit`
  observes and baselines all outbound connections without blocking (free), and
  block/enforce mode restricts traffic to an `allowed-endpoints` domain
  allowlist. Each network event maps to the exact step, job, and workflow.
  Addresses secret exfiltration and compromised-dependency network behaviour.
  (step-security/harden-runner)
- GitHub's 2026 Actions security roadmap (published 2026-03-30) introduces a
  native egress firewall for hosted runners: operates at Layer 7 outside the
  runner VM, so it holds even if an attacker gains root inside the runner;
  audit-then-enforce adoption path; policies cover allowed domains, IP ranges,
  HTTP methods, and TLS; every request is correlated to the run, job, step, and
  initiating command. Also on the roadmap: workflow dependency locking and
  scoped secrets. (GitHub 2026 Actions security roadmap; corroborated by webhani
  and dev.to guides)
- An earlier roadmap item (github/roadmap issue #821, opened 2023-09-06) for a
  runner-group IP/domain allowlist was closed as not planned. The native
  firewall is the current answer.

## Sources

- https://www.kenmuse.com/blog/restricting-ip-access-on-github-hosted-runners/
- https://docs.github.com/en/organizations/managing-organization-settings/configuring-private-networking-for-github-hosted-runners-in-your-organization
- https://api.github.com/meta
- https://github.com/step-security/harden-runner
- https://github.blog/news-insights/product-news/whats-coming-to-our-github-actions-2026-security-roadmap/
- https://github.com/github/roadmap/issues/821
