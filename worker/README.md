# DefuseLab LLM proxy (Cloudflare Worker → OpenAI)

> Used by the **archived Lakers/Celtics demo** ([`../legacy-lakers-celtics.html`](../legacy-lakers-celtics.html)),
> not the current K-pop prototype (`../index.html`), which is fully scripted and has no Live LLM mode.

A small Worker that lets the legacy prototype's **Live LLM** mode work **without exposing your
OpenAI key in the browser**. The key is an encrypted Worker **secret**; the browser sends
only the post text + team (+ a Turnstile token) and gets back `{ text }`.

> You never paste your key into chat or share it with anyone — you enter it **yourself**
> in the Cloudflare dashboard, and the public never sees it.

## ✅ Easiest: deploy from the dashboard (no terminal)
1. **Cloudflare dashboard → Workers & Pages → Create → Workers → Create Worker.**
   Name it `defuselab-proxy`, click **Deploy** (creates a starter).
2. **Edit code →** delete the starter, **paste all of `worker.js`**, click **Deploy**.
3. **Settings → Variables and Secrets → Add:**
   - Name `OPENAI_API_KEY`, value = your `sk-...` key, choose **Encrypt** → **Deploy**.
4. Copy the Worker URL shown at the top — `https://defuselab-proxy.<your-subdomain>.workers.dev`.
5. **Send me that URL** and I'll hardcode it into the prototype (or paste it into the
   demo's *Proxy URL* field yourself). Done — live GPT agents, key hidden.

That's it for a working demo. The two layers below are optional hardening.

## Optional: Turnstile gate (stops bots/curl abusing the public URL)
1. Dashboard → **Turnstile** → add a widget for `zeng-lingbo.github.io`. You get a
   **Site key** (public) and **Secret key**.
2. Worker → Settings → Variables and Secrets → add `TURNSTILE_SECRET` = the Secret key
   (**Encrypt**) → Deploy.
3. In `../legacy-lakers-celtics.html`, set `const TURNSTILE_SITEKEY = "<your site key>";`
> Set **both** (secret + site key) or **neither** — secret-only rejects every request.

## Optional: per-IP daily cap (KV)
Dashboard → **Storage & Databases → KV → Create namespace** (any name). Then Worker →
Settings → **Bindings → Add → KV namespace**, variable name **`RL`**, select the namespace
→ Deploy. Adjust `DAILY_CAP` under **Variables** (default 50).

## Notes
- **CORS allowlist:** edit `ALLOWED_ORIGINS` in `worker.js` if your Pages origin differs.
- Models allowlisted: `gpt-4o-mini` (default), `gpt-4o`, `gpt-4.1-mini`, `gpt-4.1`.
- The Worker caps input (500 chars), `max_tokens` (120), and the model, and owns the
  system prompt, so the key can't be repurposed.
- Prefer the CLI? `wrangler secret put OPENAI_API_KEY && wrangler deploy` works too.

## Files
- `worker.js` — the proxy (OpenAI + optional Turnstile + KV rate-limit)
- `wrangler.toml` — config (no secrets)
