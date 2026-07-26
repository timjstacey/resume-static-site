# Research: Playwright 1.62 Moves Component Testing to Stories and Galleries

**Date range:** 2026-06-28 to 2026-07-26

## Summary

Playwright v1.62.0 shipped around 2026-07-24 (tag `v1.62.0`, not previously in the
ledger; latest Playwright post before it was 1.61 on 2026-06-30). Tier 1 release,
within the 4-week recency gate. Archetype forced to News / launch.

Headline highlights (confirmed from the GitHub release page's Highlights section,
cross-checked against the Playwright docs summaries and a web search):

1. **New component testing model — stories and galleries.**
   - A _story_ wraps the component under test in one scenario: hard-coded props,
     mock data, providers, recorded callbacks.
   - You implement and serve a _gallery_ page at `testOptions.baseURL`. The gallery
     exposes `window.mount(params)` and `window.unmount()`, which render a story
     into a root element.
   - The `fixtures.mount()` fixture navigates to `baseURL` and calls `window.mount()`
     with the story id and props, so every mount is a full navigation and tests are
     isolated from each other.
   - `mount()` returns a `Locator` scoped to the story's root element. Scope queries
     from that locator (`component.getByRole(...)`), not from `page`.
   - Pass the story type as a template argument to type-check its props.
   - Use `update(props)` / `unmount()` on the returned locator to re-render or tear
     down within a test.
   - This drops Playwright's framework-specific bundler integration (the deprecated
     `@playwright/experimental-ct-*` packages that bundled the component with Vite):
     component tests now drive a page you build and serve, the same way E2E tests do.

2. **Cancel operations with AbortSignal.** Most operations and web-first assertions
   accept a `signal` option taking an `AbortSignal`, cancelling long-running actions,
   navigations, waits, and assertions. A signal does not disable the default timeout;
   pass `timeout: 0` to disable it.

3. **WebP screenshots.** `expect(page/locator).toHaveScreenshot()` stores snapshots
   in WebP; `page.screenshot()` / `locator.screenshot()` accept `webp` as a `type`.
   Quality `100` (default) is lossless; lower values use lossy compression.

4. **Custom test filtering with `Reporter.preprocess()`.** A new `reporter.preprocess()`
   hook runs after configuration resolves and can mark individual tests skipped,
   excluded, fixed, or failing before the run starts.

5. **Isolated retries.** New `testConfig.retryStrategy`: default `'immediate'` retries
   as soon as a worker is free; `'isolated'` runs all retries at the end in a single
   worker.

Browser versions: Chromium 151.0.7922.34, Firefox 153.0, WebKit 26.5. Debian 11
support dropped.

Angle for this feed: the component-testing rework is the freshest for this ledger
(the blog has covered auth, clock, passkeys, agentic E2E, but never component
testing). Lead on the stories/galleries mechanism — CT becomes "drive a page you
serve" instead of "let Playwright bundle your component" — then a short round-up of
AbortSignal, WebP, preprocess, and isolated retries.

## Sources

- https://github.com/microsoft/playwright/releases/tag/v1.62.0
- https://playwright.dev/docs/test-components
- https://playwright.dev/docs/api/class-fixtures
- https://playwright.dev/docs/release-notes
