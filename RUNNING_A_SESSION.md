# Running a session — operator runbook

How to drive a session from the researcher dashboard, for a rehearsal or the real thing.
The dashboard is the control surface; participants only ever see the forum.

- **Dashboard:** `public/dashboard.html` (or `/dashboard.html` on the custom domain) — passphrase is the Worker's `RESEARCHER_TOKEN`
- **Participant:** `study.html?flair=ARMY` or `?flair=BLINK` on the custom domain (see [`MIGRATION.md`](MIGRATION.md))

**Fandom comes from the link, never from a menu.** A participant with no `?flair=` and no
rejoin code sees *"Please use the personal invite link from the study team"* and cannot join.
This is deliberate — self-assigned fandom would break the design — so real invites must be
personalised per participant from the pre-selection form.

---

## Before the session

1. **Create the cohort.** Code (3–12 letters/numbers), label, language, and **arm**.
   Pick `EXPT (whole group)` or `CTRL (whole group)` — never `MIXED` for a real run, which
   splits a group of 8 into two 2v2 feeds. The cohort starts at **Day 1, phase `free`**, and
   its Day-1 seed prompts are inserted automatically.
2. **Send each participant their link** — `study.html?flair=ARMY` to the ARMY members,
   `?flair=BLINK` to the BLINK members — plus the cohort code.
3. Confirm the row shows the arm you intended and `Day 1` / `free`.

---

## Day 1 — the manipulation happens inside this session

Everything is driven by the **phase stepper** in the cohort row. Participants' screens follow
within ~4 seconds of each click (the app polls).

| Phase | You click | Participants see |
|---|---|---|
| `free` | *(starting state)* | The forum. They post and argue on the seeded prompts. |
| `task` | when hostility is established | A **full-screen task step** — the Community Note contribution (EXPT) or the poll (CTRL). The feed is unreachable until they submit; after 60 s a small "continue without adding" escape appears (logged). |
| `survey1` | once the notes have published | **Survey 1** opens full-screen. Submitting it **ends their day** — they land on the rejoin-code screen. Advancing to this phase also resolves anyone still unpaired with a labelled system sample. |
| `done` | housekeeping | Anyone still connected is moved to the finish screen. |

**Notes publish one pair per minute**, oldest contributions first (`PAIR_INTERVAL_MS`), so
the feed shows them arriving one at a time rather than all at once. With 4 pairs expect the
last note roughly 4 minutes after the first — don't advance to `survey1` before the last
note is out, unless you intend the sweep to filler-resolve the stragglers.

**Watch for these while it runs:**

- The task step blocks everyone until they contribute (or take the 60 s escape, which is
  logged as `task_skipped`). A reload re-blocks a skipper; a submitted contribution sticks.
- After contributing, EXPT participants are back in the feed with a pinned card showing
  their entry and a waiting spinner — their note publishes when the one-per-minute schedule
  reaches their pair. Keep the discussion going meanwhile.
- **Unpaired entries resolve when you advance to `survey1`** — each gets a clearly-labelled
  system sample and is recorded as not-live-paired (excluded per-protocol). Prefer letting
  the schedule pair everyone first.
- Tell participants to **screenshot their rejoin code** on the finish screen. Without it they
  cannot be linked to Day 2.

---

## Day 2 — persistence, no feature

**Two clicks, and the order matters:**

1. Click **Day 2** — this re-seeds the Day-2 prompts.
2. Click **`free`** — ⚠️ the phase is still `done` from yesterday. If you skip this, everyone
   who rejoins lands straight on the finish screen.

Then: participants rejoin with the **cohort code + their personal rejoin code** (the `?flair=`
link no longer matters — their fandom comes from their record). Let them discuss, then click
**`survey2`**. Survey 2 ends the day by itself and finishes with the interview-consent
question. There is no task block on Day 2 — that is the persistence test.

---

## Reading the dashboard while it runs

Hit **↻ Refresh** — nothing auto-updates except participants' own screens.

- **Day 1 — before vs after the task block.** The contrast the study rests on. Read EXPT's
  drop *relative to* CTRL's, never on its own.
- **Operational gates G1–G3.** Whether the session is behaving well enough to continue.
  They are run-time checks, **not** evidence for the hypothesis.
- **By group.** Each cohort's own trajectory — the level the design actually varies at.
- **Messages.** Every post with its own toxicity score; filter by cohort/arm/day.

**At the end of a session, click ♻ Rescore once.** It re-grades every message with one
consistent scorer, so live scores from different moments become comparable.

---

## Exports

| Button | Contents |
|---|---|
| ⇩ Surveys CSV | one row per participant × instrument, one column per item id |
| ⇩ Messages CSV | every message with `text_raw`, toxicity, we/they, thread id |
| ⇩ Sessions CSV | one row per session with its mean |
| ⇩ Export JSON | everything, for external re-scoring |

`s2_back_shared_community` and `s2_back_own_fandom` are separate columns on purpose — they
jointly operationalise dual identity and must never be averaged into one score.

---

## Rehearsing without participants

1. Create a throwaway cohort, e.g. `TEST01`, arm EXPT.
2. Open `study.html?flair=ARMY` in a normal window and `?flair=BLINK` in **a different
   browser or an incognito window**. The app keeps the rejoin code in `localStorage`, so two
   participants in the same profile overwrite each other. All Chrome incognito tabs share one
   profile — use two distinct browsers if you want more than two testers.
3. Step through the phases above.

⚠️ **Test data lands in the production database and skews the arm-level panels.** The
arm × day and Day-1 phase aggregates — and therefore G1–G3 — are computed across *all*
cohorts. The *By group* table is per cohort and stays clean. Closing a test cohort does not
remove its events. Prefix test cohorts `TEST…` so they are identifiable later.

---

## If something looks wrong

| Symptom | Cause |
|---|---|
| "Please use the personal invite link…" | No `?flair=` in the URL and no rejoin code. Day 1 needs the flair link. |
| Participant stuck on the task step | They haven't contributed; the escape link appears after 60 s. Advancing to `survey1` unblocks everyone. |
| Note not published yet | Pairs publish one per minute, oldest first — wait for the schedule, or advance the phase to filler-resolve. |
| A button does nothing | Reload the page (F5). If a browser dialog was suppressed earlier, `confirm()` silently returns false. |
| Numbers look wrong after a rehearsal | Test cohorts are in the arm-level aggregates — see above. |

**Closing a cohort blocks new joins only**; people already in a session continue. There is no
reopen control, so close only when you are done with a cohort.
