# Moving the participant site to your own domain

The participant app now lives in **`public/`** — that folder, and nothing else, is what your
domain serves. `demo.html` and the protocol docs (`PLAN.md`, `REVIEW_RISKS.md`, …) stay out
of it deliberately: they walk through the hypothesis, and a participant who lands on them is
unblinded. Recruiting links must use the new domain only.

The backend (Worker + D1) does not move. Nothing about the data changes.

## One-time setup (~10 minutes, all in the Cloudflare dashboard)

### 1. Create the Pages project

1. Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** →
   **Connect to Git**.
2. Pick the `polarization-prototype` repository (authorize GitHub if asked).
3. Settings:
   - Production branch: **master**
   - Build command: **(leave empty)**
   - Build output directory: **`public`**
4. **Save and Deploy.** From now on every merge to master redeploys the site automatically —
   the same flow you already use.

### 2. Attach your domain

1. Open the new Pages project → **Custom domains** → **Set up a custom domain**.
2. Enter the domain you want participants to visit, e.g. `study.yourdomain.com`.
3. Because the zone is already on Cloudflare, the DNS record is created for you — accept it.
   The domain is live within a couple of minutes.

### 3. Let the Worker accept calls from that domain

The API rejects browsers it doesn't recognise, so the new domain must be allowlisted:

1. Edit `backend/wrangler.toml`:
   ```toml
   ALLOWED_ORIGINS_EXTRA = "https://study.yourdomain.com"
   ```
   (exact origin: scheme + host, no trailing slash; several domains are comma-separated)
2. Deploy:
   ```
   cd backend
   npx wrangler deploy
   ```

### 4. Check it

Open `https://study.yourdomain.com` — it should land on the join screen. Create a throwaway
cohort in the dashboard (`https://study.yourdomain.com/dashboard.html`), join it with
`?flair=ARMY`, and post once. If the post appears, CORS is right and you're done.

## What stays where

| | URL |
|---|---|
| Participant app | `https://study.yourdomain.com/study.html` (invite links add `?flair=ARMY` / `?flair=BLINK`) |
| Researcher dashboard | `https://study.yourdomain.com/dashboard.html` |
| API (Worker) | `https://defuselab-study.lingpo-tseng.workers.dev` — unchanged, `public/assets/config.js` already points at it |
| Old GitHub Pages | keeps working; `study.html`/`dashboard.html` at the repo root are now redirect stubs into `public/` |

## Optional: API on your domain too

If you want the API under your domain (e.g. `api.yourdomain.com` instead of `workers.dev`):
Worker `defuselab-study` → **Settings** → **Domains & Routes** → **Add** → Custom domain.
Then set `BACKEND_URL` in `public/assets/config.js` to `https://api.yourdomain.com` and merge.
Purely cosmetic — the workers.dev URL keeps working either way.

## Blinding note

The GitHub repository itself is public, so the protocol docs remain readable by anyone who
finds the repo. The domain migration removes them from the URL participants are *given*, which
is the exposure that matters for blinding; making the repo private is the stricter option if
the team wants it.
