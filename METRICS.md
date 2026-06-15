# DefuseLab metrics — what the live panel means

The right-hand panel shows four live meters that update after every post. They exist to
make the intervention's effect **visible during a demo** — when you run the scenario with
agents ON, the temperature should fall, the “we” share should rise, and cross-group
engagement should climb.

> ⚠️ **These are transparent, lightweight heuristics for demonstration — not the study's
> measurements.** The real study uses validated, peer-reviewed instruments (Perspective
> API, LIWC, human incivility coding, validated surveys). See the mapping table at the
> bottom and [`measures.md`](https://github.com/ZENG-LingBo/polarization/blob/main/measures.md)
> in the study repo.

---

## 1. Thread temperature (Hostility)
**What it is.** A fast-reacting gauge of how hostile the conversation feels *right now*.

**How it's computed.** The mean toxicity (see §2) of the **last 6 posts**, scaled 0–100.
Because it only looks at recent posts, it rises and falls quickly as the mood changes —
that's what makes the agents' effect visible mid-scenario.

**Color bands.** Cool (green) ≤ 33 · Warm (amber) 34–60 · Hot (red) > 60.

**What it demonstrates.** Run the scenario with **Agents OFF** → it climbs and stays hot.
With **Agents ON** → it drops once Phase 2–3 kick in. That gap is the whole point.

**Real-study analogue.** A per-message **Perspective API** toxicity trajectory over the
session, plus human **incivility coding** (Coe et al. 2014). → RQ1 (behavior/process).

---

## 2. Toxicity (avg)
**What it is.** The cumulative average toxicity across **all** posts in the thread (unlike
temperature, which is only the recent window).

**How it's computed.** Each post gets a score:
`toxicity = min(1, hits / 3)`, where `hits` = the number of words from a small built-in
**toxic-term lexicon** it contains (clown, trash, delusional, ratio, cope, bandwagon,
fraud, overrated, 🤡, etc.), **+1** if the post contains a run of 4+ capital letters
(shouting). The meter shows the mean of those scores as a %.

**What it demonstrates.** The overall toxicity “level” of the thread; moves slower than
temperature.

**Real-study analogue.** **Perspective API** (Lees et al. 2022) toxicity/insult/threat
scores + the **incivility codebook** (name-calling, aspersion, vulgarity; Coe et al.
2014). → RQ1.

**Caveat.** The lexicon does crude substring/word matching, so it's approximate (it can
miss sarcasm and occasionally over-counts). It's meant to be *legible*, not accurate — the
study replaces it with a trained classifier + human coders.

---

## 3. “we/us” vs “they/them” (pronoun ratio)
**What it is.** A proxy for whether people are framing the conversation as **one group**
(“we”) or **two opposed groups** (“they/you”).

**How it's computed.** Counts first-person-plural words (we, us, our, we're, …) and
out-group/second-person words (they, them, their, you, your, y'all, …) across all posts.
The meter = `we / (we + they)`, shown as `we:they (X% we)`. Higher = more shared-identity
language.

**What it demonstrates.** As agents seed the cooperative task and model “we're all NBA
fans,” the **“we” share rises** — the linguistic signature of recategorization (CIIM).

**Real-study analogue.** **LIWC** pronoun categories (Tausczik & Pennebaker 2010) — the
we/they ratio is one of the most theory-aligned markers of common in-group identity. →
RQ1 / RQ3 (mechanism).

**Caveat.** Treating “you” as out-group framing is a rough rule (it's friendly half the
time). LIWC's validated dictionaries handle this far better.

---

## 4. Cross-group engagement
**What it is.** A running count of **constructive cross-rival interactions** — agents (or
people) replying across team lines rather than piling on within their own side.

**How it's computed.** Increments each time an agent posts in the cooperative/identity
phases or replies to one of your posts; the bar normalizes the count against a target of 6.

**What it demonstrates.** Hostile threads are mostly **in-group** pile-ons; defusing shows
up as **cross-group** replies. This meter rising = the structural goal working.

**Real-study analogue.** Behavioral coding of **cross-group vs. in-group replies** from the
[observation codebook](https://github.com/ZENG-LingBo/polarization/blob/main/coding_templates/observation_codebook_seed.csv)
(reply-to-rival, concede-point, genuine-question). → RQ1 / RQ3.

---

## How to read a demo run
1. **Agents OFF → Run scenario.** Temperature climbs to Hot; “we” share stays low;
   cross-group ~0. This is the echo chamber.
2. **Agents ON → Run scenario.** Phase 1 is still hostile, then Phase 2 (cooperative task)
   and Phase 3 (peer agents modeling de-escalation) pull temperature down, push the “we”
   share up, and raise cross-group engagement.
3. The **difference between the two runs** is the visual story of the intervention.

---

## Demo metric → real instrument (don't conflate them)

| Panel meter | Demo computation | Validated study instrument | Construct | RQ |
|---|---|---|---|---|
| Thread temperature | rolling mean toxicity, last 6 posts | Perspective API trajectory + incivility coding | session hostility over time | RQ1 |
| Toxicity (avg) | keyword lexicon, `min(1, hits/3)`, +caps | Perspective API (Lees 2022) + incivility codebook (Coe 2014) | toxicity / incivility | RQ1 |
| we/they ratio | word counts, `we/(we+they)` | LIWC pronoun categories (Tausczik & Pennebaker 2010) | common in-group identity | RQ1 / RQ3 |
| Cross-group engagement | count of cross/agent replies ÷ 6 | observation coding of cross-group replies | recategorization behavior | RQ1 / RQ3 |

The study also adds what the demo **cannot** show: pre/post **affective-polarization**
surveys (feeling thermometer, IOS), the **CIIM common-identity** mediator, and **reactance**
checks — all in [`measures.md`](https://github.com/ZENG-LingBo/polarization/blob/main/measures.md)
and [`survey_instrument.md`](https://github.com/ZENG-LingBo/polarization/blob/main/survey_instrument.md).
