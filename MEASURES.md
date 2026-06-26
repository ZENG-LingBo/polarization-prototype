# Measurement plan — literature grounding & model-paper anchor

This document keeps the project's measures grounded in validated, published instruments
(the methodological bar raised in review: *"Measures should be based on the literature… do
we have a model paper… use similar measures."* — RAY LC).

Short answer: **yes.** Every construct maps to a published, validated instrument, and the
battery is anchored to a directly comparable HCI study (**GuesSync!**, CSCW 2023). Post-pivot
(K-pop toxicity testbed; a social-media *feature* rather than embedded agents), **toxicity /
incivility is now the primary outcome**, with the affective-polarization and
common-in-group-identity battery behind it. Nothing in the study measurement plan is
home-grown.

This file is the literature-grounding companion to the study repo's
[`measures.md`](https://github.com/ZENG-LingBo/polarization/blob/main/measures.md) and
[`survey_instrument.md`](https://github.com/ZENG-LingBo/polarization/blob/main/survey_instrument.md)
(which carry the same pivot — re-target the group from team fans to rival K-pop fandoms and
swap the sport-specific identity scale; see §5). Protocol: [`PLAN.md`](PLAN.md); framing:
[`OUTLINE.md`](OUTLINE.md).

---

## 1. Principle: adapt validated instruments, never invent

Affective polarization (AP) and incivility have mature, validated measurement traditions. We
cannot psychometrically validate a new scale within one project, so the rule is:

- **Take the instrument from the literature unchanged in form** (same response format, same
  item structure).
- **Adapt only the target group** — swap "the out-party" for "the rival fandom" (e.g.,
  Fandom A ↔ Fandom B), and the superordinate anchor for "K-pop fans." Re-targeting a
  validated intergroup instrument to the relevant group boundary is standard practice; AP
  measures (feeling thermometer, social distance, trait ratings, behavioral allocation) are
  group-agnostic by construction (Iyengar, Sood & Lelkes 2012; Iyengar & Westwood 2015).
- **Use a group-agnostic identity scale.** The earlier sport-specific scale (SSIS; Wann &
  Branscombe 1993) does not transfer to K-pop; we use validated group-agnostic
  identification scales instead (FISI — Postmes, Haslam & Jans 2013; and Leach et al. 2008;
  see §5).
- **Never write our own AP or incivility items.** Where a draft cited a source loosely, §5
  tightens the attribution.

---

## 2. Model paper: GuesSync! (Rajadesingan et al., CSCW 2023)

> Ashwin Rajadesingan, Daniel Choo, Jessica Zhang, Mia Inakage, Ceren Budak & Paul Resnick.
> 2023. **GuesSync!: An Online Casual Game To Reduce Affective Polarization.** *Proc. ACM
> Hum.-Comput. Interact.* 7, CSCW2, Article 341. https://doi.org/10.1145/3610190

**Why it is the right model for us:**
- Same venue and genre — a **CSCW**, platform-based **intervention** whose stated goal is to
  **reduce affective polarization**.
- A **pre-registered randomized experiment** with a control vs. intervention contrast, the
  same design backbone we use.
- It measures AP with the **field-standard validated battery** — a **feeling-thermometer**
  outcome plus a **willingness-to-engage** behavioral-intention outcome — which we adopt and
  re-target from political out-party to rival fandom.

**What we borrow directly:** the feeling-thermometer AP outcome and the
willingness-to-interact outcome, with the *same response formats*.

**The one place GuesSync stops and we continue.** GuesSync measures AP at the **individual**
level (how *I* feel about out-party supporters) and works through **correcting
misperceptions**. Our contribution is **group-level** and behavioral: a social-media
**feature** that **indirectly activates a common in-group identity** (CIIM) by having rival
fans co-create and co-share content — and we **foreground toxicity / incivility as the
primary behavioral DV**, with the validated AP battery and the common-in-group-identity
**mediator** behind it. So we keep GuesSync's validated outcomes and **add** a behavioral
toxicity outcome plus group-level mechanism instruments (§4).

---

## 3. Crosswalk — construct → validated instrument → model-paper correspondence

| Construct | Our measure | Type | Validated source | In GuesSync? | Adaptation |
|---|---|---|---|---|---|
| **Toxicity / incivility — PRIMARY DV** | per-message toxicity + human incivility coding | behavioral log | Perspective API (Lees et al. 2022); Coe, Kenski & Rains 2014 codebook | — (our behavioral outcome) | + K-pop fandom-slur lexicon layer (§5); score on pre-moderation text |
| **Affective polarization** (feeling-thermometer difference) | in-group − out-group warmth | survey | Iyengar, Sood & Lelkes 2012; Iyengar & Westwood 2015 | ✔ core DV | target = rival fandom; superordinate ("K-pop fans") + neutral ("pop-music fans") anchors |
| **Social distance** | discomfort across relationship contexts | survey | Iyengar, Sood & Lelkes 2012 | Iyengar battery | rival-fandom member as friend / neighbor / roommate / collaborator |
| **Out-group trait ratings** | warmth/competence battery | survey | Iyengar & Westwood 2015 | Iyengar battery | both fandoms rated; bias = differential |
| **Behavioral allocation** (trust/dictator-style) | incentivized split toward rival fan | incentivized choice | Iyengar & Westwood 2015 | analogous behavioral DV | allocation to a rival-fandom recipient |
| **Willingness to interact** | join joint activity / cooperate again | survey | GuesSync lineage; Druckman & Levendusky 2019 | ✔ primary behavioral-intention outcome | re-targeted to rival fandom |
| **Common in-group identity** (mediator) | one-group vs. two-group representation | survey | Gaertner & Dovidio 2000 (CIIM) | — (group-level extension) | superordinate = "K-pop fans"; + dual-identity check (§4) |
| **Self–out-group overlap** | Inclusion of Other in the Self | survey | Aron, Aron & Smollan 1992 (IOS) | — | pictorial overlap, fandoms as targets |
| **Fandom (subgroup) identification** | FISI and/or multicomponent identification | survey | Postmes, Haslam & Jans 2013 (FISI); Leach et al. 2008 | n/a | **replaces SSIS** (group-agnostic; §5); covariate + dual-identity baseline |
| **Linguistic recategorization** (we/they) | first-person-plural vs. out-group reference | behavioral log | LIWC (Tausczik & Pennebaker 2010) | — (group-level extension) | pronoun ratio over session |
| **Cross-fandom engagement** | cross-flair likes/shares/replies, co-shares | behavioral log | observation coding (Coe et al. 2014 lineage) | — (group-level extension) | reply-to-rival, concede-point, genuine-question, Collab co-share |
| **Reactance** (backfire guardrail) | trait + state | survey | Hong & Faedda 1996; Dillard & Shen 2005 | — (guardrail) | detects feature-induced distinctiveness threat |

"✔" = GuesSync used this exact measure; "Iyengar battery" = the standard validated AP set
GuesSync's measures are drawn from; "—" = beyond GuesSync's scope, grounded in §4.

---

## 4. Group-level & behavioral extensions (what the model paper does not cover)

Because GuesSync stays at the individual/survey level, four of our measures stand on their
own validated footing — and they are precisely the ones that capture our *group-level* claim
and the CIIM mechanism:

1. **Toxicity / incivility (primary DV)** — Perspective API per-message scoring (Lees et al.
   2022) + the **incivility codebook** (Coe, Kenski & Rains 2014: name-calling, aspersion,
   vulgarity, pejorative-for-speech), extended with a **K-pop fandom-slur lexicon** because
   generic classifiers miss in-group-coded toxicity ("flop," "nugu," streaming-war framing).
   Double-code a subset for inter-rater reliability (Krippendorff's α). Scored on
   **pre-moderation** text.
2. **Common in-group identity representation (mediator)** — the one-group / two-group /
   dual-identity items from Gaertner & Dovidio (2000), the canonical CIIM operationalization.
   The key mechanistic checkpoint: did the feature induce the "K-pop fan" representation? We
   retain a **dual-identity check** ("a [Fandom] fan *and* a K-pop fan at the same time")
   because for high identifiers, dissolving the subgroup can threaten distinctiveness and
   backfire (Crisp, Stone & Hall 2006; robust multicomponent identity per Leach et al. 2008).
3. **We/they linguistic recategorization** — LIWC pronoun categories (Tausczik & Pennebaker
   2010); the first-person-plural-vs-out-group ratio is among the most theory-aligned
   behavioral markers of a shared superordinate identity.
4. **Cross-fandom vs. in-fandom engagement** — behavioral observation grounded in the
   incivility/interaction coding tradition (Coe, Kenski & Rains 2014); hostile threads are
   in-group pile-ons, defusing shows up as constructive cross-rival replies and **co-shares
   of Collab artifacts**.

These extensions are *additive*: we keep GuesSync's validated AP outcomes **and** add a
behavioral toxicity outcome plus group-level mechanism instruments.

---

## 5. Attribution fixes & the identity-scale swap

- **Feeling thermometer + social distance** trace primarily to **Iyengar, Sood & Lelkes
  (2012)** ("Affect, Not Ideology"), which introduced the thermometer-based AP measure and
  the social-distance item. **Iyengar & Westwood (2015)** is the correct source for the
  **trait ratings** and the **behavioral allocation (trust/dictator) games**. Citing each to
  its true origin is the difference between "literature-based" and "looks literature-based."
- We measure warmth toward **ordinary rival fans**, not fandom "elites" (idols/labels).
  Targeting *ordinary out-group members* is the recommendation of **Druckman & Levendusky
  (2019)** and matches GuesSync's "out-party supporters" framing.
- **SSIS → FISI / Leach (the identity-scale swap).** The **Sport Spectator Identification
  Scale** (Wann & Branscombe 1993) is validated for *sports-team* fandom and contains
  sport-specific items (attending games, etc.) that do not transfer to K-pop. We replace it
  with **group-agnostic, validated identification scales**, targeted to the specific fandom:
  the **Four-Item Social Identification** scale (FISI; Postmes, Haslam & Jans 2013) as a
  short identification covariate, and/or **Leach et al. (2008)** multicomponent in-group
  identification when the *self-investment vs. self-definition* structure is needed (it is
  what dual-identity preservation and distinctiveness threat operate on).

---

## 6. What is *not* a study measure

The earlier prototype's right-hand panel showed four live demo meters (thread temperature,
keyword toxicity, a we/they word count, a cross-group counter). These were **transparent
demonstration heuristics**, never validated instruments and never used for inference. The
prototype itself is being replaced (control interface + the Collab feature), and the real
**toxicity** measure is the validated Perspective API + incivility codebook + K-pop lexicon
above — not a keyword count. No home-grown number enters the analysis.

---

## 7. RQ alignment (current two-RQ structure)

- **RQ1 — control baseline.** *In a plain K-pop social platform, what is the nature and level
  of toxicity / incivility in rival-fandom interaction?* Measured by the primary toxicity DV
  (Perspective API + Coe et al. 2014 + K-pop lexicon) plus we/they language and cross-fandom
  engagement in the control arm.
- **RQ2 — feature effect + mechanism.** *Does the cross-fandom co-creation / shared-share
  feature, which indirectly activates the superordinate "K-pop fan" identity, reduce toxicity
  and affective polarization, mediated by increased common-in-group representation without
  eroding subgroup identification?* The with-vs-without comparison on **(a)** toxicity
  (primary) and interaction patterns, and **(b)** the AP battery (feeling-thermometer
  difference, social distance, traits, allocation, IOS). **Common in-group identity** is the
  measured **mediator**; **fandom identification** tests the dual-identity (no-erosion)
  condition; **reactance** is the backfire guardrail.

The behavioral logs serve both RQs — descriptively under RQ1 and as the feature-effect
comparison under RQ2.

---

## 8. References

- Aron, A., Aron, E. N., & Smollan, D. (1992). Inclusion of Other in the Self Scale and the
  structure of interpersonal closeness. *J. Pers. Soc. Psychol.*, 63(4), 596–612.
- Coe, K., Kenski, K., & Rains, S. A. (2014). Online and uncivil? Patterns and determinants
  of incivility in newspaper website comments. *J. Communication*, 64(4), 658–679.
- Crisp, R. J., Stone, C. H., & Hall, N. R. (2006). Recategorization and subgroup
  identification: Predicting and preventing threats from common ingroups. *Pers. Soc.
  Psychol. Bull.*, 32(2), 230–243.
- Druckman, J. N., & Levendusky, M. S. (2019). What do we measure when we measure affective
  polarization? *Public Opinion Quarterly*, 83(1), 114–122.
- Dillard, J. P., & Shen, L. (2005). On the nature of reactance and its role in persuasive
  health communication. *Communication Monographs*, 72(2), 144–168.
- Gaertner, S. L., & Dovidio, J. F. (2000). *Reducing Intergroup Bias: The Common Ingroup
  Identity Model.* Psychology Press.
- Hong, S.-M., & Faedda, S. (1996). Refinement of the Hong Psychological Reactance Scale.
  *Educ. Psychol. Meas.*, 56(1), 173–182.
- Iyengar, S., Sood, G., & Lelkes, Y. (2012). Affect, not ideology: A social identity
  perspective on polarization. *Public Opinion Quarterly*, 76(3), 405–431.
- Iyengar, S., & Westwood, S. J. (2015). Fear and loathing across party lines: New evidence
  on group polarization. *Am. J. Polit. Sci.*, 59(3), 690–707.
- Leach, C. W., et al. (2008). Group-level self-definition and self-investment: A
  hierarchical (multicomponent) model of in-group identification. *J. Pers. Soc. Psychol.*,
  95(1), 144–165.
- Lees, A., et al. (2022). A new generation of Perspective API: Efficient multilingual
  character-level transformers. *KDD '22*.
- Postmes, T., Haslam, S. A., & Jans, L. (2013). A single-item measure of social
  identification: Reliability, validity, and utility. *British Journal of Social
  Psychology*, 52(4), 597–617.
- Rajadesingan, A., Choo, D., Zhang, J., Inakage, M., Budak, C., & Resnick, P. (2023).
  GuesSync!: An online casual game to reduce affective polarization. *Proc. ACM Hum.-Comput.
  Interact.*, 7(CSCW2), Article 341. https://doi.org/10.1145/3610190
- Tausczik, Y. R., & Pennebaker, J. W. (2010). The psychological meaning of words: LIWC and
  computerized text analysis methods. *J. Lang. Soc. Psychol.*, 29(1), 24–54.
- Wann, D. L., & Branscombe, N. R. (1993). Sport fans: Measuring degree of identification
  with their team. *Int. J. Sport Psychol.*, 24, 1–17. *(prior identity scale, replaced — §5)*
