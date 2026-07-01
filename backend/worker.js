// DefuseLab — Study 1 backend (Cloudflare Worker + D1).
//
// Handles the participant app + researcher dashboard:
//   POST /api/session/start        -> assign arm (balanced) + fandom flair, create a session
//   POST /api/event                -> log a behavioral event (pre-moderation text + toxicity/we-they)
//   POST /api/collab/contribute    -> submit a Collab contribution; match a waiting rival-fandom one
//   GET  /api/collab/status?id=     -> poll the pairing gate (live pair, or a DISCLOSED sample on timeout)
//   POST /api/session/end          -> close a session
//   GET  /api/dashboard/summary     -> per-arm aggregates          (Bearer RESEARCHER_TOKEN)
//   GET  /api/dashboard/sessions    -> raw sessions/events/collabs  (Bearer RESEARCHER_TOKEN)
//
// Blinding: the dashboard endpoints require the researcher token so participants never see analytics.
// Toxicity here is the same keyword heuristic as the demo meters; the real study rescoreson the
// stored pre-moderation text with Perspective API + the validated K-pop lexicon (see MEASURES.md).
//
// Deploy (no terminal): see backend/README.md.

const ALLOWED_ORIGINS = [
  "https://zeng-lingbo.github.io",
  "http://localhost:8000",
  "http://127.0.0.1:8000",
];
const ARMS = ["C0", "C1", "C2"];
const other = (f) => (f === "AUR" ? "NOV" : "AUR");

// Minimal server-side sample partner content for the DISCLOSED filler (no live partner online).
const SAMPLE = {
  C2: { kind: "super", text: "throwing in 'Supernova' — the choreo is what pulled me in", artifact: '🎵 "The songs that made us fall for K-pop"' },
  C1: { kind: "neutral", text: "ok fair, adding ramen + extra cheese", artifact: '🍜 "Comfort foods"' },
};

const TOX = ["clown", "clowns", "trash", "delusional", "delulu", "ratio", "idiot", "stupid",
  "talentless", "untalented", "garbage", "cope", "copium", "washed", "fraud", "overrated",
  "embarrassing", "pathetic", "cringe", "mid", "flop", "flopped", "nugu", "industry plant",
  "mass-report", "mass report", "brainrot", "shut up", "🤡", "💀"];
const WE = ["we", "us", "our", "ours", "we're", "weve", "both", "together"];
const THEY = ["they", "them", "their", "theirs", "they're", "u", "you", "your", "yall", "y'all"];
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
function toxicity(t) {
  const s = String(t).toLowerCase(); let hits = 0;
  TOX.forEach((w) => { if (s.includes(w)) hits++; });
  if (/[A-Z]{4,}/.test(String(t))) hits++;
  return clamp(hits / 3);
}
const countWords = (t, list) => String(t).toLowerCase().split(/[^a-z']+/).filter((x) => list.includes(x)).length;
function commonIdentity(weShare, kind, crossNorm) {
  const boost = kind === "super" ? 0.55 : kind === "neutral" ? 0.20 : 0;
  return clamp(0.05 + 0.25 * weShare + boost + 0.12 * clamp(crossNorm));
}

function corsHeaders(origin) {
  const allow = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type, authorization",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };
}
const json = (obj, status, origin) =>
  new Response(JSON.stringify(obj), { status, headers: { ...corsHeaders(origin), "content-type": "application/json" } });
const uid = (p) => p + "_" + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const url = new URL(request.url);
    const path = url.pathname;
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(origin) });

    const DB = env.DB;
    if (!DB) return json({ error: "no_d1_binding" }, 500, origin);

    try {
      // ---------------- participant endpoints ----------------
      if (path === "/api/session/start" && request.method === "POST") {
        const body = await request.json().catch(() => ({}));
        let arm = ARMS.includes(body.arm) ? body.arm : null;
        if (!arm) {
          const { n } = (await DB.prepare("SELECT COUNT(*) AS n FROM sessions").first()) || { n: 0 };
          arm = ARMS[n % 3];                                 // balanced round-robin
        }
        const flair = body.flair === "AUR" || body.flair === "NOV" ? body.flair : (Math.random() < 0.5 ? "AUR" : "NOV");
        const pid = uid("p"), sid = uid("sess"), now = Date.now();
        await DB.prepare("INSERT INTO participants (id,arm,flair,created_at) VALUES (?,?,?,?)").bind(pid, arm, flair, now).run();
        await DB.prepare("INSERT INTO sessions (id,participant_id,arm,flair,started_at) VALUES (?,?,?,?,?)").bind(sid, pid, arm, flair, now).run();
        return json({ sessionId: sid, arm, flair }, 200, origin);
      }

      if (path === "/api/event" && request.method === "POST") {
        const b = await request.json().catch(() => ({}));
        if (!b.sessionId) return json({ error: "no_session" }, 400, origin);
        const text = String(b.textRaw || "").slice(0, 2000);
        await DB.prepare(
          "INSERT INTO events (id,session_id,type,text_raw,toxicity,we,they,thread_id,created_at) VALUES (?,?,?,?,?,?,?,?,?)"
        ).bind(uid("ev"), b.sessionId, String(b.type || "post"), text, toxicity(text), countWords(text, WE), countWords(text, THEY), String(b.threadId || "seed"), Date.now()).run();
        return json({ ok: true }, 200, origin);
      }

      if (path === "/api/collab/contribute" && request.method === "POST") {
        const b = await request.json().catch(() => ({}));
        const sess = await DB.prepare("SELECT arm,flair FROM sessions WHERE id=?").bind(b.sessionId).first();
        if (!sess) return json({ error: "no_session" }, 400, origin);
        const text = String(b.text || "").slice(0, 500);
        const kind = sess.arm === "C2" ? "super" : "neutral";
        // try to match a waiting contribution from the OTHER fandom in the same arm
        const match = await DB.prepare(
          "SELECT * FROM collabs WHERE arm=? AND status='waiting' AND a_flair=? ORDER BY created_at ASC LIMIT 1"
        ).bind(sess.arm, other(sess.flair)).first();
        if (match) {
          await DB.prepare("UPDATE collabs SET b_flair=?, b_text=?, status='paired', is_live_paired=1, paired_at=? WHERE id=?")
            .bind(sess.flair, text, Date.now(), match.id).run();
          return json({ collabId: match.id, status: "paired", isLivePaired: true,
            partner: { flair: match.a_flair, text: match.a_text }, artifact: SAMPLE[sess.arm].artifact }, 200, origin);
        }
        const cid = uid("col");
        await DB.prepare(
          "INSERT INTO collabs (id,session_id,arm,kind,a_flair,a_text,status,is_live_paired,filler,artifact,created_at) VALUES (?,?,?,?,?,?, 'waiting',0,0,?,?)"
        ).bind(cid, b.sessionId, sess.arm, kind, sess.flair, text, SAMPLE[sess.arm].artifact, Date.now()).run();
        return json({ collabId: cid, status: "waiting" }, 200, origin);
      }

      if (path === "/api/collab/status" && request.method === "GET") {
        const id = url.searchParams.get("id");
        const col = await DB.prepare("SELECT * FROM collabs WHERE id=?").bind(id).first();
        if (!col) return json({ status: "unknown" }, 200, origin);
        const timeout = 15000;
        if (col.status === "waiting" && Date.now() - col.created_at > timeout) {
          // no live partner arrived -> DISCLOSED system-generated sample (PLAN.md §4.3)
          const s = SAMPLE[col.arm];
          await DB.prepare("UPDATE collabs SET status='filler', filler=1, b_flair=?, b_text=? WHERE id=?")
            .bind(other(col.a_flair), s.text, id).run();
          return json({ status: "filler", isLivePaired: false, filler: true,
            partner: { flair: other(col.a_flair), text: s.text }, artifact: col.artifact }, 200, origin);
        }
        return json({
          status: col.status,
          isLivePaired: !!col.is_live_paired, filler: !!col.filler,
          partner: col.b_text ? { flair: col.b_flair, text: col.b_text } : null,
          artifact: col.artifact,
        }, 200, origin);
      }

      if (path === "/api/session/end" && request.method === "POST") {
        const b = await request.json().catch(() => ({}));
        await DB.prepare("UPDATE sessions SET ended_at=? WHERE id=?").bind(Date.now(), b.sessionId).run();
        return json({ ok: true }, 200, origin);
      }

      // ---------------- researcher endpoints (auth) ----------------
      if (path.startsWith("/api/dashboard/")) {
        const auth = request.headers.get("Authorization") || "";
        const token = auth.replace(/^Bearer\s+/i, "");
        if (!env.RESEARCHER_TOKEN || token !== env.RESEARCHER_TOKEN) return json({ error: "unauthorized" }, 401, origin);

        if (path === "/api/dashboard/summary") {
          const byArm = {};
          ARMS.forEach((a) => (byArm[a] = { arm: a, sessions: 0, msgs: 0, toxSum: 0, we: 0, they: 0, cross: 0, livePaired: 0, filler: 0 }));
          const sc = await DB.prepare("SELECT arm, COUNT(*) n FROM sessions GROUP BY arm").all();
          (sc.results || []).forEach((r) => { if (byArm[r.arm]) byArm[r.arm].sessions = r.n; });
          const ec = await DB.prepare(
            "SELECT s.arm arm, COUNT(*) msgs, SUM(e.toxicity) toxSum, SUM(e.we) we, SUM(e.they) they FROM events e JOIN sessions s ON e.session_id=s.id WHERE e.type IN ('post','comment') GROUP BY s.arm"
          ).all();
          (ec.results || []).forEach((r) => { const b = byArm[r.arm]; if (b) { b.msgs = r.msgs; b.toxSum = r.toxSum || 0; b.we = r.we || 0; b.they = r.they || 0; } });
          const cc = await DB.prepare(
            "SELECT s.arm arm, COUNT(*) n FROM events e JOIN sessions s ON e.session_id=s.id WHERE e.type='cross' GROUP BY s.arm"
          ).all();
          (cc.results || []).forEach((r) => { if (byArm[r.arm]) byArm[r.arm].cross += r.n; });
          const col = await DB.prepare(
            "SELECT arm, SUM(is_live_paired) live, SUM(filler) fill, COUNT(*) n FROM collabs GROUP BY arm"
          ).all();
          (col.results || []).forEach((r) => { const b = byArm[r.arm]; if (b) { b.livePaired = r.live || 0; b.filler = r.fill || 0; b.cross += r.n || 0; } });
          ARMS.forEach((a) => {
            const b = byArm[a];
            b.toxRate = b.msgs ? b.toxSum / b.msgs : null;
            const tot = b.we + b.they; b.weShare = tot ? b.we / tot : null;
            const kind = a === "C2" ? "super" : a === "C1" ? "neutral" : null;
            b.ci = b.weShare == null ? null : commonIdentity(b.weShare, kind, b.cross / 6);
          });
          const { n: sessions } = (await DB.prepare("SELECT COUNT(*) n FROM sessions").first()) || { n: 0 };
          return json({ source: "backend", byArm, totals: { sessions } }, 200, origin);
        }

        if (path === "/api/dashboard/sessions") {
          const sessions = (await DB.prepare("SELECT * FROM sessions ORDER BY started_at DESC LIMIT 1000").all()).results || [];
          const events = (await DB.prepare("SELECT id,session_id,type,text_raw,toxicity,we,they,created_at FROM events ORDER BY created_at DESC LIMIT 5000").all()).results || [];
          const collabs = (await DB.prepare("SELECT * FROM collabs ORDER BY created_at DESC LIMIT 1000").all()).results || [];
          return json({ source: "backend", sessions, events, collabs }, 200, origin);
        }
      }

      return json({ error: "not_found", path }, 404, origin);
    } catch (e) {
      return json({ error: "server_error", detail: String(e && e.message || e) }, 500, origin);
    }
  },
};
