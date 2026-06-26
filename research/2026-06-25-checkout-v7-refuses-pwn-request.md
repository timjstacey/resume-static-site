# Research: Checkout v7 refuses the pwn request by default

**Date range:** 2026-05-28 to 2026-06-25

## Summary

On 2026-06-18 GitHub shipped `actions/checkout` v7 and flipped a default that has
leaked repository secrets for years. The action now refuses, by default, to fetch
fork pull request code when a workflow runs on `pull_request_target` (or on
`workflow_run` when the underlying event is a `pull_request*` event). This is the
checkout half of the "pwn request" attack class.

Key facts (consistent across the changelog and multiple writeups):

- **What v7 refuses:** when the PR is from a fork and the checkout resolves to that
  fork PR — `repository` resolves to the fork PR's repo, OR `ref` matches
  `refs/pull/<number>/head` / `refs/pull/<number>/merge`, OR `ref` resolves to the
  fork PR's head or merge commit SHA — the action refuses to fetch the code. The
  job still runs; only the dangerous fetch stops.
- **Opt-out flag:** `allow-unsafe-pr-checkout` restores the old behaviour. Default
  flips from open to closed; reopening it is now an explicit line in the workflow.
- **persist-credentials change:** v7 stores the credential in a separate file under
  `$RUNNER_TEMP` instead of writing it into `.git/config` in the workspace, so a
  later step or checked-out code can't read the token out of `.git/config`.
- **Backport date:** 2026-07-16 — enforcement backported to all supported major
  versions. Workflows pinned to a floating major tag (`actions/checkout@v4`) pick
  it up automatically. Workflows pinned to a full SHA or exact minor/patch are NOT
  affected and must upgrade (Dependabot or by hand). The careful SHA-pinners are
  the ones the backport skips.
- **Limitations:** v7 guards its own checkout only. A `run` block that uses `git`
  or the `gh` CLI to pull a fork HEAD ref and then executes it walks past the
  default. Pwn requests via other triggers (e.g. `issue_comment`) are not blocked.

Background on the attack: a `pull_request_target` workflow runs in the base
branch context with the repo's secrets and a `GITHUB_TOKEN` that has write access.
The trigger exists so a workflow can label/comment on fork PRs safely. Teams then
add a checkout of the PR head to lint/test the contributor code, and the privileged
job runs attacker-authored scripts (`package.json` scripts, Makefile, etc.) with
the base repo's secrets and token. GitHub Security Lab tracks this class
(e.g. GHSL-2020-249) and it has caused multiple supply-chain incidents.

## Sources

- https://github.blog/changelog/2026-06-18-safer-pull_request_target-defaults-for-github-actions-checkout/
- https://securitylab.github.com/resources/github-actions-preventing-pwn-requests/
- https://docs.github.com/en/actions/reference/security/securely-using-pull_request_target
- https://thehackernews.com/2026/06/github-updates-actionscheckout-to-block.html
- https://github.com/actions/checkout
