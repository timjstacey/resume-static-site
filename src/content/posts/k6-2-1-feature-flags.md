---
title: k6 2.1 Ships a Feature-Flag System for Experimental Behavior
date: 2026-07-02
tag: Tools
excerpt: 'k6 2.1 adds a feature-flag system: opt into experimental behavior with --features, list what exists with k6 features, and switch trend metrics to native Prometheus histograms.'
readMins: 4
hashtags: [k6, PerformanceTesting, LoadTesting, Grafana, Observability]
preview:
  - ['$', 'cat k6-2-1-feature-flags.md']
  - ['#', '# k6 2.1 ships a feature-flag system']
  - [' ', '']
  - [' ', 'Experimental behavior used to arrive as']
  - [' ', 'a stray env var you found in a changelog.']
  - [' ', '']
  - [' ', '2.1 gives it one switch and a k6 features']
  - [' ', 'command that lists every flag and its']
  - [' ', 'lifecycle status.']
linkedinPost: |
  k6 2.1 shipped on June 30 with a feature-flag system for opting into experimental behavior in the core engine.

  You turn a flag on three ways: the --features CLI flag, the K6_FEATURES environment variable, or a features key in config.json. You list what exists with k6 features, which prints each flag's name, its lifecycle status, and a one-line description. k6 features --json gives you the machine-readable version for a CI check.

  The release ships one flag: native-histograms, marked experimental, described as "Use native histograms for trend metrics". Run k6 run --features native-histograms script.js and k6 exports your trend metrics as native Prometheus histograms. Classic Prometheus histograms make you declare fixed buckets up front, so a p99 that lands past your top bucket reports as an estimate. Native histograms carry high-resolution buckets whose boundaries grow with the data, so tail latency stays accurate without you guessing the layout.

  2.1 also adds a context-level browser proxy option, locator.isInViewport(), k6 cloud test list, basic auth on the OpenTelemetry HTTP exporter, and a config file locked to owner-only permissions.

  The flag system is the part that outlives this release. Every experimental feature k6 ships next gets one switch and one line in k6 features instead of a new environment variable to hunt for.

  Read the full write-up: https://tim.sillysamoyed.com/blog/k6-2-1-feature-flags

  #k6 #PerformanceTesting #LoadTesting #Grafana #Observability
---

```bash title="opt into an experimental feature"
$ k6 features
NAME               STATUS         DESCRIPTION
native-histograms  experimental   Use native histograms for trend metrics

$ k6 run --features native-histograms script.js
```

[k6 v2.1.0](https://github.com/grafana/k6/releases/tag/v2.1.0), released June 30,
adds a feature-flag system for experimental behavior in the core engine. You opt
in with `--features`, the `K6_FEATURES` environment variable, or a `features` key
in `config.json`, and you list what exists with `k6 features`. The release ships
one flag, `native-histograms`, which switches trend metrics to native Prometheus
histograms.

## One switch, and a command that lists them

An experimental feature used to reach you as a specific `K6_` environment variable
named in release notes, with no command to tell you what was available or how
finished each one was. 2.1 gives every experimental feature the same switch and a
single place to read them.

`k6 features` prints the catalog: each flag's name, its lifecycle status, and a
one-line description of what it does. `k6 features --json` gives you the same list
in a shape a script can read, so a CI job can assert which flags a pipeline runs
with. To turn one on, pass `--features native-histograms` to `k6 run`, set
`K6_FEATURES=native-histograms` in the environment, or add the flag to the
`features` array in `config.json`. The three routes cover the CLI, the container,
and the checked-in config without a custom build.

The lifecycle status is the useful part. A flag marked `experimental` warns you
the behavior can change before it becomes the default, so you read it as a preview
and not a stable API. When the k6 team promotes a feature, the status moves and the
flag stays where you already know to look.

## native-histograms, the first flag

k6 trend metrics track a latency distribution: the p95 and p99 you gate a load
test on. Export those to Prometheus and the bucket layout decides how accurate the
tail reads. A [classic Prometheus histogram](https://grafana.com/docs/k6/latest/results-output/real-time/prometheus-remote-write/)
needs its buckets declared up front, so a p99 that lands past your highest bucket
comes back as an estimate against the nearest boundary you happened to pick.

Native histograms drop the guess. Prometheus stores high-resolution buckets whose
boundaries grow with the observed values, so a request that runs slower than
anything you planned for still lands in a real bucket. Turn on the flag and k6
exports trend metrics as native histograms through the remote-write output, which
feeds a [native-histogram dashboard](https://grafana.com/grafana/dashboards/18030-k6-prometheus-native-histograms/)
that reads accurate percentiles straight from the stored distribution. For a team
that gates a release on p99, the flag removes a source of quiet error in the number
the gate checks.

## Also in 2.1

The browser module gains a context-level `proxy` option, so you route a context's
traffic through a proxy from the test instead of building a custom binary:

```javascript title="browser-context-proxy.js"
const context = await browser.newContext({
  proxy: {
    server: 'http://proxy.test:8080',
    bypass: 'localhost,127.0.0.1',
  },
});
```

`locator.isInViewport()` lands alongside it, with an optional `ratio` between 0 and
1 to assert how much of an element sits on screen. `k6 cloud test list` prints the
tests in a Grafana Cloud k6 project and takes `--project-id` and `--json`. The
OpenTelemetry HTTP exporter accepts basic auth through
`K6_OTEL_HTTP_EXPORTER_USERNAME` and `K6_OTEL_HTTP_EXPORTER_PASSWORD`, and
`Selection.single(selector)` gives a faster path for a single-element HTML lookup.

The bug fixes cover the rough edges. `--vus` works on its own as an execution
shortcut, an invalid threshold percentile fails with a message that names the
problem instead of a silent parse, and k6 writes the config file with owner-only
`0o600` permissions so a shared runner does not leave credentials readable.

## The part that outlives the release

> Every experimental feature k6 ships next gets one switch and one line in `k6 features`.

native-histograms is the first flag, and the flag system is the change that keeps
paying out. The next preview k6 wants to try arrives as a named entry with a
lifecycle status you can query, not a new environment variable buried in a
changelog. Run `k6 features` on your current binary and you see what your team can
turn on today.
