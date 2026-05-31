---
title: Playwright agents and the new QA skills gap
date: 2026-05-10
tag: Tools
excerpt: 'Playwright v1.56 put a Planner, Generator, and Healer in the test runner. The interesting part is what it asks of the engineers who own the suite.'
readMins: 6
hashtags: [Playwright, SoftwareTesting, AI, TestAutomation, QualityAssurance]
preview:
  - ['$', 'cat playwright-ai-agents-2025.md']
  - ['#', '# Playwright agents and the new QA skills gap']
  - [' ', '']
  - [' ', 'Playwright v1.56 put a Planner, Generator,']
  - [' ', 'and Healer inside the test runner. The']
  - [' ', 'suite writes and repairs itself without a']
  - [' ', 'human trigger.']
  - [' ', '']
  - [' ', 'The agents are the headline. Playwright MCP,']
  - [' ', 'the protocol under them, is the part to']
  - [' ', 'watch...']
---

Playwright v1.56 shipped in October 2025 with three AI agents inside the test
runner. The Planner explores your app and writes a Markdown test plan, the
Generator turns that plan into code, and the Healer finds broken tests and
repairs them. Chain them together and the suite writes and repairs itself
without a human trigger.

## The loop in practice

The Generator emits cleaner output than most people picture. It leans on
role-based locators and Playwright's web-first assertions, the same patterns a
careful engineer reaches for. A generated checkout test reads close to one you
would write by hand:

```ts title="checkout.spec.ts"
import { test, expect } from '@playwright/test';

test('rejects an expired card at checkout', async ({ page }) => {
  await page.goto('/checkout');
  await page.getByRole('textbox', { name: 'Card number' }).fill('4000000000000069');
  await page.getByRole('button', { name: 'Pay now' }).click();

  await expect(page.getByRole('alert')).toHaveText(/card has expired/i);
});
```

One documented run generated 67 scenarios and a passing end-to-end suite for an
e-commerce app on its own, per
[a 1.56 walkthrough](https://skakarh.medium.com/playwright-agents-in-1-56-8127ac936f15).
The agents run inside Claude Code, VS Code Copilot, and Cursor, so the test code
shows up where you already work, per
[Awesome Testing's breakdown](https://www.awesome-testing.com/2025/10/playwright-agents).

## MCP is the part to watch

Most of the noise lands on test generation. The deeper change arrived in March
2025 with Playwright MCP, a protocol that lets an LLM drive the browser through
the accessibility tree rather than pixels. You point a model at the server and
describe intent in plain language, and it reads the live page structure to write
locators that match what users interact with. Wiring it into an editor takes a
few lines:

```json title=".vscode/mcp.json" showLineNumbers
{
  "servers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    }
  }
}
```

That config is the whole integration. Claude or Copilot connects to the server,
opens a real browser, and works from the accessibility snapshot. GitHub
Copilot's Coding Agent and Azure App Testing both speak the protocol now, per
[Microsoft's end-to-end writeup](https://developer.microsoft.com/blog/the-complete-playwright-end-to-end-story-tools-ai-and-real-world-workflows).
The standard matters more than any single agent, because it sets how AI
tools reach a browser. For a deeper tour,
[this MCP guide](https://medium.com/@bluudit/playwright-mcp-comprehensive-guide-to-ai-powered-browser-automation-in-2025-712c9fd6cffa)
walks the internals.

## The Healer changes the maintenance math

Locator drift is the tax on a maturing UI suite. Someone renames a button,
twelve tests fail, and an engineer spends an afternoon chasing selectors. The
Healer runs the failing test, reads the accessibility snapshot, decides whether
the locator went stale or the app changed under it, and patches the test when
the fault is the locator. The repair lands before CI reports red.

> A passing suite used to prove the locators were current. Now it proves an
> agent kept them current. Your review process should know which guarantee it
> trusts.

## What this asks of QA engineers

Teams on those tools start to expect their QA engineers to judge a Healer's
patch and tune the prompts that drive generation. That means reading LLM
function calls and understanding how MCP brokers a browser session, on top of
the testing fundamentals.
[Katalon's 2025 survey](https://katalon.com/resources-center/blog/test-automation-statistics-for-2025)
of 1,400 QA professionals found 82% still run manual tests daily, so the old
skills have not gone anywhere. The new ones stack on top.

## Where humans still own the call

An agent generates a checkout test in seconds. Deciding what a correct checkout
looks like still takes a person who knows the business rule. The Generator
asserts what the page shows. It cannot tell you whether a £0.00 total is a valid
free order or a pricing bug, because that answer lives in your domain, not the
DOM. [Testlio's 2025 report](https://testlio.com/blog/test-automation-statistics)
found nearly half of teams have moved most manual testing to automation, which
frees those people for the judgment calls the agents cannot make.

Point the agents at your app and they will draft a suite by morning. You still
decide what earns a slot in CI, and what a green run is allowed to mean.
