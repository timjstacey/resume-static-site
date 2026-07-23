---
title: Only k6 Thresholds Can Fail Your Load Test
date: 2026-07-23
tag: Tools
excerpt: 'A k6 run where every check fails still exits 0; only a threshold sets the non-zero exit code your CI pipeline gates on.'
readMins: 5
hashtags: [k6, PerformanceTesting, LoadTesting, CICD, Grafana]
preview:
  - ['$', 'cat k6-checks-vs-thresholds.md']
  - ['#', '# k6 checks vs thresholds']
  - [' ', '']
  - [' ', 'Twenty VUs hammer a 503 endpoint for']
  - [' ', '30 seconds. Every check comes back red.']
  - [' ', '']
  - [' ', 'k6 prints the failures and exits 0. The']
  - [' ', 'CI stage goes green. Only a threshold']
  - [' ', 'sets the exit code a pipeline reads.']
linkedinPost: |
  A k6 load test can report every check as failed and still exit 0. The CI stage goes green.

  k6 has two pass/fail mechanisms and they do different jobs. check() evaluates a condition per response (status is 200, p95 under 500ms) and records the result in the built-in checks rate metric. k6 prints each check with its pass rate at the end. A failed check does not stop the iteration and does not change the exit code. Checks are for visibility: which assertion broke, and how often.

  Thresholds are the gate. You set pass/fail criteria on a metric, like http_req_duration p(95) under 500 or http_req_failed rate under 0.01. Breach one and k6 finishes with a non-zero exit code (99). CI reads the exit code, so a threshold is the only thing that fails the pipeline stage. The k6 learning hub documents the case: p(95) at 683ms against a 500ms threshold exits 99 and blocks the deploy.

  The bridge between them is a threshold on the checks metric itself. Write thresholds: { checks: ['rate>0.9'] } and the per-assertion visibility of checks becomes a gate that fails the run when the success rate drops below 90 percent.

  Checks let you see which assertion broke. Thresholds set the exit code that fails the build. A load test that runs in CI needs both.

  Link in the first comment.

  #k6 #PerformanceTesting #LoadTesting #CICD #Grafana
---

```js title="checks-only.js"
// Every check fails. k6 still exits 0.
import http from 'k6/http';
import { check } from 'k6';

export const options = { vus: 20, duration: '30s' };

export default function () {
  const res = http.get('https://api.example.com/orders');
  check(res, {
    'status is 200': (r) => r.status === 200, // gets 503
    'p95 under 500ms': (r) => r.timings.duration < 500, // gets 900ms
  });
}
```

Twenty virtual users hammer an endpoint returning 503s for thirty seconds. Both checks fail on every iteration. k6 prints two red rows, the CI stage exits 0, and the pipeline moves the build to the next step. The test caught the outage and told no one who could stop the deploy. k6 gives you two ways to declare a load test passed or failed, and only one of them touches the exit code your pipeline reads.

## Checks record, they do not gate

[`check()`](https://grafana.com/docs/k6/latest/using-k6/checks/) takes a value and a set of named boolean conditions. It evaluates each one, records the result in the built-in `checks` rate metric, and returns. A false condition does not throw, does not stop the iteration, and does not change the exit status. k6 keeps running and tallies the pass rate as the test goes.

That design gives you per-assertion visibility. At the end of the run k6 prints each named check with a ✓ or ✗ and its success rate, so you see that `status is 200` held at 98% while `p95 under 500ms` collapsed to 40%. The k6 docs state the limit in the same breath: checks alone cannot fail the test. You get a detailed report of what broke and a green pipeline underneath it.

Use checks the way you would use assertions in a functional test, to confirm the system answered with the content you expected. Just know that the report they produce is for your eyes, not for the CI runner.

## Thresholds set the exit code

A [threshold](https://grafana.com/docs/k6/latest/using-k6/thresholds/) attaches a pass/fail expression to a metric. Cross it and k6 finishes the run with a non-zero exit code.

```js title="thresholds.js"
export const options = {
  vus: 30,
  duration: '2m',
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95th percentile under 500ms
    http_req_failed: ['rate<0.01'], // error rate under 1%
  },
};
```

CI cares about one signal from a k6 process: the exit code. A zero moves the build forward and anything else stops it. Thresholds are what produce that non-zero code. The k6 learning hub walks through a run where the [95th percentile lands at 683ms against a `p(95)<500` bar](https://grafana.com/docs/learning-hub/k6-performance-testing/03-establishing-a-baseline/19b-when-thresholds-fail/): k6 exits 99 and the deploy stops. Swap the failing metric for a passing one and the same run exits 0.

Thresholds read from any metric k6 collects, including your own `Trend` and `Rate` metrics, so a service-level objective you can express as a number becomes a gate. p95 latency, error rate, requests per second, bytes received: name the metric, write the bound, and the pipeline enforces it.

> A k6 run with only checks always exits 0. The pipeline reads the exit code, not the check output. Put your pass/fail criteria in a threshold or the CI runner never learns the test failed.

## abortOnFail stops a doomed run early

By default a breached threshold marks the run failed but lets it play out to the end. When you want k6 to quit the moment a bound is crossed, use the object form and set `abortOnFail`.

```js title="abort.js"
export const options = {
  thresholds: {
    http_req_failed: [{ threshold: 'rate<0.01', abortOnFail: true, delayAbortEval: '10s' }],
  },
};
```

`abortOnFail` stops the test without a graceful ramp-down as soon as the error rate crosses 1%, so a run that is already going to fail does not burn the full duration or keep pounding a service that is falling over. `delayAbortEval` holds that evaluation for the first ten seconds, which keeps a cold-start blip or a warm-up spike from aborting the run before enough traffic has flowed to judge it.

## Put a threshold on the checks metric

The two mechanisms meet at one line. `checks` is a metric like any other, so you can gate on it.

```js title="checks-as-gate.js"
export const options = {
  vus: 50,
  duration: '30s',
  thresholds: {
    checks: ['rate>0.9'], // fail the run if <90% of checks pass
  },
};
```

This keeps the per-assertion detail of `check()` and adds the exit code CI needs. Every named check still prints its own pass rate, so you keep the diagnosis of which condition broke. The threshold on the aggregate `checks` rate turns that diagnosis into a gate: drop below 90% and k6 exits non-zero. The [k6 docs recommend this exact pairing](https://grafana.com/docs/k6/latest/using-k6/checks/) to make failing checks fail the test.

## Which one for which job

Checks answer "what did the responses look like" and thresholds answer "does this run pass". A load test that runs in CI needs both. Write checks for the assertions you want to read in the summary, so a failure points at the exact condition that broke. Write thresholds for the numbers that decide the build, including one on the `checks` metric so a wave of failed assertions cannot slip past as a green stage. The check tells you the story. The threshold sets the exit code, and the exit code is all your pipeline ever reads.
