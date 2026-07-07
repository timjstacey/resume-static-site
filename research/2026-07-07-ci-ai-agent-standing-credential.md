# Research: Your CI's AI agent was running on a standing credential

**Date range:** 2026-06-09 to 2026-07-07

## Summary

On 2026-07-02 GitHub shipped a change to Copilot CLI: it can now run inside
GitHub Actions authenticated by the workflow's built-in `GITHUB_TOKEN`, with no
personal access token (PAT) required. GitHub's changelog frames the reason as
removing "the operational and security risks of managing long-lived PATs for
automations at scale."

The angle is a **failure mode**, not a launch recap. To run an agentic CLI in
Actions before this change, you minted a PAT and stored it as a repo or org
secret. That credential is the failure:

- **User-bound.** A classic PAT carries a person's whole account access. The CI
  bot acts as that user; revoking the PAT breaks whatever else the user wired to
  it.
- **Long-lived.** A PAT does not expire unless you set an expiry. Stored as a
  secret, it sits in the pipeline as a standing credential every job can read.
- **Over-scoped.** A PAT's scopes are coarse. Even a fine-grained PAT outlives
  the single job that uses it.

The fix GitHub documents: the `GITHUB_TOKEN` is an installation access token
GitHub mints at the start of each run, scoped to the one repository, with
permissions declared per workflow via the `permissions:` key, and it expires
when the job finishes (24h max). Copilot CLI now reads it.

Mechanics from the changelog:

- Workflow needs `copilot-requests: write` permission; authenticates with the
  built-in token; no extra secret.
- In an org-owned repo, AI credits consumed by the CLI are billed to the org.
  Requires the "Allow use of Copilot CLI billed to the organization" policy
  (on by default if the "Copilot CLI" policy is enabled).
- Needs a recent Copilot CLI (`copilot update` or `npm install -g @github/copilot`).

Boundary (what the run token does not fix): `GITHUB_TOKEN` still needs
least-privilege `permissions:`; the default grants can be broad. The token is
scoped to the current repo, so a genuine cross-repo automation still needs a
narrowly scoped credential (a GitHub App installation token, not a user PAT).
The agent still runs with whatever write permissions you grant it.

## Sources

- https://github.blog/changelog/2026-07-02-copilot-cli-no-longer-needs-a-personal-access-token-in-github-actions/
- https://docs.github.com/en/actions/security-guides/automatic-token-authentication
- https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens
- https://github.com/github/copilot-cli
- https://dev.to/leobaniak/copilot-cli-drops-the-pat-requirement-inside-github-actions-3hm7
