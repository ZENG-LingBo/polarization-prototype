# Study & Design Plan — Defusing K-pop Fandom Toxicity with a Social-Media Feature

> **Status:** working protocol (post-pivot). Supersedes the Lakers/Celtics + embedded-agent
> design. Companion docs: [`OUTLINE.md`](OUTLINE.md) (framing) and [`MEASURES.md`](MEASURES.md)
> (instruments). Several specifics are still open team decisions — see §13.

## 0. Roadmap — two studies + extension
This is a **two-study** program, chosen after weighing domain options:
- **Study 1 (primary — this document):** **K-pop** rival fandoms — a clean Common-In-group-Identity
  test (real toxicity, a *non-contested* superordinate, identity-not-moral conflict). 3-arm RCT,
  **M1 (co-create / co-share)** feature, toxicity primary DV.
- **Study 2 (boundary condition — §15):** **politics** (abortion or transgender rights) — the
  strongest domain on stakes and native measurement, the *weakest* on the mechanism (no
  non-contested superordinate; substantive moral conflict). Run with a **different mechanism —
  M9 (shared interdependent goal / common fate), not co-create-celebration** — and native
  political measures. Its likely null/backfire **is** the contribution: the scope condition that
  indirect recategorization needs a non-contested superordinate.
- **Extension (future — §16):** a field A/B and/or longitudinal durability study.

## 1. Overview
Rival K-pop fandoms direct sustained, genuinely toxic hostility at one another online. We
test whether a single **social-media feature** can reduce that toxicity by **indirectly
activating a shared superordinate identity** ("K-pop fans") — getting rival fans to *act* as
one group rather than *telling* them they are one. The feature (the **Collab Spotlight**, §4)
makes members of two rival fandoms co-create and co-share content about K-pop as a whole. We
compare a plain platform (control), the same platform with a **neutral-prompt** version of
the feature (active control), and the **superordinate-framed** feature (intervention), with
**toxicity as the primary outcome**. The LLM is hidden, non-generative implementation
(templating, routing, layout — it does **not** author or rewrite user text), and is openly
disclosed as automated — there is no human-impersonating bot. The mechanic is specified
domain-independently so it is a **candidate** to transfer to other polarized groups;
demonstrating transfer is future work, not a claim of this study.

## 2. Background & theory
- **Affective polarization** — animosity toward an out-group rooted in social identity
  rather than substantive disagreement — is the construct (Iyengar et al. 2019); its
  social-identity basis is Social Identity / Self-Categorization Theory (Tajfel & Turner
  1979; Turner et al. 1987). In fan communities it manifests as toxic intergroup hostility.
- **Common In-group Identity Model (CIIM)** (Gaertner & Dovidio 2000): recategorizing two
  rival groups under a shared **superordinate** identity redirects in-group favoritism across
  the old boundary — most safely as a **dual identity** that preserves the subgroup to avoid
  distinctiveness threat (Crisp et al. 2006; Leach et al. 2008).
- **Indirect activation (the pivot's core).** Identity is activated by context and behavior,
  not by assertion (Turner et al. 1987). We do not tell people "you are all K-pop fans" — and
  a bot especially cannot, lacking human in-group standing. We instead give them an activity
  that presupposes the superordinate category. *Caveat:* the design still surfaces
  superordinate-framed prompts and an interdependence cue, so it **minimizes explicit
  assertion** rather than eliminating all category cues — the active-control contrast (§5)
  and the reactance guardrail (§3) test whether the indirect route adds value over an overt
  label. The mechanism also assumes "K-pop fans" is a psychologically real superordinate
  category; this is **conditional on the §13 pilot** confirming it registers.
- **Model paper:** GuesSync! (Rajadesingan et al., CSCW 2023) — a casual-game platform
  intervention that reduced affective polarization (survey feeling thermometer +
  willingness-to-engage). We adopt its validated *survey* outcomes and control-vs-intervention
  design, and extend it from individual misperception-correction to **group-level enacted
  recategorization** with **behavioral toxicity** as the primary DV. (GuesSync's effect sizes
  inform power for our *secondary* AP outcomes only — not the behavioral primary; see §7.)

## 3. Research questions & hypotheses
- **RQ1 (control baseline).** In a plain K-pop social platform, what is the nature and level
  of toxicity / incivility in rival-fandom interaction?
- **RQ2 (feature effect + mechanism).** Does a cross-fandom co-creation / shared-share
  feature that *indirectly* activates the superordinate "K-pop fan" identity reduce toxicity
  and affective polarization between rival fandoms, and is the effect linked to an increased
  common-in-group representation **without eroding subgroup identification**?

Hypotheses:
- **H1 (primary).** Session toxicity (rate per message) is lower in the intervention arm than
  in control, and lower than in the active control (isolating superordinate framing from
  generic cross-group contact/novelty).
- **H2.** Affective-polarization change (pre→post) is more favorable in the intervention arm
  (feeling-thermometer difference shrinks; social distance drops).
- **H3 (mechanism, correctly ordered).** (a) For the **T1 survey outcomes** (AP, IOS,
  willingness), the condition effect is **mediated by ΔCIIM common-in-group identity**
  (mediator and outcome both at T1; cross-sectional-mediation caveats stated). (b) For the
  **during-session toxicity** outcome, reduction is **associated with the during-session LIWC
  we/they recategorization marker** (a time-appropriate in-session proxy), since post-session
  CIIM cannot causally precede toxicity already emitted. We describe these as **consistent
  with** the recategorization account, not as establishing causal mediation.
- **H4 (dual-identity guardrail).** Subgroup (fandom) identification does **not** erode —
  tested by **equivalence testing** (TOST against a pre-registered smallest effect of
  interest), not by a non-significant NHST.
- **H5 (reactance guardrail).** State reactance is **not** elevated in the intervention arm,
  especially among high identifiers — also tested by **equivalence testing**.

## 4. Intervention feature spec — "Collab Spotlight"

### 4.1 Abstract definition (the design rationale for transfer)
A native social-media artifact (a "post type") that **cannot be completed by one subgroup
alone**. The platform surfaces a **superordinate-category prompt** — framed around the whole
category, never around either rival subgroup — and the artifact only **publishes** once
contributions from **members of two different rival subgroups** are combined. The finished
artifact carries **both subgroups' tags** and is **shared together** under the superordinate
banner. Three domain-free parts carry the design: (1) **superordinate-category framing**,
(2) **structural interdependence** (publication requires both sides), (3) **co-attributed,
co-shared output**. Because these are specified independently of K-pop, the mechanic is a
**candidate to transfer** to other polarized groups (political, gaming, music) — but a
single-rivalry study **cannot establish** cross-domain generalization; that is future work,
and political contexts in particular (where a felt superordinate identity is harder to
surface) may not transfer. K-pop is the **testbed**, not proof of generality.

### 4.2 K-pop instantiation
Platform = a plain K-pop social feed (Reddit/Twitter-like: posts, comments, likes, shares,
fandom flair). Two rival fandoms are the subgroups; "K-pop fans" is the superordinate
category. Flow of an in-feed **"K-pop Collab Spotlight"** card:
1. **Prompt (superordinate-framed):** e.g., "What's a moment that made you fall for K-pop?"
   / "Build the ultimate cross-group K-pop playlist." Always about K-pop as a whole.
2. **Contribute (native affordance):** the user adds their piece (a song pick, a caption
   line, a clip, a one-sentence reason) — it just feels like composing a post.
3. **Pairing (structural gate):** the draft is held until a **real** contributor whose flair
   belongs to a **different fandom** completes it (see §4.3 on availability). UI: "Waiting for
   a fan from another group to finish this with you."
4. **Co-publish:** the merged artifact posts to the feed **tagged with both fandom flairs**
   under a neutral superordinate header ("A K-pop Collab"); both contributors credited.
5. **Shared share:** the **Share** button posts the artifact *as from both of them*; likes
   and replies accrue to the **joint** object.

The user (a) answered a K-pop-level question, (b) needed a rival-fandom member to finish it,
and (c) shared the result together. Identity is **enacted, then self-inferred**.

### 4.3 Where the LLM sits (hidden, non-generative) and why it is transparent
The LLM is **infrastructure, never an interlocutor, and never an author**:
- generates/curates the rotating prompts **from a fixed, pre-registered template bank**
  (filtering out pro-one-subgroup framing);
- **routes pairing** (matches a waiting contribution to a complementary one from the other
  fandom);
- **assembles** the two sides' contributions into the artifact by **verbatim
  concatenation/ordering/layout only — it does not rewrite, paraphrase, summarize, or
  "balance" user text.** (The earlier "merge/balance 50/50" wording is dropped: any rewriting
  would make the LLM a generative co-author, re-introducing the agent Ray rejected and
  confounding the toxicity DV. Balancing is limited to *which* verbatim items appear and in
  what order, not their content.)
- optional **minimal slur-flagging** before co-publish, applied **identically across arms**
  and logged so the toxicity DV is scored on pre-moderation text (§10).

**Pairing availability & deception.** The manipulation is co-creation with a **real** rival.
We **guarantee live cross-fandom pairing for any Collab that counts toward the dose** by
running balanced sessions / scheduling so a real out-group partner is available; we do **not**
substitute an automated partner into a measured Collab. If, for queue smoothing, any
non-measured filler is ever auto-generated, the UI must **not** imply a human finished it and
the disclosure must specifically say "some contributions you see may be system-generated,"
covered again at debrief. A generic "assembly is automated" notice does **not** license the
specific "a fan from another group finished this with you" message — so that message is only
shown when it is **true**.

**Transparency.** No humanlike persona, no claim of personhood. Onboarding and a persistent
notice disclose that prompts and artifact assembly are automated. We **expect** disclosure
not to attenuate the effect because the active ingredient is the users' own joint action
rather than machine persuasion — but we treat this as an **open assumption** (§13.4), not a
settled fact.

### 4.4 Design element → CIIM antecedent
| Design element | CIIM antecedent |
|---|---|
| Superordinate-framed prompt | salient superordinate cue via **indirect** category activation (SCT) |
| Publication gate requires both fandoms | **interdependence / common goals** (Sherif) |
| Artifact "succeeds" only if both contribute | **common fate** (shared outcome) |
| Both flairs kept; verbatim, non-generative assembly | **dual-identity preservation** (anti distinctiveness threat; Crisp et al. 2006) |
| Co-share + likes/replies on the joint object | public **reinforcement** of the recategorized boundary |

## 5. Conditions (three arms)
The pure no-feature control cannot isolate *superordinate activation*, because the feature
adds cross-group contact, collaboration, novelty, and time-off-hostile-threads all at once.
We therefore use **three arms**:
- **C0 — Control:** a plain K-pop feed (posts, comments, likes, shares, flair, seeded
  rival-fandom threads), **no Collab**. Establishes the RQ1 toxicity baseline.
- **C1 — Active control:** the same feed **+ a cross-fandom Collab framed around a *neutral*,
  non-superordinate prompt** (e.g., "co-create a list of comfort foods"). Holds cross-group
  contact, co-creation, novelty, and time-on-task constant; **removes the superordinate
  framing**.
- **C2 — Intervention:** the same feed **+ the superordinate-framed Collab** (K-pop as a
  whole).

Key contrasts: **C2 − C0** = total feature effect; **C2 − C1** = the added value of
**superordinate framing specifically** (the mechanism); **C1 − C0** = generic
contact/collaboration/novelty. Only C2 − C1 licenses "indirect superordinate activation is
the active ingredient." (Two-arm fallback — C0 vs C2 only — is acceptable but then the
contribution must be framed as "feature vs. no feature," not as isolating recategorization;
see §13.)

## 6. Design
**Between-subjects on condition (C0/C1/C2), pre/post within arm.** Rationale: the mechanism is
*indirect* priming (a within-subjects crossover would tip the hypothesis and confound order),
and toxicity is a one-shot first-session behavioral DV.

**Toxicity baseline (new).** Because between-subjects randomization alone leaves the primary
behavioral DV without a covariate, every participant completes a short **standardized
pre-manipulation interaction block** (a fixed set of seeded mildly-contentious posts to
react to), logged identically across arms, yielding a **per-participant toxicity baseline**
for ANCOVA on the primary DV. We additionally pre-register **trait covariates** known to
predict incivility (trait reactance, identification).

**Randomization & blocking.** Random assignment, **block-stratified on baseline
fandom-identification strength captured at screening** (so high identifiers — most at risk of
backfire — are balanced across arms). The full FISI/Leach at T0 is the continuous covariate
and dual-identity baseline.

**Non-independence.** Participants are **not** independent: they share seeded threads and are
pairwise coupled by Collab pairing. Analyses use **session/cohort random effects** (mixed
models), model the cross-fandom pairing dyadically where relevant, and use cluster-robust
standard errors. The unit of analysis and dependency structure are pre-registered.

## 7. Participants
- **Frame:** active members of two clearly **rival** K-pop fandoms (specific pair = open
  decision, §13). Recruit from fandom spaces + a panel/Prolific top-up for balance.
- **Balanced cells** per fandom so live cross-fandom pairing is feasible; flair pre-assigned.
- **Eligibility:** single-fandom (not strong dual-fan); active K-pop engagement; **18+ with
  an age-verification step beyond self-report** (K-pop fandoms skew young — see §11); language
  proficiency; attention checks.
- **Identification threshold** captured **at screening** (above midpoint) and used for
  blocking; continuous score retained.
- **Power (keyed to the right outcomes).** The primary DV is **behavioral toxicity**, for
  which GuesSync gives **no** estimate. We run an a-priori power analysis on the toxicity
  aggregate using a pre-registered **smallest effect size of interest**, accounting for its
  skew / zero-inflation (e.g., a count/quasi-Poisson or rate model), ideally informed by a
  **pilot**. Separate **sensitivity / Monte-Carlo power** analyses cover the
  identification × condition **interaction** (≈4× the N of a main effect) and the **indirect
  (mediation) path**. GuesSync-class survey-AP effects power the **secondary** AP outcomes
  only. A three-arm design with an interaction is N-hungry; the earlier "~120–160/arm" is a
  placeholder — the real target follows the toxicity power analysis and may be larger. If N
  cannot power the interaction/mediation, they are demoted to **exploratory**.

## 8. Procedure & timeline (per arm, one session)
1. **Screen & consent** — eligibility, age verification, **identification (blocking item)**;
   consent flags exposure to (and logging of) uncivil content.
2. **Pre-survey (T0):** full fandom identification (FISI + Leach), baseline AP battery,
   common-in-group-identity baseline, IOS, trait baseline, trait reactance, **and the
   willingness-to-engage item (firm T0 measure, so the pre/post delta is clean)**.
3. **Standardized pre-manipulation interaction block** → per-participant **toxicity baseline**
   (identical across arms).
4. **Onboarding** with the constant automation-disclosure notice (identical across arms).
5. **Interaction session** (fixed duration, e.g. 20–30 min): browse/post/comment/like/share
   in seeded rival threads. C1/C2 additionally complete **≥1 Collab** (the dose), with a
   **guaranteed real cross-fandom partner** (§4.3). All behavior logged.
6. **Post-survey (T1):** full AP battery, common-in-group identity (mediator for T1 outcomes),
   IOS, trait ratings, willingness, state reactance, manipulation/awareness checks,
   automation-disclosure comprehension check.
7. **Debrief** (incl. any automated-content reconciliation).

**The "~2-week" gap = a build window.** Run **C0** first; build C1/C2 during the gap; then
run them. **Preferred:** use the gap to build only, then run **all arms concurrently** with
random assignment. **Fallback:** sequential cohorts — acceptable but introduces a **history
confound** (a comeback / scandal / awards show could move toxicity); if forced, log major
fandom events, hold seeded content and recruitment constant, and covary. *Note: this
reinterprets the advisor's literal "control → measure → gap → intervention → measure"
sequence (which reads within-subjects) as between-subjects with a build gap — get sign-off.*

## 9. Measures (see [`MEASURES.md`](MEASURES.md) for instruments & citations)
| Measure | Type | T0 baseline | During (logs) | T1 |
|---|---|:--:|:--:|:--:|
| **Toxicity / incivility — PRIMARY DV** (rate per message; Perspective API + Coe et al. 2014 + validated K-pop lexicon) | behavioral | ✔ (pre-block) | ✔ | — |
| Cross-group engagement — **ordinary** cross-flair replies/likes/shares (affordance common to all arms) | behavioral | — | ✔ | — |
| Collab co-shares (manipulation/dose indicator, **not** evidence of reduced animosity) | behavioral | — | ✔ (C1/C2) | — |
| LIWC we/they recategorization (**during-session mediator** for toxicity) | behavioral | — | ✔ | — |
| Affective polarization (feeling thermometer, social distance, traits, allocation) | survey | ✔ | — | ✔ |
| Common in-group identity (CIIM **mediator for T1 outcomes**) | survey | ✔ | — | ✔ |
| IOS (self–out-group overlap) | survey | ✔ | — | ✔ |
| Willingness to engage | survey | ✔ | — | ✔ |
| Fandom identification (FISI / Leach; blocking item at screening) | survey | ✔ | — | ✔ (dual-identity check) |
| Reactance (trait → state; equivalence-tested guardrail) | survey | ✔ | — | ✔ |

Cross-group engagement is scored on affordances present in **all** arms; Collab co-shares are
reported **separately** as a manipulation indicator (they are mechanically unavailable in C0
and would otherwise confound "more engagement" with "the feature creates co-shares").

## 10. Analysis plan
- **Primary:** condition effect on **toxicity rate per message** (mixed count/rate model with
  session random effects, cluster-robust SEs), ANCOVA-adjusted for the pre-block toxicity
  baseline + trait covariates. Report **rate**, not session totals, and **covary
  time-in-hostile-threads** so reduced *exposure* (less time in threads while doing the
  Collab) is separated from reduced *hostility*.
- **Toxicity-DV scope:** score toxicity only on **free-form thread posts/comments** (the
  surface common to all arms); **exclude** the LLM-assembled Collab-artifact text; if any
  artifact text is included, score the **raw pre-assembly user contributions**. Pre-register
  this.
- **Secondary:** AP change × condition (mixed ANCOVA, pre as covariate, block on
  identification).
- **Mechanism (correctly ordered, §3 H3):** ΔCIIM mediation for the **T1** outcomes only;
  during-session LIWC we/they as the in-session correlate of the toxicity effect.
- **Guardrails:** H4/H5 by **equivalence testing** (TOST / Bayesian) against pre-registered
  bounds — a non-significant NHST will **not** be read as confirming the null.
- **Robustness:** ITT **and** per-protocol (by Collab dose, excluding any non-live-paired
  Collabs); toxicity analysis **with and without** the K-pop lexicon layer (§MEASURES).
- Pre-registration of the primary DV, the causal ordering, the equivalence bounds, and the
  mediation paths.

## 11. Ethics / IRB
- Informed consent covering exposure to **and logging of** uncivil content; **automation
  disclosure** (no human-impersonating agent); **log pre-moderation text** so toxicity is
  scored on what users actually wrote.
- **Duty of care / escalation:** a protocol and threshold for logged content revealing
  self-harm intent or credible threats (mandatory-reporting boundary).
- **Data management:** secure storage, access controls, and a retention limit for retained
  pre-moderation toxic text; de-identification of authored slurs.
- **Participant-as-author harm:** acknowledge and mitigate harm from *producing* recorded
  harassment, not only from being exposed to it.
- **Age:** an enforced **18+ verification** beyond self-report (or an explicit risk
  statement), given K-pop fandoms skew young.
- No instigation of new harassment; anonymize real-discourse seed content; right to withdraw;
  distress-support plan; **debrief** including any automated co-creation/standby content.

## 12. Threats to validity
| Threat | Handling |
|---|---|
| **Active-ingredient confound** (contact/novelty vs. superordinate framing) | three arms; the C2 − C1 contrast isolates superordinate framing |
| **Novelty / time-on-task / distraction** (less time in hostile threads → lower toxicity by reduced exposure) | toxicity as **rate per message/min**; covary time-in-threads; active control equates novelty |
| Demand characteristics | between-subjects; indirect cue; constant disclosure; T1 awareness check to flag/exclude guessers |
| History (sequential cohorts) | prefer concurrent randomized run; else log events, hold content/recruitment constant, covary |
| Selection / non-equivalent arms | randomize; block on screening identification; ANCOVA on pre-block toxicity + AP |
| **No primary-DV baseline** | the pre-manipulation toxicity block (§6) supplies it |
| **Non-independence** (shared threads, dyadic pairing) | session random effects / dyadic models / cluster-robust SEs |
| Distinctiveness-threat backfire | dual-identity preservation; equivalence-tested reactance & identification guardrails; identification × condition |
| Toxicity-DV contamination (moderation **and** LLM assembly) | minimal identical slur-flagging; score free-form thread text only, exclude assembled artifact text |
| Dose non-compliance / non-live pairing | ≥1 **live-paired** Collab required; per-protocol excludes non-live Collabs |
| Ecological validity | seed threads from real, anonymized rival-fandom discourse |

## 13. Open decisions (team)
1. **Which two rival fandoms + which superordinate framing** ("K-pop fans" broadly vs. a
   tighter, more psychologically real shared category). **Pilot the CIIM baseline first** —
   this is a **gating precondition**: if the superordinate does not register, the mechanism
   (and the generalizability argument) does not hold. → candidate pairs, selection criteria,
   and the deciding pilot are worked through in [`FANDOM_SELECTION.md`](FANDOM_SELECTION.md).
2. **Three-arm (with active control C1) vs. two-arm fallback** — three arms isolate the
   mechanism but cost N; two arms force a "feature vs. no feature" framing.
3. **Concurrent vs. sequential cohorts** for the build gap (recommend concurrent after build).
4. **Pairing availability policy** — how to guarantee live cross-fandom partners for dosed
   Collabs (scheduling/queueing); any non-measured filler must be disclosed.
5. **IRB** scope: duty-of-care, data retention, participant-as-author harm, age verification.
6. **LLM transparency vs. effectiveness** (§4.3) and exact disclosure wording.
7. **K-pop incivility lexicon** must be **validated before use** (derive from coded data,
   report reliability vs. the Coe codebook, pre-register which tokens count) — "flop"/"nugu"
   may be competitive-but-civil jargon, not toxicity.
8. **Dose** (how many live-paired Collabs = "the intervention"; dose-response?).
9. **Mechanism for Study 1:** **M1** (co-create / co-share) is the default; pre-register **M9**
   (shared interdependent goal / common fate) as the fallback if guaranteed live pairing proves
   infeasible — M9 is also the Study-2 mechanism (§15).

## 14. Out of scope / known liabilities (follow-up)
`METRICS.md`, `README.md`, and `index.html` still describe the old Lakers/Celtics agent demo.
Beyond being out of scope, the study's canonical instrument files in the separate study repo
(`measures.md`, `survey_instrument.md`) still encode the **declared-identity agent design**
and are a **faithfulness liability** until re-targeted to rival K-pop fandoms with the
SSIS→FISI/Leach swap — they should be updated (or the re-targeted items quoted inline in
`MEASURES.md`) so the instrument wording can be confirmed pivot-consistent and non-home-grown.
Recommended next step once the rivalry/superordinate framing is locked: update those files and
rebuild the prototype as the control interface + Collab feature (C0/C1/C2).

## 15. Study 2 — Politics (boundary-condition transfer)
**Purpose.** Probe whether the feature transfers to a high-stakes political conflict — and, more
likely, **map its boundary.** Politics is the strongest domain on stakes and native measurement
(the validated AP battery and GuesSync were built for it) but the weakest on the CIIM mechanism.

**Why the Study-1 mechanism (M1) won't transfer.** M1 asks rivals to co-create and co-share
content *celebrating the shared superordinate group.* For K-pop the shared object is benign and
real (the music). For abortion / trans rights there is **no benign superordinate to celebrate**:
forcing opponents to co-create "we're all Americans" content trivializes a moral stake, the
superordinate identity is itself contested, and CIIM is known to **backfire** when a superordinate
is imposed on a high-distinctiveness moral conflict.

**Mechanism: M9, not M1.** Use a **shared interdependent goal / common-fate task** (Sherif-style)
that requires both sides to reach a joint outcome **without** celebrating a shared identity — e.g.,
an interdependent task with a joint payoff framed around a concrete shared problem, not a contested
identity.

**Measures.** The **native political AP battery, unchanged** (feeling thermometer, social distance,
trait ratings, Druckman/Levendusky willingness, behavioral allocation) — maximal reviewer
credibility and exact GuesSync comparability. Toxicity remains the primary DV.

**Prediction & contribution.** We **predict a weaker, null, or backfiring effect** vs. K-pop. That
is the point: a documented **scope condition** — indirect recategorization works where a
non-contested superordinate exists and fails where it does not — is a genuine theoretical
contribution and converts "is this generalizable?" into a tested boundary.

**Heightened ethics / IRB.** Exposing participants to toxic abortion / anti-trans content is
**participant-as-target** harm (transgender participants are a named vulnerable population), not
just participant-as-author — expect full-board IRB (duty-of-care / escalation, content warnings,
opt-out, careful debrief). Reconsider the specific issue if IRB risk is prohibitive.

**Decision flag.** Which issue, and whether Study 2 runs, depends on Study 1's result and IRB —
decide after Study 1.

## 16. Extension — field & longitudinal (future)
After Study 1 establishes the causal effect:
- **Field A/B:** deploy the feature in a real rival-fandom community and measure organic toxicity —
  highest ecological validity, but needs a platform partner and careful in-the-wild
  consent/disclosure (avoid the r/ChangeMyView problem).
- **Longitudinal / multi-session:** repeat over weeks to test whether the toxicity reduction and
  common-identity shift **persist** or decay, and whether subgroup identification erodes with
  repeated dosing (the dual-identity guardrail over time); watch the history confound.

Both are scoped as **future** phases, not part of the Study-1 protocol.
