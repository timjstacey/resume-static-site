---
title: The Internet Runs on Remote Work. Your CEO Says It Doesn't Work
date: 2026-07-17
tag: Team
excerpt: 'The largest engineering projects in history are distributed by design, yet executives keep insisting distributed work fails. What the RTO research, the real estate money trail, and one Australian policy contradiction actually show.'
readMins: 7
hashtags: [RemoteWork, RegionalAustralia, OpenSource, TestAutomation, FutureOfWork]
preview:
  - ['$', 'cat internet-runs-on-remote-work.md']
  - ['#', '# The internet runs on remote work']
  - [' ', '']
  - [' ', "Your CEO's RTO memo reached you through"]
  - [' ', 'software built by people who have never']
  - [' ', 'shared an office.']
  - [' ', '']
  - [' ', 'Linux: 2,134 devs, 1,780+ orgs, one release.']
  - [' ', 'Kubernetes: 88,000 contributors, 44 countries.']
linkedinPost: |
  During COVID, I did what Australian governments have spent decades asking people to do: I left the big city and moved to regional Queensland.

  Australia built an entire migration program around this goal. Regional visas require holders to live outside Sydney, Melbourne and Brisbane, and the Department of Home Affairs updated its guidance to allow those visa holders to work from a regional area for metropolitan employers. Remote work is federal regional development policy.

  Unless you're a citizen job hunting. Then it's "2–3 days a week in a Brisbane office", 1,700 km from me.

  Walk a hybrid office floor on one of those anchor days: rows of people in noise-cancelling headphones, blocking out the open plan, dialling into video calls because their teammates are in another timezone or on a different office roster. Commuting hours, paying for fuel and parking, to do the same meetings with worse audio.

  Pittsburgh researchers found RTO mandates produced no improvement in financial performance across S&P 500 firms, while hiring slowed 17% and job satisfaction cratered. Stanford's randomised trial found hybrid work delivered identical productivity with 33% less attrition.

  Meanwhile, tens of thousands of paid professionals across 44 countries build the internet itself: Linux, Kubernetes, the open source stack your company runs on. Most have never shared an office.

  Distributed collaboration built the modern world. The office made bad collaboration look busy.

  I've written up the full research: open source governance, the RTO studies, the commercial real estate money trail, and the Australian policy contradiction. Link in the first comment.

  If you're hiring remote SDET/automation talent, my DMs are open. I'm one of the people your regional development strategy says you want.

  #RemoteWork #RegionalAustralia #OpenSource #TestAutomation #FutureOfWork
---

```bash title="~/rto-research" frame="terminal"
$ grep -i '^Received:' rto-mandate.eml
Received: from mail.google.com
  by imap.fastmail.com; Fri, 17 Jul 2026 09:04:11 +1000
Received: from mx1.corp.example
  by mail.google.com with ESMTPS id d9-20020a17
Received: from ceo-laptop.corp.example (Postfix)
  by mx1.corp.example with ESMTPS

# read bottom-up: ceo-laptop -> corp MTA -> Google -> your inbox
# every relay in that chain runs Linux: 2,134 devs, 1,780 orgs, one release
# Google routes the mail on the container model Kubernetes standardised
#   (88,000 contributors, 44 countries, no shared office)
# payload: "distributed collaboration does not work"
```

Your CEO's return-to-office memo reached you through software built by people who have never shared an office.

The email travelled over Linux servers. Kubernetes orchestrated the containers behind the video call where leadership explained that collaboration happens in person. The badge system tracking your attendance depends on open source libraries maintained by someone on the other side of the planet.

I find this funny. The most successful collaborative engineering efforts in history are distributed by design, and executives keep insisting distributed work fails. Let's test that claim against the record.

## The largest engineering project on Earth has no office

The Linux kernel sits under Android phones, cloud infrastructure, supercomputers, your router, maybe your car. The Linux Foundation describes it as [the largest distributed software development project in the world](https://www.linuxfoundation.org/press/press-release/linux-foundation-publishes-study-on-linux-development-statistics-who-writes-linux-and-who-supports-it).

In 2025, [2,134 developers contributed to a single kernel release, the highest participation in the project's history, with contributions spread across more than 1,780 organizations](https://commandlinux.com/statistics/linux-kernel-contributors-lines-of-code-statistics/). The codebase passed 40 million lines. Development runs on mailing lists, patches, and written review. Academic research on kernel collaboration found [no evidence that developers in similar time zones were more likely to collaborate](https://opensource.com/article/17/10/collaboration-linux-kernel). Time zones stop mattering when the workflow is asynchronous and written down.

The "hobbyist volunteers" dismissal died over a decade ago. The Linux Foundation's own research found [between 70 and 95 percent of kernel developers are paid for their work](https://www.linuxfoundation.org/press/press-release/linux-foundation-publishes-study-on-linux-development-statistics-who-writes-linux-and-who-supports-it). These are professional engineers at Intel, Google, Red Hat, AMD, Oracle: [direct competitors who collaborate](https://thenewstack.io/contributes-linux-kernel/) across companies, countries, and time zones without a shared office or a mandated anchor day.

Kubernetes tells the same story at a different scale. Ten years in, it has attracted [over 88,000 contributors from more than 8,000 companies across 44 countries](https://kubernetes.io/blog/2024/06/06/10-years-of-kubernetes/). It orchestrates the workloads of most of the Fortune 100. Its contributors have no anchor days.

The pattern predates both. Distributed contributors built the Apache web server, Perl, and [a large proportion of Internet infrastructure](https://firstmonday.org/ojs/index.php/fm/article/download/1479/1394) before "remote work" was a phrase anyone used. The kernel community created Git, the tool nearly every software team on the planet now uses, for its own distributed workflow. Distributed collaboration is the operating model that produced the modern internet.

These projects run on written communication, asynchronous review, clear ownership, and judging contributions by quality rather than desk visibility. Compare that with the office.

## The official reasons, versus the evidence

Ask why the mandate exists and you'll get some mix of productivity, collaboration, culture, and mentorship. Researchers have tested each one.

**Productivity and financial performance.** Researchers at the University of Pittsburgh examined S&P 500 firms that imposed RTO mandates and found [no significant changes in financial performance or firm value after the mandates, but a sharp decrease in employee job satisfaction](https://www.utimes.pitt.edu/news/study-return-office). Per [Fortune's coverage](https://fortune.com/2024/01/26/return-to-office-job-satisfaction-financial-performance-study/), 99% of the mandating companies saw job satisfaction drop. Stanford's randomised controlled trial, published in Nature, found [hybrid work produced identical productivity outcomes with a 33% reduction in turnover](https://speakwiseapp.com/blog/return-to-office-statistics). Executives have had four years to publish a measurement linking attendance to output. The studies that exist point the other way.

**Collaboration and culture.** Atlassian, an Australian company, has run a fully distributed model since 2020 and studies it with a dedicated team of behavioural scientists. Their finding: [intentional team gatherings have a far greater impact on teamwork than regular office attendance, and the boost lasts 4–5 months](https://www.atlassian.com/solutions/distributed). Their broader research found [1 in 3 executives think their own RTO policy had even a slight impact on productivity](https://www.atlassian.com/blog/distributed-work/distributed-work-report). The biggest obstacles to teamwork in that research were vague goals, confusing processes, and useless meetings, and an office fixes none of them. Under this model, [92% of Atlassian's 12,000 staff say the policy enables their best work, about 40% live two or more hours from an office, and the workforce has tripled](https://fortune.com/2025/04/02/best-companies-to-work-for-atlassian-remote-work/).

**Talent.** The Pittsburgh team's follow-up tracked over three million tech and finance workers and found that after RTO mandates, [time to fill vacancies increased 23% and hire rates dropped 17%](https://www.hrdive.com/news/rto-mandates-lead-to-brain-drain-attrition/734989/), with attrition concentrated among senior and high-performing staff, the people with options. Mandates filter for the people who couldn't leave.

The stated reasons fail. What holds up?

## Follow the money, carefully

My theory, stated as the suspicion it is: if workers don't turn up, the real estate loses its value. The office tower, the cafés, the sandwich shops, the parking. An entire economic ecosystem depends on funnelling millions of people into a CBD five days a week, and RTO mandates protect those asset values.

The suspicion holds up better than I expected, with one caveat.

The financial pressure is real and documented. In the two years leading into the mandate wave, [75% of companies had increased their commercial real estate footprint](https://finance.yahoo.com/news/commercial-real-estate-behind-boss-113007845.html), and analysts noted employers were struggling to squeeze value out of expensive holdings while banks tightened commercial lending. The academic paper that coined the "urban doom loop", [_Work From Home and the Office Real Estate Apocalypse_](https://www.governing.com/urban/cities-confront-mounting-revenue-risks-from-empty-offices), laid out the mechanism: emptier offices mean lower valuations, lower property tax revenue, cut city services, less appealing cities, emptier offices. City governments are behaving like entities exposed to that risk. Boston's mayor sought [emergency authority to raise commercial tax rates as assessed office values fell](https://commonwealthbeacon.org/economy/bostons-effort-to-head-off-an-urban-doom-loop-explained/). Denver's mayor described the pattern in his own downtown as [a doom loop of vacancies, less activation, and more vacancies](https://www.pew.org/en/research-and-analysis/reports/2026/05/the-remote-work-challenge-lessons-from-5-cities). A lot of capital, public and private, needs you at that desk buying that $14 salad.

The caveat: Pew's 2026 study of five US cities concluded that [the theory that remote work and office vacancies will cause urban doom loops remains unproven](https://www.pew.org/en/research-and-analysis/reports/2026/05/the-remote-work-challenge-lessons-from-5-cities), with city finances proving more resilient than feared. The real estate motive supplies documented pressure. As an explanation for any individual company's mandate, it stays circumstantial.

The better-evidenced explanation is more depressing. The Pittsburgh researchers found RTO mandates correlate with prior poor stock performance, and concluded that [managers use RTO for power grabbing and blaming employees for poor performance](https://www.business.pitt.edu/return-to-office-mandates-dont-improve-employee-or-company-performance/). A mandate is visible, decisive-looking action that shifts the narrative from "leadership made strategic missteps" to "workers got lazy at home". [Firms with more sophisticated institutional investors, the shareholders most likely to see through a smokescreen, were less likely to impose mandates at all](https://www.psychologytoday.com/us/blog/intentional-insights/202408/why-leaders-disregard-data-in-return-to-office-decisions).

The honest version of the money theory: real estate exposure supplies the pressure, blame-shifting supplies the motive. Collaboration appears nowhere in it.

## The Australian own goal

Australia has spent decades trying to get people out of Sydney, Melbourne, and Brisbane. We built [an entire regional migration program around it](https://immi.homeaffairs.gov.au/visas/working-in-australia/regional-migration): visas whose conditions require holders to live and work outside the major cities, extra skilled-migration points for going regional, incentives for studying at regional universities, all with the stated goal of boosting regional economies and easing big-city infrastructure pressure.

The Department of Home Affairs went further in its updated guidance, which confirms that [regional visa holders can work remotely for a metropolitan employer while residing in a regional area](https://www.australianmigrationlawyers.com.au/news-and-updates/remote-work-regional-visas-491-494-489). One arm of national policy treats remote work as the mechanism that makes regional settlement viable. Remote work is Australian regional development policy, for migrants.

I did what governments have begged people to do for twenty years. I left the big city during COVID and moved to Far North Queensland, bringing a fullstack automation skillset with me, the kind of skills each "grow our regions" strategy says it wants to attract. Hybrid mandates requiring 2–3 days a week in offices 1,700 km away now lock me out of roles I'm well qualified for. Meanwhile a regional visa holder down the road can work remote for a Sydney employer with the federal government's blessing.

We had a once-in-a-generation opportunity to decentralise: to move salaries, skills, and spending into the towns we claim to want to grow. RTO mandates are reversing it.

## Commuting to a video call

Walk any hybrid office floor on an anchor day. Rows of people wear noise-cancelling headphones to block out the open plan so they can concentrate, dialling into video calls because their teammates are in another city, another time zone, or rostered onto different anchor days.

Atlassian's survey numbers match the eye test. [Nearly half of office-goers attend because of the mandate, and a quarter of those with nominal choice still feel pressured to show face](https://www.atlassian.com/blog/teamwork/distributed-work-research). Remote work shows [22 percent more focused time than in-office work](https://www.psychologytoday.com/us/blog/intentional-insights/202403/unraveling-the-corporate-control-agenda-behind-rto-mandates). Each mandated day costs the worker hours of commuting, fuel, parking, and before/after-school care, in exchange for the same video calls with worse audio.

Anyone holding data that two anchor days deliver gains would have published it by now. Kernel maintainers merge [about eight changes an hour](https://www.linuxfoundation.org/blog/blog/linux-kernel-report-more-contributors-than-ever) without a single one.

## Measure output, not attendance

Open source maintainers solved this thirty years ago out of necessity. With collaborators spread across 44 countries, presence can't be your yardstick, so you judge the patch, the review, the design doc: written, asynchronous, visible. Working under that constraint, they shipped the most reliable software in history.

The office made bad collaboration look busy.

The next time a mandate memo promises that proximity drives innovation, remember the route it took to reach you: kernels, containers, and libraries built by thousands of paid professionals who have never shared a postcode, out-collaborating the people who wrote the memo.

---

## References

- Linux Foundation: [Who Writes Linux and Who Supports It](https://www.linuxfoundation.org/press/press-release/linux-foundation-publishes-study-on-linux-development-statistics-who-writes-linux-and-who-supports-it)
- CommandLinux: [Linux Kernel Contributor Statistics 2025/26](https://commandlinux.com/statistics/linux-kernel-contributors-lines-of-code-statistics/)
- Dawn Foster / Opensource.com: [What the data says about how Linux kernel developers collaborate](https://opensource.com/article/17/10/collaboration-linux-kernel)
- The New Stack: [Who Contributes to the Linux Kernel?](https://thenewstack.io/contributes-linux-kernel/)
- Kubernetes Blog: [10 Years of Kubernetes](https://kubernetes.io/blog/2024/06/06/10-years-of-kubernetes/)
- First Monday: [Essence of Distributed Work: The Case of the Linux Kernel](https://firstmonday.org/ojs/index.php/fm/article/download/1479/1394)
- University of Pittsburgh: [Study on return-to-office mandates](https://www.utimes.pitt.edu/news/study-return-office) and [Key findings](https://www.business.pitt.edu/return-to-office-mandates-dont-improve-employee-or-company-performance/)
- Fortune: [99% of companies with RTO mandates saw job satisfaction drop](https://fortune.com/2024/01/26/return-to-office-job-satisfaction-financial-performance-study/)
- HR Dive: [RTO mandates lead to 'brain drain' attrition](https://www.hrdive.com/news/rto-mandates-lead-to-brain-drain-attrition/734989/)
- Psychology Today: [Unraveling the Corporate Control Agenda Behind RTO Mandates](https://www.psychologytoday.com/us/blog/intentional-insights/202403/unraveling-the-corporate-control-agenda-behind-rto-mandates) and [Why Leaders Disregard Data in RTO Decisions](https://www.psychologytoday.com/us/blog/intentional-insights/202408/why-leaders-disregard-data-in-return-to-office-decisions)
- Yahoo Finance / Unispace: [Commercial Real Estate Is Behind Your Boss Getting You Back to the Office](https://finance.yahoo.com/news/commercial-real-estate-behind-boss-113007845.html)
- Pew Charitable Trusts: [The Remote Work Challenge: Lessons From 5 Cities](https://www.pew.org/en/research-and-analysis/reports/2026/05/the-remote-work-challenge-lessons-from-5-cities)
- Governing: [Cities Confront Mounting Revenue Risks From Empty Offices](https://www.governing.com/urban/cities-confront-mounting-revenue-risks-from-empty-offices)
- CommonWealth Beacon: [Boston's effort to head off an 'urban doom loop'](https://commonwealthbeacon.org/economy/bostons-effort-to-head-off-an-urban-doom-loop-explained/)
- Department of Home Affairs: [Regional migration program](https://immi.homeaffairs.gov.au/visas/working-in-australia/regional-migration)
- Australian Migration Lawyers: [Remote work rules for 491, 494 & 489 regional visas](https://www.australianmigrationlawyers.com.au/news-and-updates/remote-work-regional-visas-491-494-489)
- Atlassian: [Designing for distributed work](https://www.atlassian.com/solutions/distributed), [1,000 days of distributed](https://www.atlassian.com/blog/distributed-work/distributed-work-report), [Distributed work research](https://www.atlassian.com/blog/teamwork/distributed-work-research)
- Fortune: [Why Atlassian is standing by their WFH philosophy](https://fortune.com/2025/04/02/best-companies-to-work-for-atlassian-remote-work/)
- Stanford/Nature RCT summary: [Return to Office Statistics 2026](https://speakwiseapp.com/blog/return-to-office-statistics)
