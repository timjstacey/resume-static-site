# Research: Only k6 Thresholds Can Fail Your Load Test

**Date range:** 2026-06-25 to 2026-07-23

**Tier:** 3 (docs deep-dive). Playwright latest is 1.61.1 and k6 latest is 2.1.0 —
both already in the ledger, so no fresh Tier 1/2 release. Teardown of two k6 docs
concepts teams conflate: checks vs thresholds.

**Archetype:** Teardown (last three — Playbook, News / launch, Contrarian take — excluded).

## Summary

k6 has two pass/fail mechanisms and only one of them fails the test.

- **check()** evaluates a boolean condition per response and records the result in the
  built-in `checks` rate metric. A failed check does NOT stop the iteration and does NOT
  change the exit code. k6 prints each check with its pass rate (✓/✗) at the end. Checks
  are for visibility: which assertion broke, and how often.
- **Thresholds** are pass/fail criteria on a metric (`http_req_duration: ['p(95)<500']`,
  `http_req_failed: ['rate<0.01']`). If a threshold is breached, k6 finishes with a
  non-zero exit code (exit code 99). CI reads the exit code, so a threshold is the only
  thing that fails a pipeline stage.
- Consequence: a load test that uses only checks always exits 0, even with every check
  red. The learning-hub example: p(95)=683ms vs a `p(95)<500` threshold → exit 99, deploy
  blocked.
- **abortOnFail**: object-form threshold `{ threshold: 'rate<0.01', abortOnFail: true,
delayAbortEval: '10s' }` stops the run (non-graceful) as soon as the threshold is
  crossed; `delayAbortEval` delays the evaluation so a cold-start blip doesn't abort before
  enough data.
- **Bridge pattern**: put a threshold on the `checks` metric — `thresholds: { checks:
['rate>0.9'] }` — so the per-assertion visibility of checks becomes a gate that fails
  the run when the success rate drops below the bar.

Decision: checks give per-assertion visibility, thresholds give the CI gate. A serious
load test carries both — checks to see which assertion broke, thresholds (including one on
the checks metric) to set the exit code the pipeline reads.

## Sources

- https://grafana.com/docs/k6/latest/using-k6/checks/
- https://grafana.com/docs/k6/latest/using-k6/thresholds/
- https://grafana.com/docs/learning-hub/k6-performance-testing/03-establishing-a-baseline/19b-when-thresholds-fail/
