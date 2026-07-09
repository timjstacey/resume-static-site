---
title: Two k6 Load Models Measure Two Different Systems
date: 2026-07-09
tag: Strategy
excerpt: 'A closed-model k6 test eases off the moment the server slows; an open-model test holds the request rate and shows you the tail your users will hit.'
readMins: 4
hashtags: [k6, PerformanceTesting, LoadTesting, Grafana, CoordinatedOmission]
preview:
  - ['$', 'cat k6-closed-vs-open-load-models.md']
  - ['#', '# Two k6 load models']
  - [' ', '']
  - [' ', 'Fifty VUs loop your API for 30s and the']
  - [' ', 'run comes back green: p99 at 180ms.']
  - [' ', '']
  - [' ', 'constant-vus and constant-arrival-rate']
  - [' ', 'both drive load. They answer different']
  - [' ', 'questions, and the wrong one hides the']
  - [' ', 'tail your users will hit.']
linkedinPost: |
  A k6 load test can ease off at the exact moment your server starts to struggle, and the run still comes back green.

  The reason is the executor you picked. constant-vus and the other VU-based executors run a closed model: a virtual user fires its next request only after the last one returns. When the target slows, each VU waits longer, starts fewer iterations, and the offered load tapers off. k6 never generates the slow responses that would have piled up, so they never reach your latency histogram. That is coordinated omission, and it lives in the tail.

  constant-arrival-rate runs an open model instead. You set a rate and a time unit, and k6 starts new iterations on that schedule whether or not the previous ones returned, allocating more VUs up to a maxVUs ceiling to hold the target. The request rate stays fixed and the latency lands wherever the server puts it. One coordinated-omission analysis measured the reported p99 shifting by roughly 25x between a VU-bound run and an arrival-rate run against the same service.

  Pick by the system you are testing. A fixed, session-bound client count (a connection pool, a browser fleet, an N-thread batch) matches the closed model. Traffic that arrives independent of your service's speed (public endpoints, event streams, SLA and capacity questions) needs the open model to hold the rate long enough to answer.

  Full write-up: https://tim.sillysamoyed.com/blog/k6-closed-vs-open-load-models

  #k6 #PerformanceTesting #LoadTesting #Grafana #CoordinatedOmission
---

```js title="closed-model.js"
// Closed model: 50 VUs, each looping for 30 seconds.
// A VU fires its next request only after the last one returns.
export const options = {
  scenarios: {
    browse: {
      executor: 'constant-vus',
      vus: 50,
      duration: '30s',
    },
  },
};
```

Fifty virtual users loop against your API for thirty seconds and the run comes back green: p99 at 180ms, zero errors. The number is honest about the test you ran and quiet about the one you meant to run. `constant-vus` and `constant-arrival-rate` both drive load in k6, and they answer different questions. Pick the wrong executor and the green p99 describes a gentler load than production sends.

## The closed model feeds response time back into the load

k6 runs each scenario through an [executor](https://grafana.com/docs/k6/latest/using-k6/scenarios/executors/), and the VU-based ones — `constant-vus`, `ramping-vus`, `shared-iterations`, `per-vu-iterations` — share one rule: a VU starts its next iteration only after the current one finishes. The request rate depends on how fast the server answers. Fifty VUs against a service replying in 20ms push far more requests per second than the same fifty against a service replying in 500ms.

That coupling turns against you under stress. When the target slows, each VU waits longer on every response, starts fewer iterations, and the offered load tapers off. [The k6 docs](https://grafana.com/docs/k6/latest/using-k6/scenarios/concepts/open-vs-closed/) name these the closed-model executors and spell out the consequence: the test eases off at the exact moment the server struggles. Your load generator and your bottleneck negotiate a truce, and the metrics record the truce, not the load you asked for.

This is coordinated omission. k6 never generates the slow responses that would have stacked up, so those responses never land in the latency histogram. The [coordinated-omission write-up on idle-ti.me](https://idle-ti.me/blog/coordinated-omission/) traces the mechanism: the load stops arriving in lockstep with the slowdown, and the numbers that would have exposed the problem go missing by construction.

## The open model holds the rate no matter what

The arrival-rate executors flip the control. `constant-arrival-rate` and `ramping-arrival-rate` start new iterations on a schedule you set with `rate` and `timeUnit`, independent of whether the previous iterations have returned.

```js title="open-model.js"
export const options = {
  discardResponseBodies: true,
  scenarios: {
    browse: {
      executor: 'constant-arrival-rate',
      rate: 500, // 500 iterations...
      timeUnit: '1s', // ...every second
      duration: '30s',
      preAllocatedVUs: 50,
      maxVUs: 200,
    },
  },
};
```

Now the rate stays at 500 per second whether a response takes 20ms or two seconds. You seed the run with `preAllocatedVUs` and cap it with `maxVUs`; when the server slows and iterations start piling up, [k6 allocates more VUs toward that ceiling](https://grafana.com/docs/k6/latest/using-k6/scenarios/concepts/arrival-rate-vu-allocation/) to keep hitting the target. The request rate no longer reports the server's speed back to itself. It holds the number you set and lets the latency land wherever the server puts it.

## The tail is where the two diverge

Below the server's limit the two models agree. Push past it and they split. The closed model throttles its own load and undercounts the slow responses; the open model keeps firing and records every one of them. The gap lives in the tail. The same coordinated-omission analysis measured the reported p99 moving by roughly 25x between a VU-bound run and an arrival-rate run against one service. A p99 off by that factor is not a rounding error. It is the difference between a dashboard that says you are fine and a pager that says you are not.

> A green p99 from `constant-vus` tells you how the system behaves when the load politely waits its turn. Production traffic does not wait.

## Which model for which job

Reach for `constant-vus` or `ramping-vus` when the real client count is fixed and session-bound. A connection pool of N workers, a fleet of N headless browsers, a batch job with N threads: each client blocks on its last response before it sends the next, so the closed model matches the shape of the thing you are testing. The question you are asking is how the system behaves with N clients that each wait their turn, and the executor answers it honestly.

Reach for `constant-arrival-rate` or `ramping-arrival-rate` when traffic arrives independent of your service's speed. Public HTTP endpoints, event consumers, anything where users keep clicking whether or not the last request came back. The question is whether you can hold X requests per second and what the tail looks like at that rate. That is SLA validation and capacity planning, and only the open model keeps the rate steady long enough to answer it.

For "can we handle X req/s", set `rate` and `timeUnit` to your target throughput, cap `maxVUs` so a runaway test cannot exhaust the box, and read the tail it produces. That run costs more VUs than the closed-model version, and it reports the latency `constant-vus` was quietly hiding from you.
