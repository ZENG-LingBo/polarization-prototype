# Measurement plan — literature grounding & model-paper anchor

This document answers the methodological note raised in review:

> *"Measures should be based on the literature. We can't make our own because we
> cannot validate. Do we have a model paper studying something related to what we
> do? If so we can use similar measures."* — RAY LC

Short answer: **yes.** Every construct we measure maps to a published, validated
instrument, and the whole battery is anchored to a directly comparable HCI study
(**GuesSync!**, CSCW 2023). Nothing in the *study* measurement plan is home-grown.
The only non-validated numbers in this repo are the prototype's four live demo
meters, which are transparent heuristics and are **never** used for inference
(see [`METRICS.md`](METRICS.md)).

This file is the literature-grounding companion to the study repo's
[`measures.md`](https://github.com/ZENG-LingBo/polarization/blob/main/measures.md)
and
[`survey_instrument.md`](https://github.com/ZENG-LingBo/polarization/blob/main/survey_instrument.md);
keep them in sync.

---

## 1. Principle: adapt validated instruments, never invent

Affective polarization (AP) has a mature, validated measurement tradition. We
cannot psychometrically validate a new scale within one project, so the rule is:

- **Take the instrument from the literature unchanged in form** (same response
  format, same item structure).
- **Adapt only the target group** — swap "the out-party" for "the rival fanbase"
  (Lakers ↔ Celtics). Re-targeting a validated intergroup instrument to the
  relevant group boundary is standard practice; AP measures (feeling thermometer,
  social distance, trait ratings, behavioral allocation) are group-agnostic by
  construction (Iyengar, Sood & Lelkes 2012; Iyengar & Westwood 2015), and the
  sport-fan identity literature gives us a domain-validated identity scale
  (Wann & Branscombe 1993).
- **Never write our own affective-polarization items.** Where the draft cited a
  source loosely, §5 tightens the attribution.

---

## 2. Model paper: GuesSync! (Rajadesingan et al., CSCW 2023)

> Ashwin Rajadesingan, Daniel Choo, Jessica Zhang, Mia Inakage, Ceren Budak &
> Paul Resnick. 2023. **GuesSync!: An Online Casual Game To Reduce Affective
> Polarization.** *Proc. ACM Hum.-Comput. Interact.* 7, CSCW2, Article 341.
> https://doi.org/10.1145/3610190

**Why it is the right model for us:**

- Same venue and genre — a **CSCW**, platform-based **intervention** whose stated
  goal is to **reduce affective polarization**.
- A **pre-registered randomized experiment** with a control vs. intervention
  contrast, the same design backbone we use.
- It measures AP with the **field-standard validated battery** — a
  **feeling-thermometer** outcome (warmth toward out-group supporters) plus a
  **willingness-to-engage** behavioral-intention outcome — exactly the measures
  our `survey_instrument.md` already uses (Blocks B and G).

**What we borrow directly:** the feeling-thermometer AP outcome and the
willingness-to-interact outcome, with the *same response formats*, re-targeted
from political out-party to rival fanbase.

**The one place GuesSync stops and we continue.** GuesSync measures AP at the
**individual** level (how *I* feel about out-party supporters) and works through
**correcting misperceptions**. Our contribution is **group-level**: we test
whether embedded in-group agents reshape the *group* relationship via a
**common in-group identity** (CIIM). So we keep GuesSync's individual-level
outcomes and **add** group-level instruments — each separately grounded in §4.
This is the gap the team already flagged ("it doesn't reach the group level"),
turned into our measurement contribution.

---

## 3. Crosswalk — construct → validated instrument → model-paper correspondence

| Construct | Our measure (survey block) | Validated source | In GuesSync? | Adaptation |
|---|---|---|---|---|
| **Affective polarization** (primary DV: in-group − out-group warmth) | B — feeling thermometer, difference score | Iyengar, Sood & Lelkes 2012; Iyengar & Westwood 2015 | ✔ core DV | target = rival-team fans; superordinate ("NBA fans") + neutral ("baseball fans") anchors added per standard practice |
| **Social distance** | C — discomfort across relationship contexts | Iyengar, Sood & Lelkes 2012 (marriage item) | Iyengar battery (field standard) | rival fan as in-law / friend / neighbor / teammate |
| **Out-group trait ratings** | D — warmth/competence trait battery | Iyengar & Westwood 2015 | Iyengar battery | both groups rated; bias = differential |
| **Behavioral allocation** (trust/dictator-style) | G1 — split raffle entries | Iyengar & Westwood 2015 (behavioral games) | analogous behavioral DV | incentivized allocation to rival fan |
| **Willingness to interact** | G2/G3 — join joint event / cooperate again | GuesSync "willingness to talk politics" lineage; Druckman & Levendusky 2019 | ✔ primary behavioral-intention outcome | direct analog, re-targeted |
| **Team (subgroup) identity** | A — Sport Spectator Identification Scale | Wann & Branscombe 1993 (SSIS) | n/a (sport-specific) | domain-validated; covariate + dual-identity baseline |
| **Common in-group identity** (mediator) | F — one-group vs. two-group representation | Gaertner & Dovidio 2000 (CIIM) | — (group-level extension) | + dual-identity check (§4) |
| **Self–out-group overlap** | E — Inclusion of Other in the Self | Aron, Aron & Smollan 1992 (IOS) | — | pictorial overlap, groups as targets |
| **Reactance** (backfire guardrail) | H — trait + state | Hong & Faedda 1996; Dillard & Shen 2005 | — (guardrail) | detects in-group-agent backfire |
| **Toxicity / incivility** (process) | platform logs | Perspective API (Lees et al. 2022); Coe, Kenski & Rains 2014 codebook | behavioral process | per-message scoring + human coding |
| **Linguistic recategorization** (we/they) | platform logs | LIWC pronoun categories (Tausczik & Pennebaker 2010) | — (group-level extension) | first-person-plural vs. out-group reference |
| **Cross-group engagement** | platform logs | observation codebook (Coe et al. 2014 lineage) | — (group-level extension) | reply-to-rival, concede-point, genuine-question |

"✔" = GuesSync used this exact measure; "Iyengar battery" = the standard
validated AP instrument set GuesSync's measures are drawn from; "—" = a
group-level measure beyond GuesSync's individual-level scope, grounded in §4.

---

## 4. Group-level extensions (what the model paper does not cover)

Because GuesSync stays at the individual level, three of our measures have **no
counterpart in the model paper** and must stand on their own validated footing.
They are precisely the measures that capture our *group-level* claim and the CIIM
mechanism:

1. **Common in-group identity representation (Block F)** — the one-group /
   two-group / dual-identity item set from Gaertner & Dovidio (2000), the
   canonical operationalization of the Common In-group Identity Model. This is
   the **mediator** in our group-level account. We retain a **dual-identity
   check** ("a Lakers fan *and* an NBA fan at the same time") because for high
   identifiers, dissolving the subgroup can threaten distinctiveness and backfire
   (Crisp, Stone & Hall 2006; robust multicomponent identity per Leach et al.
   2008).
2. **We/they linguistic recategorization** — LIWC pronoun categories (Tausczik &
   Pennebaker 2010); the first-person-plural-vs-out-group ratio is among the most
   theory-aligned behavioral markers of a shared superordinate identity.
3. **Cross-group vs. in-group reply coding** — behavioral observation grounded in
   the incivility/interaction coding tradition (Coe, Kenski & Rains 2014) and the
   study's observation codebook; hostile threads are in-group pile-ons, defusing
   shows up as constructive cross-rival replies.

These extensions are *additive*: we keep GuesSync's validated individual-level
outcomes **and** add group-level instruments, rather than substituting one for
the other.

---

## 5. Attribution fixes (tightening loose citations)

To make the "based on the literature" claim airtight, two attributions in the
current draft are sharpened:

- **Feeling thermometer + social distance** trace primarily to **Iyengar, Sood &
  Lelkes (2012)** ("Affect, Not Ideology"), which introduced the thermometer-based
  AP measure and the marriage/social-distance item. **Iyengar & Westwood (2015)**
  is the correct source for the **trait ratings** and the **behavioral allocation
  (trust/dictator) games**. Citing each to its true origin (rather than both to
  Iyengar & Westwood 2015) is the difference between "literature-based" and
  "looks literature-based."
- We measure warmth toward **ordinary rival fans**, not team "elites"
  (players/management). Targeting *ordinary out-group members* is the
  recommendation of **Druckman & Levendusky (2019)** on what AP measures should
  capture, and it matches GuesSync's "out-party supporters" framing.

---

## 6. What is *not* a study measure

The prototype's right-hand panel shows four live meters — thread temperature,
keyword toxicity, a we/they word count, and a cross-group counter. These are
**transparent demonstration heuristics**, built to make the intervention visible
during a demo. They are **not** validated instruments and are **never** used for
statistical inference. Each maps to the validated instrument that replaces it in
the real study; that mapping is in [`METRICS.md`](METRICS.md). This is the only
place any home-grown number appears in the project, and it is explicitly fenced
off from the measurement plan above.

---

## 7. RQ alignment (current structure)

The RQ numbering was consolidated: **former RQ3 (mediation/mechanism) is now the
mechanism component of RQ2.** Current mapping:

- **RQ1 — behavior / process:** toxicity & incivility trajectories, interaction
  patterns (Perspective API; Coe et al. 2014; LIWC; cross-group coding).
- **RQ2 — group-level affective polarization *and its mechanism*:** the
  feeling-thermometer difference DV (Blocks B–E, G), with **common in-group
  identity (Block F)** as the tested mediator, and reactance (Block H) as the
  backfire guardrail.

Older items still labeled "RQ3" in any draft now fall under RQ2 as its mechanism
component.

---

## 8. References

- Aron, A., Aron, E. N., & Smollan, D. (1992). Inclusion of Other in the Self
  Scale and the structure of interpersonal closeness. *J. Pers. Soc. Psychol.*,
  63(4), 596–612.
- Coe, K., Kenski, K., & Rains, S. A. (2014). Online and uncivil? Patterns and
  determinants of incivility in newspaper website comments. *J. Communication*,
  64(4), 658–679.
- Crisp, R. J., Stone, C. H., & Hall, N. R. (2006). Recategorization and
  subgroup identification: Predicting and preventing threats from common
  ingroups. *Pers. Soc. Psychol. Bull.*, 32(2), 230–243.
- Druckman, J. N., & Levendusky, M. S. (2019). What do we measure when we measure
  affective polarization? *Public Opinion Quarterly*, 83(1), 114–122.
- Dillard, J. P., & Shen, L. (2005). On the nature of reactance and its role in
  persuasive health communication. *Communication Monographs*, 72(2), 144–168.
- Gaertner, S. L., & Dovidio, J. F. (2000). *Reducing Intergroup Bias: The Common
  Ingroup Identity Model.* Psychology Press.
- Hong, S.-M., & Faedda, S. (1996). Refinement of the Hong Psychological
  Reactance Scale. *Educ. Psychol. Meas.*, 56(1), 173–182.
- Iyengar, S., Sood, G., & Lelkes, Y. (2012). Affect, not ideology: A social
  identity perspective on polarization. *Public Opinion Quarterly*, 76(3),
  405–431.
- Iyengar, S., & Westwood, S. J. (2015). Fear and loathing across party lines:
  New evidence on group polarization. *Am. J. Polit. Sci.*, 59(3), 690–707.
- Leach, C. W., et al. (2008). Group-level self-definition and self-investment: A
  hierarchical (multicomponent) model of in-group identification. *J. Pers. Soc.
  Psychol.*, 95(1), 144–165.
- Lees, A., et al. (2022). A new generation of Perspective API: Efficient
  multilingual character-level transformers. *KDD '22*.
- Rajadesingan, A., Choo, D., Zhang, J., Inakage, M., Budak, C., & Resnick, P.
  (2023). GuesSync!: An online casual game to reduce affective polarization.
  *Proc. ACM Hum.-Comput. Interact.*, 7(CSCW2), Article 341.
  https://doi.org/10.1145/3610190
- Tausczik, Y. R., & Pennebaker, J. W. (2010). The psychological meaning of
  words: LIWC and computerized text analysis methods. *J. Lang. Soc. Psychol.*,
  29(1), 24–54.
- Wann, D. L., & Branscombe, N. R. (1993). Sport fans: Measuring degree of
  identification with their team. *Int. J. Sport Psychol.*, 24, 1–17.
