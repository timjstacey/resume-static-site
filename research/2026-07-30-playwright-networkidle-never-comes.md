# Research: Your Playwright Suite Waits for a Network Silence That Never Comes

**Date range:** 2026-07-02 to 2026-07-30

## Summary

Priority ladder: Playwright latest release is v1.62.0 (already in ledger,
2026-07-26) and k6 latest is v2.1.0 (already in ledger, 2026-07-02), so Tier 1
and Tier 2 dedup out. Tier 4 web search surfaced only evergreen guides. Landed on
Tier 3 (docs deep-dive), Failure mode archetype (Playbook / Teardown / News were
the last three, excluded).

Angle: `page.waitForLoadState('networkidle')` is a documented failure mode.
Playwright's own docs mark the `networkidle` load state DISCOURAGED and tell you
not to use it for testing.

Key facts:

- The Playwright docs describe `'networkidle'` as DISCOURAGED: "consider the
  operation to be finished when there are no network connections for at least
  500 ms. Don't use this method for testing, rely on web assertions to assess
  readiness instead."
- `networkidle` resolves after a 500 ms window with zero in-flight network
  requests. A modern app never delivers that silence: analytics beacons on route
  change, long-polling widgets, websocket streams, service-worker revalidation
  all keep requests in flight, so the wait times out on a page that already
  rendered.
- The reverse trap: on a single-page app the `load` event fires against the tiny
  HTML shell before the first API call returns, so teams reach for `networkidle`
  to compensate and trade too-early for too-late/never.
- The flake shows up in CI, not locally: local dev has a warm server, blocked
  analytics, and fast pollers, so the 500 ms silence happens by luck; CI hits real
  third-party calls, a cold cache, and a slower runner, so it never does.
- The fix is web-first assertions. `expect(locator).toBeVisible()` runs an
  internal retry loop polling ~100 ms until the condition passes or the timeout
  hits, so it waits for the app-visible state a user waits for.
- Biome ships a lint rule, `noPlaywrightNetworkidle`, that flags every call to the
  discouraged state.
- Narrow legitimate case: wait for one named request with `page.waitForResponse`
  (a download or an XHR whose body you assert on), not for the whole page to fall
  quiet.

## Sources

- https://playwright.dev/docs/navigations
- https://playwright.dev/docs/test-assertions
- https://biomejs.dev/linter/rules/no-playwright-networkidle/
- https://github.com/microsoft/playwright/issues/37080
- https://www.checklyhq.com/docs/learn/playwright/waits-and-timeouts/
