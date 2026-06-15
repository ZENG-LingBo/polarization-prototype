# DefuseLab LLM proxy (Cloudflare Worker)

A small Worker that lets the prototype's **Live LLM** mode work **without exposing your
Anthropic key in the browser**. The key is an encrypted Worker **secret**; the browser
sends only the post text + team (+ a Turnstile token) and gets back `{ text }`.

Protection is **layered and optional** — the proxy works with none of it, and each layer
switches on only when you add its value:

| Layer | Enable by | Effect |
|---|---|---|
| Base proxy | `wrangler secret put ANTHROPIC_API_KEY` | key stays server-side |
| **Turnstile** (anti-bot) | `wrangler secret put TURNSTILE_SECRET` + set `TURNSTILE_SITEKEY` in `index.html` | blocks `curl`/bots — requires a real browser challenge |
| **Rate limit** (KV) | create KV namespace + uncomment binding in `wrangler.toml` | per-IP daily cap (`DAILY_CAP`, default 50) |

## 1. Base deploy (required)
```bash
cd worker
npm install -g wrangler        # or use npx wrangler ...
wrangler login
wrangler secret put ANTHROPIC_API_KEY    # paste sk-ant-...
wrangler deploy                           # prints https://defuselab-proxy.<sub>.workers.dev
```
Then set `PROXY_URL` in `../index.html` (top of the <script>) to that URL — done.
*(Send me the URL and I'll hardcode it for you.)*

## 2. Turnstile gate (recommended for a public URL)
1. Cloudflare dashboard → **Turnstile** → add a widget for your Pages domain
   (`zeng-lingbo.github.io`). You get a **Site key** (public) and a **Secret key**.
2. `wrangler secret put TURNSTILE_SECRET`  → paste the Secret key.
3. In `../index.html`, set `const TURNSTILE_SITEKEY = "<your site key>";`
4. Redeploy: `wrangler deploy`.
> Set **both** the secret and the site key, or **neither** — if only the secret is set,
> the client sends no token and every request is rejected.

## 3. Rate limit (optional, KV)
```bash
wrangler kv namespace create RL     # prints an id
```
Uncomment the `[[kv_namespaces]]` block in `wrangler.toml`, paste the `id`, optionally
change `DAILY_CAP`, then `wrangler deploy`.

## Notes
- **CORS allowlist:** edit `ALLOWED_ORIGINS` in `worker.js` if your Pages origin differs.
- The Worker already caps input length (500), `max_tokens` (120), and the model
  (allowlist), and owns the system prompt so the key can't be repurposed.

## Files
- `worker.js` — the proxy (+ Turnstile + KV rate-limit, both optional)
- `wrangler.toml` — config (no secrets)
