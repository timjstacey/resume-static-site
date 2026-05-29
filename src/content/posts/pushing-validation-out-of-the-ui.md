---
title: Pushing validation out of the UI
date: 2026-05-24
tag: Strategy
excerpt: Most E2E suites I review are a contract test in a trench coat. Four checks earn a real browser run.
readMins: 6
preview:
  - ['$', 'cat pushing-validation.md']
  - ['#', '# Pushing validation out of the UI']
  - [' ', '']
  - [' ', 'Most E2E suites I review are a contract']
  - [' ', 'test in a trench coat. Slow, flaky,']
  - [' ', 'expensive — and 90% of the assertions']
  - [' ', 'could live happily in the API layer.']
  - [' ', '']
  - [' ', 'There are four checks I will defend']
  - [' ', 'in a real browser, and a much larger']
  - [' ', 'set I push down the stack...']
---

Most E2E suites I review are a contract test in a trench coat. Slow, flaky,
expensive — and 90% of the assertions could live happily in the API layer.

There are four checks I will defend in a real browser, and a much larger set I
push down the stack. This post is about telling them apart.
