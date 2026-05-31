---
title: k6 2.0 moves load-test authoring into the CLI
date: 2026-05-12
tag: Tools
excerpt: 'Grafana previewed k6 2.0 at GrafanaCON 2026: AI authoring in the CLI, an MCP server, and a Playwright-to-k6 converter.'
readMins: 6
hashtags: [PerformanceTesting, TestAutomation, k6, Grafana, AI]
preview:
  - ['$', 'cat k6-2-ai-performance-testing.md']
  - ['#', '# k6 2.0 moves authoring into the CLI']
  - [' ', '']
  - [' ', 'Grafana previewed k6 2.0 at GrafanaCON']
  - [' ', '2026. Describe a load scenario in plain']
  - [' ', 'language, get a working k6 script back.']
  - [' ', '']
  - [' ', 'The part that matters for teams with']
  - [' ', 'Playwright coverage: a converter that']
  - [' ', 'turns E2E journeys into load tests...']
---

Grafana previewed k6 2.0 at [GrafanaCON 2026](https://grafana.com/blog/grafanacon-2026-announcements/) last month. The headline is AI-assisted authoring baked into the CLI, so you describe a load scenario in plain language and get a working script back.

## The new subcommands

k6 2.0 adds `agent`, `mcp`, `docs`, and `explore`. The first turns a prompt into a script; the rest wire the runner to your editor and your questions. The experimental `mcp-k6` server connects Claude, Cursor, and VS Code to k6 for authoring, validation, and local runs. You bring your own LLM key, and the script stays in your repo where you can read it.

```bash
# Describe the scenario, get a script
k6 agent "ramp to 200 VUs over 2m against /checkout, p95 under 800ms"

# Or expose k6 to your editor's assistant over MCP
k6 mcp serve
```

k6's design keeps the runner transparent, and the [AI assistant config](https://grafana.com/docs/k6/latest/set-up/configure-ai-assistant/) runs alongside it rather than inside it. You stay in control of what executes.

## The Playwright-to-k6 converter

The converter is the piece worth your attention. If you maintain E2E journeys in Playwright, `mcp-k6` turns them into load-test scripts without a rewrite. The user flows already exist, so the conversion takes minutes instead of an afternoon.

The generated script is ordinary k6 JavaScript with checks and thresholds:

```js title="checkout-load.js"
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 200 },
    { duration: '1m', target: 0 },
  ],
  thresholds: { http_req_duration: ['p(95)<800'] },
};

export default function () {
  const res = http.post('https://example.com/checkout', payload);
  check(res, { 'status is 200': (r) => r.status === 200 });
}
```

> A load test you can read in the same language as your E2E suite is a load test the team will keep current.

## k6 Studio shipped the first piece in January

[k6 Studio v1.10.0](https://grafana.com/oss/k6/) added AI Autocorrelation back in January. It scans a recording and generates extraction rules for CSRF tokens, session IDs, and other dynamic values. That step has eaten hours from senior engineers and stalled junior ones, so automating it removes the most common reason a recorded script fails on the second run.

## Where this lands

For teams that already run Playwright, k6 2.0 lowers the barrier to load testing to near zero. The flows exist, the converter reads them, and the output is a script you can version and tune. Independent roundups from [Gatling](https://gatling.io/blog/best-ai-load-testing-tools) and [PFLB](https://pflb.us/blog/top-ai-load-testing-tools/) place this alongside a wider shift toward AI-assisted performance work, but k6's bring-your-own-key model keeps the script and the cost in your hands. Start by converting one journey you already trust, run it, and read what comes back.
