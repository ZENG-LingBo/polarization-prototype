# How toxicity is measured — per message and per user

This file documents **exactly** what the running platform computes: the algorithms, the
prompt, the formulas, and where each number on the dashboard comes from. It is the
operational companion to [`MEASURES.md`](MEASURES.md), which covers the *validated
instruments the paper reports*.

**The one distinction that matters:**

| Layer | What it is | Used for | Documented in |
| --- | --- | --- | --- |
| **Live scoring** (this file) | A wordlist heuristic plus a single-shot LLM rating, computed as the session runs | Running the study: seeing whether Day 1 got hot enough, watching the G1–G3 gates, spotting a session that needs intervention | this file |
| **Registered analysis** | Perspective API + Coe, Kenski & Rains (2014) incivility codebook + the validated K-pop lexicon, applied afterwards to the exported raw text | Everything reported in the paper | [`MEASURES.md`](MEASURES.md) |

Live scores are **not** a published instrument and must not be reported as one. They exist
because a researcher needs a number *during* a session. `text_raw` is stored unmodified
precisely so the registered instruments can be applied later to the same corpus.

---

## 1. What is stored for every message

Every post and reply becomes one row in the `events` table
([`backend/schema.sql`](backend/schema.sql)):

| Column | Meaning |
| --- | --- |
| `id` | event id (also the parent handle for replies) |
| `session_id` | which session wrote it — **`NULL` for seeded prompt posts** |
| `cohort_id`, `day`, `arm` | group session, study day (1–3), condition (`EXPT` / `CTRL`) |
| `flair` | author's fandom (`ARMY` / `BLINK`, or `SYS` for system/seed posts) |
| `author` | anonymous handle (e.g. `army_eppy`) |
| `type` | `post` \| `comment` (only these two are scored) |
| `text_raw` | the message **exactly as typed, pre-moderation — never modified** |
| `toxicity` | score in **0.0–1.0** (the UI multiplies by 100) |
| `we`, `they` | in-group / out-group pronoun counts |
| `thread_id` | parent event id — for replies this is the true reply target |
| `created_at` | epoch ms |

`toxicity` is a *current-best* value: it is written at insert time and **overwritten** by
later scoring passes (§2.3, §2.4). There is no score history — see §5.1.

---

## 2. Per-message scoring ("each sentence")

### 2.1 Scorer A — bilingual wordlist heuristic

`toxicity(t)` — [`backend/worker.js:154`](backend/worker.js). Deterministic, instant, no
network:

1. Lowercase the message.
2. Count **one hit per distinct list term present**:
   - English list `TOX` (30 terms: `clown`, `trash`, `delusional`, `flop`, `cope`,
     `pathetic`, `shut up`, 🤡, 💀, …) — [`worker.js:82`](backend/worker.js). Single words
     match on **word boundaries**; multi-word phrases and emoji match as substrings.
   - Chinese list `TOX_ZH` (29 terms: 呵呵, 也配, 就这, 糊了, 过气, 拉胯, 黑子, 脑残, 垃圾,
     闭嘴, 笑死, 不能看, 打不过, 下头, …) — [`worker.js:88`](backend/worker.js). Substring
     matched, which CJK requires.
3. Add one hit if the message contains a run of **4+ capital letters** (shouting), after
   removing group and fandom names — they are capitalised by convention, and counting them
   gave every message naming **BLACKPINK** (9 capitals) a free hit while **BTS** (3) never
   triggered it, biasing the meter against one fandom.
4. `score = min(hits / 3, 1.0)`

Both refinements in steps 2–3 were added after the originals misfired: plain substring
matching scored *"gene**ratio**n"* as toxic via the term `ratio` (likewise *operation*,
*rational*), which alone made two intensity-matched seed prompts differ by 33 points.

So the heuristic can only ever return **0, 33, 67 or 100**. Worked examples:

| Message | Hits | Score |
| --- | --- | --- |
| 我们一起听歌吧 | none | **0** |
| 你们根本不能看，垃圾 | 不能看, 垃圾 | **67** |
| 呵呵就这？也配叫代表 | 呵呵, 就这, 也配 | **100** |
| this take is TRASH lol | `trash` + caps run | **67** |
| BLACKPINK outsold and outperformed | none (name exempt from the caps rule) | **0** |
| a rational operation in this generation | none (`ratio` needs a word boundary) | **0** |

Known blind spots: no negation handling ("this is *not* trash" scores as a hit), no sarcasm,
no coverage of terms outside the two lists, and hits are counted once per *term* rather than
per occurrence. The Chinese list keeps substring matching, so it retains the class of false
positive that was just removed from English.

### 2.2 Scorer B — LLM rating (0–100)

`llmToxicity(env, text)` — [`backend/worker.js:130`](backend/worker.js). Runs only when the
`LLM_API_KEY` secret is set.

| Setting | Value |
| --- | --- |
| Endpoint | `LLM_BASE_URL` + `/chat/completions`, OpenAI-compatible (default: DashScope international) |
| Model | `LLM_TOX_MODEL`, default **`qwen-turbo`** |
| Temperature | `0` |
| `max_tokens` | 8 |
| Timeout | 8 s |
| Input | the message alone — **no thread context, no author, no fandom, no arm** (the rater is blind to condition) |

System prompt, verbatim:

> Rate the toxicity of this K-pop fan-community message toward the rival fandom or its
> members: hostility, insults, mockery, dismissive sarcasm. Scale 0-100 (0 = friendly or
> neutral, 100 = extremely hostile). The message may be English or Chinese. Reply with ONLY
> the integer.

Parsing: the first 1–3 digit integer in the reply, divided by 100 and clamped to 0–1. If the
key is missing, the request fails, times out, returns non-200, or contains no integer, the
function returns `null` and **the wordlist score stands**. Toxicity scoring never blocks or
breaks posting.

### 2.3 When each scorer runs — live

On `POST /api/event` ([`worker.js:293`](backend/worker.js)):

1. The row is inserted **immediately** with the Scorer A value, so the feed never waits.
2. If a key is configured, `ctx.waitUntil()` grades the same text with Scorer B in the
   background and updates the row — typically ~1 s later.

Consequence: a message's score may change shortly after it appears. **Seeded prompt posts
are inserted directly (not via `/api/event`), so they are never LLM-graded live** — they
carry Scorer A values until a rescore.

### 2.4 When each scorer runs — backfill (♻ Rescore)

`POST /api/dashboard/rescore` ([`worker.js:433`](backend/worker.js)), researcher-gated,
driven by the dashboard button:

- Selects **all** `post`/`comment` rows (including seeds), ordered oldest first.
- LLM mode (default when a key exists): **25 rows per request**, 5 concurrent calls at a
  time; the dashboard loops `offset` until `done`, showing `♻ 120/312 (llm)`.
- Wordlist mode (`{"mode":"wordlist"}`, or no key): all rows in one pass.
- Per row: use the LLM value if it returned one, else the wordlist value.
- `we` / `they` are **always** recomputed with the current wordlists.
- Returns `{mode, total, processed, nextOffset, done}` — `mode` tells you which scorer
  actually ran. If the button reports `(wordlist)` when you expected `(llm)`, the key is
  not set on the Worker.

Run this after any scorer change so the whole corpus is scored by one consistent version.

### 2.5 Which number ends up in the column

Precedence, highest first:

1. Most recent **rescore** value (LLM if available, else wordlist)
2. Live **LLM** value from `waitUntil`
3. Live **wordlist** value at insert

### 2.6 `we` / `they` pronoun counts

`countWords(t, list)` — [`worker.js:161`](backend/worker.js). English: tokenize on
non-letters and match `WE` (`we, us, our, ours, we're, weve, both, together`) or `THEY`
(`they, them, their, theirs, they're, u, you, your, yall, y'all`). Chinese: count
**occurrences** of `WE_ZH` (我们, 咱们, 一起, 大家) or `THEY_ZH` (他们, 她们, 你们, 那边,
对家, 你家). The two are summed, so a bilingual message counts both.

---

## 3. Per-user and per-group aggregation

### 3.1 Per session — the dashboard *Sessions* table

Mean of that session's own post/comment scores
([`dashboard.html:207`](dashboard.html)):

```
session mean = round(100 × Σ toxicity(messages in session) / count(messages in session))
```

Shown as `—` when the session has no messages. **A "session" is one join, not one person**:
a participant who rejoins the same day (refresh, reconnect) produces a second session row.
For a per-*person* figure, group by `participant_id` / handle in the CSV rather than reading
this table.

### 3.2 Per message list — the *Messages* table

Every message with its own score, filterable by cohort / arm / day / source, sortable, and
searchable ([`dashboard.html:237`](dashboard.html)). Its summary line is the unweighted mean
of the currently filtered rows. It defaults to **participants only** so the mean shares the
basis of the primary-outcome chart; switching to "include seed prompts" adds researcher-
inserted posts, which the chart excludes.

### 3.3 Per arm × day — the primary outcome

SQL at [`worker.js:463`](backend/worker.js):

```sql
SELECT arm, day, COUNT(*) msgs, SUM(toxicity) toxSum, SUM(we) we, SUM(they) they
FROM events
WHERE type IN ('post','comment') AND session_id IS NOT NULL
GROUP BY arm, day
```

```
toxRate  = toxSum / msgs        → the "TOX %" column and the bar chart (×100)
weShare  = we / (we + they)     → "WE SHARE %", null when both are 0
```

Two properties to keep in mind:

- **Seeds are excluded** (`session_id IS NOT NULL`) — the seeded fan-war prompts do not
  inflate the outcome.
- This is a **message-level mean**: a participant who posts 20 messages influences it 20×
  more than one who posts once. For the paper, compute the **user-level mean-of-means**
  (average within participant, then across participants) — the exported CSV supports this,
  and the two can differ substantially when posting is unbalanced.

### 3.4 Operational gates (G1–G3)

Computed from `toxRate` at [`worker.js:480`](backend/worker.js); `null` (grey) until the
relevant cells have data:

| Check | Passes when |
| --- | --- |
| **G1** — baseline high on Day 1 | `EXPT day1 ≥ 0.55` **and** `CTRL day1 ≥ 0.55` |
| **G2** — control stays high after its inert feature | `CTRL day2 ≥ 0.50` |
| **G3** — drop only after the community note | `EXPT day2 ≤ 0.35` **and** `CTRL day2 ≥ 0.50` |

These are **operational go/no-go gates for the protocol** (e.g. don't advance a cohort whose
Day 1 never got heated), not hypothesis tests.

---

## 4. Getting the data out

- **⇩ Messages CSV** — the currently filtered messages, one row each:
  `event_id, cohort, day, arm, fandom, handle, type, is_seed, toxicity_0_100, we, they, thread_id, created_at_iso, text_raw`
- **⇩ Sessions CSV** — one row per session with its message count and mean.
- **⇩ Export JSON** — the full `/api/dashboard/sessions` payload (sessions, events, collabs,
  participants) for external re-scoring.

`thread_id` holds the parent event id, so the reply graph — who replied to whom — is
reconstructable from the export.

---

## 5. Limitations, and what the paper must do instead

**5.1 Rescoring overwrites in place.** There is no per-score history: a rescore replaces
`toxicity` for every row. If you want to compare scorer versions, **export the Messages CSV
before rescoring** — that file is the snapshot.

**5.2 The live LLM score is one single-shot rating.** One model, one prompt, one call, no
self-consistency, no ensemble, no human validation, and no agreement statistic. It is not a
validated instrument.

**5.3 It is not reproducible by construction.** A hosted model behind a version-floating
alias (`qwen-turbo`) can change under you, and `temperature: 0` reduces but does not
eliminate nondeterminism. Nothing pins the model version in the stored data.

**5.4 The wordlist is a demo heuristic.** Four possible values, no negation or sarcasm
handling, and coverage limited to terms someone thought of in advance.

**5.5 Bilingual comparability is unestablished.** English and Chinese messages are scored by
the same prompt and by two independently written wordlists, with no calibration showing the
scales are equivalent across languages.

**For the reported analysis**, apply the registered instruments to the exported `text_raw`
(Perspective API, the Coe et al. 2014 incivility codebook, and the validated K-pop lexicon
per [`MEASURES.md`](MEASURES.md)), with a human-coded subsample and a reported reliability
statistic (e.g. Krippendorff's α) for the automated measure. If the LLM rating is to appear
in the paper at all, it needs its own validation against that human-coded subsample, plus a
pinned model version, the prompt as published here, and its agreement reported.
