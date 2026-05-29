---
title: Hooks, not heroes
date: 2026-05-11
tag: Practice
excerpt: 'Pre-commit, pre-push, pre-merge: a cheap ladder of checks that got the on-call pager off the team.'
readMins: 4
preview:
  - ['$', 'cat hooks-not-heroes.md']
  - ['#', '# Hooks, not heroes']
  - [' ', '']
  - [' ', 'The cheapest test is the one that']
  - [' ', 'runs before you push. The next-cheapest']
  - [' ', 'runs before review. After that, costs']
  - [' ', 'go up fast.']
  - [' ', '']
  - [' ', 'Three pre-commit checks bought us back']
  - [' ', 'the on-call pager — here is the ladder...']
---

The cheapest test is the one that runs before you push. The next-cheapest runs
before review. After that, costs go up fast.

Three pre-commit checks bought us back the on-call pager. Here is the ladder, in
order of how much it saved.
