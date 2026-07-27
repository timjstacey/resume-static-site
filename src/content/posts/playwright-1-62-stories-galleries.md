---
title: Playwright 1.62 Moves Component Testing to Stories and Galleries
date: 2026-07-26
tag: Tools
excerpt: 'Playwright 1.62 rebuilds component testing so mount() drives a gallery page you serve, plus AbortSignal cancellation, WebP snapshots, and isolated retries.'
readMins: 4
hashtags: [Playwright, TestAutomation, ComponentTesting, E2ETesting, QA]
preview:
  - ['$', 'cat playwright-1-62-stories-galleries.md']
  - ['#', '# Playwright 1.62: stories and galleries']
  - [' ', '']
  - [' ', 'The old mount() let Playwright bundle']
  - [' ', 'your component behind a Vite server.']
  - [' ', '']
  - [' ', '1.62 hands the render back to you: a']
  - [' ', 'gallery page you serve, driven over']
  - [' ', 'HTTP like any other page.']
linkedinPost: |
  Playwright 1.62 rebuilt component testing around a stories-and-galleries model, and it drops the framework-specific bundler the old mount() carried.

  The deprecated experimental component testing bundled your component with Vite through packages like playwright/experimental-ct-react. You imported the component into the spec, and Playwright hoisted that import into a dev server it wired up for you. Component tests ran against Playwright's bundle, not your app's real build.

  1.62 reverses the direction. You write a story: a wrapper that fixes props, mock data, and providers into one scenario. You serve a gallery page at your test baseURL that exposes window.mount and window.unmount to render a story into a root element. The mount fixture navigates to the gallery and calls window.mount with a story id, so every mount is a full navigation and tests stay isolated. It returns a Locator scoped to the story's root, and update(props) re-renders without a reload. Component tests now drive a page you build and serve, the same way an E2E test does.

  Four more changes ship in the same release:

  1. A signal option takes an AbortSignal to cancel long-running actions, navigations, and assertions.
  2. toHaveScreenshot and screenshot() store snapshots in WebP.
  3. A reporter.preprocess() hook marks tests skipped or excluded before the run.
  4. retryStrategy: 'isolated' runs all retries at the end in one worker.

  Link in the first comment.

  #Playwright #TestAutomation #ComponentTesting #E2ETesting #QA
---

```ts title="gallery.ts — served at testOptions.baseURL"
// The gallery renders one story on demand and exposes two globals.
window.mount = ({ id, props }) => {
  const Story = stories[id]; // a wrapper: fixed props, mock data, providers
  render(Story(props), root); // your framework, your build, your root element
};
window.unmount = () => clear(root);
```

[Playwright 1.62](https://github.com/microsoft/playwright/releases/tag/v1.62.0),
released July 24, rebuilds component testing around stories and galleries. The
`mount()` you write no longer imports your component and lets Playwright bundle it.
It navigates to a gallery page you serve and renders one story there.

## What the old mount() did behind you

The deprecated experimental component testing shipped as framework-specific packages,
`@playwright/experimental-ct-react`, `-vue`, `-svelte`. You imported the component
into the spec and called `mount(<Button label="Save" />)`. Playwright hoisted that
import out of the test, handed it to a Vite server it configured for you, and rendered
the component in a browser it controlled.

The convenience carried a cost. Your component ran inside Playwright's bundle, not the
build your application ships, so a provider, a global stylesheet, or a Vite plugin your
real app relies on had to be re-declared in Playwright's config. The import-hoisting
rules tripped anyone who put a helper in the wrong scope. Each framework needed its own
package to stay current with that framework's compiler.

## Stories and galleries

1.62 hands the render back to you. You write a _story_: a small wrapper that pins the
component into one scenario, with fixed props, mock data, the providers it needs, and
recorded callbacks. You serve a _gallery_ page at `testOptions.baseURL` that knows how
to render any story into a root element. The gallery exposes two functions on `window`,
`mount({ id, props })` and `unmount()`, and it renders with your framework and your
build.

The `mount` fixture drives that page:

```ts title="tests/expandable.spec.ts"
test('expands on click', async ({ mount }) => {
  // mount() navigates to the gallery, then calls window.mount for one story id.
  const component = await mount('Expandable/Collapsed');
  await component.getByRole('button', { name: 'Show more' }).click();
  await expect(component.getByTestId('body')).toBeVisible();

  // Re-render the same story with new props, no page reload.
  await component.update({ open: true });
});
```

Each call to `mount()` navigates to `baseURL` and calls `window.mount()` with the story
id, so a mount is a full page navigation. Two tests never share a rendered tree.
`mount()` returns a [Locator](https://playwright.dev/docs/api/class-fixtures) scoped to
the story's root element, so you scope queries from `component`, not from `page`, and a
second story on the page cannot leak into your assertions. Pass the story type as a
template argument and the props you send get type-checked against the component.
`update(props)` re-renders the same story with new props inside the test, and
`unmount()` tears it down.

The trade you make is real work for real fidelity. You own the gallery page, which is a
route in your app that imports a story map. In return the component runs against your
build, your bundler config, and your providers, and Playwright drops the per-framework
CT package. You test the component through a page you wrote, with the tools you ship.

## AbortSignal cancels a running action

Most operations and web-first assertions now take a `signal` option that accepts an
[AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal). Abort the
controller and the click, navigation, wait, or assertion stops:

```ts title="tests/cancel.spec.ts"
const controller = new AbortController();
page.on('dialog', () => controller.abort()); // bail the moment a modal steals focus
await expect(page.getByTestId('status')).toHaveText('Ready', {
  signal: controller.signal,
});
```

The signal runs alongside the timeout. A signal leaves the default timeout in place;
pass `timeout: 0` to lean on the signal alone.

## Also in 1.62

Screenshots gain WebP. `expect(page).toHaveScreenshot()` and the locator variant store
their snapshots in WebP, and `page.screenshot()` and `locator.screenshot()` accept
`webp` as a `type`. Quality `100`, the default, stays lossless; a lower value switches
to lossy compression and a smaller file for the snapshots you keep in the repo.

Reporters gain a filtering hook. `reporter.preprocess()` runs after Playwright resolves
the config and lets a reporter mark individual tests skipped, excluded, fixed, or failing
before the run starts, so a reporter that reads flake history can quarantine a test
without a config edit.

Retries gain a strategy. `testConfig.retryStrategy` defaults to `'immediate'`, which
retries a failed test as soon as a worker frees up. Set it to `'isolated'` and Playwright
holds every retry to the end and runs them in a single worker, away from the parallel
load that a resource-contention flake needs to reproduce.

The bundled browsers move to Chromium 151, Firefox 153, and WebKit 26.5, and Debian 11
drops off the support list.

> You test a component by serving a page and driving it, the same way you drive any
> other page in the suite.

If your suite ran the experimental CT packages, 1.62 is the migration: write the gallery
route, move each mounted component into a story, and point `mount()` at the id.
