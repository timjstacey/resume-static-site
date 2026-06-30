# Research: Playwright 1.61 Tests Passkey Logins Without a Hardware Key

**Date range:** 2026-06-02 to 2026-06-30

**Tier:** 1 (Playwright release) — v1.61.1 published 2026-06-23, within 4 weeks, not in ledger. Archetype forced News / launch.

## Summary

Playwright 1.61.0 ships a WebAuthn virtual authenticator, exposed as
`browserContext.credentials` (the `Credentials` class). It registers passkeys and
answers the page's `navigator.credentials.create()` / `navigator.credentials.get()`
ceremonies in-test, with no real hardware key, across Chromium, Firefox, and WebKit.

- `credentials.create(origin, { id, userHandle, privateKey, publicKey })` seeds a
  passkey the backend provisioned for a test user; `credentials.install()` attaches it
  so the page's `navigator.credentials.get()` resolves against the seeded key.
- Setup pattern: let the app register a passkey once in a setup test, read it back with
  `credentials.get()`, then seed it into later tests — mirrors the storageState pattern
  applied to credentials.
- The gap it closes: a passkey login runs a WebAuthn ceremony against a real
  authenticator (phone, security key, platform TPM) that an E2E browser does not have.
  Teams left the passkey button untested or hand-mocked `navigator.credentials`.

Also in 1.61.0:

- WebStorage API: `page.localStorage` / `page.sessionStorage` (`getItem`/`setItem`/
  `items`) read and write the origin's storage without a `page.evaluate` wrapper.
- `testOptions.video` gains the trace-style modes (`on-all-retries`,
  `retain-on-first-failure`, `retain-on-failure-and-retries`); `expect.soft.poll`;
  HAR and trace recordings now include WebSocket traffic.
- Browser versions: Chromium 149, Firefox 151, WebKit 26.5; Ubuntu 26.04 support.

v1.61.1 (2026-06-23) is a patch: fixes a Node 22.15 sync-loader regression
(`context.conditions?.includes is not a function`), an ESM extensionless `.ts` subpath
resolution bug across pnpm workspace symlinks, a trace-viewer WebSocket time scaling
bug, and an `expect.extend` override. Upgrade past 1.61.0 if hit by the loader regressions.

## Sources

- https://github.com/microsoft/playwright/releases/tag/v1.61.0
- https://github.com/microsoft/playwright/releases/tag/v1.61.1
- https://playwright.dev/docs/api/class-credentials
- https://playwright.dev/docs/api/class-browsercontext#browser-context-credentials
- https://playwright.dev/docs/api/class-webstorage
