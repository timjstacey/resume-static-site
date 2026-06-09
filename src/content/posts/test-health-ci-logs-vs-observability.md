---
title: 'Where Test Health Belongs: CI Logs or an Observability Backend'
date: 2026-06-09
tag: Strategy
excerpt: 'Your suite emits pass rate and flake count every run, then buries them in a CI log nobody scrolls; export them over OTLP and a dashboard catches the rot.'
readMins: 5
hashtags: [TestAutomation, OpenTelemetry, TestObservability, CICD, DevOps]
preview:
  - ['$', 'cat test-health-ci-logs-vs-observability.md']
  - ['#', '# Where test health belongs']
  - [' ', '']
  - [' ', 'Every run, your suite reports its pass']
  - [' ', 'rate and flake count. The number lands']
  - [' ', 'in a CI log and nobody scrolls back.']
  - [' ', '']
  - [' ', 'Export it over OTLP and pass rate flows']
  - [' ', 'into the same Grafana board as prod...']
---

```ts title="global-setup.ts"
// Start the OTel SDK once, before any test runs.
// Every spec then emits a span your collector can graph.
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

const sdk = new NodeSDK({
  traceExporter: new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
  }),
});

export default async function globalSetup() {
  sdk.start();
}
```

Every run, your test suite reports how healthy it is. It ran for eleven minutes. Forty specs flaked. Pass rate sat at 96 percent. That data lands in a CI log, scrolls past, and nobody opens it again. The gap between where the number lands and where you would act on it decides whether the suite rots in the dark.

## Why test health dies in CI logs

To learn your suite slowed down, you open pipeline runs and read them by hand. A 30 percent jump in duration over baseline sits in plain text. A flake rate creeping past 1 percent sits two screens further down. Both wait there until someone scrolls far enough to spot the trend, and weeks pass before anyone does. [Datadog's test-health guidance](https://docs.datadoghq.com/tests/test_health/) names those two signals, duration regression and flake rate, as the ones worth watching. A log shows you one run at a time, so it shows you neither trend.

The log still earns its place. When a build goes red this morning, you open the run and read which assertion failed on which worker, and you fix it from there. The single failure is what the log does well. The month-long slope is what it cannot show you at all.

## OpenTelemetry became the bridge

On May 21 2026 the CNCF graduated OpenTelemetry at its Observability Summit and named it the de facto observability standard. [The announcement](https://www.cncf.io/announcements/2026/05/21/cloud-native-computing-foundation-announces-opentelemetrys-graduation-solidifying-status-as-the-de-facto-observability-standard/) counts more than 12,000 contributors from over 2,800 companies, and the OTel JavaScript API drew over 1.36 billion downloads in the past year, [per the graduation post](https://opentelemetry.io/blog/2026/otel-graduates/).

Your test runner can now speak the wire format your production stack already speaks. Export test metrics over OTLP and pass rate flows into the same Grafana or Datadog board that holds your live traffic, beside latency and error rate.

## Wire a Playwright reporter to a collector

For Playwright, an OpenTelemetry reporter emits a span per test case and per step. You start the OTel SDK in `globalSetup` and point `OTEL_EXPORTER_OTLP_ENDPOINT` at a collector. [The aergonaut reporter](https://github.com/aergonaut/playwright-opentelemetry-reporter) hooks the Playwright reporter API, and [Chris Fung walks the full setup](https://chrisfung.dev/posts/playwright-opentelemetry-reporter/) from SDK init to the first span landing on the board.

```ts title="playwright.config.ts"
export default defineConfig({
  globalSetup: './global-setup.ts',
  reporter: [['@aergonaut/playwright-opentelemetry-reporter']],
});
```

A full pattern routes the collector into the stack you maintain already: OTEL Collector into Tempo, Loki, and Prometheus, with Grafana on top. [Gaffer's teardown](https://gaffer.sh/blog/opentelemetry-test-metrics/) surfaces pass rate, duration, and flakiness as test-centric metrics off that pipeline. [OneUptime pairs Playwright with Tracetest](https://oneuptime.com/blog/post/2026-02-06-tracetest-playwright-browser-testing/view) for the same span-per-test export against an OTLP backend.

## Query the suite, alert on it, trace its slow tests

From the dashboard you run the queries the log refused. You graph `tests.pass_rate` grouped by project across six months and watch the slope. You set a monitor that pages you when pass rate drops below 95 percent for two runs straight. [Gaffer builds exactly that](https://gaffer.sh/blog/opentelemetry-test-metrics/): a Datadog timeseries widget on `tests.pass_rate` by project, plus an alert on the two-run drop. [Datadog's monitoring playbook](https://www.datadoghq.com/blog/best-practices-for-monitoring-software-testing/) treats those numbers as telemetry you watch the way you watch a production service.

Trace correlation closes the loop. A span on a browser action links to the backend span it triggered, so a slow test points at its cause inside one trace. You stop guessing whether the test got slower or the service under it did. You open the trace and read which span ate the time.

> A CI log answers what broke on one run. An observability backend answers whether the suite rotted over a month, and points at the service that rotted it.

## Pick by the question you ask

Each store wins a different question. For one red run this morning, the log tells you which assertion failed and on which worker. For whether the suite degraded over the last month, you read the slope off the dashboard in a glance while the log wastes your afternoon. Keep the log for the single failure. Send the trend to the backend that can graph it and page you.

## Treat the suite as a service

Your test suite ships a health signal every run and gets none of the monitoring you give a service in production. Wire the reporter to the collector this sprint. Point it at the board you already watch. Set the one alert that earns its place, pass rate under 95 percent across two runs, and let the dashboard catch the rot you would never scroll far enough to see.

I first shared this [on LinkedIn](https://www.linkedin.com/feed/update/urn:li:share:7470249937935495169).
