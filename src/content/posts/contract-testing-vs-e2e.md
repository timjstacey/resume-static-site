---
title: Contract tests on every edge, E2E for the paths that earn it
date: 2026-06-01
tag: Strategy
excerpt: 'A renamed field breaks two services. A contract test catches it in three seconds; the E2E suite takes twenty minutes and a six-service environment.'
readMins: 3
hashtags: [ContractTesting, Microservices, APITesting, TestAutomation, CICD]
preview:
  - ['$', 'cat contract-testing-vs-e2e.md']
  - ['#', '# Where integration bugs belong']
  - [' ', '']
  - [' ', 'A provider renames a field. The E2E']
  - [' ', 'suite catches it 20 minutes later,']
  - [' ', 'after booting six services.']
  - [' ', '']
  - [' ', 'A contract test catches the same break']
  - [' ', 'in three seconds, before the PR merges.']
---

```ts title="orders.contract.spec.ts"
// Consumer: the checkout service records what it depends on.
pact
  .given('an account exists')
  .uponReceiving('a request for the account')
  .withRequest({ method: 'GET', path: '/accounts/42' })
  .willRespondWith({
    status: 200,
    body: { accountId: '42', balance: 1200 }, // provider renamed userId -> accountId
  });
```

Two services trade JSON. The provider renames a field from `userId` to `accountId`, ships it, and moves on. Your end-to-end suite catches the break twenty minutes later, after it boots six services into a shared environment. A contract test catches the same break in three seconds, before the pull request merges. Both prove the two services still agree. They charge different prices for the proof.

## One boundary, no shared environment

A contract test checks a single edge. The consumer records the requests it sends and the responses it leans on, and the provider replays those expectations against its own build to show it still satisfies them. [Pact](https://docs.pact.io/) drives this consumer-driven flow: the consumer publishes a contract, the provider verifies against it in isolation, and a broker tracks which versions agree. Each side runs alone, so there is no shared environment to drift or flake. [Gravitee's teardown](https://www.gravitee.io/blog/contract-testing-microservices-strategy) reports these runs finishing in seconds, which lets you drop the check straight into the pull request pipeline.

## The full journey costs minutes

End-to-end testing deploys the whole stack and walks a real user path: mobile app, API gateway, ride-matching service, notification service, and back to the screen. It catches the system-wiring bugs that no pairwise contract sees, the failures that surface when service A's real output meets service B's real input in a live environment. [totalshiftleft's E2E breakdown](https://totalshiftleft.ai/blog/end-to-end-testing-strategies-microservices) puts those suites at fifteen to thirty minutes against a production-like environment, where network timing and dependency drift turn a green run red without anyone touching the code.

## The trade you are making

[Discover's engineering team frames the split](https://technology.discover.com/posts/end-to-end-contract-testing): a contract test covers a boundary and never confirms the whole path works, while E2E confirms the path and bills you the runtime plus an environment to keep alive. Teams that move boundary checks off the E2E suite and onto contracts report integration runtime falling from fifteen-to-twenty minutes to two-to-three, per [totalshiftleft's contract guide](https://totalshiftleft.ai/blog/contract-testing-for-microservices). The faster feedback lands where an engineer can act on it: inside the PR, against one service, with one log to read.

## Where each check belongs

Put a contract test on each service-to-service edge and run it in the pull request pipeline. A provider that breaks the agreement then fails its own build before the change reaches deploy, and the engineer who renamed the field reads the failure with the diff still open. [appetizers' field notes](https://appetizers.io/en/blog/contract-testing-microservices/) and [ContextQA's primer](https://contextqa.com/blog/what-is-contract-testing-api-microservices/) both land on the same placement: contracts gate the merge, because that is where a broken boundary is cheapest to fix.

Reserve E2E for the handful of journeys where revenue depends on the full chain holding. Sign-up, checkout, payment confirmation: walk those end to end on a schedule and before a release, where the cost of a missed system-wiring bug dwarfs the cost of the slow run.

> Run a broad E2E suite on every commit and you buy two things you do not want: slow feedback, and flake your team learns to ignore. A test people skim past stops catching anything.

## Let the traffic write the baseline

Writing a contract by hand for every edge stalls when a service already has forty consumers. [Signadot's SmartTests](https://www.signadot.com/articles/stop-breaking-your-microservices-with-smarttests-ai-powered-contract-testing/) generate the baseline from real request traffic and flag a breaking change before the PR merges, which closes the gap for teams that never wrote the contracts up front. You still own the call on which edges matter, but you start from what the services actually send each other rather than a blank file.

I first wrote this up [on LinkedIn](https://www.linkedin.com/feed/update/urn:li:share:7467034691959951360).
