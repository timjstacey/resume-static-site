---
title: I Asked for a Rebuttal to My Own Remote Work Post
date: 2026-07-28
tag: Team
excerpt: 'The trial I cited against return-to-office mandates put its winning group in the office three days a week. Going looking for the rebuttal produced a better argument than the one I published.'
readMins: 6
hashtags: [RemoteWork, FutureOfWork, SoftwareEngineering, TeamCulture]
preview:
  - ['$', 'cat rebuttal-to-my-own-remote-work-post.md']
  - ['#', '# I asked for the rebuttal']
  - [' ', '']
  - [' ', 'Last week I argued the internet runs on']
  - [' ', 'remote work. This week I went looking']
  - [' ', 'for the case against it.']
  - [' ', '']
  - [' ', 'The trial I cited ran its winning arm']
  - [' ', 'three days a week in an office.']
linkedinPost: |
  Last week I published a post arguing that return-to-office mandates fail on their own evidence. It found an audience. So I asked for the opposite case: same research, go hunting for the rebuttal, come back with sources or come back empty.

  It came back with sources.

  My strongest citation was the Trip.com randomised trial in Nature. 1,612 employees, six months, hybrid workers matched the control group on performance and quit a third less often. I used it against a mandate asking for two or three days a week in an office.

  The control arm worked five days in the office. The treatment arm worked three days in the office and two at home. The arm that won is the policy I was arguing against. Nick Bloom, who ran that trial, puts fully remote work 10 to 20 percent below fully in-person.

  The rest of the picture is better than I expected, and more specific. The Trip.com engineers wrote 4.4 percent more code on hybrid, short of significance. A 24-month study of software engineers found productivity flat across two years.

  Then the finding that changed my mind. Emanuel, Harrington and Pallais studied engineers at a Fortune 500 firm with two headquarters buildings. Engineers whose whole team sat in one building got 23.9 percent more code review comments than engineers on teams split across both. Both groups were in an office. The split-team engineers commuted and got nothing for it. The gains land on junior engineers, and senior engineers write less code when they sit near their teams.

  So the thing worth measuring is whether your team is in the room with you. Two days a week beside people who report to a different roster is the arm that got nothing.

  I have written up the full audit of my own post, including where the sourcing was weak.

  Link in the first comment.

  #RemoteWork #FutureOfWork #SoftwareEngineering #TeamCulture
---

```bash title="~/rebuttal-research" frame="terminal"
$ grep -A3 'randomisation' trip-com-rct.notes
control arm:    5 days in office
treatment arm:  3 days in office, 2 days at home
n = 1,612  (marketing, finance, software engineering)

# result: performance flat, attrition down a third
# the arm that won goes to an office three days a week
# I cited this against "2-3 days a week in a Brisbane office"
```

Last week I published a post arguing that the internet runs on remote work and that
return-to-office mandates fail on the evidence their own advocates cite. It found an
audience. So I asked for the opposite case: take the same research, go hunting for the
rebuttal, and come back with sources or come back empty.

It came back with sources. Three of my load-bearing claims took damage. The one that
survived cut the argument into a better shape than the one I published.

## The trial I cited ran three days in the office

My strongest citation was Bloom, Han and Liang in Nature: 1,612 Trip.com employees
randomised by birthday, six months, [hybrid workers matching the control group on
performance while quitting a third less often](https://www.nature.com/articles/s41586-024-07500-2).
I ran that number against a mandate asking for two or three days a week in a Brisbane
office.

Read the arms. The control group [worked five days a week in the
office](https://siepr.stanford.edu/news/hybrid-work-win-win-win-companies-workers-study-finds).
The treatment group worked three days in the office and two at home. Everyone in the
trial commuted for most of the week. The arm that won is the policy I was arguing
against.

Nick Bloom runs the WFH Research group behind that trial, and his estimate for fully
remote work puts it [10 to 20 percent below fully
in-person](https://fortune.com/2023/07/06/remote-workers-less-productive-wfh-research/),
with supervision and mentoring named as the mechanism. I quoted Bloom for the half that
agreed with me.

## The studies against remote work measured other people

The 8 to 19 percent drop in productivity per hour comes from [Gibbs, Mengel and
Siemroth](https://www.chicagobooth.edu/review/wfh-or-rto), and the sample is HCL
Technologies, an India-headquartered IT services company, measured from April 2019 to
August 2020. Chicago Booth's own write-up calls that window a chaotic crisis period.
Lockdown, children at home, no chosen setup, no established async practice. Whatever it
measures, it does not measure a 2026 engineer who picked this.

The Microsoft study on siloed collaboration networks covers [61,182 information workers
firm-wide](https://www.nature.com/articles/s41562-021-01196-4) across the first six
months of 2020, and it measures the shape of a communication graph rather than output.

Brucks and Levav found [in-person pairs generating 15 to 20 percent more
ideas](https://www.nature.com/articles/s41586-022-04643-y) than pairs on video, and
their own caveat is that the video groups did as well or better at picking which idea to
pursue. That is a finding about how to run an ideation workshop.

## The research on engineers says something duller

The Trip.com trial covered the software engineering department, and lines of code written
by hybrid engineers [rose 4.4 percent](https://www.nber.org/system/files/working_papers/w30292/w30292.pdf),
short of significance. Russo, Hanel and van Berkel tracked software engineers across
[24 months and six survey waves from April 2020 to April
2022](https://dl.acm.org/doi/10.1145/3638244) and found productivity flat, with engineers
already fluent in the tooling. Ford and colleagues surveyed [3,634 developers at
Microsoft](https://dl.acm.org/doi/full/10.1145/3487567) and found a split population,
some faster at home and some slower, sorted by how hard they found it to communicate.

Nobody has shown that a distributed team of engineers ships less. That part of my post
holds.

## The 22 percent I should have cited

My post claimed remote workers get 22 percent more focused time. That number belongs to
[Hubstaff](https://www.timedoctor.com/blog/remote-work-increased-focus), an
employee-monitoring vendor, derived from activity telemetry on its own customers. It
went into a post that spent four paragraphs attacking executives for making claims
without measurement.

The 22 percent worth quoting comes from Emanuel, Harrington and Pallais, who studied
software engineers at a Fortune 500 firm from 2019 to 2024. The firm's campus had two
headquarters buildings a few blocks apart, which handed the researchers a natural
experiment in proximity. Engineers whose entire team sat in one building received 22
percent more feedback than engineers with distant teammates, and
[23.9 percent more comments on their
code](https://leaddev.com/velocity/physical-proximity-boosts-engineering-collaboration-harvard-study-finds)
than engineers on teams split across both buildings.

Both groups were in an office. The split-team engineers commuted, badged in, sat at a
desk and got the low number, because the people who would have reviewed their code were
in the other building. [The gains land on less-tenured
engineers](https://www.nber.org/papers/w31880) building skill, the tradeoff runs sharper
for women, who give and receive more mentoring when they sit near their team, and
experienced engineers write less code when co-located because they spend the time
reviewing.

> Sitting in an office while your team sits somewhere else puts you in the arm of that
> study that got nothing. You pay the commute and land in the control group.

That is the shape of a mandated anchor day on a team spread across three cities and two
rosters. Headphones on, dialling into the same call you would have dialled into from
your spare room, reviewing code written by someone two timezones away.

## The maintainers I held up book flights

I wrote that Linux and Kubernetes contributors have no anchor days and have never shared
an office. The second half holds. The first half is wrong, and correcting it strengthens
the case rather than denting it.

Kernel maintainers meet at an annual invitation-only [Maintainers
Summit](https://lwn.net/Articles/1049982/), held last December in Tokyo. Linux Plumbers
asks presenters and microconference leads to [attend in
person](https://lpc.events/event/20/abstracts/), with remote presentation allowed on an
emergency basis. Kubernetes runs a [Maintainer Summit at
KubeCon](https://www.kubernetes.dev/events/2026/kcseu/maintainer-summit-eu/), next in
Amsterdam in March. Atlassian, my example of a distributed company, keeps 12 offices and
flies whole teams together [three or four times a year for three to five
days](https://www.atlassian.com/blog/distributed-work/intentional-togetherness-research),
because its own research clocks the boost from a gathering decaying over four to five
months.

None of those communities decided presence is worthless. They decided the useful dose is
the whole team, together, a few times a year.

## What I would write now

The variable worth measuring is whether your team is in the room with you. A whole team
in one place for a week buys the junior engineers on it a review culture they cannot get
over Slack, and it costs the seniors some throughput. Two days a week in a building
where your team is elsewhere buys the commute.

So the mandate I keep meeting in job ads gets the dosage backwards, and the post I wrote
last week got the reasoning backwards on the way to the same conclusion. I want the
remote role, and I want it with a plane ticket three times a year and a written answer
to the mentorship question, because the one study that measured it says the juniors and
the women on the team pay for the feedback that goes missing when nobody plans for it.
