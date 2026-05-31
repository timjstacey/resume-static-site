---
title: k6 Script Authoring calibrates load tests to live traffic
date: 2026-05-26
tag: Tools
excerpt: 'Grafana Assistant reads your telemetry, finds endpoints by real RPS and p95, and generates a k6 script that inherits that profile.'
readMins: 6
hashtags: [PerformanceTesting, k6, Grafana, TestAutomation, DevOps]
preview:
  - ['$', 'cat k6-script-authoring-live-telemetry.md']
  - ['#', '# k6 Script Authoring']
  - [' ', '']
  - [' ', 'The HTTP calls take ten minutes. The load']
  - [' ', 'profile is what stops teams: thresholds,']
  - [' ', 'VU ramp, latency that matches reality.']
  - [' ', '']
  - [' ', 'k6 Script Authoring reads your telemetry']
  - [' ', 'and calibrates the script to production...']
---

Performance scripts do not stall on the HTTP calls. Writing those takes ten minutes. The load profile stops teams: what counts as a passing threshold, how many virtual users to ramp to, and whether your latency numbers reflect real traffic.

## It reads your telemetry first

[Grafana shipped k6 Script Authoring on April 15](https://grafana.com/whats-new/2026-04-15-create-k6-tests-with-grafana-assistant-and-k6-script-authoring-mode), a mode inside Grafana Assistant in Grafana Cloud. You name a service, and Assistant queries your telemetry to find endpoints by category, each with real RPS and p95 latency from your Grafana stack. The script it generates inherits that observed profile, so the thresholds match what your service already handles in production.

## Structured output, wired to your dashboards

The result is structured JavaScript: checks, thresholds, URL grouping to control metric cardinality, and Tempo and Pyroscope hooks so load-test results land in the same dashboards where you watch production.

```js title="service-load.js"
import http from 'k6/http';
import { check, group } from 'k6';

export const options = {
  // thresholds derived from observed p95, not guessed
  thresholds: { 'http_req_duration{group:::checkout}': ['p(95)<420'] },
};

export default function () {
  group('checkout', () => {
    const res = http.get('https://example.com/api/cart');
    check(res, { 'cart 200': (r) => r.status === 200 });
  });
}
```

You can also start from an OpenAPI spec, a plain-language prompt, or an existing Postman or curl script, and [Script Authoring converts them](https://grafana.com/blog/generate-test-scripts-from-natural-language-with-grafana-assistant-introducing-k6-script-authoring) to k6 format.

## Two paths, one toolchain

The [k6 2.0 release](https://grafana.com/events/grafanacon/agenda/ai-assisted-testing-k6-v2) in May added a CLI `agent` command and the `mcp-k6` server for converting Playwright browser tests into load tests. Script Authoring takes the other path: it runs inside Grafana Cloud, reads your live observability data, and calibrates to production traffic. One starts from your existing tests; the other starts from your real numbers. The [authoring docs](https://grafana.com/docs/grafana-cloud/testing/k6/author-run/k6-script-authoring-mode) cover when each fits.

> Teams that skip load testing cite the same friction: the setup cost for a realistic script exceeds the test run itself.

## The friction it removes

That setup cost is the whole reason load testing slips off the plan. When the script arrives already shaped by your traffic, with thresholds tied to your p95 and results flowing into your existing dashboards, the realistic version stops being the expensive version. Name a service, read the generated script, run it.
