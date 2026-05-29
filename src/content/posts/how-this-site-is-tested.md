---
title: How this site is tested
date: 2026-05-02
tag: Meta
excerpt: Two-layer suite, route-aware fixtures, one Playwright config per environment. The test setup behind sillysamoyed.com.
readMins: 5
preview:
  - ['$', 'cat how-this-site-is-tested.md']
  - ['#', '# How this site is tested']
  - [' ', '']
  - [' ', 'Two layers gate every merge:']
  - [' ', '']
  - [' ', '  43 unit specs · vitest']
  - [' ', ' 122 e2e flows · playwright × 3 engines']
  - [' ', '']
  - [' ', 'Route-aware fixtures keep navigation']
  - [' ', 'honest. One config per environment.']
---

Two layers gate every merge: 43 unit specs in vitest, 122 end-to-end flows in
Playwright across three engines.

Route-aware fixtures keep navigation honest, and one config per environment
means the preview deploy is what actually gets tested.
