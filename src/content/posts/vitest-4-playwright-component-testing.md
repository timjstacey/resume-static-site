---
title: Vitest 4 made Playwright component testing the wrong default
date: 2026-06-30
tag: Strategy
excerpt: 'Vitest 4.0 took Browser Mode stable and runs it on a Playwright provider, so the experimental Playwright component-testing package is the wrong default on a Vitest codebase.'
readMins: 4
hashtags: [Vitest, ComponentTesting, Playwright, TestAutomation, FrontendTesting]
preview:
  - ['$', 'cat vitest-4-playwright-component-testing.md']
  - ['#', '# Vitest 4 and Playwright component tests']
  - [' ', '']
  - [' ', 'You install the experimental Playwright']
  - [' ', 'package to test a component in a real']
  - [' ', 'browser. The name still says experimental.']
  - [' ', '']
  - [' ', 'Vitest 4.0 took Browser Mode stable, and']
  - [' ', 'it drives the browser through Playwright']
  - [' ', 'anyway. Same engine, one runner.']
linkedinPost: |
  Vitest 4.0 changed the default answer for testing a component in a real browser, and most teams have not noticed.

  The reflex is to install @playwright/experimental-ct-react, stand up a second runner, and mount your component in Chromium. Read the package name. It still ships as experimental, years after release.

  Vitest 4.0 took Browser Mode stable on October 22, 2025, with built-in visual regression and Playwright trace files. Browser Mode runs on a browser-automation provider, and that provider is Playwright or WebdriverIO. So a Vitest browser test runs in the same real Chromium, Firefox, or WebKit a Playwright component test would. You keep Playwright's engine and locators and drop the second runner.

  The architectures split on where the test runs. A Playwright component test runs in Node while the component renders in the browser, two processes with no shared memory, so Playwright serializes the JSX and rebuilds the tree on the page. Vitest Browser Mode runs the test inside the browser, so render() works the way it does in your app, with no marshalling step.

  The real browser costs time, about two to four times slower than jsdom per test. So keep pure logic in fast node tests and move the visual and interaction checks to Browser Mode.

  None of this retires Playwright. The framework still owns end-to-end testing. For the component layer on a Vitest codebase, Browser Mode is the default and the experimental package is a detour.

  Read the full write-up: https://tim.sillysamoyed.com/blog/vitest-4-playwright-component-testing

  #Vitest #ComponentTesting #Playwright #TestAutomation #FrontendTesting
---

```tsx title="counter.test.tsx"
import { render } from 'vitest-browser-react';
import { expect, test } from 'vitest';
import { Counter } from './Counter';

// Runs inside real Chromium. render() works because the test runs in the browser.
test('increments on click', async () => {
  const screen = render(<Counter />);
  await screen.getByRole('button', { name: 'Add' }).click();
  await expect.element(screen.getByRole('status')).toHaveText('1');
});
```

Teams reach for `@playwright/experimental-ct-react` when they want a component in a real browser instead of jsdom. Read the package name: it ships as experimental, years after release. Vitest 4.0 changed that. Browser Mode went stable in October, it runs on a Playwright provider, and it renders your component with the same `render()` call your app uses.

## Vitest 4.0 dropped the experimental tag

Vitest 4.0 [shipped on October 22, 2025](https://vitest.dev/blog/vitest-4) and took Browser Mode out of experimental. The release graduates it to stable, adds built-in visual regression that screenshots a component and diffs it against a baseline, and wires in Playwright trace files you open in the Trace Viewer. [InfoQ records the same three changes](https://www.infoq.com/news/2025/12/vitest-4-browser-mode/). The warning label that kept teams from betting a suite on Browser Mode is gone, and the tool's reach grew alongside it: [VoidZero reports](https://voidzero.dev/posts/announcing-vitest-4) Vitest weekly downloads climbed from about 7 million to 17 million in the year before the release.

## Playwright drives the browser for both

Browser Mode runs on top of Playwright rather than replacing it. Vitest asks you to pick a [browser-automation provider](https://vitest.dev/config/browser/playwright), Playwright or WebdriverIO, and that provider launches real Chromium, Firefox, or WebKit. A Browser Mode test runs in the same engine a Playwright component test would. You keep Playwright's browser and its locators. You drop the second runner, the second config file, and the experimental package you installed to reach them.

## Playwright CT pays a serialization tax

The two tools render a component in different places. A Playwright component test runs in Node while the component renders in the browser, two processes that share no memory. [Artem Zakharchenko walks the gap](https://www.epicweb.dev/vitest-browser-mode-vs-playwright): Playwright cannot call react-dom's `render()` across that boundary, so it serializes the JSX from your test, ships it to the page, and reconstructs the component tree on the other side.

```tsx title="counter.spec.tsx"
import { test, expect } from '@playwright/experimental-ct-react';
import { Counter } from './Counter';

// The test runs in Node. Playwright serializes <Counter /> and rebuilds it in the page.
test('increments on click', async ({ mount }) => {
  const component = await mount(<Counter />);
  await component.getByRole('button', { name: 'Add' }).click();
  await expect(component.getByRole('status')).toHaveText('1');
});
```

Vitest Browser Mode runs the test inside the browser, so `render()` works the way it does in your app. You import the component, render it, query it with real locators, and assert, with no marshalling step in the middle. Kent C. Dodds, who wrote React Testing Library, [said he has never been so happy](https://www.epicweb.dev/vitest-browser-mode-vs-playwright) to see people uninstall it for the native Browser Mode flow.

## Keep the slice the browser earns

The real browser costs time. Component tests in a browser run [about two to four times slower](https://www.pkgpulse.com/blog/vitest-browser-mode-vs-playwright-component-testing-vs-2026) than the same tests in jsdom, because the browser lays out, paints, and runs a full JS engine that jsdom skips. So the browser earns its slot where jsdom lies: focus management, CSS transitions, IntersectionObserver, an element's real `getBoundingClientRect`. Keep pure logic, reducers, formatters, and validators in fast node tests. Move the visual and interaction checks to Browser Mode, where a real layout makes the assertion mean something. The same comparison clocks Vitest Browser Mode several times faster than Playwright CT on an equal test count, so you gain speed on top of the simpler setup.

> Browser Mode and Playwright CT run in the same engines. One keeps your runner and your `render()`; the other adds a process boundary and an experimental tag. On a Vitest codebase, pick the first.

## Playwright keeps the job it owns

None of this retires Playwright. The framework still owns end-to-end testing, the critical journeys that cross pages and hit a real backend, and Browser Mode leaves that work alone. The argument is narrow: for the component layer on a codebase that already runs Vitest, Browser Mode is the default and the experimental CT package is a detour. This site runs that split today, Vitest 4 for units and component checks, Playwright for the journeys. Audit your own setup. If you installed `@playwright/experimental-ct-react` to get a component into a browser, Vitest 4.0 hands you the same browser through a runner you already have.
