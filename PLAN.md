# Study & Design Plan — Defusing K-pop Fandom Toxicity with a Social-Media Feature

> **Status:** working protocol (post-pivot). Supersedes the Lakers/Celtics + embedded-agent
> design. Companion docs: [`OUTLINE.md`](OUTLINE.md) (framing) and [`MEASURES.md`](MEASURES.md)
> (instruments). Several specifics are still open team decisions — see §13.

## 1. Overview
Rival K-pop fandoms direct sustained, genuinely toxic hostility at one another online. We
test whether a single, **generalizable social-media feature** can reduce that toxicity by
**indirectly activating a shared superordinate identity** ("K-pop fans") — getting rival
fans to *act* as one group rather than *telling* them they are one. The feature (the
**Collab Spotlight**, §4) makes members of two rival fandoms co-create and co-share content
about K-pop as a whole. We compare a plain K-pop social platform (control) against the same
platform plus the feature (intervention), with **toxicity as the primary outcome**. The
LLM is hidden implementation, not a conversational agent, and is openly disclosed as
automated — there is no human-impersonating bot.

## 2. Background & theory
- **Affective polarization** is animosity toward an out-group rooted in social identity
  rather than substantive disagreement (Tajfel & Turner 1979; Iyengar et al. 2019). In fan
  communities it shows up as toxic intergroup hostility.
- **Common In-group Identity Model (CIIM)** (Gaertner & Dovidio 2000): recategorizing two
  rival groups under a shared **superordinate** identity redirects in-group favoritism
  across the old boundary, reducing bias — most safely as a **dual identity** that preserves
  the subgroup to avoid distinctiveness threat (Crisp et al. 2006; Leach et al. 2008).
- **Indirect activation (the pivot's core).** Identity is activated by context and behavior,
  not by assertion (Self-Categorization Theory; Turner et al. 1987). You do not tell people
  "you are all K-pop fans" — and a bot especially cannot, since it is not in their human
  in-group. Instead you give them an **activity that presupposes the superordinate category**
  (e.g., co-creating "what makes K-pop great"), and self-categorization follows.
- **Model paper:** GuesSync! (Rajadesingan et al., CSCW 2023) — a casual-game platform
  intervention that reduced affective polarization, measured with a feeling thermometer +
  willingness-to-engage. We adopt its validated outcomes and control-vs-intervention design,
  and extend it from individual-level misperception-correction to **group-level enacted
  recategorization**, foregrounding toxicity.

## 3. Research questions & hypotheses
- **RQ1 (control baseline).** In a plain K-pop social platform, what is the nature and level
  of toxicity / incivility in rival-fandom interaction?
- **RQ2 (feature effect + mechanism).** Does a cross-fandom co-creation / shared-share
  feature that *indirectly* activates the superordinate "K-pop fan" identity reduce toxicity
  and affective polarization between rival fandoms, and is the effect **mediated** by an
  increased common-in-group representation **without eroding subgroup identification**?

Hypotheses:
- **H1.** Session toxicity is lower in the intervention arm than the control arm. *(primary)*
- **H2.** Affective-polarization change (pre→post) is more favorable in the intervention arm
  (feeling-thermometer difference shrinks; social distance drops).
- **H3.** The effect on toxicity/AP is **mediated** by an increase in common-in-group
  identity representation (CIIM, Block F).
- **H4.** Subgroup (fandom) identification does **not** erode — the superordinate identity is
  *added* (dual identity), not substituted.
- **H5 (guardrail).** State reactance is **not** elevated in the intervention arm (no
  distinctiveness-threat backfire), especially among high identifiers.

## 4. Intervention feature spec — "Collab Spotlight"

### 4.1 Abstract definition (so it generalizes)
A native social-media artifact (a "post type") that **cannot be completed by one subgroup
alone**. The platform surfaces a **superordinate-category prompt** — framed around the whole
category, never around either rival subgroup — and the artifact only **publishes** once
contributions from **members of two different rival subgroups** are combined. The finished
artifact carries **both subgroups' tags** and is **shared together** under the superordinate
banner. The three load-bearing parts are domain-free:
1. **superordinate-category framing** of the task,
2. **structural interdependence** (publication requires both sides),
3. **co-attributed, co-shared output** (the artifact is *ours*).

Swap the category and the rivals and it transfers to any polarized groups (political,
gaming, music). K-pop is the **testbed**, not the contribution.

### 4.2 K-pop instantiation
Platform = a plain K-pop social feed (Reddit/Twitter-like: posts, comments, likes, shares,
fandom flair). Two rival fandoms are the subgroups; "K-pop fans" is the superordinate
category. Flow of an in-feed **"K-pop Collab Spotlight"** card:
1. **Prompt (superordinate-framed):** e.g., "What's a moment that made you fall for K-pop?"
   / "Build the ultimate cross-group K-pop playlist." Always about K-pop as a whole — never
   "defend your group."
2. **Contribute (native affordance):** the user adds their piece (a song pick, a caption
   line, a clip, a one-sentence reason) — it just feels like composing a post.
3. **Pairing (structural gate):** the draft is held until a contributor whose flair belongs
   to a **different fandom** completes it. UI shows "Waiting for a fan from another group to
   finish this with you" — interdependence is visible; the *common label* is never asserted.
4. **Co-publish:** the merged artifact posts to the feed **tagged with both fandom flairs**
   under a neutral superordinate header ("A K-pop Collab"); both contributors credited.
5. **Shared share:** the **Share** button posts the artifact *as from both of them*; likes
   and replies accrue to the **joint** object, so cross-group praise lands on a shared
   product rather than on either side.

The user never reads "you and they are one group." They (a) answered a K-pop-level question,
(b) needed a rival-fandom member to finish it, and (c) shared the result together. Identity
is **enacted, then self-inferred** — the indirect route.

### 4.3 Where the LLM sits (hidden) and why it is transparent
The LLM is **infrastructure, never an interlocutor**:
- generates/curates the rotating superordinate-framed prompts (filters out any pro-one-
  subgroup framing);
- **balances and merges** the two sides' contributions 50/50 into a coherent co-artifact
  (a dual-identity safeguard so neither fandom dominates);
- assists **pairing** a waiting contribution with a complementary one from the other fandom;
- optional **minimal** slur-flagging before co-publish (kept light to avoid contaminating
  the toxicity DV — see §12).

**No deception.** There is no humanlike persona and no claim of personhood, so the
r/ChangeMyView undisclosed-AI problem does not arise. Onboarding and a persistent notice
disclose that "Collab prompts and artifact assembly are automated." Disclosure costs
nothing here because the mechanism is the *users' own joint action*, not persuasion by a
machine.

### 4.4 Design element → CIIM antecedent
| Design element | CIIM antecedent |
|---|---|
| Superordinate-framed prompt | salient superordinate cue via **indirect** category activation (SCT) |
| Publication gate requires both fandoms | **interdependence / common goals** (Sherif) |
| Artifact "succeeds" only if both contribute | **common fate** (shared outcome) |
| Both flairs kept + 50/50 balancing | **dual-identity preservation** (anti distinctiveness threat; Crisp et al. 2006) |
| Co-share + likes/replies on the joint object | public **reinforcement** of the recategorized boundary |

## 5. Conditions
- **Control:** a fully functional plain K-pop social feed (posts, comments, likes, shares,
  flair, threads) seeded with naturalistic, mildly contentious rival-fandom threads —
  **everything except the Collab Spotlight**. Its job is to capture **baseline toxicity**
  through the identical logging/measurement pipeline.
- **Intervention:** the identical platform **+ the Collab Spotlight** surfaced into the same
  feed. Same threads, affordances, and logging; the feature is the **sole** manipulated
  variable.

## 6. Design
**Between-subjects on condition, pre/post (mixed) within arm.** Each participant is in one
arm only. Rationale:
- **Demand characteristics:** the mechanism is *indirect* priming; a within-subjects crossover
  would tip participants to the hypothesis and confound order with effect.
- **Toxicity is a one-shot behavioral DV:** a participant's first-session incivility baseline
  cannot be re-collected.
- The advisor's "control then intervention" sequence is a **build/logistics** sequence, not a
  crossover (see §8).

Mitigations for the cost of between-subjects: collect **pre-exposure identification and
baseline AP for everyone** as covariates (ANCOVA), and **block-randomize on baseline
fandom-identification strength** so high identifiers (most at risk of backfire) are balanced
across arms.

## 7. Participants
- **Frame:** active members of two clearly **rival** K-pop fandoms (specific pair = open
  decision, §13). Recruit from fandom spaces (subreddits, Discords, Twitter, university
  K-pop clubs) with a panel/Prolific top-up for balance.
- **Balanced cells** from each fandom so cross-fandom pairing is possible and AP is measured
  in both directions; flair pre-assigned by self-identified primary fandom.
- **Eligibility:** (a) self-identifies with one target fandom and **not** a strong dual-fan
  of both; (b) actively engages with K-pop online (frequency screen); (c) 18+; (d) language
  proficiency; (e) passes attention checks.
- **Identification threshold:** require above-midpoint fandom identification (FISI / Leach
  self-investment) so participants are genuinely in-group; record the continuous score for
  ANCOVA/blocking regardless.
- **Target N:** GuesSync-class AP effects are small-to-medium; plan **~120–160 per arm**
  (~240–320 total) to retain power after exclusions and to support the identification ×
  condition interaction. A formal pre-registered power analysis (mixed ANCOVA + mediation)
  goes here before launch.

## 8. Procedure & timeline (per arm, one session)
1. **Screen & consent** (consent flags exposure to potentially uncivil fan discourse).
2. **Pre-survey (T0):** fandom identification (FISI + Leach), baseline AP battery toward the
   rival fandom, common-in-group-identity baseline, IOS, trait baseline, trait reactance.
3. **Onboarding** with the constant automation-disclosure notice (identical across arms).
4. **Interaction session** (fixed duration, e.g. 20–30 min): browse/post/comment/like/share
   in seeded rival threads. Intervention arm must complete **≥1 Collab Spotlight** (the
   dose). **All behavior logged** → toxicity / cross-group-engagement / LIWC stream.
5. **Post-survey (T1):** full AP battery, common-in-group identity (mediator), IOS, trait
   ratings, willingness-to-engage, state reactance, manipulation/awareness checks,
   automation-disclosure comprehension check.
6. **Debrief.**

**The "~2-week" gap = a build window.** Run the **control** with the plain interface; build
the intervention during the gap; then run the **intervention**. **Preferred:** use the gap to
build only, then run **both arms concurrently** with random assignment (preserves clean
causal inference). **Fallback:** sequential cohorts — acceptable but introduces a **history
confound** (a comeback / scandal / awards show between runs could move toxicity); if forced,
log major fandom events in the window, hold seeded content and recruitment constant, and treat
events as covariates/threats.

## 9. Measures (see [`MEASURES.md`](MEASURES.md) for instruments & citations)
| Measure | Type | T0 | During (logs) | T1 |
|---|---|:--:|:--:|:--:|
| **Toxicity / incivility — PRIMARY DV** (Perspective API + Coe et al. 2014 coding + K-pop lexicon) | behavioral | — | ✔ | — |
| Cross-fandom engagement (cross-flair likes/shares/replies, co-shares) | behavioral | — | ✔ | — |
| LIWC we/they recategorization | behavioral | — | ✔ | — |
| Affective polarization (feeling thermometer, social distance, traits, allocation) | survey | ✔ | — | ✔ |
| Common in-group identity (CIIM **mediator**) | survey | ✔ | — | ✔ |
| IOS (self–out-group overlap) | survey | ✔ | — | ✔ |
| Willingness to engage | survey | (✔) | — | ✔ |
| Fandom identification (FISI / Leach) | survey | ✔ (covariate/block) | — | ✔ (dual-identity check) |
| Reactance (trait → state, guardrail) | survey | ✔ | — | ✔ |

Toxicity is purely behavioral/during (the point of foregrounding it); AP/CIIM are pre/post
survey deltas testing the **mechanism** behind any toxicity difference.

## 10. Analysis plan
- **Primary:** between-arm contrast on session toxicity (per-participant aggregate of
  per-message Perspective scores; secondary peak/trajectory).
- **Secondary:** AP change × condition (mixed ANCOVA, pre as covariate, block on
  identification).
- **Mechanism:** mediation of condition → outcome through ΔCIIM common-in-group identity.
- **Moderation/guardrail:** identification × condition interaction; state-reactance check.
- **Robustness:** intent-to-treat **and** per-protocol (by Collab dose); pre-registration of
  primary DV and mediation path.

## 11. Ethics / IRB
Informed consent covering exposure to (and logging of) uncivil content; **automation
disclosure** (no human-impersonating agent); **log pre-moderation text** so toxicity is
scored on what users actually wrote; no instigation of new harassment; anonymize any
real-discourse seed content and collect no PII from fandom spaces; right to withdraw; a plan
for participants distressed by toxic content; full debrief.

## 12. Threats to validity
| Threat | Handling |
|---|---|
| Demand characteristics | between-subjects; indirect (never declared) cue; constant disclosure; T1 awareness check to flag/exclude hypothesis-guessers |
| History (sequential cohorts) | prefer concurrent randomized run; else log events, hold content/recruitment constant, covary |
| Selection / non-equivalent arms | random assignment; block on baseline identification + AP; ANCOVA on pre-scores |
| Distinctiveness-threat backfire (high identifiers) | dual-identity preservation (both flairs, 50/50); reactance guardrail; identification × condition analyzed |
| Toxicity-DV contaminated by moderation | minimal, **identical** slur-flagging across arms; score on pre-moderation text |
| Dose non-compliance | ≥1 Collab required; record dose; ITT + per-protocol |
| Pairing stalls (no rival available) | disclosed automated standby contribution pool — never a hidden confederate |
| Ecological validity | seed threads from real, anonymized rival-fandom discourse |

## 13. Open decisions (team)
1. **Which two rival fandoms + which superordinate framing** ("K-pop fans" broadly vs. a
   tighter, more psychologically real shared category). **Pilot the CIIM baseline** to
   confirm the superordinate registers before committing.
2. **Concurrent vs. sequential cohorts** for the build gap (recommend concurrent after build).
3. **IRB** scope for recruiting real fans + logging real toxicity.
4. **LLM transparency vs. effectiveness:** exact disclosure wording, and how much merging is
   acceptable before the artifact stops being genuinely the participants' joint product.
5. **Toxicity-DV vs. moderation:** the minimal safety filtering that still preserves an
   unfiltered measure, identical across arms.
6. **Dose:** how many Collab completions constitute "the intervention" (and dose-response?).

## 14. Out of scope (recommended follow-up)
`METRICS.md`, `README.md`, and `index.html` still describe the old Lakers/Celtics agent demo
and will be inconsistent with this plan until updated. Recommended next step once the rivalry
and superordinate framing are locked: update those and rebuild the prototype as the control
interface + Collab Spotlight feature.
