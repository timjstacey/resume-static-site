# Structures to Avoid

## Binary Contrasts

These create false drama. State the point directly.

| Pattern                                                       | Problem                        |
| ------------------------------------------------------------- | ------------------------------ |
| "Not because X. Because Y." / "Not because X, but because Y." | Telegraphed reversal           |
| "[X] isn't the problem. [Y] is."                              | Formulaic reframe              |
| "The answer isn't X. It's Y."                                 | Predictable pivot              |
| "It feels like X. It's actually Y."                           | Setup/reveal cliche            |
| "The question isn't X. It's Y."                               | Rhetorical misdirection        |
| "Not X. But Y." / "not X, it's Y" / "isn't X, it's Y"         | Mechanical contrast            |
| "It's not this. It's that."                                   | Same formula, different words  |
| "stops being X and starts being Y"                            | False transformation arc       |
| "doesn't mean X, but actually Y"                              | Negation-then-assertion crutch |
| "is about X but not Y"                                        | False distinction              |
| "not just X but also Y"                                       | Additive hedge                 |

**Instead:** State Y directly. "The problem is Y." "Y matters here." Drop the negation entirely.

## Negative Listing

Listing what something is _not_ before revealing what it _is_. A rhetorical striptease.

| Pattern                               | Problem                           |
| ------------------------------------- | --------------------------------- |
| "Not a X... Not a Y... A Z."          | Dramatic buildup through negation |
| "It wasn't X. It wasn't Y. It was Z." | Same structure, past tense        |

**Instead:** State Z. The reader doesn't need the runway.

## Dramatic Fragmentation

Sentence fragments for emphasis read as manufactured profundity.

| Pattern                                  | Problem                 |
| ---------------------------------------- | ----------------------- |
| "[Noun]. That's it. That's the [thing]." | Performative simplicity |
| "X. And Y. And Z."                       | Staccato drama          |
| "This unlocks something. [Word]."        | Artificial revelation   |

**Instead:** Complete sentences. Trust content over presentation.

## Rhetorical Setups

These announce insight rather than deliver it.

| Pattern               | Problem                |
| --------------------- | ---------------------- |
| "What if [reframe]?"  | Socratic posturing     |
| "Here's what I mean:" | Redundant preview      |
| "Think about it:"     | Condescending prompt   |
| "And that's okay."    | Unnecessary permission |

**Instead:** Make the point. Let readers draw conclusions.

## Insider-Tease Openers

The "I know a secret the field missed" hook. Pairs false agency on a release with a
claim that the reader is behind. LLM-written launch posts default to this shape.

| Pattern                                                        | Problem                                          |
| -------------------------------------------------------------- | ------------------------------------------------ |
| "...and most teams haven't noticed."                           | Fake-insider tease; flatters writer, nags reader |
| "...and nobody realises / you probably missed it."             | Same manufactured-secret hook                    |
| "X changed the answer / changed the game / rewrote the rules." | False agency — a release does a thing, name it   |
| "X quietly changed how Y works."                               | "quietly" smuggles in the same secret-knowledge  |

Example of the whole shape to never write: _"Vitest 4.0 changed the default answer for
testing a component in a real browser, and most teams have not noticed."_

**Instead:** State what shipped and what it does. "Vitest 4 ships Browser Mode stable;
it runs your component test inside a real Chromium." Name the change and who does the
work. Trust the reader to judge whether they knew.

## Fabricated Prevalence

Claiming what a group does without a source that measured it. Neither the writer nor the
reader can know what "most teams" do. It reads as authority; it is invention. This is the
soft cousin of the lazy extremes (`every`/`never`/`nobody`) — the quantifier is fuzzier
(`most`, `many`, `a lot of`), so it slips past a scan for absolutes while making the same
unmeasured claim.

| Pattern                                              | Problem                                         |
| ---------------------------------------------------- | ----------------------------------------------- |
| "Most teams / many teams / a lot of teams [do X]"    | Unmeasured prevalence stated as fact            |
| "Teams keep their X in a wiki" (unquantified plural) | Implies a norm the writer never measured        |
| "No one edits / everyone reaches for X"              | Absolute version of the same invented claim     |
| "The industry / the field has settled on X"          | Same guess, dressed as consensus                |
| "Developers tend to / people usually [do X]"         | Armchair claim about a population you can't see |

Example of the shape to never write: _"Most teams keep their flaky-test quarantine in a
wiki page."_ — you have no data on what most teams do.

**Instead:** Two moves. (1) If a named source measured it, cite it inline: "JetBrains'
2026 survey puts developer AI use at 90%." (2) Otherwise drop the population and address
the reader, or state the mechanism on its own: "If you keep your quarantine in a wiki
page, it goes stale." or "A wiki-page quarantine goes stale the week after you write it."
Never assert a prevalence you cannot source.

## Formulaic Constructions

| Pattern                   | Problem                     |
| ------------------------- | --------------------------- |
| "By the time X, I was Y." | Narrative template          |
| "X that isn't Y"          | Indirect. Say "X is broken" |

## False Agency

Giving inanimate things human verbs. Complaints don't "become" fixes. Bets don't "live or die." Decisions don't "emerge." A person does something to make those things happen. AI loves this because it avoids naming the actor.

| Pattern                         | Problem                                                           |
| ------------------------------- | ----------------------------------------------------------------- |
| "a complaint becomes a fix"     | The complaint did nothing. Someone fixed it.                      |
| "a bet lives or dies in days"   | Bets don't have lifespans. Someone kills the project or ships it. |
| "the decision emerges"          | Decisions don't emerge. Someone decides.                          |
| "the culture shifts"            | Cultures don't shift on their own. People change behavior.        |
| "the conversation moves toward" | Conversations don't move. Someone steers.                         |
| "the data tells us"             | Data sits there. Someone reads it and draws a conclusion.         |
| "the market rewards"            | Markets don't reward. Buyers pay for things.                      |

**Instead:** Name the human. "The team fixed it that week" beats "the complaint becomes a fix." If no specific person fits, use "you" to put the reader in the seat.

## Narrator-from-a-Distance

Floating above the scene instead of putting the reader in it.

| Pattern                   | Problem                 |
| ------------------------- | ----------------------- |
| "Nobody designed this."   | Disembodied observation |
| "This happens because..." | Lecturer voice          |
| "This is why..."          | Same                    |
| "People tend to..."       | Armchair sociologist    |

**Instead:** Put the reader in the room. "You don't sit down one day and decide to..." beats "Nobody designed this."

## Passive Voice

Every sentence needs a subject doing something. Passive voice hides the actor and drains energy.

| Pattern                    | Fix                  |
| -------------------------- | -------------------- |
| "X was created"            | Name who created it  |
| "It is believed that"      | Name who believes it |
| "Mistakes were made"       | Name who made them   |
| "The decision was reached" | Name who decided     |

**Instead:** Find the actor. Put them at the front of the sentence.

## Sentence Starters to Avoid

| Pattern                                                         | Fix                                             |
| --------------------------------------------------------------- | ----------------------------------------------- |
| Sentences starting with What, When, Where, Which, Who, Why, How | Restructure. Lead with the subject or the verb. |
| Paragraphs starting with "So"                                   | Start with content                              |
| Sentences starting with "Look,"                                 | Remove                                          |

Wh- openers become a crutch. "What makes this hard is..." becomes "The constraint is..." or better, name the specific constraint.

## Rhythm Patterns

| Pattern                        | Fix                                                 |
| ------------------------------ | --------------------------------------------------- |
| Three-item lists               | Use two items or one                                |
| Questions answered immediately | Let questions breathe or cut them                   |
| Every paragraph ends punchily  | Vary endings                                        |
| Em-dashes                      | Remove. Use commas or periods. No em dashes at all. |
| Staccato fragmentation         | Don't stack short punchy sentences                  |
| "Not always. Not perfectly."   | Hedging disguised as reassurance                    |

## Word Patterns

| Pattern                                                                                               | Problem                                                    |
| ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Lazy extremes (every, always, never, everyone, everybody, nobody)                                     | False authority. Use specifics instead of sweeping claims. |
| All adverbs (-ly words, "really," "just," "literally," "genuinely," "honestly," "simply," "actually") | Empty emphasis. See phrases.md for full list.              |
