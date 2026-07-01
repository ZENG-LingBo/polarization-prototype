# DefuseLab metrics — what the live panel means (Study 1 · K-pop)

The side panel shows four live meters plus a compare-arms panel that update as you post, run the
scenario, or complete a Collab. They exist to make the intervention's effect **visible during a
demo** — in the intervention arm (C2), toxicity should fall and common identity should rise as the
Collab completes; the compare-arms panel then lets you see the C0/C1/C2 story side by side.

> ⚠️ **These are transparent, lightweight heuristics for demonstration — not the study's
> measurements.** The real study uses validated, peer-reviewed instruments (Perspective API, a
> validated K-pop incivility lexicon, LIWC, human incivility coding, validated surveys), anchored
> to a model paper (**GuesSync!**, Rajadesingan et al., CSCW 2023). See the mapping table below,
> the full protocol in [`PLAN.md`](PLAN.md), and the construct-by-construct grounding in
> [`MEASURES.md`](MEASURES.md).

---

## 1. Toxicity (recent)
**What it is.** A fast-reacting gauge of how hostile the thread feels *right now*.

**How it's computed.** The mean toxicity (see below) of the **last 6 posts**, scaled 0–100.
Because it only looks at recent posts, it reacts quickly to a Collab completing.

**Color bands.** Cool (green) ≤ 33 · Warm (amber) 34–60 · Hot (red) > 60.

**Toxicity scoring.** Each post gets `toxicity = min(1, hits / 3)`, where `hits` counts words from
a small built-in fandom-flavored lexicon (clown, trash, delusional, ratio, cope, flop, nugu,
industry plant, 🤡, etc.), **+1** for a run of 4+ capital letters (shouting).

**What it demonstrates.** Run C0 → it climbs and stays hot. Run C2 → the Collab pulls it down as
the warm cross-fandom exchange follows. Run C1 → contact softens things briefly, but without the
K-pop framing it drifts back up.

**Real-study analogue.** A per-message **Perspective API** toxicity score + a **validated K-pop
incivility lexicon** (PLAN.md §13 open item 7 — must be validated before use; "flop"/"nugu" may be
competitive jargon, not incivility) + human **incivility coding** (Coe et al. 2014), reported as a
**rate per message** with time-in-threads covaried (PLAN.md §12). → H1 (primary outcome).

**Caveat.** The lexicon does crude substring matching — approximate, legible for a demo, not a
classifier.

---

## 2. "we/us" vs "they/you" (pronoun ratio)
**What it is.** A proxy for whether people are framing the conversation as **one group** ("we") or
**two opposed groups** ("they/you").

**How it's computed.** Counts first-person-plural words (we, us, our, we're, …) and out-group/
second-person words (they, them, their, you, y'all, …) across all posts. The meter =
`we / (we + they)`, shown as `we:they (X% we)`.

**What it demonstrates.** After a C2 Collab, fans start talking to each other instead of about
each other — the "we" share rises. This is the linguistic signature of recategorization.

**Real-study analogue.** **LIWC** pronoun categories (Tausczik & Pennebaker 2010). Per PLAN.md's
mediation timing (§3, H3b): because toxicity is logged *during* the session but the CIIM survey is
only given *after*, the study uses this **during-session we/they marker** — not the post-survey
CIIM score — as the mechanism proxy for the toxicity outcome. → H3b (mechanism, toxicity).

**Caveat.** Treating "you" as out-group framing is a rough rule. LIWC's validated dictionaries
handle this far better.

---

## 3. Common identity (one-group) — CIIM mediator proxy
**What it is.** A proxy for how much participants feel like one shared group ("K-pop fans") rather
than two rival ones.

**How it's computed.** `0.05 + 0.25·(we-share) + boost + 0.12·(cross-fandom engagement, normalized)`,
where `boost` is `+0.55` after a **superordinate-framed** Collab completes (C2), `+0.20` after a
**neutral-framed** one (C1), and `0` otherwise. This is a hand-tuned demo curve, not a measurement
instrument.

**What it demonstrates.** Completing the C2 Collab moves this meter far more than completing the
C1 Collab — the demo's stand-in for "the superordinate framing, not just the collaboration, drives
the identity shift."

**Real-study analogue.** The **CIIM common in-group identity** survey scale (Gaertner & Dovidio
2000), collected **post-session (T1)**. Per PLAN.md §3 (H3a), it mediates the **T1 survey
outcomes** (affective polarization, IOS, willingness) — it is *not* used to explain toxicity that
already happened during the session (that's meter 2's job). The demo collapses this into one
real-time meter for legibility; the actual study keeps the two timings and two outcomes separate.

---

## 4. Cross-fandom engagement
**What it is.** A running count of **constructive cross-rival interactions** — contributions to a
Collab or replies that cross fandom lines rather than pile-ons within one side.

**How it's computed.** Increments on each Collab contribution/share step; the bar normalizes the
count against a target of 6.

**What it demonstrates.** Hostile threads are mostly **in-group** pile-ons; the Collab's pairing
gate forces a **cross-group** interaction structurally, before any attitude has to change.

**Real-study analogue.** Behavioral coding of cross-group vs. in-group replies and completed
live-paired Collabs (dose, PLAN.md §13 item 8) from an observation codebook. → RQ1 / RQ2.

---

## 5. Compare arms · final toxicity
**What it is.** After running the scenario in an arm, its final toxicity score is recorded as a bar
in the side panel. Run all three arms to fill it in.

**What it demonstrates.** The intended pattern is **C2 < C1 < C0**. The **C2−C0** gap is the
feature's total effect; **C1−C0** is generic contact/collaboration/novelty; **C2−C1** is what's left
over — the superordinate-framing effect specifically. That last contrast is the whole point of the
three-arm design (PLAN.md §5, §12 "active-ingredient confound").

---

## How to read a demo run
1. **C0 → Run scenario.** Toxicity climbs and stays hot; "we" share and common identity stay low;
   cross-fandom engagement stays 0. The unmoderated baseline.
2. **C1 → Run scenario.** The neutral Collab gives a brief lift in warmth and engagement, but
   without K-pop framing the thread drifts back toward rivalry.
3. **C2 → Run scenario.** The K-pop-framed Collab pulls toxicity down further and pushes "we" share
   and common identity up more than C1 — same contact and collaboration, different framing.
4. Compare all three in the **compare-arms** panel — the gap between C2 and C1 (not just C2 and C0)
   is the demo's visual argument for the mechanism.

---

## Demo metric → real instrument (don't conflate them)

| Panel meter | Demo computation | Validated study instrument | Construct | Hypothesis |
|---|---|---|---|---|
| Toxicity (recent) | rolling mean toxicity, last 6 posts | Perspective API + validated K-pop lexicon + incivility coding (Coe 2014), rate/message | toxicity / incivility | H1 |
| we/they ratio | word counts, `we/(we+they)` | LIWC pronoun categories (Tausczik & Pennebaker 2010), during-session | recategorization (in-session marker) | H3b |
| Common identity | hand-tuned curve incl. Collab-type boost | CIIM common in-group identity scale (Gaertner & Dovidio 2000), post-session (T1) | common in-group identity | H3a |
| Cross-fandom engagement | count of Collab steps ÷ 6 | observation coding of cross-group replies + live-paired Collab dose | recategorization behavior | RQ1 / RQ2 |
| Compare arms (final toxicity) | per-arm toxicity after a scenario run | between-subjects toxicity by condition (ANCOVA on baseline) | active-ingredient isolation | H1 (C2−C1 contrast) |

The study also adds what the demo **cannot** show: pre/post **affective-polarization** surveys
(feeling thermometer — Iyengar, Sood & Lelkes 2012 / Iyengar & Westwood 2015; IOS — Aron et al.
1992), a **pre-manipulation toxicity baseline** block, **dual-identity** and **reactance**
equivalence-test guardrails (H4/H5), and the **Study 2 politics boundary-condition** test — all in
[`PLAN.md`](PLAN.md) and [`MEASURES.md`](MEASURES.md).

**Why these and not home-grown meters:** affective polarization has a validated measurement
tradition, and the whole battery is anchored to a directly comparable model paper — **GuesSync!**
(Rajadesingan, Choo, Zhang, Inakage, Budak & Resnick, CSCW 2023,
[doi:10.1145/3610190](https://doi.org/10.1145/3610190)) — which reduces affective polarization with
the same feeling-thermometer + willingness-to-engage outcomes. The construct-by-construct
grounding is in [`MEASURES.md`](MEASURES.md).
