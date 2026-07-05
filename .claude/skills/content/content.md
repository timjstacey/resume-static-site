---
name: content
description: Blog-first content routine. Researches a topic, writes the canonical long-form blog post into src/content/posts/, distills it into the linkedinPost frontmatter field, validates against the live schema, branches, commits, and opens a PR. Reads RESEARCH_TOPIC and HASHTAGS from the environment. Skips if the post already exists.
metadata:
  trigger: /content
---

# Blog-first content generation

Write the **canonical** artifact — a long-form blog post — first, then distill it
into a short LinkedIn post stored in the `linkedinPost` frontmatter field. One
session, one PR. The blog is the source of truth; the LinkedIn copy is a faithful
summary of it that links back to it. There is no LinkedIn-first step and no
write-back: the link runs one way, LinkedIn → blog.

This runs locally (`/content`) or as the scheduled **RSS Content** routine. Either
way the steps are identical.

## 1. Runtime context

```bash
date -u +%Y-%m-%d      # TODAY
echo "$RESEARCH_TOPIC"  # topic — pick one specific angle from it
echo "$HASHTAGS"        # seed hashtags (may be empty)
```

## 2. Read the writing rules

Invoke this repo's `stop-slop` skill (`/stop-slop`) and read all four files in full
before writing any prose:

- `.claude/skills/stop-slop/SKILL.md`
- `.claude/skills/stop-slop/references/phrases.md`
- `.claude/skills/stop-slop/references/structures.md`
- `.claude/skills/stop-slop/references/examples.md`

Every rule applies to the blog prose and to the distilled `linkedinPost`. No
exceptions. Code blocks and the commit message are exempt — write those normally.

## 3. Read recent posts and the ledger

Read `research/INDEX.md` — the dedup + archetype-rotation ledger. Then list
`src/content/posts/*.md`, sort by `date` descending, and read the three most recent
in full. Use them for:

**Overlap detection.** Note the specific claims, statistics, product names, and
mechanisms each post covers. A new post must not repeat the same specific facts
even when the angle label looks different. "Playwright MCP enables AI agents" and
"Playwright MCP cuts locator maintenance" share one core mechanism — both are
off-limits for a new Playwright MCP post. Judge overlap on the `Topic angle`
column, not the title.

**Style calibration.** Match the sentence-length distribution and paragraph
density of the recent posts. Do not copy how they open or close — the opener and
closer come from the archetype you select next. A post never closes with a summary.

## 4. Select the archetype

Read `.claude/skills/content/references/archetypes.md`. Read the `Archetype` column
of `research/INDEX.md` and collect the labels from the **last three rows** — those
are off-limits this run. From the remaining archetypes, pick the one that best fits
the research you are about to do. The archetype controls **structure only** (opener
/ body movement / closer); every stop-slop rule still applies.

**Release override.** When step 5 lands on a **Tier 1 or Tier 2 release**, skip the
rotation: use `News / launch` and ignore the last-three exclusion — release freshness
beats format variety. The rotation and exclusion still govern Tiers 3 and 4. Either
way, record the archetype you used in the ledger (step 11) as normal.

## 5. Research

Pick the topic by walking this **priority ladder** top-down. Stop at the first tier
that yields an angle the ledger has not already covered — research that tier, skip
the rest. The ladder weights live release cycles over generic news so the post is
about something that is actually current, not an old release dredged up months late.

**Tier 1 — Playwright release.** Read the latest Playwright release from the GitHub
Releases API:

```bash
gh api repos/microsoft/playwright/releases/latest --jq '{tag: .tag_name, published: .published_at}'
# fallback if gh is unavailable: WebFetch https://api.github.com/repos/microsoft/playwright/releases/latest
```

If the tag version (e.g. `1.61.1`) does **not** already appear in `research/INDEX.md`
(Title or Topic angle) **and** `published_at` is within 4 weeks of `TODAY`, this is
the topic. Research the release notes + changelog for the headline changes. Archetype
is forced to `News / launch` (see step 4).

**Tier 2 — k6 release.** Same against `repos/grafana/k6/releases/latest` (k6 ships its
own GitHub versioning, not npm). Same dedup-by-version + 4-week recency guard. If it
qualifies and Tier 1 did not, this is the topic — also forced `News / launch`.

**Tier 3 — last-week web search.** No fresh, unposted release → search for any
interesting testing/CI/DevEx angle from the **last 7 days**. Run several **WebSearch**
queries with different wording. If WebSearch is unavailable (a local run outside the
US, where it is region-restricted), use the **Tavily** MCP tool instead. Target a
fresh, specific angle not already in the ledger. Normal archetype rotation (step 4).

**Tier 4 — docs deep-dive.** No fresh release and no fresh news → write a how-to or
teardown from the Playwright (`playwright.dev/docs`) or k6 (`grafana.com/docs/k6`)
**docs**. Pick a guide or feature the ledger has not covered. Normal rotation (this
tier lands naturally on `Playbook` or `Teardown`).

**Recency gate (hard rule).** A Tier 1/2 release only qualifies if published within
4 weeks of `TODAY`; a Tier 3 source must be dated within 7 days. If a tier's candidate
fails the gate or is already in the ledger, drop to the next tier — never resurrect an
old release to fill the slot.

Derive a `SLUG` from the post title: lowercase, hyphens only, no special
characters, no year suffix (the `date` field already records when it was written).

**Dedup guard.** If `src/content/posts/SLUG.md` already exists, this angle is
already published. Stop and report it — do not open a duplicate PR.

## 6. Write research notes

Write `research/TODAY-SLUG.md`:

```markdown
# Research: POST_TITLE

**Date range:** FOUR_WEEKS_AGO to TODAY

## Summary

KEY_INSIGHTS_HERE

## Sources

- URL_1
- URL_2
```

The `## Sources` URLs are the outbound links the blog body cites in step 8.

## 7. Read the live schema and calibrate

Do not hardcode the schema — read it live:

- `src/content.config.ts` and `src/lib/schemas.ts` — the `PostSchema` (authoritative).
- The "Blog data" section of `CLAUDE.md`.
- One or two existing posts under `src/content/posts/*.md` — match their frontmatter
  shape, `preview` block style, and prose voice.
- `astro.config.mjs` — read the `site` value (e.g. `https://tim.sillysamoyed.com`).
  The blog URL is `BLOG_URL = <site>/blog/SLUG`; you need it for `linkedinPost`.

Required frontmatter (confirm against `PostSchema`):

| Field          | Type                                            | Notes                                           |
| -------------- | ----------------------------------------------- | ----------------------------------------------- |
| `title`        | string                                          | The post title.                                 |
| `date`         | bare `YYYY-MM-DD` (parses to a JS Date)         | Unquoted, = `TODAY`.                            |
| `tag`          | `Strategy \| Practice \| Meta \| Team \| Tools` | Bare enum. See mapping below.                   |
| `excerpt`      | string                                          | One sentence. Quote it if it contains a colon.  |
| `readMins`     | integer                                         | `ceil(word_count / 220)`.                       |
| `preview`      | list of `[prefix, text]` tuples                 | 8–12 lines; the terminal-style cover.           |
| `hashtags`     | list of strings                                 | 3–5, `#` stripped. See below.                   |
| `linkedinPost` | string                                          | The distilled LinkedIn copy. Written in step 9. |

**`hashtags`** — blog-first, so you author these (no source LinkedIn post to copy
from). Start from `HASHTAGS` if set, then add topic-relevant tags until you have
3–5. Preserve casing (`TestAutomation`, not `testautomation`) — they drive the
`/blog` Tags sidebar and must match across posts.

**Tag mapping** (pick the closest; fall back to `Practice`):

- testing strategy, what-to-test, quality direction → `Strategy`
- how-to, craft, hands-on technique → `Practice`
- a specific tool / release / framework → `Tools`
- process, team, ways of working → `Team`
- writing about the blog/site itself → `Meta`

## 8. Write the canonical blog post

Write `src/content/posts/SLUG.md`. This is the artifact — full length, evidence-
backed, the real read. Do not write it as a stretched LinkedIn post; write the
LinkedIn post later as a summary of _this_.

- **Frontmatter** — mirror an existing post exactly. `preview` is a `cat SLUG.md`
  terminal cover: a `'$'` shell line, a `'#'` title line, a blank `' '` line, then
  `' '` body lines paraphrasing the opening. Leave `linkedinPost` for step 9.
- **`##` section headings** structure the piece (3–6 real sections). They drive the
  on-this-page TOC rail and the numbered section index.
- **Code examples** in fenced blocks with a language and a `title="file.ext"` so
  Expressive Code renders the window chrome. Open the body with a code fence where
  it fits — the site has no hero imagery, so the lead fence is the visual hero. Add
  `showLineNumbers` to the meta for a block long enough to reference by line.
- **Outbound links** `[anchor](https://…)` to the `## Sources` URLs, placed inline
  where they back a specific claim. Every load-bearing fact traces to a source. The
  build rewrites external links to new-tab with a `↗` marker — author plain markdown
  links, do not add `target`/`rel` yourself.
- A `>` blockquote renders as a callout — use one for the key takeaway if it earns it.
- **No LinkedIn backlink.** The blog is authored first; there is no source LinkedIn
  post to link to. Do not add an "I first shared this on LinkedIn" closer — the link
  runs one way, from the LinkedIn post (step 9) to here.
- **No fabricated prevalence.** Do not claim what "most teams", "many teams", or
  "developers" do unless a cited source measured it (then attribute it inline). You
  have no data on the field's behaviour. Drop the population and address the reader as
  "you", or state the mechanism on its own. See the Fabricated Prevalence rule in
  `stop-slop/references/structures.md`. This applies hardest to the opener, where the
  archetype invites a status-quo line and the easy fill is an invented "most teams…".
- Apply every stop-slop rule: no adverbs, no passive voice, no binary contrasts, no
  em-dashes, no throat-clearing openers, active voice, no inanimate subjects doing
  human actions.

Aim for 700–1,400 words.

## 9. Distill the LinkedIn post into `linkedinPost`

Now read the blog you just wrote and distill it into the `linkedinPost` frontmatter
field — a standalone LinkedIn post that summarizes the blog and links to it. This is
the **only** LinkedIn copy; `publish-linkedin.yml` hands it verbatim to the LinkedIn
API on merge, so it must be API-ready.

Write it as a YAML block scalar so the multi-line plain text survives:

```yaml
linkedinPost: |
  First line that states the post's angle, no throat-clearing.

  Two or three short paragraphs carrying the core claims from the blog.

  Read the full write-up: https://tim.sillysamoyed.com/blog/SLUG

  #Hashtag1 #Hashtag2 #Hashtag3
```

Rules for `linkedinPost`:

- **Plain text only — no Markdown.** It is sent verbatim to the LinkedIn API, which
  has no Markdown renderer. No `**bold**`, `_italics_`, `` `backticks` ``, `#`
  headings, `-`/`*` bullet markers, or `[text](url)` links — they show as literal
  characters. Write code identifiers as bare text. A numbered list is plain lines
  (`1. ...`). Separate sections with blank lines.
- **Summary, not a second draft.** Distill the finished blog faithfully. Do not
  introduce a claim, statistic, or framing the blog does not make. Every fact traces
  to the blog (and through it to the research). Never fabricate a personal story,
  team, incident, or result.
- **No insider-tease opener.** Do not open with the "X changed the answer / changed
  the game" + "most teams haven't noticed / nobody realises" shape (see
  `stop-slop/references/structures.md`). State what shipped and why it matters; trust
  the reader. Lead with the concrete change, not a claim of secret knowledge.
- **No fabricated prevalence.** Same as the blog: no "most teams / many teams /
  developers do X" unless a cited source measured it. Reframe to "you" or the mechanism.
  Watch the opener — the distilled first line is where an invented "most teams…" creeps
  back in.
- 150–300 words.
- End with the **blog link as a bare URL** (`BLOG_URL` from step 7) on its own line —
  this is the one-way link readers follow to the canonical post.
- Then 3–5 hashtags on the final line, `#`-prefixed. Use the same set as the post's
  `hashtags` frontmatter.
- Apply every stop-slop rule, same as the blog.

## 10. Validate before pushing

```bash
pnpm typecheck   # astro check — fails on bad frontmatter
```

A bad `tag` enum, missing field, malformed `preview` tuple, or non-string
`linkedinPost` surfaces here. Re-run until clean.

## 11. Update the ledger

Append one row to `research/INDEX.md` (preserve existing rows). Put the archetype
Label from step 4 verbatim in the `Archetype` column:

```
| TODAY | POST_TITLE | ONE_SENTENCE_TOPIC_ANGLE | ARCHETYPE_LABEL | #Hashtag1 #Hashtag2 |
```

## 12. Branch, commit, open the PR

The branch must be `claude/`-prefixed — the routine only pushes `claude/` branches,
and the site's branch-name hook accepts the `claude` type. The repo rebase-merges.

```bash
BRANCH="claude/blog-SLUG"
git checkout main && git pull --ff-only
git checkout -b "$BRANCH"
git add "src/content/posts/SLUG.md" research/
git commit -m "feat(blog): POST_TITLE"
git push -u origin "$BRANCH"      # pre-push hook re-runs typecheck
gh pr create \
  --base main --head "$BRANCH" \
  --title "feat(blog): POST_TITLE" \
  --body "$(cat <<'EOF'
Blog-first content post (research → canonical blog → distilled linkedinPost).

## Summary

ONE_PARAGRAPH_SUMMARY

## Sources

- URL_1
- URL_2

---

On merge, `publish-linkedin.yml` reads `linkedinPost` and dispatches it to
linkedin-post-generator to post, with the blog link already in the copy.
EOF
)"
```

Replace `SLUG`, `POST_TITLE`, `ONE_PARAGRAPH_SUMMARY`, `ARCHETYPE_LABEL`,
`ONE_SENTENCE_TOPIC_ANGLE`, `FOUR_WEEKS_AGO`, and the source URLs with real values.
After the PR opens, print its URL and stop. Do not merge.
