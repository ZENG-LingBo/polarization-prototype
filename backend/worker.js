// DefuseLab — Study 1 backend, protocol v3 (Cloudflare Worker + D1).
//
// 2 arms (EXPT = Community Note · CTRL = inert poll) × 3 days, run as COHORT group
// sessions. Each cohort×arm is a shared live feed (same-cohort/same-arm participants see
// each other's posts via polling). Participants get a REJOIN CODE on Day 1 that links
// them across Days 2–3.
//
//   POST /api/session/start        {cohort, flair?, rejoin?}    -> join/rejoin a cohort
//   GET  /api/feed?sessionId&since                              -> shared feed (cohort+arm)
//   POST /api/event                {sessionId,type,textRaw,threadId} -> log + publish
//   POST /api/collab/contribute    {sessionId,text}             -> Community Note (EXPT day 2)
//   GET  /api/collab/status?id                                  -> pairing gate poll
//   POST /api/poll/vote            {sessionId,option}           -> inert poll (CTRL day 2)
//   GET  /api/poll/results?sessionId                            -> poll counts
//   GET  /api/survey-link?sessionId                             -> end-of-day survey URL
//   POST /api/session/end          {sessionId}
//   -- researcher (Bearer RESEARCHER_TOKEN) --
//   POST /api/dashboard/cohort       {code,label,language}      -> create cohort
//   POST /api/dashboard/cohort/day   {code,day}                 -> advance day (re-seeds prompts)
//   POST /api/dashboard/cohort/close {code}
//   GET  /api/dashboard/summary                                 -> arm×day aggregates + R1-R3
//   GET  /api/dashboard/sessions                                -> raw export
//
// Blinding: participant endpoints never mention arms/purpose; analytics are token-gated.
// Toxicity is the demo keyword heuristic; text_raw (pre-moderation) is stored so the real
// study rescores with Perspective API + the validated K-pop lexicon (MEASURES.md).
// Vars/secrets: DB (D1 binding), RESEARCHER_TOKEN (secret), SURVEY_URL_D1..D3 (+_ZH) vars,
// LLM_API_KEY (secret, optional — enables LLM note merge), LLM_MODEL + LLM_BASE_URL vars.
//
// Deploy (no terminal): see backend/README.md.

const ALLOWED_ORIGINS = [
  "https://zeng-lingbo.github.io",
  "http://localhost:8000",
  "http://127.0.0.1:8000",
];
const ARMS = ["EXPT", "CTRL"];
const other = (f) => (f === "ARMY" ? "BLINK" : "ARMY");

// ---- Community Note config (EXPT day 2). Pre-screened template; when the optional
// LLM_API_KEY secret is set, paired halves are merged by the LLM (see llmMerge below),
// otherwise (or on any LLM failure) the verbatim mechanical assembly is published.
const NOTE = {
  en: {
    prompt: "Community Note — today's playlist: add the song that made YOU fall for K-pop. Publishes once one ARMY and one BLINK have both added one.",
    artifact: '🎵 Community Playlist — "the songs that made us fall for K-pop"',
    fillerText: "adding 'As If It's Your Last' — the energy pulled me in",
  },
  zh: {
    prompt: "社区共创 — 今日歌单：添加那首让你爱上K-pop的歌。需要一位ARMY和一位BLINK各添加一首后发布。",
    artifact: '🎵 社区歌单 — "让我们爱上K-pop的歌"',
    fillerText: "加一首《As If It's Your Last》——是那种能量吸引了我",
  },
};
// ---- Inert daily poll (CTRL day 2). Solo, no pairing, no shared output.
const POLL = {
  en: { prompt: "Daily vibe check — how are we feeling today?", options: ["😤 hyped", "😐 meh", "🫠 tired", "🎧 locked in"] },
  zh: { prompt: "今日心情打卡 — 你今天感觉如何？", options: ["😤 兴奋", "😐 一般", "🫠 很累", "🎧 沉浸中"] },
};
// ---- Day seed prompts (discussion-provoking posts inserted for BOTH arms when a day
// opens). Anonymized/paraphrased fan-war register; group-vs-group only (ethics: PLAN §12).
// NOTE for the real run: replace Day-1 seeds with the team's finalized prompts.
const SEEDS = {
  en: {
    1: [
      { flair: "ARMY", author: "seed_mod_a", text: "BTS is the defining group of this generation, it's genuinely not close 🏆 discuss." },
      { flair: "BLINK", author: "seed_mod_b", text: "BLACKPINK outsold and outperformed — the numbers don't lie. change my mind." },
    ],
    2: [{ flair: "SYS", author: "kpop_mod", text: "New day, same energy — what's everyone's take today?" }],
    3: [{ flair: "SYS", author: "kpop_mod", text: "Final day — biggest hot take of the week?" }],
  },
  zh: {
    1: [
      { flair: "ARMY", author: "seed_mod_a", text: "BTS就是这一代的代表团体，真的没有悬念 🏆 来讨论。" },
      { flair: "BLINK", author: "seed_mod_b", text: "BLACKPINK销量和舞台都更强——数据不会说谎。来反驳我。" },
    ],
    2: [{ flair: "SYS", author: "kpop_mod", text: "新的一天，继续聊——今天大家怎么看？" }],
    3: [{ flair: "SYS", author: "kpop_mod", text: "最后一天——本周最敢说的观点是什么？" }],
  },
};

const TOX = ["clown", "clowns", "trash", "delusional", "delulu", "ratio", "idiot", "stupid",
  "talentless", "untalented", "garbage", "cope", "copium", "washed", "fraud", "overrated",
  "embarrassing", "pathetic", "cringe", "mid", "flop", "flopped", "nugu", "industry plant",
  "mass-report", "mass report", "brainrot", "shut up", "🤡", "💀"];
// Chinese fan-war snark/insults, substring-matched (CJK has no word boundaries). Like the
// EN list this is a crude live-gate heuristic — real scoring happens post-hoc on text_raw.
const TOX_ZH = ["呵呵", "也配", "也算", "就这", "糊了", "糊咖", "过气", "拉胯", "尬黑", "黑子",
  "脑残", "白痴", "智障", "有病", "恶心", "垃圾", "闭嘴", "滚吧", "滚开", "笑死", "碰瓷",
  "蹭热度", "柠檬精", "装什么", "洗白", "不能看", "打不过", "眼瞎", "下头"];
const WE = ["we", "us", "our", "ours", "we're", "weve", "both", "together"];
const THEY = ["they", "them", "their", "theirs", "they're", "u", "you", "your", "yall", "y'all"];
const WE_ZH = ["我们", "咱们", "一起", "大家"];
const THEY_ZH = ["他们", "她们", "你们", "那边", "对家", "你家"];
const countZh = (t, list) => list.reduce((n, w) => n + (String(t).split(w).length - 1), 0);
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
// ---- LLM note merge. OpenAI-compatible endpoint (Qwen/DashScope by default). The key
// lives ONLY in the LLM_API_KEY secret — never in code or [vars]. Any failure (no key,
// timeout, bad response) returns null and the caller falls back to mechanical assembly.
async function llmMerge(env, lang, a, b) {
  if (!env.LLM_API_KEY) return null;
  const base = (env.LLM_BASE_URL || "https://dashscope-intl.aliyuncs.com/compatible-mode/v1").replace(/\/$/, "");
  const sys = lang === "zh"
    ? "你是K-pop粉丝社区的共创笔记助手。把来自两个不同粉丝团成员的两条贡献合并成一条温暖、简短的社区笔记（不超过60字）。保留双方原意，不新增事实或名字，只输出合并后的笔记正文。"
    : "You merge two K-pop fans' contributions into ONE short, warm community note (max 50 words). Keep the spirit of both contributions, invent no new facts or names, and output ONLY the merged note text.";
  try {
    const r = await fetch(base + "/chat/completions", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: "Bearer " + env.LLM_API_KEY },
      body: JSON.stringify({
        model: env.LLM_MODEL || "qwen-plus",
        messages: [
          { role: "system", content: sys },
          { role: "user", content: `${a.flair} fan (${a.handle}): "${a.text}"\n${b.flair} fan (${b.handle}): "${b.text}"` },
        ],
        max_tokens: 200, temperature: 0.4,
      }),
      signal: AbortSignal.timeout(12000),
    });
    if (!r.ok) return null;
    const j = await r.json();
    const t = (j.choices?.[0]?.message?.content || "").trim().replace(/^["“]+|["”]+$/g, "");
    return t ? t.slice(0, 400) : null;
  } catch { return null; }
}

function toxicity(t) {
  const s = String(t).toLowerCase(); let hits = 0;
  TOX.forEach((w) => { if (s.includes(w)) hits++; });
  TOX_ZH.forEach((w) => { if (s.includes(w)) hits++; });
  if (/[A-Z]{4,}/.test(String(t))) hits++;
  return clamp(hits / 3);
}
const countWords = (t, list) => String(t).toLowerCase().split(/[^a-z']+/).filter((x) => list.includes(x)).length
  + countZh(t, list === WE ? WE_ZH : list === THEY ? THEY_ZH : []);

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
const rejoinCode = () => Math.random().toString(36).slice(2, 8).toUpperCase();
const mkHandle = (flair) => (flair === "ARMY" ? "army" : "blink") + "_" + Math.random().toString(36).slice(2, 6);

// Constant-time-ish token compare (avoid early-exit string !==).
function safeEqual(a, b) {
  const A = String(a || ""), B = String(b || "");
  if (A.length !== B.length) return false;
  let diff = 0;
  for (let i = 0; i < A.length; i++) diff |= A.charCodeAt(i) ^ B.charCodeAt(i);
  return diff === 0;
}

async function getSession(DB, sid) {
  if (!sid) return null;
  return await DB.prepare(
    `SELECT s.*, c.language, c.day AS cohort_day, c.status AS cohort_status, p.handle, p.rejoin_code
     FROM sessions s JOIN cohorts c ON s.cohort_id=c.id JOIN participants p ON s.participant_id=p.id
     WHERE s.id=?`).bind(sid).first();
}

async function insertEvent(DB, sess, type, text, threadId, authorOverride, flairOverride) {
  const t = String(text || "").slice(0, 2000);
  await DB.prepare(
    `INSERT INTO events (id,session_id,cohort_id,day,arm,flair,author,type,text_raw,toxicity,we,they,thread_id,created_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
  ).bind(uid("ev"), sess.id || null, sess.cohort_id, sess.cohort_day || sess.day, sess.arm,
    flairOverride || sess.flair, authorOverride || sess.handle, type, t,
    toxicity(t), countWords(t, WE), countWords(t, THEY), String(threadId || "seed"), Date.now()).run();
}

async function seedDay(DB, cohort, day) {
  const lang = cohort.language === "zh" ? "zh" : "en";
  const seeds = (SEEDS[lang] || SEEDS.en)[day] || [];
  for (const arm of ARMS) {
    for (const s of seeds) {
      await DB.prepare(
        `INSERT INTO events (id,session_id,cohort_id,day,arm,flair,author,type,text_raw,toxicity,we,they,thread_id,created_at)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
      ).bind(uid("ev"), null, cohort.id, day, arm, s.flair, s.author, "post", s.text,
        toxicity(s.text), countWords(s.text, WE), countWords(s.text, THEY), "seed", Date.now()).run();
    }
  }
}

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
        const b = await request.json().catch(() => ({}));
        const code = String(b.cohort || "").trim().toUpperCase();
        const cohort = await DB.prepare("SELECT * FROM cohorts WHERE id=?").bind(code).first();
        if (!cohort) return json({ error: "no_cohort" }, 404, origin);
        if (cohort.status !== "open") return json({ error: "cohort_closed" }, 403, origin);

        let part = null;
        if (b.rejoin) {
          part = await DB.prepare("SELECT * FROM participants WHERE cohort_id=? AND rejoin_code=?")
            .bind(code, String(b.rejoin).trim().toUpperCase()).first();
          if (!part) return json({ error: "bad_rejoin" }, 404, origin);
        }
        if (!part) {
          // Fandom is collected in the pre-selection form and carried by the personalized
          // invite link (?flair=). Never fabricate it — refuse if absent (PLAN.md §17).
          const flair = b.flair === "ARMY" || b.flair === "BLINK" ? b.flair : null;
          if (!flair) return json({ error: "no_flair" }, 400, origin);
          // balanced arm within cohort
          const { n } = (await DB.prepare("SELECT COUNT(*) n FROM participants WHERE cohort_id=?").bind(code).first()) || { n: 0 };
          const arm = ARMS[n % 2];
          part = { id: uid("p"), cohort_id: code, rejoin_code: rejoinCode(), handle: mkHandle(flair), arm, flair, created_at: Date.now() };
          await DB.prepare("INSERT INTO participants (id,cohort_id,rejoin_code,handle,arm,flair,created_at) VALUES (?,?,?,?,?,?,?)")
            .bind(part.id, part.cohort_id, part.rejoin_code, part.handle, part.arm, part.flair, part.created_at).run();
        }
        const sid = uid("sess");
        await DB.prepare("INSERT INTO sessions (id,participant_id,cohort_id,day,arm,flair,started_at) VALUES (?,?,?,?,?,?,?)")
          .bind(sid, part.id, code, cohort.day, part.arm, part.flair, Date.now()).run();
        const lang = cohort.language === "zh" ? "zh" : "en";
        return json({
          sessionId: sid, participantId: part.id, rejoinCode: part.rejoin_code, handle: part.handle,
          arm: part.arm, flair: part.flair, day: cohort.day, language: lang, cohortLabel: cohort.label || code,
          note: part.arm === "EXPT" && cohort.day === 2 ? NOTE[lang] : null,
          poll: part.arm === "CTRL" && cohort.day === 2 ? POLL[lang] : null,
        }, 200, origin);
      }

      if (path === "/api/feed" && request.method === "GET") {
        const sess = await getSession(DB, url.searchParams.get("sessionId"));
        if (!sess) return json({ error: "no_session" }, 400, origin);
        const since = Number(url.searchParams.get("since") || 0);
        const rows = (await DB.prepare(
          `SELECT id,session_id,flair,author,type,text_raw,thread_id,created_at FROM events
           WHERE cohort_id=? AND arm=? AND day=? AND created_at>? AND type IN ('post','comment','note_published')
           ORDER BY created_at ASC LIMIT 200`
        ).bind(sess.cohort_id, sess.arm, sess.cohort_day, since).all()).results || [];
        return json({ day: sess.cohort_day, posts: rows }, 200, origin);
      }

      if (path === "/api/event" && request.method === "POST") {
        const b = await request.json().catch(() => ({}));
        const sess = await getSession(DB, b.sessionId);
        if (!sess) return json({ error: "no_session" }, 400, origin);
        const type = ["post", "comment", "like", "share", "cross"].includes(b.type) ? b.type : "post";
        await insertEvent(DB, sess, type, b.textRaw, b.threadId);
        return json({ ok: true }, 200, origin);
      }

      if (path === "/api/collab/contribute" && request.method === "POST") {
        const b = await request.json().catch(() => ({}));
        const sess = await getSession(DB, b.sessionId);
        if (!sess) return json({ error: "no_session" }, 400, origin);
        if (sess.arm !== "EXPT" || sess.cohort_day !== 2) return json({ error: "not_available" }, 403, origin);
        const lang = sess.language === "zh" ? "zh" : "en";
        const text = String(b.text || "").slice(0, 500);
        const match = await DB.prepare(
          "SELECT * FROM collabs WHERE cohort_id=? AND arm='EXPT' AND status='waiting' AND a_flair=? ORDER BY created_at ASC LIMIT 1"
        ).bind(sess.cohort_id, other(sess.flair)).first();
        if (match) {
          // publish the co-authored note into the shared EXPT feed: LLM-merged when the
          // LLM_API_KEY secret is configured, verbatim assembly otherwise / on failure
          const merged = await llmMerge(env, lang,
            { flair: match.a_flair, handle: match.a_handle, text: match.a_text },
            { flair: sess.flair, handle: sess.handle, text });
          const artifactLine = merged
            ? `${NOTE[lang].artifact} — ${merged} (co-written by ${match.a_handle} · ${match.a_flair} × ${sess.handle} · ${sess.flair} · AI-merged)`
            : `${NOTE[lang].artifact} — "${match.a_text}" (${match.a_handle} · ${match.a_flair}) × "${text}" (${sess.handle} · ${sess.flair})`;
          await DB.prepare("UPDATE collabs SET b_flair=?, b_text=?, b_handle=?, status='paired', is_live_paired=1, paired_at=?, artifact=? WHERE id=?")
            .bind(sess.flair, text, sess.handle, Date.now(), artifactLine, match.id).run();
          await insertEvent(DB, sess, "note_published", artifactLine, "note", "kpop_mod", "SYS");
          return json({ collabId: match.id, status: "paired", isLivePaired: true, aiMerged: !!merged,
            partner: { flair: match.a_flair, text: match.a_text, handle: match.a_handle },
            artifact: NOTE[lang].artifact }, 200, origin);
        }
        const cid = uid("col");
        await DB.prepare(
          "INSERT INTO collabs (id,session_id,cohort_id,day,arm,a_flair,a_text,a_handle,status,is_live_paired,filler,artifact,created_at) VALUES (?,?,?,?,?,?,?,?,'waiting',0,0,?,?)"
        ).bind(cid, sess.id, sess.cohort_id, sess.cohort_day, "EXPT", sess.flair, text, sess.handle, NOTE[lang].artifact, Date.now()).run();
        return json({ collabId: cid, status: "waiting" }, 200, origin);
      }

      if (path === "/api/collab/status" && request.method === "GET") {
        const id = url.searchParams.get("id");
        const col = await DB.prepare("SELECT * FROM collabs WHERE id=?").bind(id).first();
        if (!col) return json({ status: "unknown" }, 200, origin);
        const timeoutMs = Number(env.PAIRING_TIMEOUT_MS || 90000); // group sessions: wait longer before filler
        if (col.status === "waiting" && Date.now() - col.created_at > timeoutMs) {
          const cohort = await DB.prepare("SELECT language FROM cohorts WHERE id=?").bind(col.cohort_id).first();
          const lang = cohort && cohort.language === "zh" ? "zh" : "en";
          await DB.prepare("UPDATE collabs SET status='filler', filler=1, b_flair=?, b_text=?, b_handle='system_sample' WHERE id=?")
            .bind(other(col.a_flair), NOTE[lang].fillerText, id).run();
          return json({ status: "filler", isLivePaired: false, filler: true,
            partner: { flair: other(col.a_flair), text: NOTE[lang].fillerText, handle: "system_sample" },
            artifact: col.artifact }, 200, origin);
        }
        return json({
          status: col.status, isLivePaired: !!col.is_live_paired, filler: !!col.filler,
          partner: col.b_text ? { flair: col.b_flair, text: col.b_text, handle: col.b_handle } : null,
          artifact: col.artifact,
        }, 200, origin);
      }

      if (path === "/api/poll/vote" && request.method === "POST") {
        const b = await request.json().catch(() => ({}));
        const sess = await getSession(DB, b.sessionId);
        if (!sess) return json({ error: "no_session" }, 400, origin);
        if (sess.arm !== "CTRL" || sess.cohort_day !== 2) return json({ error: "not_available" }, 403, origin);
        await DB.prepare("INSERT INTO poll_votes (id,session_id,cohort_id,day,option_idx,created_at) VALUES (?,?,?,?,?,?)")
          .bind(uid("pv"), sess.id, sess.cohort_id, sess.cohort_day, Number(b.option) || 0, Date.now()).run();
        await insertEvent(DB, sess, "cross", "poll_vote:" + b.option, "poll"); // engagement log only (type not in feed)
        return json({ ok: true }, 200, origin);
      }

      if (path === "/api/poll/results" && request.method === "GET") {
        const sess = await getSession(DB, url.searchParams.get("sessionId"));
        if (!sess) return json({ error: "no_session" }, 400, origin);
        const rows = (await DB.prepare(
          "SELECT option_idx, COUNT(*) n FROM poll_votes WHERE cohort_id=? AND day=? GROUP BY option_idx"
        ).bind(sess.cohort_id, sess.cohort_day).all()).results || [];
        const lang = sess.language === "zh" ? "zh" : "en";
        const counts = POLL[lang].options.map((_, i) => (rows.find((r) => r.option_idx === i) || {}).n || 0);
        return json({ counts }, 200, origin);
      }

      if (path === "/api/survey-link" && request.method === "GET") {
        const sess = await getSession(DB, url.searchParams.get("sessionId"));
        if (!sess) return json({ error: "no_session" }, 400, origin);
        const day = sess.cohort_day, lang = sess.language === "zh" ? "zh" : "en";
        const base = (lang === "zh" && env["SURVEY_URL_D" + day + "_ZH"]) || env["SURVEY_URL_D" + day] || "";
        if (!base) return json({ url: null }, 200, origin);
        const u = new URL(base);
        u.searchParams.set("pid", sess.participant_id);
        u.searchParams.set("day", String(day));
        u.searchParams.set("arm", sess.arm);
        u.searchParams.set("lang", lang);
        u.searchParams.set("cohort", sess.cohort_id);
        await insertEvent(DB, sess, "survey_opened", "day" + day, "survey");
        return json({ url: u.toString() }, 200, origin);
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
        if (!env.RESEARCHER_TOKEN || !safeEqual(token, env.RESEARCHER_TOKEN)) return json({ error: "unauthorized" }, 401, origin);

        if (path === "/api/dashboard/cohort" && request.method === "POST") {
          const b = await request.json().catch(() => ({}));
          const code = String(b.code || "").trim().toUpperCase();
          if (!/^[A-Z0-9]{3,12}$/.test(code)) return json({ error: "bad_code" }, 400, origin);
          const lang = b.language === "zh" ? "zh" : "en";
          const cohort = { id: code, label: String(b.label || code).slice(0, 60), language: lang, day: 1, status: "open", created_at: Date.now() };
          await DB.prepare("INSERT INTO cohorts (id,label,language,day,status,created_at) VALUES (?,?,?,?,?,?)")
            .bind(cohort.id, cohort.label, cohort.language, 1, "open", cohort.created_at).run();
          await seedDay(DB, cohort, 1);
          return json({ ok: true, cohort }, 200, origin);
        }
        if (path === "/api/dashboard/cohort/day" && request.method === "POST") {
          const b = await request.json().catch(() => ({}));
          const code = String(b.code || "").trim().toUpperCase();
          const day = Math.min(3, Math.max(1, Number(b.day) || 1));
          const cohort = await DB.prepare("SELECT * FROM cohorts WHERE id=?").bind(code).first();
          if (!cohort) return json({ error: "no_cohort" }, 404, origin);
          await DB.prepare("UPDATE cohorts SET day=? WHERE id=?").bind(day, code).run();
          if (day !== cohort.day) await seedDay(DB, { ...cohort, day }, day);
          return json({ ok: true, code, day }, 200, origin);
        }
        if (path === "/api/dashboard/cohort/close" && request.method === "POST") {
          const b = await request.json().catch(() => ({}));
          await DB.prepare("UPDATE cohorts SET status='closed' WHERE id=?").bind(String(b.code || "").toUpperCase()).run();
          return json({ ok: true }, 200, origin);
        }

        if (path === "/api/dashboard/summary") {
          const cohorts = (await DB.prepare("SELECT * FROM cohorts ORDER BY created_at DESC").all()).results || [];
          const cell = () => ({ sessions: 0, msgs: 0, toxSum: 0, we: 0, they: 0, cross: 0, livePaired: 0, filler: 0, pollVotes: 0 });
          const byArmDay = { EXPT: { 1: cell(), 2: cell(), 3: cell() }, CTRL: { 1: cell(), 2: cell(), 3: cell() } };
          const get = (a, d) => (byArmDay[a] && byArmDay[a][d]) || null;

          const sc = (await DB.prepare("SELECT arm, day, COUNT(*) n FROM sessions GROUP BY arm, day").all()).results || [];
          sc.forEach((r) => { const c = get(r.arm, r.day); if (c) c.sessions = r.n; });
          const ec = (await DB.prepare(
            "SELECT arm, day, COUNT(*) msgs, SUM(toxicity) toxSum, SUM(we) we, SUM(they) they FROM events WHERE type IN ('post','comment') AND session_id IS NOT NULL GROUP BY arm, day"
          ).all()).results || [];
          ec.forEach((r) => { const c = get(r.arm, r.day); if (c) { c.msgs = r.msgs; c.toxSum = r.toxSum || 0; c.we = r.we || 0; c.they = r.they || 0; } });
          const cc = (await DB.prepare("SELECT arm, day, COUNT(*) n FROM events WHERE type='cross' GROUP BY arm, day").all()).results || [];
          cc.forEach((r) => { const c = get(r.arm, r.day); if (c) c.cross = r.n; });
          const col = (await DB.prepare("SELECT day, SUM(is_live_paired) live, SUM(filler) fill FROM collabs GROUP BY day").all()).results || [];
          col.forEach((r) => { const c = get("EXPT", r.day); if (c) { c.livePaired = r.live || 0; c.filler = r.fill || 0; } });
          const pv = (await DB.prepare("SELECT day, COUNT(*) n FROM poll_votes GROUP BY day").all()).results || [];
          pv.forEach((r) => { const c = get("CTRL", r.day); if (c) c.pollVotes = r.n; });

          for (const a of ARMS) for (const d of [1, 2, 3]) {
            const c = byArmDay[a][d];
            c.toxRate = c.msgs ? c.toxSum / c.msgs : null;
            const tot = c.we + c.they; c.weShare = tot ? c.we / tot : null;
          }
          // R1–R3 requirement checks (same thresholds as the demo: high ≥.55 · stay ≥.50 · drop ≤.35)
          const t = (a, d) => byArmDay[a][d].toxRate;
          const R1 = t("EXPT", 1) == null || t("CTRL", 1) == null ? null : (t("EXPT", 1) >= 0.55 && t("CTRL", 1) >= 0.55);
          const R2 = t("CTRL", 2) == null ? null : t("CTRL", 2) >= 0.5;
          const R3 = t("EXPT", 2) == null || t("CTRL", 2) == null ? null : (t("EXPT", 2) <= 0.35 && t("CTRL", 2) >= 0.5);
          const { n: sessions } = (await DB.prepare("SELECT COUNT(*) n FROM sessions").first()) || { n: 0 };
          return json({ source: "backend", version: "v3", cohorts, byArmDay, checks: { R1, R2, R3 }, totals: { sessions } }, 200, origin);
        }

        if (path === "/api/dashboard/sessions") {
          const sessions = (await DB.prepare("SELECT * FROM sessions ORDER BY started_at DESC LIMIT 1000").all()).results || [];
          const events = (await DB.prepare("SELECT id,session_id,cohort_id,day,arm,flair,author,type,text_raw,toxicity,we,they,thread_id,created_at FROM events ORDER BY created_at DESC LIMIT 5000").all()).results || [];
          const collabs = (await DB.prepare("SELECT * FROM collabs ORDER BY created_at DESC LIMIT 1000").all()).results || [];
          const participants = (await DB.prepare("SELECT id,cohort_id,handle,arm,flair,created_at FROM participants LIMIT 2000").all()).results || [];
          return json({ source: "backend", version: "v3", sessions, events, collabs, participants }, 200, origin);
        }
      }

      return json({ error: "not_found", path }, 404, origin);
    } catch (e) {
      return json({ error: "server_error", detail: String(e && e.message || e) }, 500, origin);
    }
  },
};
