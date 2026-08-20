# AUG16 pilot — what the data supports

Written against the live database on 2026-08-20. Reproduce with:

```bash
export RESEARCHER_TOKEN=…            # the Worker secret, never committed
python3 -m pip install numpy scipy
python3 analysis/analyze_pilot.py --cohort AUG16
```

This memo answers the analysis questions raised in supervision. It separates what the
data **shows**, what it **cannot yet show**, and which requests would need a design
change rather than a different statistical test.

---

## 1. What is actually in the database

One real cohort has run. Everything else is rehearsal traffic.

| | AUG16 | notes |
|---|---|---|
| Date | 2026-08-16, 11:10–12:24 | single sitting |
| Language | Chinese | |
| Registered participants | 17 | 9 ARMY / 8 BLINK |
| **Participants who actually posted** | **9** | 8 of 17 never wrote a message |
| Participant messages | 120 | 89 free / 31 task |
| Arm | **EXPT only** | no control group was run |
| Days | **Day 1 only** | no Day 2 session took place |
| Surveys returned | 5 survey1 | 0 survey2 |
| Collabs | 6 | 2 live-paired, 2 filler, 2 unresolved |

Other cohorts in the database — `TEST1`, `JULY23`, `PRE5`, `AUG5`, `JULY22` — are
rehearsals containing researcher and pilot traffic. `TEST1` is the only one with Day-2
rows (32 messages, 4 participants) and it is test data, not evidence.

**The two facts that constrain everything below: there is no control arm, and there is
no Day 2.**

---

## 2. The headline result

Toxicity falls sharply when the Community Note task opens.

| Phase | n | mean toxicity | window |
|---|---|---|---|
| `free` (open argument) | 89 | **0.350** | 11:10–11:59 |
| `task` (notes) | 31 | **0.218** | 12:00–12:20 |

A drop of 0.132 absolute, **38% relative**. The direction is the one the hypothesis
predicts, and it is not fragile:

- **Leave-one-participant-out**: the drop survives removing any single participant,
  ranging +0.084 to +0.170. No one person carries it.
- **Attrition works against it.** The four participants who stopped posting after the
  free phase were *less* toxic than those who stayed (0.258 vs 0.364). Losing the calm
  people should have pushed the task phase *up*. It went down anyway.
- **It reverses a rising trend.** Within the free phase toxicity was climbing
  (+0.0020/min, n.s.). Extrapolating that trend predicts 0.422 in the task window; the
  observed value is 0.218.

### Othering language moves with it

| Phase | "we" per msg | "they" per msg | they-share |
|---|---|---|---|
| `free` | 0.04 | 0.19 | **0.810** |
| `task` | 0.13 | 0.06 | **0.333** |

Counts are small (17 vs 2 "they" tokens) but this is a second, independent measure
moving in the same direction at the same moment.

---

## 3. Significance — the honest answer

The question "why is it not significant" has a specific answer: **only 5 participants
posted in both phases.** That is the effective sample for any paired test.

| Test | Unit | Result |
|---|---|---|
| Wilcoxon signed-rank | 5 participants | W=2.0, **p=0.188** |
| Paired *t* | 5 participants | t(4)=2.30, **p=0.083**, dz=1.03 |
| Within-participant permutation (20k) | 120 messages | **p=0.011** |
| OLS + linear time trend, cluster-robust | 9 clusters | b=−0.192, **p=0.108** |

These disagree because they make different assumptions, and the disagreement is
informative rather than something to resolve by picking the smallest number:

- The **permutation test (p=0.011)** treats messages within a participant as
  exchangeable. It has the most power and the strongest assumption — it ignores that
  toxicity drifts over time within a session, so some of what it reads as a phase
  effect is time.
- The **paired tests (p=0.083–0.188)** respect clustering and are the defensible
  confirmatory tests, but with n=5 they are close to powerless. dz=1.03 is a large
  effect that this sample simply cannot certify.
- The **time-adjusted model (p=0.108)** is the one closest to the real question, and it
  is the one that should be quoted alongside its caveat: with 9 clusters, cluster-robust
  standard errors are anti-conservative, so even that p-value is optimistic.

**Recommended reporting: effect size and interval, not a significance claim.** The
pilot is powered to estimate, not to test. Presenting p=0.011 as the result would not
survive review.

---

## 4. The identification problem, stated plainly

Phase flipped at a single instant — last free message 11:59, first task message 12:00 —
and **nothing else in the study differed at that instant**, because every participant
was in the EXPT arm. So "the Community Note calmed people" and "an hour of arguing had
passed and people were tiring" predict exactly the same data.

The design already solves this: the control arm sits through the same clock time with a
matched-salience poll instead of the note. That contrast is the estimand in `PLAN.md`
§17.1. It was not run on 16 August. **Until a CTRL cohort runs, the drop is a promising
descriptive result and cannot be causal.**

The rising pre-trend and the attrition direction both argue against pure fatigue, and
they are worth reporting, but neither substitutes for the control group.

---

## 5. Behaviour moved; attitudes did not

This is the most interesting thing in the pilot, and it directly supports the
supervision point that self-report is the weaker evidence.

| Survey 1 measure (n=5, end of Day 1) | Mean |
|---|---|
| Note seen as legitimate | **1.87 / 5** |
| Reactance — "made me want to argue the opposite" | **4.35 / 5** |
| Feeling thermometer, own fandom | 97 / 100 |
| Feeling thermometer, rival fandom | **13 / 100** |
| Thermometer gap | **84 points** |
| Session felt heated | 4.80 / 5 |
| Outgroup similarity | 2.95 / 5 |

Three of five respondents rated the rival fandom **0**. Participants rejected the note
as illegitimate and reported high reactance — and their behaviour still got measurably
less toxic in the same window.

The framing this supports is **compliance without persuasion**: the intervention changed
what people did without changing what they thought. That is a legitimate and publishable
CHI finding, and it is more defensible than an attitude-change claim the data does not
support. It also means the mechanism is unlikely to be the superordinate-identity route
in the current draft — worth reconciling with the theory section.

---

## 6. Objective, non-self-report evidence available now

The reply graph reconstructs cleanly from `thread_id`: 95 directed edges, 29 dyads.

- **77% of replies are cross-fandom** (73 of 95) — the seeding produced genuine
  intergroup contact rather than two parallel monologues.
- **Cross-fandom replies are 2.1× as toxic as within-fandom replies** (0.384 vs 0.186).
  This is an objective, behavioural measure of intergroup hostility with no self-report
  component.
- **Conflict is concentrated in one dyad.** One BLINK–ARMY pair accounts for 28 of 95
  replies (29%). The top three participants produced 71% of all messages.

That last point matters for the analysis plan: with hostility this concentrated,
participant-level means are dominated by a couple of people, and the per-participant
network plot requested in supervision will show that clearly. It also means group-level
means understate what a *typical* participant experienced.

**Topic-shifting is visible in the transcript** and is worth coding qualitatively —
the argument drifts off K-pop into unrelated flame material (esports teams, a rival
boy group, repetitive spam), which is a plausible escalation route rather than noise.

---

## 7. Requests that the current data cannot meet

| Request | Status |
|---|---|
| An objective difference on **Day 2** | **Not possible.** No Day-2 session was run. There are zero rows. |
| Day-1 vs Day-2 persistence | **Not possible.** Same reason. |
| Effect of the intervention vs control | **Not possible.** No CTRL cohort exists. |
| N=30 | Currently 9 active participants. Needs roughly 3–4 more cohorts. |
| Interview data in the discussion | No interviews conducted yet. |

On interviewing: the guidance to interview everyone or run a focus group rather than
selecting participants is right, and it is worth deciding *before* recruitment, because
consent language and session length both depend on it.

---

## 8. One methodological caution, recorded deliberately

Some of the analysis guidance amounts to choosing where to measure after seeing the
results — testing checkpoints until a difference appears, or falling back to "end of
Day 1" as the comparison point if Day 2 shows nothing. Both are ordinary exploratory
practice, and both stop being defensible the moment they are written up as confirmatory.
This is the exposure already logged in `REVIEW_RISKS.md` §1–2, and CHI reviewers do ask.

The workable version: **fix the checkpoints and the primary contrast in writing before
the next cohort runs**, then report anything else as exploratory and clearly labelled.
Naming an expected pattern in advance — the 10 → 5 → 6 → 7 shape discussed in
supervision — is a *prediction*, and pre-registering it is exactly the right move. It
becomes a problem only if the cut points are moved afterwards to fit what came back.

The exploratory checkpoint series from AUG16, reported as descriptive only:

| Checkpoint | n | mean toxicity |
|---|---|---|
| Free, first half (11:10–11:30) | 44 | 0.302 |
| Free, second half (11:30–11:59) | 45 | 0.397 |
| After notes published (12:03–12:20) | 30 | 0.215 |

The predicted shape — escalation, then a drop at the intervention — is present. It just
cannot be certified from one arm of one cohort.

---

## 9. What to change before the next run

Ordered by how much each one buys.

1. **Run a CTRL cohort.** Without it there is no causal claim, no matter how many
   participants are added. This is the single highest-value change.
2. **Run Day 2.** It is a stated contribution and there is currently no data at all.
3. **Fix the primary contrast and checkpoints in writing first**, so the confirmatory
   analysis is decided before the data exists.
4. **Raise participation, not just registration.** 8 of 17 registered participants never
   posted. Recruitment counts are not sample size; the effective n for the paired
   analysis was 5.
5. **Improve scorer resolution.** The toxicity scale is producing only 8 distinct values
   and 46% of messages score exactly 0.3, which compresses real variation and costs
   power. Either widen the rubric or move to a continuous score.
6. **Address participant suspicion.** At least two messages show participants guessing
   they were in a study or that AI was involved ("怀疑有AI", and one explicitly noting
   their data would contaminate an experiment). Demand characteristics are a live threat
   to the behavioural measure and should be handled in the debrief protocol and reported.

---

## 10. Reproducing and extending

`analysis/analyze_pilot.py` pulls the same export as the dashboard's **Export JSON**
button and prints every number in this memo. It takes `--cohort`, `--input` for a saved
dump, and `--json` to save one.

Note for anyone writing their own script: Cloudflare rejects the default
`Python-urllib` user agent with a 403 before the request reaches the Worker. Send a real
`user-agent` header.
