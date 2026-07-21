---
title: Stop Your Playwright Tests From Waiting Out the Clock
date: 2026-07-21
tag: Practice
excerpt: 'A test that sleeps through a 30-minute session timeout burns half an hour; install Playwright fake clock and fast-forward past every timer your UI waits on.'
readMins: 5
hashtags: [Playwright, TestAutomation, E2ETesting, QA]
preview:
  - ['$', 'cat playwright-clock-control.md']
  - ['#', '# Stop waiting out the clock']
  - [' ', '']
  - [' ', 'Your app warns at 25 minutes idle and signs']
  - [' ', 'the user out at 30. To test that, you sleep']
  - [' ', 'for a real half hour or you fake the clock.']
  - [' ', '']
  - [' ', 'Install Playwright fake timers, jump forward,']
  - [' ', 'and the run finishes in milliseconds.']
linkedinPost: |
  Your app warns the user at 25 minutes idle and signs them out at 30. To prove that in an end-to-end test, you have two honest options: sleep for a real half hour, or fake the clock.

  Playwright ships a Clock API that takes the browser's sense of time off the wall clock and hands it to your test. It covers Date, Date.now(), setTimeout, setInterval, requestAnimationFrame, and performance.now. You jump to 25 minutes, assert the warning banner, jump five more, assert the sign-out redirect. The run finishes in milliseconds and reads the same on every pass.

  Four moves cover most time-dependent UI:

  1. install() freezes time where you set it and replaces the timer environment. Call it before page.goto so timers scheduled during load read the fake clock.
  2. fastForward('30:00') jumps to an offset and fires the timers that came due, skipping the frames between. Use it for a debounce or a session timeout.
  3. runFor(3000) ticks time forward firing each timer along the way. Use it for a per-second countdown or a poller.
  4. setFixedTime() freezes only what Date.now() returns while timers keep running. Use it for a "posted 2 hours ago" label or a date picker that opens on today.

  Start with the sleeps you already have. Search your suite for waitForTimeout. Each call that exists to wait out a debounce, a poll, or a timeout becomes a fastForward of the same span, and the test asserts the same thing without the wait.

  Link in the first comment.

  #Playwright #TestAutomation #E2ETesting #QA
---

```ts title="session-timeout.spec.ts"
// Warn at 25 minutes, sign the user out at 30. This test proves
// both without the runner sleeping for a real half hour.
await page.clock.install({ time: new Date('2026-07-21T09:00:00') });
await page.goto('/dashboard');

await page.clock.fastForward('25:00');
await expect(page.getByRole('alert')).toHaveText(/session expires soon/i);

await page.clock.fastForward('05:00');
await expect(page).toHaveURL('/login');
```

Your app warns the user at 25 minutes idle and signs them out at 30. To prove that in a test, you have two honest options: sleep for a real half hour, or fake the clock. Call `page.waitForTimeout('25:00')` and the runner sits idle while the wall clock ticks, then does the same on every run. Playwright's [Clock API](https://playwright.dev/docs/clock) lets your test take the browser's sense of time off the wall clock. You jump forward to 25 minutes, assert the banner, jump five more, assert the redirect. The run finishes in milliseconds.

The clock covers `Date`, `Date.now()`, `setTimeout`, `setInterval`, `requestAnimationFrame`, and `performance.now`. Anything your UI schedules against time comes under the test's control.

## Install the clock before the page loads

`install` replaces the timer environment and freezes time where you set it. Nothing moves until your test advances it, so a `setTimeout` due after 30 seconds stays pending until you fast-forward past 30 seconds.

Two ordering rules keep it working. Call `install` before any other clock method: the [docs warn](https://playwright.dev/docs/clock) that a later `install` produces undefined behaviour. And call it before `page.goto`, so timers the page schedules during load read the fake clock from the first tick instead of the real one.

```ts title="install-first.spec.ts"
await page.clock.install({ time: new Date('2026-07-21T09:00:00') });
await page.goto('/dashboard'); // load-time timers are faked from here
```

Pass a fixed `time` so the test starts from a date you chose. A test that reads today's real date passes in July and fails on a leap day. A pinned start date reads the same every run.

## Fast-forward past a wait, tick through an interval

Two methods move time, and they fire timers in two ways.

`fastForward` jumps. Give it `'30:00'` or a millisecond count and it lands at that offset, firing every timer that came due on the way and skipping the animation frames between. Reach for it when one delayed thing has to happen: a debounced search that fires 300ms after the last keystroke, or the session timeout above.

```ts title="debounced-search.spec.ts"
await page.getByRole('searchbox').fill('play');
await page.clock.fastForward(300); // clear the debounce
await expect(page.getByRole('listitem')).toHaveCount(3);
```

`runFor` ticks. It advances time firing each timer in sequence, so a `setInterval` that polls every second runs once per second across the span you give it. Use it when the steps between matter, like a countdown that repaints each second or a poller you want to fire a known number of times. The [API reference](https://playwright.dev/docs/api/class-clock) splits the two along this line: `fastForward` skips to the end and fires what came due, `runFor` walks every interval on the way.

```ts title="countdown.spec.ts"
await page.clock.runFor(3000); // three ticks of a per-second timer
await expect(page.getByTestId('countdown')).toHaveText('00:27');
```

## Fix the time when only the date has to read right

Some UI reads the clock without scheduling anything against it. A "posted 2 hours ago" label, or a date picker that opens on today. These need `Date.now()` to return a chosen value and nothing more.

`setFixedTime` does that alone. It freezes what `Date.now()` and `new Date()` return while leaving `setTimeout` and `setInterval` running in real time. No install, no fast-forward.

```ts title="relative-time.spec.ts"
await page.clock.setFixedTime(new Date('2026-07-21T12:00:00'));
await page.goto('/post/42');
await expect(page.getByTestId('published')).toHaveText('2 hours ago');
```

> `setFixedTime` fixes what the clock reads. `install` replaces the whole timer environment. Reach for the first when a rendered date has to stay stable, the second when a timer has to fire on your command.

Picking the heavier tool by default costs you nothing in correctness. Choosing `setFixedTime` keeps a date-only test to one line and signals what the test depends on.

## Pause on a boundary and step across it

Some assertions live on an edge: midnight rollover flipping a "today" filter, or a countdown reaching zero. `pauseAt` fast-forwards to a moment and holds there, so you assert the state at the boundary before anything past it fires.

```ts title="midnight-rollover.spec.ts"
await page.clock.install({ time: new Date('2026-07-21T23:59:50') });
await page.goto('/agenda');
await page.clock.pauseAt(new Date('2026-07-22T00:00:00'));
await expect(page.getByRole('heading', { level: 1 })).toHaveText('Wed, 22 Jul');
```

From the pause, `runFor` steps across the edge in controlled ticks, and `resume` hands time back to the natural flow when the test no longer needs to hold it. You assert the before, cross the line, assert the after, all inside one run that never waited.

## Start with the sleeps you already have

Search your suite for `waitForTimeout`. Each call that exists to wait out a debounce, a poll, or a timeout is a candidate: install the clock, swap the sleep for a `fastForward` of the same span, and the test asserts the same thing without the wait. The ones you keep are the deliberate pauses for something outside your own timers. The rest, the clock handles, and it handles them the same on every run.
