# DefuseLab — Polarization Defusing prototype (K-pop · Study 1)

A **one-file, static** prototype of the simulated social-media platform for **Study 1** of the
[Polarization Defusing study](https://github.com/ZENG-LingBo/polarization): rival K-pop fandoms,
a 3-arm RCT, and the **Collab Spotlight** feature. Open the GitHub Pages URL and it just runs —
no install, no backend.

## ▶ Live demo
**https://zeng-lingbo.github.io/polarization-prototype/**

## The idea
Rival K-pop fandoms direct real, sustained toxicity at each other online. **Collab Spotlight** is
a feed feature that tests whether *indirectly* activating a shared superordinate identity — "K-pop
fans," never declared, only enacted — reduces that toxicity. Full protocol: [`PLAN.md`](PLAN.md) ·
theory framing: [`OUTLINE.md`](OUTLINE.md) · instruments: [`MEASURES.md`](MEASURES.md).

## What it shows
- A simulated `r/kpop` thread between two rival fandoms (**AURORA** vs. **NOVA** — fictional
  placeholder fandoms), with fandom flair on every post.
- **Three arms**, switchable in the demo:
  - **C0 — Control:** plain feed, no feature.
  - **C1 — Active control:** feed + a cross-fandom Collab, but framed around a **neutral** topic
    (comfort food) — isolates generic contact/novelty from the identity framing.
  - **C2 — Intervention:** feed + the Collab **framed around K-pop as a whole**.
  - Running the scenario in each arm fills in a **compare-arms** panel so you can see the
    `C2 < C1 < C0` toxicity story, and read off the `C2−C1` contrast that isolates the
    superordinate-framing effect from contact/novelty (`C1−C0`).
- **Collab Spotlight**, the intervention itself, in 5 steps: a superordinate-framed prompt → you
  contribute → it won't publish until a fan from the *other* fandom completes it → it co-publishes
  with both fandom flairs → you share it together.
- **Post yourself** — pick a fandom, post into the thread, or open a Collab directly.
- **Live metrics** mirroring the study's constructs: toxicity, we/they pronoun ratio, a common
  in-group identity (CIIM) proxy, and cross-fandom engagement.
  **What each meter means + how it maps to the real validated instruments → [`METRICS.md`](METRICS.md).**

## Two modes
- **Scripted (default):** works offline, zero setup — ideal for demos. This is the only mode the
  current K-pop prototype (`index.html`) supports.
- **Live LLM:** not implemented in the K-pop prototype. It exists only in the archived
  Lakers/Celtics demo below.

## Archived: the earlier Lakers/Celtics demo
Before the K-pop pivot, the prototype simulated an `r/NBA` Lakers-vs-Celtics rivalry with two LLM
peer agents modeling de-escalation, plus an optional **Live LLM** mode (a Cloudflare Worker proxy
holding an OpenAI key server-side). That demo is preserved at
[`legacy-lakers-celtics.html`](legacy-lakers-celtics.html); its proxy setup is in
[`worker/`](worker/). It is **not** part of Study 1's design — see [`PLAN.md`](PLAN.md) for why the
study moved to K-pop (a non-contested superordinate identity) and to the indirect Collab Spotlight
mechanism (no persuading/messaging agent).

## Run locally
Just open `index.html` in a browser, or:
```
python -m http.server 8000   # then visit http://localhost:8000
```

## Notes
- Toxicity here is a transparent keyword heuristic for *demonstration*; the real study uses
  Perspective API + a validated K-pop incivility lexicon + human incivility coding.
- All posts are scripted/simulated. AURORA and NOVA are fictional placeholder fandoms — not
  affiliated with any real artist, group, or fandom.
