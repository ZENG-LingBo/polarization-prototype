# Reviewer risks — the questions this study will be asked, and our answers

Working document for the team (and for the Overleaf methods section). Written against the
**realized v3.1 design**: 4v4 groups, whole-group arms, **two days** with the feature firing
inside Day 1, one EXPT and one CTRL group per language ([`PLAN.md`](PLAN.md) §17.1).

Ordered by how much damage each does if we have no answer.

---

## 1. "Your N is the number of groups, not the number of people." — **fatal if unaddressed**

Everyone in a group talks to the same seven people, so messages are not independent. With one
group per cell we have **n = 1 cluster per arm per language**. A significance test on the arm
effect computed over messages is pseudo-replication, and it is the most common methods
desk-reject in exactly this literature.

**Our answer.** We do not run that test. The study is pre-registered as a **feasibility pilot
plus qualitative study**: RQ2 (how posting changes after the intervention) by qualitative
coding of the interaction logs, the exit interviews, and an end-to-end demonstration of the
platform, pairing, blinding and instrumentation. Toxicity is reported **descriptively, per
group**, with all four trajectories shown and never pooled. The pilot's between-group variance
and ICC are reported precisely because they are the inputs a confirmatory cluster-randomized
study needs (~8–12 groups/arm).

**What would strengthen it:** more groups. Every additional 4v4 group is one more cluster, and
this is the single highest-value thing we can buy with recruiting budget.

## 2. "Day 1 was repeated until it was toxic, so of course Day 2 is lower." — **fatal if unaddressed**

Selecting a baseline on the outcome guarantees regression toward the mean. Any within-arm
Day1→Day2 decline is expected with a completely inert intervention.

**Our answer (strengthened in v3.1).** The feature now fires **inside Day 1** at a trigger
point applied identically in both arms, and the reported contrast is the **condition × phase
difference-in-differences**: the EXPT group's pre-task → post-task change relative to the CTRL
group's change across the same two phases. Never a within-arm drop. Because both arms are
triggered the same way, novelty, fatigue and regression toward the mean apply to both and
cancel in the contrast. Day 2 is reported separately as the persistence question. Events carry
the phase they were written in, so this is computed rather than reconstructed. The G1–G3
checks are labelled in the dashboard and the paper as **operational go/no-go gates**, not as
evidence.

## 3. "Your control isn't matched." — **serious; limits the claim**

CTRL is a solo poll taking seconds; EXPT is a minutes-long collaboration **with a member of
the rival fandom**. The arms differ in cross-group contact, time-on-task, and effort all at
once. The three-arm design that isolated this (the neutral-prompt active control, C1) was
dropped for N.

**Our answer.** We claim **"a shared cross-group task reduces toxicity relative to an inert
feature"** — a feature-level claim — and explicitly *do not* claim that superordinate
recategorization is the active ingredient. The mechanism hypotheses (H3) are demoted to
exploratory. Toxicity is reported as a **rate per message** and time-in-threads is covaried,
so a reduction is not merely reduced exposure. Isolating the mechanism needs the C1 arm and
is named as the next study.

## 4. "The 'co-created' artifact was written by a language model." — **serious; settled, and it costs us something**

**Decided: we keep the synthesis.** The published note is composed by the model from both
contributions ([`PLAN.md`](PLAN.md) §4.3). The paper draft still describes verbatim
publication in four places and must be corrected — replacement text is in
[`PAPER_EDITS.md`](PAPER_EDITS.md).

**Our answer.** It is part of the manipulation, not hidden infrastructure, and four things
make it defensible: (a) **the DV is uncontaminated** — notes are stored as
`type='note_published'` and every toxicity aggregate filters `type IN ('post','comment')`, so
model text is never scored ([`TOXICITY_MEASUREMENT.md`](TOXICITY_MEASUREMENT.md));
(b) **it is disclosed** at onboarding and debrief, in both languages; (c) **the claim is
scoped to the bundle** (pairing + synthesis), with no attribution to either component;
(d) **the fallback is recorded** — when the model is unavailable a mechanical assembly is
published so no session stalls, `collabs.ai_merged` marks it, and those sessions are excluded
per-protocol rather than silently mixed into the treatment arm.

**What it costs.** We cannot claim participants co-wrote the published sentence; the
interdependence is structural (neither side can publish alone, both are credited, both badges
stay on the note) while the wording is synthesised. Say this in the limitations rather than
letting a reviewer find it. **M3** in the micro-check measures exactly this — how much the
note feels equally shared — so the risk is instrumented rather than assumed.

## 5. "How was toxicity measured, and is it valid?" — **serious; work still owed**

Live scores are a bilingual wordlist plus a single-shot `qwen-turbo` rating — documented
honestly in [`TOXICITY_MEASUREMENT.md`](TOXICITY_MEASUREMENT.md), and **not** a published
instrument.

**Our answer.** Live scores run the study; the paper rescores the stored pre-moderation
`text_raw` with the registered instruments (Perspective API + Coe et al. 2014 + the K-pop
lexicon, [`MEASURES.md`](MEASURES.md)), reports a **human-coded subsample with Krippendorff's
α**, and reports results **with and without** the lexicon layer. Open item from
[`PLAN.md`](PLAN.md) §13.7: the lexicon must be validated first — "flop", "nugu", "糊了" may be
competitive-but-civil fan jargon rather than incivility. English/Chinese comparability is
currently unestablished and must be stated as a limitation.

## 6. "Did the stimulus change across days?" — **fixed, but say so**

It did: Day 1 carried two rival provocations while later days carried a mild neutral prompt,
which would have lowered toxicity on Day 2 in **both** arms for reasons unrelated to the
intervention — and could have failed the "control stays high" gate spuriously.

**Our answer.** Fixed before the run: **both** days carry **intensity-matched seed sets** (one
ARMY-flair and one BLINK-flair comparative claim inviting rebuttal). Pre-register which set
lands on which day; counterbalance across groups if the group count ever allows it. This
matters less than it did now that the primary contrast is within Day 1 against a common
trigger point — but Day 2's persistence read-out still depends on it.

## 7. "What about demand characteristics?"

Two days, a survey after each session, and a highly salient feature appearing mid-session.

**Our answer.** The participant UI, recruiting materials and surveys never state the purpose
(blinding is implemented — all research language lives in the researcher-only dashboard).
T1 awareness checks flag participants who guessed the hypothesis, and the exit interview
records guesses; both are reported and used in a sensitivity analysis.

## 8. "What about the ethics of provoking toxicity toward real people?"

We recruit strongly-identified fans and seed prompts designed to elicit hostility about **real,
named artists**.

**Our answer.** Required before the run, not after: IRB approval; informed consent covering
exposure to *and production of* uncivil content; enforced 18+ verification beyond self-report
(K-pop fandoms skew young); a duty-of-care escalation threshold for self-harm or credible
threats; retention limits on stored pre-moderation text; debrief. Seeds stay **group-vs-group**
and are anonymized/paraphrased, never targeting individuals. **Anything done to the run gets
reported** — including situational encouragement and any repeated Day 1. The earlier phrasing
about "spice" not being reported has been removed from the protocol; it would be a
research-integrity problem, not a methods choice.

## 9. "Is 'K-pop fans' actually a superordinate identity for these two fandoms?"

The whole CIIM mechanism is conditional on it, and ARMY × BLINK is cross-gender and diffuse.

**Our answer.** [`PLAN.md`](PLAN.md) §13.1 makes the CIIM baseline pilot a **gating
precondition**. *Status: not yet run — this is an open blocker, not a documentation gap.*

## 10. "What generalizes from two fandoms, one platform, two days?"

**Our answer.** Nothing is claimed to generalize across domains. K-pop is the **testbed**; the
mechanic is specified domain-independently so it is a *candidate* for transfer, and the
politics study (§15) is designed to map the **boundary** — where a contested superordinate
should make it fail. Running the same manipulation in **two languages** is a genuine
robustness demonstration and is reported as two parallel case replications.

---

## Owed before Day 1 of the real run

| Item | Owner | Status |
|---|---|---|
| CIIM superordinate pilot (§13.1 gate) | team | **not run — blocker** |
| IRB approval + 18+ verification + duty-of-care protocol | team | open |
| K-pop lexicon validated, tokens pre-registered | team | open |
| Final seed prompts (2 intensity-matched sets) | team | placeholder text in place |
| Surveys | — | ✅ embedded in-app ([`SURVEYS.md`](SURVEYS.md)); Chinese needs team review |
| Recruiting target confirmed (32 for 4 groups of 4v4) | team | open — see §17.1 arithmetic |
| Pre-registration written (pilot framing, DiD estimand, gates ≠ evidence) | team | open |
