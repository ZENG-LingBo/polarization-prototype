# DefuseLab Study 1 — backend (Cloudflare Worker + D1)

Turns the prototype from an offline demo into a **real, cross-device study platform**: it assigns
each participant an arm (C0/C1/C2) and fandom flair, logs every post/reaction with its
pre-moderation text, drives **live cross-fandom Collab pairing**, and serves the researcher
dashboard's aggregates behind a passphrase.

> The frontend works **fully offline** with no backend (localStorage + a disclosed sample partner).
> Deploy this only when you want real cross-device logging and live pairing. Nothing here is needed
> for a single-machine walkthrough.

## ✅ Deploy from the dashboard (no terminal)
1. **Create the database.** Cloudflare dashboard → **Storage & Databases → D1 → Create** →
   name it `defuselab-study`. Open its **Console**, paste all of [`schema.sql`](schema.sql), **Run**.
2. **Create the Worker.** **Workers & Pages → Create → Worker** → name it `defuselab-study` →
   **Deploy** (starter), then **Edit code** → delete the starter, **paste all of [`worker.js`](worker.js)** → **Deploy**.
3. **Bind D1.** Worker → **Settings → Bindings → Add → D1 database** → variable name **`DB`** →
   select `defuselab-study` → **Deploy**.
4. **Set the researcher passphrase.** Worker → **Settings → Variables and Secrets → Add** →
   name **`RESEARCHER_TOKEN`**, value = a passphrase you choose, **Encrypt** → **Deploy**.
5. **Point the frontend at it.** Copy the Worker URL
   (`https://defuselab-study.<your-subdomain>.workers.dev`) into `assets/config.js` →
   `BACKEND_URL`. Commit + push. Done — the app now logs to D1 and the dashboard reads live data.

Prefer the CLI? `npx wrangler d1 create defuselab-study` → put the id in `wrangler.toml` →
`npx wrangler d1 execute defuselab-study --file=backend/schema.sql` →
`npx wrangler secret put RESEARCHER_TOKEN` → `npx wrangler deploy`.

## Test live cross-fandom pairing
Open the app in two windows forcing the **same arm** and **opposite fandoms**:
- `app.html?arm=C2&flair=ARMY`  and  `app.html?arm=C2&flair=BLINK`

Start the Collab in both. Each waits on the pairing gate until the other contributes, then both
co-publish the **same** joint artifact — a true live pair (`is_live_paired=1`), not a filler.

## Endpoints
| Method · path | Purpose | Auth |
|---|---|---|
| `POST /api/session/start` | assign arm + flair, create session | — |
| `POST /api/event` | log post/comment/like/share/cross (stores pre-moderation text) | — |
| `POST /api/collab/contribute` | submit a Collab piece; match a waiting rival-fandom one | — |
| `GET /api/collab/status?id=` | poll the pairing gate (live pair, or disclosed sample on timeout) | — |
| `POST /api/session/end` | close a session | — |
| `GET /api/dashboard/summary` | per-arm aggregates | **Bearer `RESEARCHER_TOKEN`** |
| `GET /api/dashboard/sessions` | raw sessions/events/collabs | **Bearer `RESEARCHER_TOKEN`** |

## Notes
- **CORS:** edit `ALLOWED_ORIGINS` in `worker.js` if your Pages origin differs.
- **Blinding:** dashboard endpoints require the token so participants can't reach the analytics.
- **Toxicity** stored here is the demo keyword heuristic; `text_raw` keeps the pre-moderation wording
  so the study can rescore it with **Perspective API + the validated K-pop lexicon** (see `MEASURES.md`).
- **IRB:** logging real participants' data is IRB-gated (`PLAN.md` §11) — this is for internal
  instrument-building until approval.
- Separate from the legacy [`../worker/`](../worker/) OpenAI proxy (that served the archived
  Lakers/Celtics demo); this backend does not call any LLM.

## Files
- `worker.js` — the Worker (D1-backed session logging + pairing + dashboard aggregates)
- `schema.sql` — D1 tables
- `wrangler.toml` — config (D1 binding + secret placeholders; no secrets committed)
