# Research: Two k6 Load Models Measure Two Different Systems

**Date range:** 2026-06-11 to 2026-07-09 (Tier 4 docs deep-dive — evergreen k6 docs, no recency-gated release drove this)

## Why this tier

Tier 1 (Playwright latest v1.61.1, published 2026-06-23) and Tier 2 (k6 latest
v2.1.0, published 2026-06-30) both fail the dedup guard: 1.61 is already in the
ledger (2026-06-30) and k6 2.1 is already in the ledger (2026-07-02). Tier 3
last-week search surfaced Kane CLI (TestMu AI) and Momentic's agentic quality
platform, but their launch dates (Kane CLI 2026-04-28 / test-gen 2026-06-25,
Momentic 2026-06-23) all fall outside the hard 7-day recency gate. Dropped to
Tier 4 docs deep-dive: a k6 executors teardown the ledger has not covered
(prior k6 posts are release news: 2.0 AI, script authoring, 2.1 feature flags).

## Summary

k6 configures load through scenarios, each driven by an **executor**. Executors
split into two workload models:

- **Closed model (VU-based):** `constant-vus`, `ramping-vus`, `shared-iterations`,
  `per-vu-iterations`. A VU starts its next iteration only after the previous one
  finishes, so the request rate depends on response time. When the target system
  slows under stress, each VU waits longer, starts fewer iterations, and the
  offered load tapers off — the test eases off exactly when the server struggles.
- **Open model (arrival-rate-based):** `constant-arrival-rate`, `ramping-arrival-rate`.
  k6 starts new iterations on a schedule (`rate` / `timeUnit`) independent of
  whether prior iterations returned. You set `preAllocatedVUs` and a `maxVUs`
  ceiling; when responses slow, k6 allocates more VUs (up to `maxVUs`) to hold the
  target rate. Request rate is decoupled from response time.

**Coordinated omission:** the closed model throttles offered load in lockstep with
the slowdown, so the slow responses that would have piled up never get generated
and never land in the metrics. It shows up in p99 and beyond. One coordinated-
omission write-up measured the reported p99 shifting by roughly 25x between a
VU-bound run and an arrival-rate run against the same service.

**constant-arrival-rate config (from k6 docs):**

```js
export const options = {
  discardResponseBodies: true,
  scenarios: {
    contacts: {
      executor: 'constant-arrival-rate',
      duration: '30s',
      rate: 30,
      timeUnit: '1s',
      preAllocatedVUs: 2,
      maxVUs: 50,
    },
  },
};
```

**The call:** closed model matches a fixed, session-bound client count (connection
pool of N workers, browser fleet, N-thread batch). Open model matches traffic that
arrives independent of your service's speed (public HTTP endpoints, event streams)
and is the right shape for SLA validation and "can we hold X RPS" capacity testing.

## Sources

- https://grafana.com/docs/k6/latest/using-k6/scenarios/concepts/open-vs-closed/
- https://grafana.com/docs/k6/latest/using-k6/scenarios/executors/constant-arrival-rate/
- https://grafana.com/docs/k6/latest/using-k6/scenarios/concepts/arrival-rate-vu-allocation/
- https://idle-ti.me/blog/coordinated-omission/
