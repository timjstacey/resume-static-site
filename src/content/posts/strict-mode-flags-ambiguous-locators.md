---
title: Playwright Strict Mode Flags Your Ambiguous Locator. Silencing It Ships the Bug.
date: 2026-07-28
tag: Practice
excerpt: 'A strict mode violation means your locator matches two elements. Adding .first() picks one by DOM order and hides the wrong-element click Playwright caught.'
readMins: 4
hashtags: [Playwright, TestAutomation, E2ETesting, QA]
preview:
  - ['$', 'cat strict-mode-flags-ambiguous-locators.md']
  - ['#', '# When strict mode throws']
  - [' ', '']
  - [' ', 'A test clicked one Delete button for']
  - [' ', 'months. A second row shipped, and now']
  - [' ', 'Playwright throws: resolved to 2 elements.']
  - [' ', '']
  - [' ', 'The reflex fix is .first(). It answers']
  - [' ', 'the question with a coin flip.']
linkedinPost: |
  A Playwright test clicked one Delete button for months. A second row shipped, and the test started failing with strict mode violation: resolved to 2 elements.

  The error is Playwright refusing to guess. Locators are strict: any action that needs one element throws when the locator matches more than one. The test caught a real ambiguity before it clicked the wrong button.

  The quick fix is to add .first(). It makes the error go away and picks whichever element sits first in the DOM. Your build goes green while the click lands on whatever renders first, which is the silent wrong-target bug strict mode existed to catch. It is the old page.$ behavior sneaking back through an escape hatch.

  Narrow by meaning instead. Scope with a chained getByRole so the Delete button resolves inside one row, or use filter with hasText to pick the row by its content. The locator then names which button you mean, and it survives a third row landing on the page.

  Keep nth() for the case where position is the thing under test, like the top row of a sorted table. Everywhere else, a strict mode violation is a failing test doing its job.

  Link in the first comment.

  #Playwright #TestAutomation #E2ETesting #QA
---

```ts title="delete-row.spec.ts"
// Green for months, one Delete button on the page.
await page.getByRole('button', { name: 'Delete' }).click();

// A second row ships. Same line, now:
// Error: strict mode violation: getByRole('button', { name: 'Delete' })
//   resolved to 2 elements
```

A test clicked the Delete button for months. Someone shipped a second row, a second Delete button rendered, and the same line that passed all along started throwing `strict mode violation`. Nothing about the assertion changed. The page changed under it.

The [Playwright docs](https://playwright.dev/docs/locators) describe the rule behind the error: locators are strict, so any operation that acts on a single DOM element throws when the locator matches more than one. The message names your locator and the count it resolved to. Playwright is refusing to guess which of the two Delete buttons you meant.

## The violation is the test working

The error is a finding. Read it that way. Before the second row existed, the locator was ambiguous in waiting: it described "the Delete button" on a page the author assumed held one. Strict mode checks that assumption the moment a second match appears. The alternative is a click that lands on whichever button the browser found first, and a green build that tells you nothing about whether the right row got deleted.

That silent-first behavior is not hypothetical. It is how the older [`page.$` and ElementHandle API](https://playwright.dev/docs/other-locators) worked: hand it a selector that matches ten elements and it returns the first one, no complaint. Playwright discourages that API now, and strict locators are the reason. The check turns a wrong-element click into a failing test you can see.

## .first() answers the question with a coin flip

The quickest way to clear the error is to tell Playwright which match to take:

```ts title="delete-row.spec.ts"
// The error is gone. So is the guarantee.
await page.getByRole('button', { name: 'Delete' }).first().click();
```

`locator.first()`, `locator.last()`, and `locator.nth()` opt out of the strictness check by picking a match by position. The build goes green. The click now lands on whichever Delete button sits first in DOM order, which is a property of your markup, not your intent. Reorder the rows, virtualize the list, or let the sort default flip, and the test keeps passing while it deletes a row you never chose. You have reintroduced the exact `page.$` bug, one method call at a time.

The tell is that the locator still says "the Delete button" and the page still has several. You silenced the question instead of answering it.

## Narrow by meaning, not by index

Answer it by describing which button you want, the way a user would find it. Scope the locator to the row it belongs to, then the Delete button inside that row resolves to one element on its own:

```ts title="delete-row.spec.ts"
// Scope to the row, then the button is unambiguous inside it.
const row = page.getByRole('row').filter({ hasText: 'invoice-042' });
await row.getByRole('button', { name: 'Delete' }).click();
```

Two moves from the [locators docs](https://playwright.dev/docs/locators) cover most cases. Chain `getByRole` or `getByText` to narrow the search to one region of the page, so the inner locator only sees candidates inside that region. Or call `locator.filter({ hasText })` (and its siblings `has`, `hasNot`, `hasNotText`) to keep the one match that carries the right content. Both bind the locator to what distinguishes the target on the page, so a third row landing next sprint changes nothing.

> A strict mode violation is a locator that describes a category when your test means one instance. Name the instance and the violation goes away.

## Keep nth() for when position is the point

`nth()` earns its place when position is the thing under test. Asserting on the top result of a sorted table, `getByRole('row').nth(0)` is correct, because "the first row" is what you are checking, not an accident of markup you are working around. The rule is the meaning of the call: reach for an index when the index is the requirement, not when it is the fastest way to stop a red build.

You do not always author the ambiguity. Playwright's own codegen [emits locators that violate strict mode](https://github.com/microsoft/playwright/issues/30191) on pages with repeated structure, because the ambiguity lives in the DOM and the recorder cannot read which repeat you cared about. You can. When the generated line throws, that is the point to add the `filter` the recorder could not.

A strict mode violation is a failing test catching an ambiguous locator before it clicks the wrong thing. Treat it like any other real failure: fix what the locator means, and leave the coin flip out of your suite.
