// DefuseLab — Cloudflare Worker proxy for the OpenAI API.
// The OpenAI key lives ONLY here, as a Worker secret (env.OPENAI_API_KEY).
// The browser sends just the post text + teams (+ a Turnstile token); the Worker owns
// the system prompt, so your key can't be used for arbitrary prompts.
//
// Layered protection — all OPTIONAL and graceful (the proxy works with none of them):
//   • env.TURNSTILE_SECRET set  -> requires a valid Cloudflare Turnstile token (blocks curl/bots)
//   • env.RL (KV) bound         -> per-IP daily cap (env.DAILY_CAP, default 50)
//
// Deploy (no terminal needed): see worker/README.md

const ALLOWED_ORIGINS = [
  "https://zeng-lingbo.github.io",
  "http://localhost:8000",
  "http://127.0.0.1:8000",
];
const MODELS = ["gpt-4o-mini", "gpt-4o", "gpt-4.1-mini", "gpt-4.1"];

function corsHeaders(origin) {
  const allow = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };
}
function json(obj, status, origin) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...corsHeaders(origin), "content-type": "application/json" },
  });
}

async function verifyTurnstile(token, secret, ip) {
  if (!token) return false;
  const form = new FormData();
  form.append("secret", secret);
  form.append("response", token);
  if (ip) form.append("remoteip", ip);
  try {
    const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST", body: form,
    });
    const d = await r.json();
    return !!d.success;
  } catch { return false; }
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const ip = request.headers.get("CF-Connecting-IP") || "anon";

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(origin) });
    if (request.method !== "POST") return json({ error: "POST only" }, 405, origin);

    let body;
    try { body = await request.json(); }
    catch { return json({ error: "bad json" }, 400, origin); }

    // --- (optional) Turnstile: blocks non-browser abuse ---
    if (env.TURNSTILE_SECRET) {
      const ok = await verifyTurnstile(body.turnstileToken || "", env.TURNSTILE_SECRET, ip);
      if (!ok) return json({ error: "turnstile_failed" }, 403, origin);
    }

    // --- (optional) per-IP daily rate limit via KV ---
    if (env.RL) {
      const day = new Date().toISOString().slice(0, 10);
      const key = `rl:${ip}:${day}`;
      const cap = parseInt(env.DAILY_CAP || "50", 10);
      const n = parseInt((await env.RL.get(key)) || "0", 10) + 1;
      if (n > cap) return json({ error: "rate_limited", detail: `daily cap ${cap}` }, 429, origin);
      await env.RL.put(key, String(n), { expirationTtl: 172800 });
    }

    const userText = String(body.userText || "").slice(0, 500);
    const userTeam = body.userTeam === "LAL" ? "Lakers" : "Celtics";
    const agentTeam = body.agentTeam === "LAL" ? "Lakers" : "Celtics";
    const model = MODELS.includes(body.model) ? body.model : "gpt-4o-mini";
    if (!userText) return json({ error: "empty userText" }, 400, origin);

    const system =
      `You are an ordinary, slightly opinionated NBA fan posting in a Lakers-vs-Celtics forum. ` +
      `You lean ${agentTeam}. Hidden goal: lower hostility WITHOUT sounding like a moderator, teacher, ` +
      `or AI, and WITHOUT arguing which team is better. Move the conversation toward a shared ` +
      `"we're all hoops fans" frame or a cooperative task, while still repping your team and keeping an ` +
      `edge. Never lecture, never validate an insult, never dump stats. 1-2 short, casual sentences, ` +
      `lowercase-ish, emojis ok.`;

    try {
      const r = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "authorization": `Bearer ${env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model,
          max_tokens: 120,
          temperature: 0.9,
          messages: [
            { role: "system", content: system },
            { role: "user", content: `A ${userTeam} fan just posted: "${userText}"\n\nWrite your reply as the next post in the thread.` },
          ],
        }),
      });
      if (!r.ok) {
        const detail = (await r.text()).slice(0, 300);
        return json({ error: "upstream", status: r.status, detail }, 502, origin);
      }
      const data = await r.json();
      const text = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content || "").trim();
      return json({ text }, 200, origin);
    } catch (e) {
      return json({ error: "proxy_failed", detail: String(e) }, 500, origin);
    }
  },
};
