# Research: Playwright Strict Mode Flags Your Ambiguous Locator. Silencing It Ships the Bug.

**Date range:** 2026-06-30 to 2026-07-28

## Summary

Tier 1 (Playwright) and Tier 2 (k6) release checks: latest stable Playwright is
~1.62 (already in ledger, 2026-07-26) and latest k6 is 2.1.0 (already in ledger,
2026-07-02). No fresh, unposted release within the 4-week gate. Dropped to Tier 3
(docs deep-dive). Last-three archetypes excluded: Playbook, Teardown, News/launch.
Chose Failure mode.

Angle: a documented Playwright failure mode. Locators are **strict** by default —
any operation that implies a single DOM target throws if the locator matches more
than one element ("strict mode violation: ... resolved to N elements"). The failure
teams hit is not the violation itself; it is the reflex fix. Slapping `.first()`
(or `.nth()`) onto the locator opts out of the strictness check and makes the test
click whichever element happens to be first. The test goes green while acting on
the wrong element — the exact silent wrong-target bug that strict mode existed to
catch. This is the legacy `page.$` / ElementHandle behavior (return the first match,
no check) sneaking back in through an escape hatch.

Key documented facts:

- Locators are strict; operations implying a single target throw on multiple matches.
  Error string form: `strict mode violation: getByRole('button', { name: 'Delete' })
resolved to 3 elements`. (playwright.dev/docs/locators)
- Opt out explicitly with `locator.first()`, `locator.last()`, `locator.nth()`.
  These pick by position and are order-dependent. (playwright.dev/docs/locators)
- Recommended fix is to narrow by meaning: chain `getByRole`/`getByText` to scope to
  a region, or `locator.filter({ hasText })` / `has` / `hasNot` to pick the right one
  by content. Keep `nth()` for cases where position is the thing under test (top row
  of a sorted table). (playwright.dev/docs/locators)
- Legacy `page.$` / ElementHandle returns the first match with no strictness check —
  discouraged in favor of locators. (playwright.dev/docs/other-locators)
- Even codegen can emit a locator that violates strict mode when the page has repeated
  structure — the ambiguity is in the DOM, not the author. (github issue #30191)

## Sources

- https://playwright.dev/docs/locators
- https://playwright.dev/docs/other-locators
- https://github.com/microsoft/playwright/issues/30191
