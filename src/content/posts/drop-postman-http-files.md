---
title: Your API requests belong in Git, not Postman's cloud
date: 2026-06-24
tag: Tools
excerpt: 'A private Postman collection does two jobs badly. Send the quick check to cURL and a .http file, the endpoint tests to Playwright, and let git hold both.'
readMins: 4
hashtags: [APITesting, Playwright, DeveloperExperience, cURL, SoftwareDevelopment]
preview:
  - ['$', 'cat drop-postman-http-files.md']
  - ['#', '# Your API requests belong in Git']
  - [' ', '']
  - [' ', 'On many teams every developer keeps a']
  - [' ', 'private Postman collection. It never']
  - [' ', 'leaves their laptop, synced to their']
  - [' ', 'own account.']
  - [' ', '']
  - [' ', 'Send the quick check to cURL or a .http']
  - [' ', 'file. Send the endpoint tests to Playwright.']
linkedinUrl: https://www.linkedin.com/feed/update/urn:li:share:7475433282453659648
linkedinComment: >
  I expanded this into a full write-up, with the .http examples and the
  sources behind it: https://tim.sillysamoyed.com/blog/drop-postman-http-files
---

```http title="orders.http"
# Open in VS Code (REST Client) or any JetBrains IDE.
@base = https://api.example.com

GET {{base}}/orders
Authorization: Bearer {{TOKEN}}
```

On many teams every developer keeps a private Postman collection. It stays on their laptop, synced to their own account. The person beside you rebuilt the same login request last week, and you never saw it. The request that hits your own API lives in a vendor's workspace instead of the repo next to the code it calls.

## Postman carries two jobs at once

You reach for Postman to answer two questions that want different homes. The first: what does this response look like while I build a change. The second: does this endpoint still behave under CI. Postman straddles both and does each one worse than a tool aimed at it.

Split them and each one gets a better home. Send the exploratory poke to cURL or a checked-in `.http` file. Put the endpoint coverage in your test framework.

## Send the quick check to cURL or a .http file

cURL answers a one-off in a single line, no app and no login:

```bash title="poke.sh"
curl -s https://api.example.com/orders -H "Authorization: Bearer $TOKEN" | jq
```

When a request earns a second run, save it as a [`.http` file](https://testfully.io/blog/http-files/). The [JetBrains HTTP client](https://www.jetbrains.com/help/idea/http-client-in-product-code-editor.html) and the REST Client extension for VS Code read the same plain-text format, so the file works whichever editor a teammate opens. It sits in the repo beside the code it calls, rides the same pull request, and the whole team reads it. Rename an endpoint and the request edit lands in the same diff as the handler change.

## Send the tests to Playwright

A saved Postman request that one developer runs by hand guards nothing. It runs nowhere the week that developer takes leave. Move the endpoint coverage into [Playwright's `APIRequestContext`](https://playwright.dev/docs/api-testing), which runs your API checks in the same project, runner, and CI job as the browser tests:

```ts title="orders.spec.ts"
test('orders endpoint returns the open orders', async ({ request }) => {
  const res = await request.get('/api/orders', {
    headers: { Authorization: `Bearer ${token}` },
  });
  expect(res.status()).toBe(200);
  expect(await res.json()).toContainEqual(expect.objectContaining({ status: 'open' }));
});
```

It fails the build when the endpoint breaks, in front of the whole team, on every pull request. No one opens an app and remembers to click Send.

## Version control is the argument

> A `.http` file lives beside the code it calls and travels in the same pull request. The API examples version with the source instead of drifting in a shared workspace.

Postman keeps your collections in [its cloud sync](https://learning.postman.com/docs/getting-started/basics/syncing). Two teammates edit the same collection and Postman can overwrite one set of changes with the other, no warning; recovering the lost version means digging through history behind a paid tier. A clash in a checked-in `.http` file shows up as an ordinary git conflict your team already resolves ten times a day.

Postman's friction reaches past sync. [Developers leaving Postman](https://apidog.com/blog/postman-everything-app-strategy-why-developers-leaving/) point at the same list: the desktop app wants a login, the install runs near 900MB, and the offline Scratch Pad is gone. The free tier dropped to one user in 2026, so a second teammate forces a paid plan. A wave of [account-free clients](https://jonathansblog.co.uk/best-postman-alternatives-2026), Bruno and Hoppscotch and Yaak, points the same direction, toward local, file-based tools. cURL and a `.http` file get you there with nothing new to install.

## Start with your next request

The next time you reach for Postman, ask which job you are doing. Building a change, run cURL or save a `.http` file in the repo. Guarding the endpoint, write a Playwright test. Either way the request ends up in git, in review, and in front of the team. A private workspace one person syncs to a cloud account holds none of that.

I first shared this [on LinkedIn](https://www.linkedin.com/feed/update/urn:li:share:7475433282453659648).
