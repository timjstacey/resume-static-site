# Research: Your Cucumber Suite Is a Test Script in a Plain-English Costume

**Date range:** 2016 to 2026-07-13 (evergreen craft topic; sources span the Cucumber
team's canonical anti-pattern posts through a 2025 reality-check analysis)

## Summary

Author-driven opinion post: BDD is a sound idea that teams keep implementing badly
because Cucumber's tooling makes the wrong thing easy. Each complaint is grounded in
first-hand experience and then backed against published community/vendor sources.

Core claims and where they are sourced:

- **BDD adopted as an automation format, not a collaboration practice.** Cucumber's own
  anti-patterns post warns against the product owner writing all Gherkin alone; ThinkCode
  names writing feature files _after_ the code as the worst anti-pattern; the 303 Software
  2025 reality check found many teams adopt the tooling without the methodology and the
  cross-stakeholder collaboration never happens.
- **Badly written / overloaded steps** break the "living documentation" promise (NashTech
  on the feature file as documentation; the mapping-layer maintenance burden is the
  primary criticism its advocates concede). Ranorex's "You Don't Need Cucumber for BDD"
  reports engineers maintaining regex files, disengaged stakeholders, and migrations back
  to plain code.
- **Huge scenarios.** Automation Panda's single-digit step-count rule of thumb; SmartBear's
  account of a 3–5 line scenario ballooning to 27 when scripted imperatively; the Cucumber
  team's bank-balance incidental-detail example.
- **Misused syntax** (multiple When/Given, And-chains, mixed first/third person). TestEvolve
  on keyword roles; André de Sousa's Gherkin best-practices guide (2–3 And ceiling,
  multi-user "I" ambiguity); Cucumber Ltd gherkin-lint for enforcement.
- **Community pitfalls the author hadn't listed:** imperative "Gherkin as a test script"
  (Automation Panda's panda-search example; Cucumber's _Writing better Gherkin_ "does the
  wording change if the implementation does" test); brittleness / maintenance tax
  (TestQuality, ~1/3 of teams hit implementation+maintenance challenges); testing
  everything through the UI strands you at the top of the pyramid (Cucumber anti-patterns
  part #2); Cucumber where you didn't need it (QualityWorks "juice worth the squeeze");
  adoption is mixed — 303 Software: ~27% of sampled OSS projects use a BDD framework,
  ~68% of those Ruby.

**Takeaway:** the value is the discovery conversation (three amigos) before the code, not
the .feature file. You can hold that conversation without Cucumber.

**Archetype:** Contrarian take (BDD good, tool-driven implementation bad; opens on the
author's stance, closes on the uncomfortable "do we even need Cucumber" question). Last
three ledger archetypes excluded were Playbook / Failure mode / Teardown.

## Sources

- https://cucumber.io/blog/bdd/cucumber-antipatterns-part-one/
- https://cucumber.io/blog/bdd/cucumber-anti-patterns-part-two/
- https://cucumber.io/docs/bdd/better-gherkin/
- https://github.com/cucumber-ltd/gherkin-lint
- https://www.thinkcode.se/blog/2016/06/22/cucumber-antipatterns
- https://automationpanda.com/2017/01/30/bdd-101-writing-good-gherkin/
- https://github.com/andredesousa/gherkin-best-practices
- https://www.testevolve.com/blog/best-practices-and-anti-patterns-in-bdd-cucumber-automation-part-1
- https://blog.nashtechglobal.com/bridging-the-gap-mastering-bdd-with-cucumber-for-scalable-quality/
- https://www.ranorex.com/blog/dont-need-cucmber-bdd/
- https://qualityworkscg.com/cucumber-for-bdd-is-the-juice-worth-the-squeeze/
- https://www.303software.com/insights/behavior-driven-development-cucumber-testing-2025-reality
- https://smartbear.com/blog/test-automation-with-gherkin-scenarios/
- https://testquality.com/how-to-write-maintainable-test-cases-with-gherkin-syntax/
  </content>
