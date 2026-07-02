# Research: k6 2.1 Ships a Feature-Flag System for Experimental Behavior

**Date range:** 2026-06-04 to 2026-07-02

## Summary

k6 v2.1.0 shipped June 30, 2026. The headline is a first-class feature-flag
system for opting into experimental behavior in the core engine.

- Enable a flag three ways: `--features` on the CLI (comma-separated or
  repeated), the `K6_FEATURES` environment variable, or a `features` key in
  `config.json`.
- Discover what exists with `k6 features` (and `k6 features --json`), which
  lists each flag's name, lifecycle status, and description.
- The release ships one flag: `native-histograms` (status: experimental),
  described as "Use native histograms for trend metrics". Enable with
  `k6 run --features native-histograms script.js` or
  `K6_FEATURES=native-histograms k6 run script.js`.

Native histograms context: k6 trend metrics track latency distributions
(p95/p99). Classic Prometheus histograms need pre-declared fixed buckets;
native histograms carry high-resolution buckets whose boundaries expand
automatically, so high percentiles stay accurate without guessing a bucket
layout. The flag makes k6 export trend metrics as native Prometheus
histograms through the Prometheus remote-write output.

Also in 2.1.0:

- Browser context-level `proxy` option: `browser.newContext({ proxy: { server,
bypass } })` routes context traffic through a proxy with no custom binary.
- Browser `locator.isInViewport()` with an optional `ratio` (0–1).
- `k6 cloud test list` lists Grafana Cloud k6 project tests (`--project-id`,
  `--json`).
- OpenTelemetry HTTP exporter basic auth via `K6_OTEL_HTTP_EXPORTER_USERNAME`
  and `K6_OTEL_HTTP_EXPORTER_PASSWORD`.
- `Selection.single(selector)` for faster single-element HTML lookups.

Bug fixes: `--vus` works as a standalone execution shortcut; invalid threshold
percentiles get a clear error; config file permissions tightened to owner-only
(`0o600`).

No breaking changes reported.

## Sources

- https://github.com/grafana/k6/releases/tag/v2.1.0
- https://grafana.com/docs/k6/latest/release-notes/
- https://grafana.com/grafana/dashboards/18030-k6-prometheus-native-histograms/
- https://grafana.com/docs/k6/latest/results-output/real-time/prometheus-remote-write/
