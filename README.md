# DefuseLab — Polarization Defusing prototype (Lakers vs. Celtics)

A **one-file, static** prototype of the simulated social-media platform for the
[Polarization Defusing study](https://github.com/ZENG-LingBo/polarization). Open the
GitHub Pages URL and it just runs — no install, no backend.

## ▶ Live demo
**https://zeng-lingbo.github.io/polarization-prototype/**

## What it shows
- A simulated `r/NBA` thread between **Lakers** and **Celtics** fans.
- **▶ Run scenario** plays the 3-phase intervention:
  1. **Echo chamber** — rival fans escalate; the hostility gauge climbs.
  2. **Cooperative task** — a shared superordinate goal is seeded (CIIM / Sherif).
  3. **Multi-agent modeling** — two peer agents take turns modeling de-escalation and
     “we’re all NBA fans,” and the temperature drops.
- **Post as a fan** yourself — agents reply with the structural, low-reactance moves
  (acknowledge-then-redirect, cooperative bid, dual-identity) instead of arguing.
- **Live metrics** mirroring `measures.md`: average toxicity (keyword heuristic),
  we/they pronoun ratio (LIWC-style), and cross-group engagement.
- **Toggles:** Agents ON/OFF (compare), **Reveal agents** (researcher view — agents are
  undisclosed by design), and **Live LLM**.

## Two modes
- **Scripted (default):** works offline, zero setup — ideal for demos.
- **Live LLM (optional, no key in the browser):** the prototype calls a **Cloudflare
  Worker proxy** that holds your **OpenAI key** as a server-side secret; the browser only
  sends the post text + team and gets back the agent reply (CIIM peer prompt lives
  server-side; falls back to scripted on error).
  → Deploy the proxy in **[`worker/`](worker/)** — **no terminal needed**, just paste the
  code into the Cloudflare dashboard and add the key as an encrypted variable. The key is
  **never** exposed to the browser or the public.

## Run locally
Just open `index.html` in a browser, or:
```
python -m http.server 8000   # then visit http://localhost:8000
```

## Notes
- Toxicity here is a transparent keyword heuristic for *demonstration*; the real study
  uses Perspective API + LIWC + human incivility coding.
- Agent posts are AI-generated/scripted. Not affiliated with the NBA, Lakers, or Celtics.
