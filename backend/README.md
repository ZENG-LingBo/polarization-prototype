# DefuseLab backend — deploy guide (protocol v3)

The study backend is **one Cloudflare Worker + one D1 database** (both free tier). It powers
`study.html` (participant app) and `dashboard.html` (researcher view): cohort group sessions,
2-arm assignment (EXPT community note / CTRL inert poll), the shared live feed, Day 1–3
tracking with rejoin codes, live cross-fandom Community-Note pairing, poll votes, end-of-day
survey links, and token-gated aggregates/export.

It calls **no LLM** — the note templates are static, pre-screened strings, and contributions
are assembled verbatim. Toxicity stored here is the demo heuristic; the pre-moderation
`text_raw` is kept so the real study rescores with Perspective API + the validated lexicon.
(Separate from the legacy [`../worker/`](../worker/) OpenAI proxy of the archived
Lakers/Celtics demo.)

---

## ✅ Deploy from the Cloudflare dashboard (no terminal, ~15 minutes)

1. **Create the database.** Cloudflare dashboard → *Storage & Databases → D1 → Create
   database* → name it exactly `defuselab-study`.
2. **Apply the schema.** Open the database → *Console* → paste the whole of
   [`schema.sql`](schema.sql) → *Run*.
3. **Create the Worker.** *Workers & Pages → Create → Worker* → name `defuselab-study` →
   *Deploy* the starter, then *Edit code* → replace everything with
   [`worker.js`](worker.js) → *Deploy*.
4. **Bind the database.** Worker → *Settings → Bindings → Add → D1 database* →
   Variable name **`DB`** → select `defuselab-study` → Save/redeploy.
5. **Add the researcher passphrase.** Worker → *Settings → Variables and Secrets → Add* →
   name **`RESEARCHER_TOKEN`**, type **Secret** → value = the passphrase the team will type
   into the dashboard. Save.
6. **Add the survey URLs** (plain-text variables; can be added later):
   **`SURVEY_URL_D1`**, **`SURVEY_URL_D2`**, **`SURVEY_URL_D3`** (+ `_ZH` variants for
   Chinese cohorts, e.g. **`SURVEY_URL_D1_ZH`**). The worker appends
   `?pid=&day=&arm=&lang=&cohort=` so survey responses join to platform data.
   Optional: **`PAIRING_TIMEOUT_MS`** (default 90000) — how long a Community Note waits for
   a live rival-fandom partner before a clearly-disclosed system sample completes it.
7. **Copy the Worker URL** (`https://defuselab-study.<subdomain>.workers.dev`) and send it
   to whoever maintains the repo. They will:
   - set `BACKEND_URL` in [`../assets/config.js`](../assets/config.js) to that URL, and
   - if the site is *not* served from `https://zeng-lingbo.github.io`, add the real origin
     to `ALLOWED_ORIGINS` at the top of `worker.js`,
   then commit + push so GitHub Pages serves the connected frontend.

### CLI alternative (wrangler)
```
cd backend
npx wrangler d1 create defuselab-study          # paste the returned id into wrangler.toml
npx wrangler d1 execute defuselab-study --file=schema.sql --remote
npx wrangler secret put RESEARCHER_TOKEN
npx wrangler deploy
```

---

## Running a session (researcher workflow)

1. Open `dashboard.html`, enter the passphrase.
2. **Create a cohort** (code like `PILOT1`, pick EN or 中文). Creation seeds the Day-1
   discussion prompts for both arms.
3. **Send personalized invite links.** Fandom, consent, and 18+ are all collected in the
   **pre-selection form outside the app** (PLAN.md §17) — the app asks none of it. From the
   form results, send each participant the link matching their fandom:
   - ARMY members → `study.html?cohort=PILOT1&flair=ARMY`
   - BLINK members → `study.html?cohort=PILOT1&flair=BLINK`
   They land in a **live shared feed** — participants in the same cohort+arm see each
   other's posts. Arms auto-balance; participants never see arm names (blinding). A visitor
   without an invite link (or a rejoin code) cannot join — the backend refuses to invent a
   fandom (`no_flair`).
4. End of each day: participants tap **Finish today** → get their **rejoin code** (links
   them across days) → the **survey button** (your SURVEY_URL for that day, with
   pid/day/arm/lang/cohort prefilled).
5. Next day: **advance the cohort's day** on the dashboard (re-seeds that day's prompts).
   Day 2 shows the **Community Note** to EXPT and the **inert poll** to CTRL; Day 3 has no
   feature (carry-over). Participants rejoin with cohort code + rejoin code.
6. Watch the **R1–R3 requirement checks** and arm×day toxicity live; export CSV/JSON anytime.
7. **Close** the cohort when done.

### Local development / testing
```
npx wrangler d1 execute defuselab-study --local --file=backend/schema.sql --config backend/wrangler.toml
npx wrangler dev --config backend/wrangler.toml --local --port 8787 \
  --var RESEARCHER_TOKEN:test123 --var SURVEY_URL_D1:https://example.com/s1
python -m http.server 8000
# then open: http://127.0.0.1:8000/study.html?backend=http://127.0.0.1:8787
#            http://127.0.0.1:8000/dashboard.html?backend=http://127.0.0.1:8787
```

## Endpoints
| Method · path | Purpose | Auth |
|---|---|---|
| `POST /api/session/start` | join/rejoin a cohort (balanced arm+flair, rejoin codes) | — |
| `GET /api/feed?sessionId&since` | shared live feed for the participant's cohort+arm+day | — |
| `POST /api/event` | log post/comment/like/share/cross (pre-moderation text) | — |
| `POST /api/collab/contribute` | Community Note contribution; pairs across fandoms (EXPT day 2) | — |
| `GET /api/collab/status?id=` | pairing gate (live pair, or disclosed sample on timeout) | — |
| `POST /api/poll/vote` · `GET /api/poll/results` | inert daily poll (CTRL day 2) | — |
| `GET /api/survey-link?sessionId` | end-of-day survey URL with pid/day/arm/lang/cohort | — |
| `POST /api/session/end` | close a session | — |
| `POST /api/dashboard/cohort` · `…/cohort/day` · `…/cohort/close` | cohort admin | **Bearer `RESEARCHER_TOKEN`** |
| `GET /api/dashboard/summary` | arm×day aggregates + R1–R3 checks | **Bearer** |
| `GET /api/dashboard/sessions` | raw export (sessions/events/collabs/participants) | **Bearer** |

## What the backend expects (exact names)
| Thing | Name | Where |
|---|---|---|
| D1 binding | `DB` | Worker → Settings → Bindings |
| Researcher passphrase | `RESEARCHER_TOKEN` | Secret |
| Survey URLs | `SURVEY_URL_D1..D3` (+`_ZH`) | Plain variables |
| Pairing filler timeout | `PAIRING_TIMEOUT_MS` (optional) | Plain variable |
| Frontend origin | `ALLOWED_ORIGINS` list | top of `worker.js` |
| Frontend → backend | `BACKEND_URL` | `assets/config.js` |

## Ethics / IRB reminders (before any real recruitment)
Pre-moderation text is stored by design (PLAN.md §10–§11): agree a retention window, restrict
dashboard-passphrase circulation, run the demographic pre-selection form **outside** the app,
and confirm IRB status. This build is for **internal pilot testing** until those are settled.
The Day-1 seed prompts in `worker.js` (`SEEDS`) are placeholders — replace with the team's
finalized discussion prompts before a real run.
