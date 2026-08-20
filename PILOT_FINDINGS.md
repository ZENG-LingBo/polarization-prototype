# Pilot findings — what the data supports

Written against the live database on 2026-08-20. Reproduce with:

```bash
export RESEARCHER_TOKEN=…            # the Worker secret, never committed
python3 -m pip install numpy scipy
python3 analysis/analyze_pilot.py --cohort AUG16          # single-cohort detail
python3 analysis/analyze_pilot.py --compare AUG16,TEST1   # replication + Day 2
```

This memo answers the analysis questions raised in supervision. It separates what the
data **shows**, what it **cannot yet show**, and which requests need a design change
rather than a different statistical test.

---

## 1. What is actually in the database

Two cohorts carry usable behavioural data. Both were run in the **EXPT** arm.

| | AUG16 | TEST1 |
|---|---|---|
| Day 1 | 2026-08-16, 11:10–12:24 | 2026-08-05, 13:20–14:08 |
| Day 2 | **none** | 2026-08-16, 12:36–13:03 |
| Gap between sessions | — | **10.9 days** |
| Language | Chinese | Chinese |
| Arm | EXPT | EXPT |
| Registered participants | 17 | 27 |
| Posted on Day 1 | 9 | 6 |
| Posted on Day 2 | — | 4 |
| Day-1 messages | 120 | 81 |
| Day-2 messages | — | 32 |
| Surveys | 5 × survey1 | 5 × survey1 |
| Collabs | 6 (2 live-paired) | 5 (2 live-paired) |

`JULY23`, `PRE5`, `AUG5` and `JULY22` are fragments — 2 to 32 messages, mostly from one
or two people, with no phase stamps. They are excluded throughout.

**TEST1 was set up as a rehearsal, but it contains real two-session behavioural data
from four returning participants.** It is the only Day-2 data that exists anywhere in
the database, so it is reported here rather than discarded — with its limitations stated
plainly.

**The constraint that shapes everything below: no control cohort has ever been run.**

---

## 2. The Day-1 drop replicates across two independent sessions

Toxicity falls sharply when the Community Note task opens — in both cohorts, eleven days
apart, at almost identical magnitude.

| Cohort | free *n* | free tox | task *n* | task tox | drop | relative |
|---|---|---|---|---|---|---|
| AUG16 | 89 | 0.350 | 31 | 0.218 | −0.132 | **−38%** |
| TEST1 | 61 | 0.305 | 20 | 0.175 | −0.130 | **−43%** |
| **Pooled** | **150** | **0.332** | **51** | **0.201** | **−0.131** | **−39%** |

Two separate sessions, different people, eleven days apart, producing a drop of −0.132
and −0.130. That agreement is the strongest thing in the pilot — it is the closest this
design gets to a replication, and it is much harder to explain as noise than one cohort
would be.

### It is not fragile (AUG16, where there is enough data to check)

- **Leave-one-participant-out**: the drop survives removing any single participant,
  ranging −0.084 to −0.170.
- **Attrition works against it.** The four people who stopped posting after the free
  phase were *less* toxic than those who stayed (0.258 vs 0.364). Losing the calm
  participants should have pushed the task phase *up*. It fell anyway.
- **It reverses a rising trend.** Free-phase toxicity was climbing (+0.0020/min).
  Extrapolating that trend predicts 0.422 in the task window; observed is 0.218.

### A second measure moves at the same moment

| Phase | “we” / msg | “they” / msg | “they” share |
|---|---|---|---|
| free | 0.04 | 0.19 | **0.810** |
| task | 0.13 | 0.06 | **0.333** |

Othering language collapses alongside toxicity. Counts are small (17 vs 2 “they” tokens)
but this is an independent measure moving in the same direction at the same instant.

---

## 3. Day 2: the effect does not persist

This is the direct answer to the request for an objective Day-2 difference, and it is a
negative one.

| Checkpoint | *n* | mean toxicity |
|---|---|---|
| Day 1 free — baseline | 61 | 0.305 |
| Day 1 task — intervention | 20 | **0.175** |
| Day 2 free — persistence | 32 | **0.277** |

- **Against the intervention window**: 0.175 → 0.277, a **rebound of +0.102**.
- **Like-for-like, free vs free**: 0.305 → 0.277, a change of −0.028 — essentially flat.

Person by person, the same four participants across both sessions:

| Handle | Day 1 *n* | Day 1 tox | Day 2 *n* | Day 2 tox | change |
|---|---|---|---|---|---|
| `blink_rwv0` | 24 | 0.296 | 13 | 0.381 | **+0.085** more toxic |
| `army_pz0q` | 17 | 0.218 | 10 | 0.235 | **+0.017** more toxic |
| `blink_njzj` | 12 | 0.233 | 6 | 0.067 | −0.167 less toxic |
| `army_1tkp` | 4 | 0.175 | 3 | 0.383 | **+0.208** more toxic |
| **Mean** | | **0.231** | | **0.266** | **+0.036** |

**Three of four returned more toxic than they left.** Wilcoxon p=0.625 at n=4 — this is
descriptive, not a test.

### What this Day-2 result can and cannot bear

It is 32 messages from 4 people, one arm, no control, and the sessions were **11 days
apart rather than consecutive**. It cannot support a persistence claim in either
direction as a confirmatory result.

What it does do is remove the assumption that the effect obviously persists. The
available evidence points the other way, and the honest framing is that
**the effect is state-dependent: present while the intervention is, gone by the time
people come back.** That is a contingency finding rather than a failure — and it is the
kind of "under what conditions" result that was asked for. It also makes the Day-2
design decision consequential rather than a formality: if the real protocol runs
consecutive days, it is testing something the pilot has not tested.

---

## 4. Significance — the honest answer

Pooling both cohorts doubles the effective sample to 10 participants. It is still not
enough.

| Test | Unit | Result |
|---|---|---|
| Wilcoxon signed-rank (pooled) | 10 participants | W=12.0, **p=0.131** |
| Paired *t* (pooled) | 10 participants | t(9)=2.08, **p=0.067**, dz=0.66 |
| Wilcoxon (AUG16 only) | 5 participants | W=2.0, p=0.188 |
| Paired *t* (AUG16 only) | 5 participants | t(4)=2.30, p=0.083, dz=1.03 |
| Within-participant permutation (AUG16) | 120 messages | **p=0.011** |
| OLS + linear time trend, cluster-robust (AUG16) | 9 clusters | b=−0.192, **p=0.108** |

The tests disagree because they make different assumptions, and the disagreement is
itself informative:

- The **permutation test (p=0.011)** treats messages within a participant as
  exchangeable. Most power, strongest assumption — it ignores that toxicity drifts over
  time within a session, so part of what it reads as a phase effect is time.
- The **paired tests** respect clustering and are the defensible confirmatory tests, but
  are close to powerless at n=5–10.
- The **time-adjusted model** is closest to the real question; with 9 clusters,
  cluster-robust standard errors are anti-conservative, so even p=0.108 is optimistic.

**Recommended reporting: effect size and interval, plus the cross-cohort agreement — not
a significance claim.** The pilot is powered to estimate, not to test. Leading with
p=0.011 would not survive review, because the test that produces it is the one that
assumes away the time confound.

---

## 5. The identification problem, stated plainly

In both cohorts the phase flipped at a single instant, and **nothing else differed at
that instant**, because every participant was in the EXPT arm. So <em>"the Community
Note calmed people"</em> and <em>"an hour of arguing had passed and people were
tiring"</em> predict exactly the same data.

The design already solves this: the control arm sits through the same clock time with a
matched-salience poll instead of the note. **That cohort has never been run.**

The replication across two sessions, the rising pre-trend, and the direction of attrition
all argue against pure fatigue, and all belong in the write-up. None of them substitutes
for the control group. Note that fatigue also predicts the Day-2 rebound perfectly well —
people arrive fresh and get heated again — so the persistence result does not break the
tie either.

---

## 6. Behaviour moved; attitudes did not

The most interesting thing in the pilot, and it supports the point that self-report is
the weaker evidence.

| Survey 1 measure (AUG16, n=5, end of Day 1) | Mean |
|---|---|
| Note seen as legitimate | **1.87 / 5** |
| Reactance — "made me want to argue the opposite" | **4.35 / 5** |
| Feeling thermometer, own fandom | 97 / 100 |
| Feeling thermometer, rival fandom | **13 / 100** |
| Thermometer gap | **84 points** |
| Session felt heated | 4.80 / 5 |
| Outgroup similarity | 2.95 / 5 |

Three of five rated the rival fandom **0**. Participants rejected the note as
illegitimate and reported high reactance — and their behaviour still got measurably less
toxic in the same window.

The framing this supports is **compliance without persuasion**: the intervention changed
what people did without changing what they thought. That is legitimate and publishable,
and more defensible than an attitude-change claim the data contradicts. It also sits
naturally with the Day-2 rebound — a behavioural effect with no attitudinal footing is
exactly the kind that should decay once the intervention is removed.

It does mean the mechanism is unlikely to be the superordinate-identity route in the
current draft. Worth reconciling with the theory section.

---

## 7. Objective, non-self-report evidence

The reply graph reconstructs cleanly from `thread_id`: 95 directed edges, 29 dyads
(AUG16).

- **77% of replies cross the fandom line** (73 of 95) — the seeding produced genuine
  intergroup contact, not two parallel monologues.
- **Cross-fandom replies are 2.1× as toxic as within-fandom replies** (0.384 vs 0.186).
  An objective, behavioural measure of intergroup hostility with no self-report
  component.
- **Conflict concentrates in one dyad.** A single BLINK–ARMY pair accounts for 28 of 95
  replies (29%). The top three participants produced 71% of all messages.

With hostility this concentrated, participant-level means are dominated by a couple of
people, and group means understate what a *typical* participant experienced. The
per-participant network plot will show this immediately.

**Topic-shifting is visible in the transcript** and is worth coding qualitatively — the
argument drifts off K-pop into unrelated flame material (esports teams, a rival boy
group, repetitive spam), which is a plausible escalation route rather than noise.

---

## 8. Participants worked out they were in a study

Two AUG16 messages, both inside the task phase — the window the primary result depends
on:

> 谁家好人骂人还打引号，要是做什么实验，你这条数据估计都污染池子
> *"Who puts quotation marks around an insult? If this is some kind of experiment, your
> data pool is probably contaminated."* — BLINK, 12:00

> 怀疑有AI
> *"Suspect there's an AI here."* — ARMY, 12:07

Demand characteristics are a direct threat to a behavioural measure, and the merged-note
text is the most likely tell. This needs handling in the debrief protocol and reporting
in the limitations — not omission.

---

## 9. Requests the current data cannot meet

| Request | Status |
|---|---|
| Intervention vs control | **Impossible.** No CTRL cohort has ever been run. |
| A *clean* Day-2 result | **Not from this.** 4 people, 11-day gap, no control. Directionally: no persistence. |
| Day 2 for AUG16 specifically | **Impossible.** Zero rows. |
| N = 30 | 13 participants have posted across both usable cohorts. Needs ~3 more. |
| Interview material | No interviews conducted yet. |

On interviewing: the guidance to interview everyone or run a focus group rather than
selecting participants is right, and should be decided *before* recruitment, because
consent language and session length both depend on it.

---

## 10. One methodological caution, recorded deliberately

Some analysis guidance amounts to choosing where to measure after seeing the results —
testing checkpoints until a difference appears, or falling back to "end of Day 1" as the
comparison point if Day 2 shows nothing. Both are ordinary exploratory practice, and both
stop being defensible the moment they are written up as confirmatory. This is the
exposure already logged in `REVIEW_RISKS.md` §1–2, and CHI reviewers do ask.

The workable version: **fix the checkpoints and the primary contrast in writing before
the next cohort runs**, then report everything else as exploratory and clearly labelled.
Naming an expected pattern in advance — the 10 → 5 → 6 → 7 shape discussed in
supervision — is a *prediction*, and pre-registering it is exactly the right move. It
becomes a problem only if the cut points move afterwards to fit what came back.

The exploratory checkpoint series from AUG16, descriptive only:

| Checkpoint | *n* | mean toxicity |
|---|---|---|
| Free, first half (11:10–11:30) | 44 | 0.302 |
| Free, second half (11:30–11:59) | 45 | 0.397 |
| After notes published (12:03–12:20) | 30 | 0.215 |

The predicted shape — escalation, then a drop at the intervention — is present in both
cohorts. It still cannot be certified without a control arm.

---

## 11. What to change before the next run

Ordered by how much each one buys.

1. **Run a CTRL cohort.** Without it there is no causal claim, no matter how many
   participants are added. Single highest-value change.
2. **Run a real Day 2, on consecutive days.** The only Day-2 data has an 11-day gap and
   4 participants. If the protocol says two days, test two days.
3. **Fix the primary contrast and checkpoints in writing first**, so the confirmatory
   analysis is decided before the data exists.
4. **Raise participation, not just registration.** 8 of 17 AUG16 registrants and 21 of 27
   TEST1 registrants never posted. Recruitment counts are not sample size.
5. **Improve scorer resolution.** The toxicity scale produces only 8 distinct values and
   46% of messages score exactly 0.30, which compresses real variation and costs power
   directly.
6. **Add a suspicion probe to the debrief**, so demand characteristics are measured
   rather than inferred from stray messages.

---

## 12. Reproducing

`analysis/analyze_pilot.py` pulls the same export as the dashboard's **Export JSON**
button and prints every number in this memo. `--cohort` gives single-cohort detail;
`--compare A,B` pools Day 1 and reports whatever Day 2 exists. `--input` reads a saved
dump, `--json` saves one.

Note for anyone writing their own script: Cloudflare rejects the default
`Python-urllib` user agent with a 403 before the request reaches the Worker. Send a real
`user-agent` header.
