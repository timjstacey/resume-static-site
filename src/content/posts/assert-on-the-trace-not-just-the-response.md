---
title: Assert on the Trace, Not Just the Response
date: 2026-07-16
tag: Practice
excerpt: 'A 200 response says the request finished. It hides a wrong database, a skipped cache, or a downstream call that fired twice. Assert on the trace and those bugs go red.'
readMins: 4
hashtags: [TraceBasedTesting, OpenTelemetry, TestAutomation, Observability, APITesting]
preview:
  - ['$', 'cat assert-on-the-trace-not-just-the-response.md']
  - ['#', '# Assert on the trace, not the response']
  - [' ', '']
  - [' ', 'A 200 says the request finished. It does not']
  - [' ', 'say it hit the cache or called payment once.']
  - [' ', '']
  - [' ', 'Trace-based testing checks the spans the']
  - [' ', 'request produced: which database, which']
  - [' ', 'downstream, how long each hop took.']
linkedinPost: |
  A 200 response tells you the request finished. It does not tell you the request read the replica instead of the primary, hit the cache instead of the database, or called the payment service once instead of twice. Your assertion checks the JSON that came back. The bug lives in the four service hops that produced it.

  Trace-based testing closes that gap. It asserts on the distributed trace a request emits: the spans, their attributes, their timing, and how they nest. Tracetest, an open-source tool from Kubeshop, triggers the request, waits for the trace to arrive from your OpenTelemetry pipeline, then runs assertions against the spans.

  The steps:

  1. Instrument the service with OpenTelemetry and export spans over OTLP to a collector Tracetest reads.
  2. Write the test as a YAML trigger plus specs. Each spec is a selector that picks spans and assertions that check them.
  3. Select the spans you mean with the selector language: by type, by service, by attribute, or combined.
  4. Run it in CI with tracetest run test, or the Tracetest GitHub Action.

  A span assertion catches a class of bug the response hides: a duplicate downstream call, a cache that never got hit, a database span that blew past its budget, an async event that never published. Keep your contract and integration tests on the API surface. Add trace assertions on the endpoints whose response looks fine while the internals go wrong.

  Read the full write-up: https://tim.sillysamoyed.com/blog/assert-on-the-trace-not-just-the-response

  #TraceBasedTesting #OpenTelemetry #TestAutomation #Observability #APITesting
---

```yaml title="import-pokemon.trace.yaml"
type: Test
spec:
  name: Import a Pokemon
  trigger:
    type: http
    httpRequest:
      url: http://demo-api:8081/pokemon/import
      method: POST
      body: '{"id":52}'
  specs:
    - selector: span[tracetest.span.type="database"]
      assertions:
        - attr:tracetest.span.duration < 100ms
```

A 200 response tells you the request finished. It does not tell you the request read the replica instead of the primary, hit the cache instead of the database, or called the payment service once instead of twice. Your assertion checks the JSON that came back. The bug lives in the four service hops that produced it.

Trace-based testing closes that gap. It asserts on the distributed trace a request emits: the spans, their attributes, their timing, and how they nest. [Tracetest](https://github.com/kubeshop/tracetest), an open-source tool from Kubeshop, triggers the request, waits for the resulting trace to arrive from your OpenTelemetry pipeline, then runs assertions against the spans. You keep testing the response. You also test what the code did to build it.

## Instrument the service and export the spans

Trace-based testing runs on data your service already emits once you wire in OpenTelemetry. Add the SDK, wrap the handlers, database driver, and outbound HTTP client so each hop opens a span, and export the spans over OTLP to a collector Tracetest can read. The [OpenTelemetry demo walkthrough](https://opentelemetry.io/blog/2023/testing-otel-demo/) runs the tests against the same instrumented services the demo ships, so the traces the tests assert on are the traces production emits.

Instrument for the assertions you want to make. A database span carries `db.system` and a duration. An outbound call carries the target and status. A cache lookup carries a hit-or-miss attribute if you set one. The richer the spans, the more the test can check. Thin instrumentation leaves you asserting on a bare HTTP root span, which is the response you already had.

## Write the test as a trigger plus span assertions

A Tracetest definition is YAML with two halves. The `trigger` fires the request. The `specs` list checks the trace it produced. Each spec pairs a `selector` that picks spans with `assertions` that check them.

The lead example imports a Pokemon over HTTP, then asserts every database span finishes inside 100ms. Add specs to check the rest of the trace:

```yaml title="import-pokemon.trace.yaml"
specs:
  - selector: span[tracetest.span.type="http"]
    assertions:
      - attr:http.status_code = 200
  - selector: span[tracetest.span.type="database" db.system="postgresql"]
    assertions:
      - attr:tracetest.span.duration < 100ms
  - selector: span[name="publish import.completed"]
    assertions:
      - attr:tracetest.selected_spans.count = 1
```

The first spec keeps the response check you already trust. The second says the write hit Postgres and stayed under budget. The third says the import published its completion event once, not zero times and not twice. None of those three facts shows up in the response body. All three ride in the trace.

## Select the spans you mean

The [selector language](https://docs.tracetest.io/concepts/selectors) filters spans by their attributes, space-separated inside the brackets. Pick by span type with `span[tracetest.span.type="database"]`, by service with `span[service.name="cart-api"]`, or combine them to narrow to one hop: `span[tracetest.span.type="database" db.system="postgresql"]`. A selector that matches several spans applies its assertion to each, so `duration < 100ms` against every database span fails if one query out of six runs slow.

Count and order are assertable too. Use `attr:tracetest.selected_spans.count = 1` to prove a downstream fired exactly once, the check that catches a retry loop that double-charges. Chain selectors to assert a span from one service comes after a span from another when the sequence is the contract you care about.

> A response assertion proves the shape of the answer. A span assertion proves the work behind it: which database, how many calls, how long each hop took.

## Run it in the pipeline

The [Tracetest CLI](https://docs.tracetest.io/concepts/what-is-trace-based-testing) runs a definition against a live instance:

```bash title="run-trace-tests.sh"
tracetest run test --file import-pokemon.trace.yaml
```

In CI, the [Tracetest GitHub Action](https://tracetest.io/blog/integrating-tracetest-with-github-actions-in-a-ci-pipeline) installs the CLI and agent for you:

```yaml title=".github/workflows/trace-tests.yml"
- uses: kubeshop/tracetest-github-action@v1
  with:
    token: ${{ secrets.TRACETEST_API_KEY }}
- run: tracetest run test --file import-pokemon.trace.yaml
```

The tests need a running, instrumented target and a collector feeding traces back. When the pipeline spins the app up in a namespace it names at runtime, pass the URL through an environment variable the definition reads, so the same YAML points at whichever instance this run created. The action reports each assertion as a pass or fail, so a slow query or a doubled downstream call reddens the job the way a broken response would.

## Where a span assertion earns its place

Trace-based testing does not replace the tests you have. Keep contract tests on the API boundary and integration tests on the request-response pairs a caller depends on. They run fast and they guard the surface other teams build against.

Add trace assertions where the response looks fine while the internals go wrong. The endpoint that returns 200 whether it read the cache or fell through to the database. The write that should publish one event and sometimes publishes none. The call that a retry can fire twice without changing the JSON. Pick one such endpoint, instrument the hops it touches, and write a single spec that asserts the side effect you cannot see from the outside. The first time a green response sits above a red span, you have caught a bug the old test was built to miss.
