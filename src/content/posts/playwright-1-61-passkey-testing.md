---
title: Playwright 1.61 Tests Passkey Logins Without a Hardware Key
date: 2026-06-30
tag: Tools
excerpt: 'Playwright 1.61 ships a virtual authenticator that registers passkeys in-test, so the passkey login button gets E2E coverage without a security key.'
readMins: 3
hashtags: [Playwright, TestAutomation, WebAuthn, Passkeys, QA]
preview:
  - ['$', 'cat playwright-1-61-passkey-testing.md']
  - ['#', '# Playwright 1.61 tests passkey logins']
  - [' ', '']
  - [' ', 'A passkey login runs a WebAuthn ceremony']
  - [' ', 'against a phone or a security key your']
  - [' ', 'test browser does not have.']
  - [' ', '']
  - [' ', '1.61 installs a virtual authenticator']
  - [' ', 'and answers the ceremony in the page.']
linkedinPost: |
  Playwright 1.61 shipped a virtual authenticator that registers passkeys in a test, so the passkey login flow you had to skip is now a test you can write.

  A passkey login runs a WebAuthn ceremony. The browser's navigator.credentials.get() talks to a real authenticator, a phone, a security key, or a platform TPM. An end-to-end browser has none of those, so teams left the passkey button uncovered or hand-mocked navigator.credentials and asserted against a fake.

  The new browserContext.credentials installs a software authenticator into the context. credentials.create() registers a passkey for an origin from a key you control: id, userHandle, private key, public key. credentials.install() attaches it, and the page's navigator.credentials.get() resolves against that seeded key instead of reaching for hardware. It works in Chromium, Firefox, and WebKit, because Playwright drives the authenticator through each engine.

  You can also let the app register a passkey once in a setup test, read it back with credentials.get(), and seed it into later tests. It is the storageState pattern for sessions, applied to credentials.

  1.61 also adds a WebStorage API: page.localStorage and page.sessionStorage read and write the origin's storage with no page.evaluate wrapper. The 1.61.1 patch fixes a Node 22.15 loader regression worth the bump.

  If your login screen offers a passkey, this is the release that brings it under coverage.

  Read the full write-up: https://tim.sillysamoyed.com/blog/playwright-1-61-passkey-testing

  #Playwright #TestAutomation #WebAuthn #Passkeys #QA
---

```js title="tests/passkey-login.spec.ts"
import { test, expect } from '@playwright/test';

test('passkey login', async ({ browser }) => {
  const context = await browser.newContext();

  // Seed a passkey the backend already provisioned for the test user.
  await context.credentials.create('example.com', {
    id: credentialId,
    userHandle,
    privateKey,
    publicKey,
  });
  await context.credentials.install();

  const page = await context.newPage();
  await page.goto('https://example.com/login');
  await page.getByRole('button', { name: 'Sign in with a passkey' }).click();
  await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
});
```

[Playwright 1.61.0](https://github.com/microsoft/playwright/releases/tag/v1.61.0)
adds `browserContext.credentials`, a virtual authenticator that registers passkeys and
answers the WebAuthn ceremony inside the page. It needs no security key and no platform
TPM, and it runs in Chromium, Firefox, and WebKit.

## The login you had to skip

A passkey replaces a password with a key pair bound to a device. The user taps
"Sign in with a passkey", and the browser runs `navigator.credentials.get()`, a WebAuthn
ceremony that signs a challenge with the device's private key. The authenticator is a
phone, a hardware security key, or a TPM baked into the laptop.

An end-to-end test browser carries none of those, so the passkey button sat outside the
suite. Teams tested the password fallback and noted the passkey path as manual, or they
stubbed `navigator.credentials` by hand and asserted against a value they made up. The
ceremony the user actually runs never reached CI.

## What the virtual authenticator does

`browserContext.credentials` exposes the
[Credentials](https://playwright.dev/docs/api/class-credentials) class, a software
authenticator that lives in the browser context. `credentials.create()` registers a
passkey for an origin from a key you supply: the credential `id`, the `userHandle`, and
the key pair. `credentials.install()` attaches it to the context, and from that point
the page's `navigator.credentials.get()` resolves against the seeded key.

The win is the cross-browser reach. Chromium has exposed a WebAuthn virtual authenticator
through its DevTools Protocol for years, so Chromium-only suites could already script
the ceremony. Playwright drives the authenticator through each engine it controls, which
puts the same passkey test on WebKit and Firefox.
[browserContext.credentials](https://playwright.dev/docs/api/class-browsercontext#browser-context-credentials)
is one API across all three.

## Seed in setup, read back in tests

The second shape the docs describe: let the application register a passkey for real in a
setup test, then read it back with `credentials.get()` and hold it. Later tests call
`create()` and `install()` with that credential and start already enrolled. A registration
flow runs once where it belongs, and every login test that follows skips it.

It is the same move as saving `storageState` once and reusing the session across a suite,
moved down to the credential. The setup project owns the slow path. The login specs stay
fast and read like the user's happy path.

## Also in 1.61

1.61 also adds a [WebStorage](https://playwright.dev/docs/api/class-webstorage) API.
`page.localStorage` and `page.sessionStorage` read and write the origin's storage through
`getItem`, `setItem`, and `items`, so a token check drops the `page.evaluate(() => localStorage.getItem(...))`
wrapper for a direct call. `testOptions.video` gains the trace-style modes
(`retain-on-first-failure` and the retry variants), `expect.soft.poll` lands, and HAR and
trace recordings now capture WebSocket traffic.

[1.61.1](https://github.com/microsoft/playwright/releases/tag/v1.61.1), shipped June 23,
is a patch. It clears a Node 22.15 sync-loader regression and an ESM resolution bug for
extensionless `.ts` subpath imports across pnpm workspace symlinks. If either bites your
setup, take the patch over 1.61.0.

> The passkey button is now a test you write and run in CI like any other login.

If your login screen offers a passkey, 1.61 is the upgrade that brings it under coverage.
Register the test credential, install it, and click the button the way a user does.
