---
title: Stop seeding your Playwright suite from the login form
date: 2026-06-18
tag: Practice
excerpt: 'Drive the login form to seed every test and one selector change reddens the whole suite. Authenticate through the API and keep one test on the form.'
readMins: 5
hashtags: [Playwright, TestAutomation, APITesting, CICD, QA]
preview:
  - ['$', 'cat stop-seeding-from-the-login-form.md']
  - ['#', '# Stop seeding from the login form']
  - [' ', '']
  - [' ', 'Drive the form to seed every test and one']
  - [' ', 'selector change turns a hundred tests red.']
  - [' ', '']
  - [' ', 'Write one test for the form. Authenticate']
  - [' ', 'the rest through the API, save the session,']
  - [' ', 'and reuse it across the suite.']
---

```ts title="auth.setup.ts"
// Log in once over HTTP, save the session, let every test reuse it.
const ctx = await request.newContext();
await ctx.post('/api/login', { data: credentials });
await ctx.storageState({ path: 'playwright/.auth/user.json' });
```

Seed every test by driving the login form and you hand one form veto power over the whole suite. A selector moves, the form breaks, and a hundred tests that never touch login go red beside it. The signal you needed, the login form broke, sits buried under ninety-nine failures that have nothing to report.

## One form should not redden the whole suite

Routing the session for every test through one form makes that form a single point of failure for tests that check the cart, the dashboard, the settings page. A layout change on the login screen now fails the checkout test, and the dashboard test, and every other test that asked the form for a session it never cared about.

The red suite conflates two questions. Does the login form render and submit. Does an authenticated session exist. Split them and each failure points at one thing. Keep them fused and you read a wall of red to find the one test that meant it.

## Keep one test on the form, authenticate the rest by API

Write one dedicated test that drives the login form, submits credentials, and asserts a session starts. That test owns the question of whether login works. When the form breaks, it goes red on its own and names the cause.

Authenticate everything else over HTTP. [Playwright's authentication guide](https://playwright.dev/docs/auth) recommends API auth when your app supports a login endpoint that runs faster than clicking through the UI. A setup fixture posts the credentials, then calls [`request.storageState()`](https://playwright.dev/docs/api/class-apirequestcontext) to serialize the cookies and origin storage into the same file format a browser context loads. Playwright ships [`APIRequestContext`](https://playwright.dev/docs/api-testing) for this, an HTTP client that runs in the same file, runner, and reporter as the browser tests, so the login call sits next to the test that needs it with no second CI job.

Apps that authenticate through SSO, a third-party identity provider, captcha, or MFA expose no login API to call. Keep the UI login as the setup step there. The doc frames API auth as the better path when an endpoint exists, not a rule that fits every app.

## Authenticate once, reuse the saved state

The save-and-reuse is the payoff. Log in a single time, write the session to `playwright/.auth`, and point every project at it:

```ts title="playwright.config.ts"
export default defineConfig({
  projects: [
    { name: 'setup', testMatch: /auth\.setup\.ts/ },
    {
      name: 'chromium',
      dependencies: ['setup'],
      use: { storageState: 'playwright/.auth/user.json' },
    },
  ],
});
```

Every browser test loads that state and skips the form. The auth guide measures the win as fewer logins and faster runs, since no test pays the cost of clicking through a form it does not test.

Add `.auth` to `.gitignore`. The session file holds live cookies an attacker can replay to impersonate the account, which is why the doc discourages checking it into a repo. State also expires, so delete it on a schedule or write it to the project output directory and let Playwright clean it up.

> A blind UI login couples every test to the form. An API login frees them. The first reddens the suite on a selector change; the second reddens one test and tells you which.

## One account per worker when tests write shared state

Go past a single shared session once your tests mutate server state. Build a [factory fixture](https://playwright.dev/docs/test-fixtures), `createUser({ balance: 5000 })`, that registers a fresh user per worker through the API and returns it funded. One composable call beats a drawer of fixtures named `testUser`, `testUserWithMoney`, and `testUserWithMoneyAndKyc`. Pass the state as arguments, not baked into the fixture name.

Scope this to suites that need it. One test renders the settings page while another flips that setting in parallel, and they collide on shared rows. Per-worker accounts keep them apart, each worker keyed by `parallelIndex`. Read-only suites that touch no shared state can share a single account and skip the machinery.

```ts title="fixtures.ts"
export const test = base.extend<{ createUser: CreateUser }>({
  createUser: async ({ request }, use) => {
    const created: User[] = [];
    await use(async (opts) => {
      const user = await register(request, opts);
      created.push(user);
      return user;
    });
    for (const user of created) await remove(request, user); // teardown
  },
});
```

## Watch the scope inside a worker

A worker-scoped fixture isolates one worker from the others. It does not isolate the tests inside a worker from each other. Tests in one worker run in order against the same user, so a test that spends the balance starves the next one that expects it funded.

Use test scope when a flow mutates state a later test reads. Either way, tear down the users you create, or the test database fills with dead registrations that slow every later run. The factory above pushes each created user onto a list and deletes them after the suite, so the database ends where it started.

## Start with the next red suite

The next time one form change reddens forty tests, count how many of them check login. One. Move that one to its own test, point the rest at an API login, and save the session once. The suite still goes red when login breaks. The difference is it goes red in one place and names the thing that broke.
