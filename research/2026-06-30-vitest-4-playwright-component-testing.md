# Research: Vitest 4 Made Playwright Component Testing the Wrong Default

**Date range:** 2026-06-02 to 2026-06-30

## Summary

The contrarian angle: the field still reaches for Playwright Component Testing
(`@playwright/experimental-ct-react`) to mount a component in a real browser. Vitest
4.0 (released 2025-10-22) graduated **Browser Mode** out of experimental, and it runs
on a Playwright provider — so Playwright drives the browser either way. For a team
already on Vitest, the standalone Playwright CT package is the wrong default: it stays
experimental, it serializes JSX across a Node/browser boundary, and it adds a second
runner and config for the same job.

Key load-bearing facts:

- **Vitest 4.0 shipped 2025-10-22**; Browser Mode lost the experimental tag and gained
  built-in visual regression + Playwright trace integration. Vitest weekly downloads
  grew from ~7M to ~17M in the year prior (VoidZero).
- **Playwright Component Testing is still experimental** — the package is literally
  `@playwright/experimental-ct-react`. React-first; Vue/Svelte bridges experimental,
  Angular partial.
- **Vitest Browser Mode uses a browser-automation provider — Playwright or
  WebdriverIO.** So a Vitest browser test still runs in real Chromium/Firefox/WebKit
  driven by Playwright; you keep one runner and one API.
- **Architecture difference (Artem Zakharchenko / Epic Web):** Playwright CT renders in
  the Node test and the component renders in the browser — two separate universes — so
  Playwright serializes the JSX from the test and ships it to the browser to reconstruct
  the tree. Vitest Browser Mode runs the test _inside_ the browser, so `render()` from
  react-dom works natively, same syntax as the app.
- **Kent C. Dodds** (author of React Testing Library) said he has never been so happy to
  see people uninstalling React Testing Library in favor of the native Browser Mode
  implementation.
- **Speed:** real-browser component tests run ~2-4x slower than jsdom per test; one 2026
  comparison clocks Vitest Browser Mode several times faster than Playwright CT on the
  same test count.
- **jsdom false positives:** focus management, CSS transitions, IntersectionObserver,
  getBoundingClientRect — the gaps that justify a real browser at all.
- **Honest split:** jsdom/Browser Mode for component-level checks during dev, Playwright
  E2E for critical user journeys before release. Playwright the framework still owns E2E;
  the argument is only about the component layer.

This repo's own stack: Vitest 4.1.7 + Playwright 1.60.x.

## Sources

- https://vitest.dev/blog/vitest-4
- https://www.infoq.com/news/2025/12/vitest-4-browser-mode/
- https://voidzero.dev/posts/announcing-vitest-4
- https://vitest.dev/guide/browser/why
- https://vitest.dev/config/browser/playwright
- https://playwright.dev/docs/test-components
- https://www.epicweb.dev/vitest-browser-mode-vs-playwright
- https://www.pkgpulse.com/blog/vitest-browser-mode-vs-playwright-component-testing-vs-2026
- https://www.infoq.com/news/2025/06/vitest-browser-mode-jsdom/
