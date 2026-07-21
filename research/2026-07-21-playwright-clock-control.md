# Research: Stop Your Playwright Tests From Waiting Out the Clock

**Date range:** 2026-06-23 to 2026-07-21

## Topic selection (priority ladder)

- **Tier 1 (Playwright release):** latest is v1.61.1, published 2026-06-23. Already
  covered by the 2026-06-30 ledger post (Playwright 1.61 passkey testing). Fails
  dedup. Skip.
- **Tier 2 (k6 release):** latest is v2.1.0 (2026-07-09). Already covered by the
  2026-07-02 ledger post (k6 2.1 feature-flag system). Fails dedup. Skip.
- **Tier 3 (last-7-days news):** WebSearch surfaced only evergreen "best tools 2026"
  listicles and undated best-practice guides, nothing dated within 7 days that the
  ledger has not covered. Skip.
- **Tier 4 (docs deep-dive):** the Playwright Clock API. Not present in the ledger
  (no post on time control / fake timers). Archetype: Playbook (Teardown, Contrarian
  take, News/launch excluded as the last three rows).

## Summary

Playwright's Clock API controls the browser's sense of time inside a test: `Date`,
`Date.now()`, `setTimeout`, `setInterval`, `requestAnimationFrame`,
`performance.now`. Instead of calling `page.waitForTimeout` to sleep through a
debounce, a polling interval, a session-expiry countdown, or a delayed banner, a
test installs a fake clock and jumps time forward. The runner finishes in
milliseconds and the assertion is deterministic.

Methods:

- `page.clock.install({ time })` — installs the fake clock. Must be the first clock
  call, and should run before the page loads so timers scheduled during load are
  faked. Time is frozen until the test advances it.
- `page.clock.fastForward(ticks)` — jumps time forward (`'30:00'` or ms), firing due
  timers and skipping the animation frames in between. For a one-shot wait: debounce,
  session timeout, a banner that appears after N seconds.
- `page.clock.runFor(ms)` — ticks time forward firing every timer along the way. For
  interval-driven behaviour (polling, a per-second countdown) where each tick matters.
- `page.clock.pauseAt(time)` — fast-forwards to a moment and pauses there. Assert
  state exactly at a boundary (midnight rollover, countdown hitting zero).
- `page.clock.resume()` — hands time back to the natural flow.
- `page.clock.setFixedTime(time)` — freezes `Date.now()`/`new Date()` only; timers keep
  running in real time. Lighter than `install`. For rendered dates and relative
  timestamps ("posted 2 hours ago", a copyright year, a date-picker default).
- `page.clock.setSystemTime(time)` — sets the current time under an installed clock;
  advanced scenarios.

Key distinction: `setFixedTime` fixes only what the clock reads; `install` replaces
the whole timer environment so you can pause, resume, and fast-forward through timers
that depend on time changing.

## Sources

- https://playwright.dev/docs/clock
- https://playwright.dev/docs/api/class-clock
- https://playwright.dev/docs/release-notes
