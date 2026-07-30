---
title: Your Playwright Suite Waits for a Network Silence That Never Comes
date: 2026-07-30
tag: Practice
excerpt: 'Playwright marks networkidle DISCOURAGED because a modern app never stops talking to the network; wait for a visible element instead and the CI flake goes away.'
readMins: 4
hashtags: [Playwright, TestAutomation, FlakyTests, E2ETesting, QA]
preview:
  - ['$', 'cat playwright-networkidle-never-comes.md']
  - ['#', '# The silence that never comes']
  - [' ', '']
  - [' ', 'You wait for networkidle after login.']
  - [' ', 'Green on your laptop, timeout in CI.']
  - [' ', '']
  - [' ', 'Analytics beacons and a polling call']
  - [' ', 'keep the network talking, so the wait']
  - [' ', 'never resolves. Wait for the heading.']
linkedinPost: |
  Playwright's own docs mark the networkidle load state DISCOURAGED, and the failure it causes shows up in CI, not on your laptop.

  You add one line after a navigation, page.waitForLoadState('networkidle'). The dashboard test goes green locally, so you push it. A few runs later CI fails it with a 30-second timeout, and the trace shows the page rendered the whole time. Nothing changed in the app. The wait is the bug.

  networkidle resolves after a 500 ms window with zero network requests in flight. A dashboard you ship today never goes quiet that long. An analytics beacon fires on route change. A notifications widget long-polls. A websocket streams updates. A service worker revalidates a cached asset. The 500 ms silence never arrives, so the wait times out on a page that finished rendering a second earlier.

  It passes on your machine because a warm dev server, a blocked analytics endpoint, and a fast poller hand you the silence by luck. CI runs against real third-party calls and a cold cache, so the silence never comes.

  The fix is web-first assertions. expect(locator).toBeVisible() polls about every 100 ms and returns the moment the element renders. Point it at the heading or the settled value the test needs, and the wait tracks what the user waits for instead of what the network is doing.

  Delete waitForLoadState('networkidle') on sight.

  Link in the first comment.

  #Playwright #TestAutomation #FlakyTests #E2ETesting #QA
---

```ts title="tests/dashboard.spec.ts — the wait that flakes"
await page.goto('/dashboard');
await page.waitForLoadState('networkidle'); // green locally, times out in CI
await expect(page.getByRole('heading', { name: 'Revenue' })).toBeVisible();
```

You add one line after the navigation, `await page.waitForLoadState('networkidle')`.
The dashboard test goes green on your laptop, so you push it. A few runs later CI
fails it with a 30-second timeout, and the trace shows the page rendered the whole
time. Nothing changed in the app. The wait itself is the bug.

Playwright's own docs mark this load state
[DISCOURAGED](https://playwright.dev/docs/navigations): consider the operation
finished when there are no network connections for at least 500 ms, and "don't use
this method for testing, rely on web assertions to assess readiness instead."
[Biome](https://biomejs.dev/linter/rules/no-playwright-networkidle/) ships a lint
rule, `noPlaywrightNetworkidle`, that flags every call. The tool the framework hands
you carries a warning label, and the failure teaches why.

## What networkidle waits for

`networkidle` resolves when the browser sees no network requests for a 500 ms
window. On a static page that fires once and settles. A dashboard you ship today
never goes quiet for half a second.

Your analytics library sends a beacon on route change. A notifications widget
long-polls every few seconds. A websocket streams presence updates. A service
worker revalidates a cached asset. Each one keeps a request in flight, the 500 ms
silence never arrives, and `networkidle` waits out its full timeout before it fails
the test, on a page that finished rendering a second earlier.

The reverse trap hides on the same line. Some teams reach for `networkidle` because
the plain `load` event fires too early: on a single-page app the HTML shell is tiny,
so `load` resolves before the first API call returns and the real content paints. So
you trade a wait that fires too soon for one that fires too late or never. Both waits
measure the network. Neither measures the thing the test cares about.

## Why the flake follows you to CI, not your laptop

The local pass is the trap. On your machine the app talks to a warm dev server, an
extension blocks the analytics endpoint, and the polling call answers in 5 ms, so the
network goes quiet long enough by luck. CI runs against a preview deploy with real
third-party calls, a cold cache, and a slower runner, so the same beacons and pollers
stay in flight past the 500 ms bar. The wait that got its silence at home never gets
it in the pipeline. You get a red build with no code change behind it, and you burn an
afternoon reading a trace that shows nothing wrong.

## Wait for what the user sees

Playwright's [web-first assertions](https://playwright.dev/docs/test-assertions)
already handle this. `expect(locator).toBeVisible()` runs an internal retry loop: it
polls the condition about every 100 ms and returns the moment it passes, or fails at
the timeout. Point it at the element the test needs and the wait tracks the state you
care about.

```ts title="tests/dashboard.spec.ts — wait for the state, not the network"
await page.goto('/dashboard');

// No load-state wait. The assertion retries every ~100 ms until the
// heading renders or the timeout hits.
await expect(page.getByRole('heading', { name: 'Revenue' })).toBeVisible();
await expect(page.getByRole('table', { name: 'Transactions' })).toBeVisible();
```

The assertion returns as soon as the heading paints, not 500 ms after the last
analytics ping. A background poller that runs forever no longer holds your test
hostage, because the test never asks the network to stop. It asks the page to show
the revenue figure, the same thing a user waits for.

For a value that loads and then updates, assert on the settled value:

```ts title="tests/dashboard.spec.ts — assert the settled state"
// Wait for the real number, past the placeholder the widget renders first.
await expect(page.getByTestId('revenue-total')).toHaveText('$48,210');
```

> A test should wait for the state a user waits for. `networkidle` waits for the
> network to fall silent, which a user never sees and a modern app never delivers.

The narrow case where you do want the network is a download or a specific request
whose response you assert on. Wait for that one request by URL with
`page.waitForResponse(/\/api\/export/)`, not for the whole page to fall quiet. You
name the request that matters and ignore the beacons that do not.

Delete `waitForLoadState('networkidle')` on sight. Replace each one with an assertion
on the element or the text that call stood in for. The suite stops flaking in CI, the
traces get shorter, and the test measures what the user experiences instead of what
the network happens to be doing.
