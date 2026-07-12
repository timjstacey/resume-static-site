---
title: Your Cucumber Suite Is a Test Script in a Plain-English Costume
date: 2026-07-13
tag: Strategy
excerpt: 'The value in BDD lives in the conversation before the code, not the .feature file; a Cucumber suite that skips that conversation becomes a brittle test script wearing plain English.'
readMins: 7
hashtags: [TestAutomation, BDD, Cucumber, SDET, QualityEngineering]
preview:
  - ['$', 'cat cucumber-test-script-costume.md']
  - ['#', '# BDD is good. Most suites use it badly.']
  - [' ', '']
  - [' ', "I've written Cucumber suites, inherited"]
  - [' ', 'them, and been asked to delete them.']
  - [' ', '']
  - [' ', 'Gherkin looks easy, so teams adopt the']
  - [' ', 'syntax and skip the point: the .feature']
  - [' ', 'file turns into a test script in costume.']
linkedinPost: |
  I've written Cucumber suites, inherited them, and been asked more than once to delete them. That left me with an opinion that annoys about half the room: BDD is a good idea, and the teams I've worked in kept implementing it badly.

  The pattern repeats. A team adopts the syntax and skips the point. Gherkin gets written by the automation team, after the code, with no product owner in the room. The feature files become test scripts wearing a plain-English costume. Then everyone wonders why the suite is brittle, bloated, and ignored.

  I pulled my complaints together and backed each one with what the wider community, including the Cucumber team, has said for years: the huge scenarios, the steps that say one thing and do five, the imperative "click the green button" style, the collaboration that never happens. A 2025 analysis found many teams adopt BDD tooling without adopting the methodology, and only about 27% of sampled open-source projects use a BDD framework at all.

  My takeaway: the value is in the discovery conversation before the code, not the .feature file. Three amigos arguing about what the software should do earns its keep. You can hold that conversation without Cucumber at all.

  For those still running BDD in automation, what's the real reason it earns its place? Is the collaboration happening, or is it habit at this point?

  Read the full write-up: https://tim.sillysamoyed.com/blog/cucumber-test-script-costume

  #TestAutomation #BDD #Cucumber #SDET #QualityEngineering
---

I've spent a good chunk of my career inside Cucumber suites: writing them, inheriting them, and being asked more than once to delete them. It left me with an opinion that annoys about half the room. Behaviour-Driven Development is a good idea, and the teams I've worked in kept implementing it badly.

The tooling makes the wrong thing easy and the right thing hard. Gherkin looks like plain English, so everyone assumes it's simple. It isn't. Writing good Gherkin is a skill, and treating it as free is how you end up with a 2,000-scenario suite your team stops trusting and stops reading.

This post is opinionated and drawn from my own experience. I wanted to check whether my complaints were bad luck or something the wider community sees too. They're not bad luck. Every pitfall below is documented, often by the people who built and teach these tools.

## Pitfall 1: BDD that doesn't come from the top down

The most common failure I've seen: a team adopts BDD as a _test automation format_ instead of a _collaboration practice_. The automation team writes the steps, in isolation, after the fact, and those steps never tie back to the actual user stories.

This inverts the point. BDD is a conversation _before_ code, across three perspectives: product, development, and test. The Cucumber team is blunt about it. In [Cucumber anti-patterns (part #1)](https://cucumber.io/blog/bdd/cucumber-antipatterns-part-one/) they warn that when a business analyst or product owner writes all the Gherkin alone in a Jira ticket, you lose the team's input, and the scenarios drift into something the testers or devs own while the product owner shrugs and says that isn't what they meant.

The worst anti-pattern, per the [ThinkCode write-up](https://www.thinkcode.se/blog/2016/06/22/cucumber-antipatterns), is writing feature files _after_ you've written the code, using Gherkin to document what you built rather than to drive what you're about to build. At that point you've kept the ceremony of BDD and thrown away the only part that pays for it.

A [2025 reality-check analysis](https://www.303software.com/insights/behavior-driven-development-cucumber-testing-2025-reality) found that many teams adopt BDD tooling without adopting the methodology, using Cucumber for automation rather than behaviour specification, and the collaboration between technical and non-technical stakeholders never happens. When it doesn't, you pay the full cost of the abstraction layer for none of its benefit.

## Pitfall 2: Badly written steps

This one is my bugbear: steps that say one thing and do another. A step that does four different things depending on the parameters you pass. A step named `the user logs in` that also seeds the database, sets a feature flag, and navigates three pages deep.

On the surface:

```gherkin title="login.feature"
Given the user logs in
```

Behind the scenes:

```java title="StepDefinitions.java"
@Given("the user logs in")
public void the_user_logs_in() {
    db.seedUsers();                    // wait, what?
    featureFlags.enable("new-checkout"); // this too?
    driver.get(BASE_URL + "/login");
    loginPage.enter("admin", "hunter2"); // hard-coded admin?
    dashboard.waitUntilLoaded();
}
```

The step claims to do one thing. It does five. Anyone reading the feature file has no idea the database got reseeded or a feature flag got flipped, so when the scenario fails, they debug the wrong thing.

The moment a step's name stops matching its behaviour, your "living documentation" is lying to you. A lying spec is worse than no spec, because your team trusts it. The whole promise of Cucumber, as [NashTech describes it](https://blog.nashtechglobal.com/bridging-the-gap-mastering-bdd-with-cucumber-for-scalable-quality/), is that the feature file _is_ the documentation and the build fails when they diverge. Overloaded, misnamed steps break that promise while keeping up appearances.

There's a structural driver too. Cucumber puts a mapping layer between natural language and code, and [the primary criticism of the tool](https://blog.nashtechglobal.com/bridging-the-gap-mastering-bdd-with-cucumber-for-scalable-quality/), acknowledged by its advocates, is the maintenance burden that layer imposes: large suites slow velocity when step definitions are poorly designed. Every vague, do-everything step is a small tax that compounds. One practitioner at Ranorex put it about as directly as you can. In [_You Don't Need Cucumber for BDD_](https://www.ranorex.com/blog/dont-need-cucmber-bdd/) they describe how, across every organisation they'd worked in, engineers ended up maintaining complex regex files to keep tests running, business stakeholders never engaged with the Gherkin, and the abstraction added burden without value, to the point they'd been asked to migrate Cucumber suites _back_ to plain code more than once.

## Pitfall 3: Huge scenarios

A scenario should be short and digestible. The [Automation Panda's rule of thumb](https://automationpanda.com/2017/01/30/bdd-101-writing-good-gherkin/) is a single-digit step count, under ten, because long scenarios are hard to follow and usually signal something else going wrong.

I've seen single scenarios run past 75 lines. A scenario that long has stopped being a test. The community sees the same thing. In [_Test Automation with Gherkin Scenarios_](https://smartbear.com/blog/test-automation-with-gherkin-scenarios/), a tester describes a three-to-five-line scenario ballooning to 27 lines the moment they scripted it imperatively. Long scenarios with lots of incidental detail, as [the Cucumber team puts it](https://cucumber.io/blog/bdd/cucumber-antipatterns-part-one/), ruin a good story.

Here's the [bank-balance example the Cucumber team uses](https://cucumber.io/blog/bdd/cucumber-antipatterns-part-one/) to show incidental detail crowding out the point:

```gherkin title="bank-balance.feature"
# Bloated — password steps have nothing to do with the behaviour
Scenario: Check bank balance
  Given I sign up as "Matt"
  And my password is "password"
  And my password confirmation is "password"
  And I have deposited "$60" in my account
  And I have deposited "$40" in my account
  When I check my bank balance
  Then my bank balance is "$100"
```

The scenario is about checking a balance. The password and confirmation steps are noise, dragged in because the author was thinking like they were scripting a test. Strip it back to what matters:

```gherkin title="bank-balance.feature"
# Focused — only the behaviour under test
Scenario: Check bank balance
  Given I have deposited "$60" and "$40" in my account
  When I check my bank balance
  Then my bank balance is "$100"
```

The usual culprits behind bloat:

- **Imperative step-by-step mechanics** instead of behaviour, covered next. This is the big one; it turns 3 lines into 27.
- **Scenario outline abuse.** The [Automation Panda](https://automationpanda.com/2017/01/30/bdd-101-writing-good-gherkin/) calls it out: piling extra rows and columns into an Examples table until no one is sure what's being proven. Extra rows waste execution time; extra columns signal creeping complexity.
- **Incidental setup** dragged into view, like the bank-balance example above.

If a scenario is long, it's rarely because the behaviour is complex. It's because the scenario describes _how_ instead of _what_.

## Pitfall 4: Syntax used incorrectly

Multiple `Given`s and `When`s in one scenario. A `When` trailed by a string of `And`s. First-person and third-person voice mixed in one scenario. Small sins, but a reliable smell.

Each keyword has a distinct job, as [TestEvolve lays out](https://www.testevolve.com/blog/best-practices-and-anti-patterns-in-bdd-cucumber-automation-part-1): `Given` sets the starting state, `When` is the action, `Then` is the outcome. When a scenario stitches several `When`s together with `And`s, it's usually testing several behaviours at once, which breaks the golden rule of one behaviour (one requirement, one acceptance criterion) per scenario.

```gherkin title="account.feature"
# Smell — two Whens and a chain of Ands = several behaviours in one scenario
Scenario: User manages their account
  Given I am on the login page
  When I enter my username
  And I enter my password
  And I click login
  Then I see the dashboard
  When I click "Edit profile"
  And I change my email
  And I click save
  Then my email is updated
```

That's two behaviours, logging in and editing a profile, wearing one scenario. Split them, and lift the login mechanics into one declarative step:

```gherkin title="update-email.feature"
Scenario: User updates their email address
  Given I am logged in
  When I change my email address
  Then my email address is updated
```

The community guidance is concrete. The [Gherkin best-practices guide](https://github.com/andredesousa/gherkin-best-practices) suggests an informal ceiling of two to three `And`s hanging off any single `Given`/`When`/`Then` before you rethink the scenario. On voice: the same guide notes most modern applications are multi-user, so a personal "I" introduces ambiguity about _which_ user is acting, and mixing "I" and "the user" in one scenario compounds it. These aren't style nitpicks. Broken structure is usually a scenario trying to do too much. If you want to enforce it, Cucumber's own [gherkin-lint](https://github.com/cucumber-ltd/gherkin-lint) catches a lot of it.

## The pitfalls the community kept raising

Researching this turned up complaints I hadn't put on my list but recognised at once.

**Imperative "Gherkin as a test script."** This is the root cause behind half of my own pitfalls. A newcomer takes a manual test and staples `Given`/`When`/`Then` in front of each line. The [Automation Panda's Google-search example](https://automationpanda.com/2017/01/30/bdd-101-writing-good-gherkin/) nails it:

```gherkin title="image-search.feature"
# BAD — procedure-driven with BDD buzzwords bolted on
Scenario: Google Image search shows pictures
  Given the user opens a web browser
  And the user navigates to "https://www.google.com/"
  When the user enters "panda" into the search bar
  Then links related to "panda" are shown on the results page
  When the user clicks on the "Images" link at the top of the results page
  Then images related to "panda" are shown on the results page
```

```gherkin title="image-search.feature"
# GOOD — declarative, describes behaviour not mechanics
Scenario: Image search shows pictures
  Given a web browser is at the Google home page
  When the user searches images for "panda"
  Then images related to "panda" are shown
```

As the Automation Panda puts it, the first version isn't behaviour-driven, it's procedure-driven with buzzwords bolted on. The fix is declarative style: describe _what_ the user achieves, not _which keys they press_, and push the mechanics down into the step definitions. Cucumber's own [_Writing better Gherkin_](https://cucumber.io/docs/bdd/better-gherkin/) frames the test well. Ask whether the wording needs to change if the implementation does. If yes, rework it. The payoff is resilience. The UI changes often, business rules far less, so declarative scenarios survive UI churn that shatters an imperative suite.

**Brittleness and the maintenance tax.** Because imperative scenarios couple to implementation, [changing a button label can force updates across dozens of scenarios](https://testquality.com/how-to-write-maintainable-test-cases-with-gherkin-syntax/), and restructuring a form can break a whole suite. That analysis pegs implementation and maintenance challenges as hitting roughly a third of teams adopting test automation. This is the running cost you don't budget for at adoption time.

**Testing everything through the UI.** [Cucumber anti-patterns (part #2)](https://cucumber.io/blog/bdd/cucumber-anti-patterns-part-two/) makes the point that writing your Gherkin in terms of buttons, links, and fields strands you at the top of the testing pyramid: slow, brittle, no path down to faster tests beneath the UI. It also makes poor documentation, because a description full of widgets never explains the business rule.

**Cucumber where you didn't need Cucumber.** A recurring, uncomfortable point from [QualityWorks' _Is the juice worth the squeeze?_](https://qualityworkscg.com/cucumber-for-bdd-is-the-juice-worth-the-squeeze/): if your team already communicates requirements well, often a smaller team with overlapping skills and shared vocabulary, the collaboration layer Cucumber adds solves a problem you don't have, and you eat the abstraction cost for nothing. Don't inject Cucumber mid-project hoping it fixes a specification problem. As they put it, that's building a skyscraper on a house's foundation. BDD's discovery conversations are the valuable part, and you can hold those without a single `.feature` file.

**Adoption is more mixed than the hype suggests.** For all the noise, [only about 27% of sampled open-source projects use BDD frameworks](https://www.303software.com/insights/behavior-driven-development-cucumber-testing-2025-reality), concentrated in Ruby (around 68%), and a large share use the tooling for something other than textbook BDD. BDD isn't dead, but the gap between how it's marketed and how it's practised is wide.

## Where that leaves BDD

I'm not anti-BDD. The discovery conversation, three amigos in a room arguing about what the software should do before anyone writes it, is one of the highest-leverage practices I know. When it works, the feature file becomes a real single source of truth: spec, regression test, and onboarding doc in one artifact.

That value comes from the _practice_, not the _tool_. Cucumber doesn't give you BDD any more than buying a guitar gives you a song. Adopt the syntax and skip the collaboration, and you've bought an expensive, brittle, misleading test suite with a plain-English costume on top.

My position, after all of it: do the discovery. Write scenarios declaratively. Keep them short and single-purpose. Respect the keywords. And every so often, ask the uncomfortable question. Does this team need Cucumber, or do we need to keep talking to each other before we code?

Often the answer is the second one. That's still BDD.

---

## References

- Cucumber — [Cucumber anti-patterns (part #1)](https://cucumber.io/blog/bdd/cucumber-antipatterns-part-one/)
- Cucumber — [Cucumber anti-patterns (part #2)](https://cucumber.io/blog/bdd/cucumber-anti-patterns-part-two/)
- Cucumber — [Writing better Gherkin](https://cucumber.io/docs/bdd/better-gherkin/)
- Cucumber Ltd — [gherkin-lint](https://github.com/cucumber-ltd/gherkin-lint)
- ThinkCode — [Cucumber Anti-Patterns](https://www.thinkcode.se/blog/2016/06/22/cucumber-antipatterns)
- Automation Panda — [BDD 101: Writing Good Gherkin](https://automationpanda.com/2017/01/30/bdd-101-writing-good-gherkin/)
- André de Sousa — [Gherkin Best Practices](https://github.com/andredesousa/gherkin-best-practices)
- TestEvolve — [Best Practices and Anti-Patterns in BDD Cucumber Automation (Part 1)](https://www.testevolve.com/blog/best-practices-and-anti-patterns-in-bdd-cucumber-automation-part-1)
- NashTech — [Bridging the Gap: Mastering BDD with Cucumber for Scalable Quality](https://blog.nashtechglobal.com/bridging-the-gap-mastering-bdd-with-cucumber-for-scalable-quality/)
- Ranorex — [You Don't Need Cucumber for BDD](https://www.ranorex.com/blog/dont-need-cucmber-bdd/)
- QualityWorks — [Cucumber for BDD: Is the juice worth the squeeze?](https://qualityworkscg.com/cucumber-for-bdd-is-the-juice-worth-the-squeeze/)
- 303 Software — [BDD & Cucumber Reality Check 2025](https://www.303software.com/insights/behavior-driven-development-cucumber-testing-2025-reality)
- SmartBear — [Test Automation with Gherkin Scenarios](https://smartbear.com/blog/test-automation-with-gherkin-scenarios/)
- TestQuality — [How to Write Maintainable Test Cases with Gherkin Syntax](https://testquality.com/how-to-write-maintainable-test-cases-with-gherkin-syntax/)
  </content>
  </invoke>
