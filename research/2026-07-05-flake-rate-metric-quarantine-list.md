# Research: Let a flake-rate metric build your quarantine list

**Date range:** 2026-06-07 to 2026-07-05

## Summary

Red Hat published a walkthrough (2026-06-29) for a dynamic E2E test quarantine
system backed by a Prometheus-compatible time-series DB and Grafana, running on a
long-lived cluster. The mechanism:

- Test runs export per-test pass/fail counts as metrics into Prometheus.
- A flake-rate PromQL expression scores each test:
  `(1 - (sum by test of pass count / sum by test of total run count)) > 0.2`
  — a test is flaky when its failure ratio exceeds 0.2 (20%).
- Guard requires at least 10 runs over 30 days before a test qualifies, so a
  handful of runs cannot quarantine a test.
- A quarantine controller queries Prometheus via PromQL, identifies flaky tests,
  **excludes regressions** (a test that fails consistently is a real break, not a
  flake), and outputs a quarantine configuration.
- A Grafana alerting rule fires when a test crosses the threshold; dashboards show
  historical flake trends so teams tell intermittent flakiness from a true
  regression before a broken PR blocks main.

The fresh angle vs. the ledger: existing posts argue the _policy_ (quarantine with a
fix-or-delete deadline, retries-hide-real-bugs 2026-06-07) and _where health data
lives_ (test-health-ci-logs-vs-observability 2026-06-09). This post is the
_automation of the quarantine decision itself_ — generate the skip-list from a live
metric instead of hand-maintaining it. That is a Playbook, distinct from both.

Supporting facts:

- 15-25% of CI compute burns on flaky-test reruns (GitHub Actions cost analysis).
- Playwright supports runtime conditional skip (`test.skip(condition, reason)`),
  test tags, and `--grep-invert` to exclude a tag — the runner hooks a generated
  list needs.

## Sources

- https://developers.redhat.com/articles/2026/06/29/build-dynamic-e2e-test-quarantine-system-prometheus-grafana
- https://playwright.dev/docs/test-annotations
- https://prometheus.io/docs/practices/pushing/
- https://oneuptime.com/blog/post/2026-01-28-optimize-github-actions-costs/view
