# Research: Assert on the Trace, Not Just the Response

**Date range:** 2026-06-18 to 2026-07-16

## Summary

Trace-based testing asserts on the distributed trace a request produces — its
spans, their attributes, timing, and parent-child structure — instead of only on
the HTTP response. In a distributed system the response tells half the story: a
correct-looking 200 can still hide a wrong database, a skipped cache, a duplicate
downstream call, or a missing async event. Selecting spans and checking their
values verifies what the system did internally.

Tracetest (kubeshop, open source) is the dominant dedicated tool. It triggers a
request, waits for the resulting trace to arrive from your OpenTelemetry pipeline,
then runs assertions against the spans. Test definitions are YAML: a `trigger`
(e.g. `http`) plus `specs`, each a `selector` (span filter) and `assertions`
against span attributes.

Key mechanics:

- **Selector language.** Filter spans by attributes, space-separated:
  `span[tracetest.span.type="database"]`, `span[service.name="cart-api"]`,
  combined `span[tracetest.span.type="database" db.system="postgresql"]`. Span
  order and count are assertable (`attr:tracetest.selected_spans.count >= 1`).
- **Assertions.** Check attributes, status, timing:
  `attr:tracetest.span.duration < 100ms`, `attr:http.status_code = 200`.
- **CI.** Run a definition with `tracetest run test --file path.yaml`. The
  Tracetest GitHub Action (`kubeshop/tracetest-github-action@v1`) installs the CLI
  and agent; env vars inject the target URL for dynamically created namespaces.
- **Complementary, not a replacement.** Keep contract and integration tests for
  the API surface; add trace assertions where internal behaviour matters.

## Sources

- https://github.com/kubeshop/tracetest
- https://docs.tracetest.io/concepts/what-is-trace-based-testing
- https://docs.tracetest.io/concepts/selectors
- https://opentelemetry.io/blog/2023/testing-otel-demo/
- https://tracetest.io/blog/integrating-tracetest-with-github-actions-in-a-ci-pipeline
- https://qaskills.sh/blog/trace-based-testing-opentelemetry-2026
