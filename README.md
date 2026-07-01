# DefuseLab — Polarization Defusing prototype (K-pop · Study 1)

A prototype of the simulated social-media platform for **Study 1** of the
[Polarization Defusing study](https://github.com/ZENG-LingBo/polarization): rival K-pop fandoms,
a 3-arm RCT, and the **Collab Spotlight** feature. Static frontend on GitHub Pages + an optional
Cloudflare Worker/D1 backend. **Runs fully offline with no backend** — set one config value to turn
on real cross-device logging and live cross-fandom pairing.

## ▶ Live
**https://zeng-lingbo.github.io/polarization-prototype/** → then pick an entrance:
- **📱 Participant** → [`app.html`](app.html): the mobile **kfeed** app (onboarding → session → done).
- **📊 Researcher** → [`dashboard.html`](dashboard.html): passphrase-gated metrics with source papers.

The two are deliberately **separated** so the participant never sees the toxicity meters, the arm
they're in, or the hypothesis (blinding — PLAN.md §4.3, §12).

## The idea
Rival K-pop fandoms direct real, sustained toxicity at each other online. **Collab Spotlight** tests
whether *indirectly* activating a shared superordinate identity — "K-pop fans," never declared, only
enacted — reduces that toxicity. Full protocol: [`PLAN.md`](PLAN.md) · framing: [`OUTLINE.md`](OUTLINE.md) ·
instruments: [`MEASURES.md`](MEASURES.md) · rival-pair decision: [`FANDOM_SELECTION.md`](FANDOM_SELECTION.md).

## Architecture
| File | Role |
|---|---|
| `index.html` | Landing / router (participant vs. researcher; status + IRB note). |
| `app.html` | **Tester** app — Threads/X-style mobile feed. Onboarding → consent + 18+ + eligibility → persistent automation disclosure → session (C0 plain / C1 neutral Collab / C2 K-pop Collab) → done. **No meters, no arm label.** |
| `dashboard.html` | **Researcher** dashboard — per-arm toxicity (C2<C1<C0 + contrasts), we/they, CIIM proxy, cross-fandom engagement, dose/pairing compliance, session table, CSV/JSON export, and a **measurement-provenance** panel citing each metric's source paper. |
| `assets/engine.js` | Shared data + scoring heuristics + provenance table + backend client with offline fallback. |
| `assets/config.js` | `BACKEND_URL` (empty = offline) and a few knobs. |
| `assets/ui.css` | Mobile-first styles (phone frame, feed) + dashboard grid. |
| `backend/` | Cloudflare Worker + D1: arm/flair assignment, event logging, live Collab pairing, auth-gated aggregates. See [`backend/README.md`](backend/README.md). |

## Two modes
- **Offline (default):** no backend. The app logs to browser `localStorage` and, when no live partner
  is online, completes a Collab with a **clearly disclosed** system-generated sample (never implying a
  human — PLAN.md §4.3). The dashboard reads local data and can **Seed demo cohort** to populate the
  compare-arms view. Works on GitHub Pages with zero setup.
- **Backend (real):** deploy [`backend/`](backend/README.md) (Cloudflare Worker + D1, no terminal
  needed), set `BACKEND_URL` in `assets/config.js`. Now sessions log cross-device and Collabs
  **live-pair** across two real participants from opposite fandoms. Test it with two windows:
  `app.html?arm=C2&flair=AUR` and `app.html?arm=C2&flair=NOV`.

## Measurement is source-grounded (not home-grown)
Every dashboard metric is shown with the **validated instrument + source paper** it stands in for,
anchored to a model paper — **GuesSync!** (Rajadesingan et al., CSCW 2023): toxicity → Perspective API
+ Coe et al. 2014 + a validated K-pop lexicon; we/they → LIWC (Tausczik & Pennebaker 2010); common
identity → CIIM (Gaertner & Dovidio 2000); AP/IOS → Iyengar & Westwood 2015 / Aron et al. 1992;
identification → Postmes et al. 2013 + Leach et al. 2008; reactance → Hong & Faedda 1996 / Dillard &
Shen 2005. Construct-by-construct grounding: [`MEASURES.md`](MEASURES.md); demo-meter mapping:
[`METRICS.md`](METRICS.md).

## Status & ethics
This build is for **instrument-building / internal testing**. The app records behavioral data, so a
real recruited run is **IRB-gated** (PLAN.md §11). The rival pair is **ARMY (BTS) × BLINK (BLACKPINK)**
(see [`FANDOM_SELECTION.md`](FANDOM_SELECTION.md)). Seeded posts are **anonymized and paraphrased** from
publicly documented fan-war discourse, **exclude member-targeting content** (no attacks on individuals,
no slurs/threats), use **fictional handles**, and are **not attributed to real people** — per the study's
ethics handling (PLAN.md §12).

## Run locally
```
python -m http.server 8000   # then visit http://localhost:8000
```

## Notes
- Toxicity here is a transparent keyword heuristic for *demonstration*; the real study uses
  Perspective API + a validated K-pop incivility lexicon + human incivility coding.
- The earlier Lakers/Celtics agent demo is archived at
  [`legacy-lakers-celtics.html`](legacy-lakers-celtics.html) (its OpenAI proxy is in [`worker/`](worker/)).
- A research prototype, **not affiliated with or endorsed by** BTS, BLACKPINK, HYBE, YG, or any
  official fandom. Group/fandom names are used only to study intergroup dynamics.
