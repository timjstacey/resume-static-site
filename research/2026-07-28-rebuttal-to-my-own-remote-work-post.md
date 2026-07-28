# Research: I Asked for a Rebuttal to My Own Remote Work Post

**Date range:** 2026-06-30 to 2026-07-28

## Summary

Follow-up to `internet-runs-on-remote-work.md` (2026-07-17). The ask: take the original post's
claims and attempt a fact-based rebuttal, returning empty if the facts are not there. The facts
are there, and they support a narrower, sharper thesis rather than a reversal.

**1. Category error in the original.** The post's strongest citation, Bloom/Han/Liang (Nature
2024), randomised 1,612 Trip.com employees into a 5-day-office control arm and a **3-day-office +
2-day-home** treatment arm. Every subject went to an office most of the week. The winning arm is
the policy the post argued against. Bloom's own WFH Research estimate puts **fully remote work
10-20% below fully in-person**, attributed to supervising, training, mentoring and culture, and
the post did not mention it.

**2. The anti-remote studies transfer badly to software engineering teams.**

- Gibbs/Mengel/Siemroth (−8-19% productivity per hour): sample is **HCL Technologies**, an
  India-headquartered **IT services** company, ~50,000 employees, measured Apr 2019 – Aug 2020.
  Chicago Booth's own write-up calls the window a "chaotic crisis period". Forced lockdown WFH,
  not chosen remote work.
- Yang et al. (Nature Human Behaviour): 61,182 Microsoft **information workers** firm-wide, first
  six months of 2020, forced and abrupt. Measures communication-network topology, not output.
- Brucks & Levav (Nature): measures **idea generation in brainstorming sessions**; the paper's own
  caveat is that video groups were no worse, possibly better, at **selecting** which idea to pursue.

**3. The engineering-specific evidence is neutral or favourable to remote work.**

- Trip.com RCT included the software engineering department: **lines of code +4.4% for hybrid,
  statistically insignificant**; zero effect on performance or promotion.
- Russo/Hanel/van Berkel (TOSEM 2024), software engineers, 24 months, six waves Apr 2020 – Apr
  2022: **productivity stable**; engineers were already fluent in async tooling.
- Ford et al. (TOSEM 2021, Microsoft), 3,634 developer responses: **dichotomy**, some more
  productive and some less, predicted by brainstorming ability and communication difficulty.

**4. The one rigorous engineering study argues for whole-team co-location, not for offices.**
Emanuel, Harrington & Pallais studied software engineers at a Fortune 500 firm 2019-2024 whose
campus had two HQ buildings blocks apart. Engineers on **fully co-located** teams received
**23.9% more code comments** (1.92 more per program) than engineers on **multi-building** teams.
Both groups were in an office. Gains concentrate among **less-tenured and younger** engineers;
**experienced engineers write less code when sitting near teammates**. The tradeoffs are more
acute for women, who both give and receive more mentorship when near coworkers. A mandated anchor
day with teammates on a different roster reproduces the multi-building arm: the commute, the desk,
and none of the feedback.

**5. The communities the original held up do meet in person.** The Linux kernel runs an annual
invitation-only Maintainers Summit (2025: 10 December, Tokyo). Linux Plumbers requires presenters
and microconference leads to attend physically, with remote presentation "strictly on an emergency
basis". Kubernetes runs an in-person Maintainer Summit at KubeCon (EU 2026: 22 March, Amsterdam).
Atlassian operates 12 offices and flies whole teams together 3-4 times a year for 3-5 days, and
its own research says the teamwork boost decays over 4-5 months. The original's claim that these
communities have "no anchor days" is wrong; periodic whole-team co-location is the model.

**6. Sourcing audit.** The original's "22% more focused time" traces to **Hubstaff**, an
employee-monitoring vendor, from activity telemetry on its own customer base. The peer-reviewed
22% in this space is Emanuel et al.'s feedback finding, which runs the other way. Kernel counts
(2,134 developers, 13,710 commits in 6.18) check out against LWN but were cited to an aggregator.

**Thesis for the post:** the variable is whether the whole team is in the room together, and
mandated anchor days deliver scattered attendance instead. That is an argument for flying a
distributed team together a few times a year, and against two days a week in a carpark.

## Sources

- https://www.nature.com/articles/s41586-024-07500-2
- https://siepr.stanford.edu/news/hybrid-work-win-win-win-companies-workers-study-finds
- https://www.nber.org/system/files/working_papers/w30292/w30292.pdf
- https://fortune.com/2023/07/06/remote-workers-less-productive-wfh-research/
- https://www.chicagobooth.edu/review/wfh-or-rto
- https://www.journals.uchicago.edu/doi/full/10.1086/721803
- https://www.nature.com/articles/s41562-021-01196-4
- https://www.nature.com/articles/s41586-022-04643-y
- https://www.nber.org/papers/w31880
- https://leaddev.com/velocity/physical-proximity-boosts-engineering-collaboration-harvard-study-finds
- https://dl.acm.org/doi/10.1145/3638244
- https://dl.acm.org/doi/full/10.1145/3487567
- https://lwn.net/Articles/1049982/
- https://lpc.events/event/20/abstracts/
- https://www.kubernetes.dev/events/2026/kcseu/maintainer-summit-eu/
- https://www.atlassian.com/blog/distributed-work/intentional-togetherness-research
- https://lwn.net/Articles/1046966/
- https://www.timedoctor.com/blog/remote-work-increased-focus
