# DefuseLab LLM proxy (Cloudflare Worker)

A ~60-line Worker that lets the prototype's **Live LLM** mode work **without exposing your
Anthropic key in the browser**. The key is stored as an encrypted Worker **secret**; the
browser only ever sends the post text + team and gets back `{ text }`.

## Deploy (2 commands after login)

```bash
# from this worker/ folder
npm install -g wrangler            # or use: npx wrangler ...
wrangler login                     # opens browser, authorizes your Cloudflare account

wrangler secret put ANTHROPIC_API_KEY   # paste your sk-ant-... key when prompted
wrangler deploy                          # prints your URL
```

`wrangler deploy` prints something like:
```
https://defuselab-proxy.<your-subdomain>.workers.dev
```

## Hook it up
1. Open the live prototype → tick **Live LLM** → paste that Worker URL into **Proxy URL**.
2. (Optional) I can hardcode the URL into `index.html` so users don't have to paste it —
   just send me the URL.

## Security notes (important)
- **Key safety:** the key is a secret on Cloudflare's edge; it never reaches the browser.
- **CORS allowlist:** edit `ALLOWED_ORIGINS` in `worker.js` if your Pages origin differs
  (default allows `https://zeng-lingbo.github.io` + localhost).
- **Abuse:** CORS only stops browsers, not `curl`. Because the endpoint is public, anyone
  could call it and spend your credits. For anything beyond a demo, add one of:
  - Cloudflare **Rate Limiting** rule on the route (e.g., 20 req/min/IP),
  - Cloudflare **Turnstile** (captcha) verification in the Worker, or
  - a Workers **KV**-based daily budget cap.
- The Worker already caps input length (500 chars), `max_tokens` (120), and the model
  (allowlist), and owns the system prompt so your key can't be repurposed.

## Files
- `worker.js` — the proxy
- `wrangler.toml` — Wrangler config (no secrets in here)
