// DefuseLab — Study 1 backend, protocol v3 (Cloudflare Worker + D1).
//
// 2 arms (EXPT = Community Note · CTRL = inert poll) × 2 days, run as COHORT group
// sessions. Each cohort×arm is a shared live feed (same-cohort/same-arm participants see
// each other's posts via polling). Participants get a REJOIN CODE on Day 1 that links
// them to Day 2. Day 1 carries the manipulation (free discussion -> Survey 1 -> task block
// -> micro-check); Day 2 is free discussion + Survey 2 and tests whether the change persists.
//
//   POST /api/session/start        {cohort, flair?, rejoin?}    -> join/rejoin a cohort
//   GET  /api/feed?sessionId&since                              -> shared feed (cohort+arm)
//   POST /api/event                {sessionId,type,textRaw,threadId} -> log + publish
//   POST /api/collab/contribute    {sessionId,text}             -> Community Note (EXPT, task phase)
//   GET  /api/collab/status?id                                  -> pairing gate poll
//   POST /api/poll/vote            {sessionId,option}           -> inert poll (CTRL, task phase)
//   GET  /api/poll/results?sessionId                            -> poll counts
//   GET  /api/survey-link?sessionId                             -> end-of-day survey URL
//   POST /api/session/end          {sessionId}
//   -- researcher (Bearer RESEARCHER_TOKEN) --
//   POST /api/dashboard/cohort       {code,label,language}      -> create cohort
//   POST /api/survey/submit        {sessionId,instrument,answers} -> store one instrument
//   POST /api/dashboard/cohort/day   {code,day}                 -> advance day (re-seeds prompts)
//   POST /api/dashboard/cohort/phase {code,phase}               -> free|survey1|task|microcheck|survey2|done
//   POST /api/dashboard/cohort/close {code}
//   GET  /api/dashboard/summary                                 -> arm×day + arm×phase aggregates + G1-G3
//   GET  /api/dashboard/sessions                                -> raw export
//
// Blinding: participant endpoints never mention arms/purpose; analytics are token-gated.
// Toxicity is the demo keyword heuristic; text_raw (pre-moderation) is stored so the real
// study rescores with Perspective API + the validated K-pop lexicon (MEASURES.md).
// Vars/secrets: DB (D1 binding), RESEARCHER_TOKEN (secret), SURVEY_URL_D1..D2 (+_ZH) vars,
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

// ---- Community Note config (EXPT, task phase). Pre-screened template; when the optional
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
// ---- Inert daily poll (CTRL, task phase). Solo, no pairing, no shared output.
const POLL = {
  en: { prompt: "Daily vibe check — how are we feeling today?", options: ["😤 hyped", "😐 meh", "🫠 tired", "🎧 locked in"] },
  zh: { prompt: "今日心情打卡 — 你今天感觉如何？", options: ["😤 兴奋", "😐 一般", "🫠 很累", "🎧 沉浸中"] },
};
// ---- Day seed prompts (discussion-provoking posts inserted for BOTH arms when a day
// opens). Anonymized/paraphrased fan-war register; group-vs-group only (ethics: PLAN §12).
//
// INTENSITY MUST BE MATCHED ACROSS DAYS. Earlier drafts paired two rival provocations on
// Day 1 with a mild neutral prompt on Days 2-3 — that alone lowers toxicity on Day 2 in
// BOTH arms, confounding the day effect with the stimulus and putting the "control stays
// high" go/no-go check (PLAN §17) at risk for reasons unrelated to the intervention. Every
// day therefore carries the same structure: one ARMY-flair and one BLINK-flair comparative
// superiority claim inviting rebuttal.
// NOTE for the real run: replace all three sets with the team's finalized prompts, keeping
// them matched in intensity, and pre-register which set lands on which day.
const SEEDS = {
  en: {
    1: [
      { flair: "ARMY", author: "seed_mod_a", text: "BTS is the defining group of this generation, it's genuinely not close 🏆 discuss." },
      { flair: "BLINK", author: "seed_mod_b", text: "BLACKPINK outsold and outperformed — the numbers don't lie. change my mind." },
    ],
    2: [
      { flair: "ARMY", author: "seed_mod_c", text: "Say what you want about hype — BTS filled stadiums on their own name. Marketing can't fake that 🏟️" },
      { flair: "BLINK", author: "seed_mod_d", text: "BLACKPINK got into rooms nobody else did. Global reach isn't a fandom talking point, it's the record 🌍" },
    ],
  },
  zh: {
    1: [
      { flair: "ARMY", author: "seed_mod_a", text: "BTS就是这一代的代表团体，真的没有悬念 🏆 来讨论。" },
      { flair: "BLINK", author: "seed_mod_b", text: "BLACKPINK销量和舞台都更强——数据不会说谎。来反驳我。" },
    ],
    2: [
      { flair: "ARMY", author: "seed_mod_c", text: "随便你们怎么说流量——BTS是靠自己的名字把体育场填满的，营销做不出这个 🏟️" },
      { flair: "BLINK", author: "seed_mod_d", text: "BLACKPINK进的是别人进不去的场合，全球影响力不是粉丝话术，是纪录 🌍" },
    ],
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
  // The merge IS the manipulation (PLAN §4.3), so it is configuration rather than a side
  // effect of whether a secret happens to be set. NOTE_MERGE_MODE=verbatim runs the
  // mechanical assembly instead; either way collabs.ai_merged records what was published.
  if ((env.NOTE_MERGE_MODE || "llm") === "verbatim") return null;
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

// Rates one message's toxicity 0-100 via the LLM; null on any failure. Used live via
// ctx.waitUntil right after insert (the heuristic score stands until this lands) and by
// the dashboard /rescore backfill. Same key/endpoint as llmMerge; cheaper default model.
async function llmToxicity(env, text) {
  if (!env.LLM_API_KEY || !text) return null;
  const base = (env.LLM_BASE_URL || "https://dashscope-intl.aliyuncs.com/compatible-mode/v1").replace(/\/$/, "");
  try {
    const r = await fetch(base + "/chat/completions", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: "Bearer " + env.LLM_API_KEY },
      body: JSON.stringify({
        model: env.LLM_TOX_MODEL || "qwen-turbo",
        messages: [
          { role: "system", content: "Rate the toxicity of this K-pop fan-community message toward the rival fandom or its members: hostility, insults, mockery, dismissive sarcasm. Scale 0-100 (0 = friendly or neutral, 100 = extremely hostile). The message may be English or Chinese. Reply with ONLY the integer." },
          { role: "user", content: String(text).slice(0, 1000) },
        ],
        max_tokens: 8, temperature: 0,
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!r.ok) return null;
    const j = await r.json();
    const m = String(j.choices?.[0]?.message?.content || "").match(/\d{1,3}/);
    return m ? clamp(Number(m[0]) / 100) : null;
  } catch { return null; }
}

// Group/fandom names are written in caps by convention, so the shouting rule must ignore
// them: "BLACKPINK" is 9 capitals and "BTS" is 3, which otherwise handed every message
// naming BLACKPINK a free +1 hit and biased the live meter against one fandom.
const SHOUT_EXEMPT = /\b(BTS|BLACKPINK|BP|ARMY|ARMYS|BLINK|BLINKS|KPOP|K-POP|OT7|MV|EP|LOL|OMG|TXT|NCT|IVE|AESPA|TWICE|EXO|SEVENTEEN)\b/g;
// English terms match on WORD BOUNDARIES, not as substrings: plain `includes` scored
// "generation" as toxic because it contains "ratio" (likewise operation/rational/…).
// Chinese still needs substring matching — CJK has no word boundaries.
const TOX_WORDS = new Set(TOX.filter((w) => /^[a-z']+$/.test(w)));
const TOX_PHRASES = TOX.filter((w) => /[ -]/.test(w));
const TOX_SYMBOLS = TOX.filter((w) => !/^[a-z' -]+$/.test(w));
function toxicity(t) {
  const raw = String(t), s = raw.toLowerCase();
  let hits = 0;
  const toks = new Set(s.split(/[^a-z']+/).filter(Boolean));
  TOX_WORDS.forEach((w) => { if (toks.has(w)) hits++; });
  TOX_PHRASES.forEach((w) => { if (s.includes(w)) hits++; });
  TOX_SYMBOLS.forEach((w) => { if (s.includes(w)) hits++; });
  TOX_ZH.forEach((w) => { if (s.includes(w)) hits++; });
  if (/[A-Z]{4,}/.test(raw.replace(SHOUT_EXEMPT, ""))) hits++;
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

// The task block is open when the cohort phase says so. Cohorts with no phase set keep the
// original day-2 behaviour, so pre-phase databases and the older pilots still work.
const taskOpen = (sess) => sess.cohort_phase ? sess.cohort_phase === "task" : sess.cohort_day === 2;

async function getSession(DB, sid) {
  if (!sid) return null;
  // cohort_phase is selected defensively: a database created before the phase column
  // returns undefined, which the callers read as "no phase set" (day-based fallback).
  const cols = `s.*, c.language, c.day AS cohort_day, c.status AS cohort_status, p.handle, p.rejoin_code`;
  const q = (extra) => DB.prepare(
    `SELECT ${cols}${extra} FROM sessions s JOIN cohorts c ON s.cohort_id=c.id
     JOIN participants p ON s.participant_id=p.id WHERE s.id=?`).bind(sid).first();
  return await q(", c.phase AS cohort_phase").catch(() => q(""));
}

// Which instruments this session has already completed.
async function surveysDone(DB, sid) {
  const rows = (await DB.prepare("SELECT instrument FROM survey_responses WHERE session_id=?")
    .bind(sid).all().catch(() => ({ results: [] }))).results || [];
  return rows.map((r) => r.instrument);
}

// The instrument due right now, or null. Day 1 carries Survey 1 (before the task block) and
// the micro-check (straight after it); Day 2 carries Survey 2. A day beyond that has none.
async function surveyDue(DB, sess, phase, done) {
  const want = phase === "survey1" ? (sess.cohort_day >= 2 ? "survey2" : "survey1")
    : phase === "survey2" ? "survey2"
    : phase === "microcheck" ? "microcheck" : null;
  if (!want || done.includes(want)) return null;
  if (want !== "microcheck") return { instrument: want };
  // M5 is the dual-identity check and only makes sense to someone who was really paired:
  // intervention arm, live cross-fandom pair. Both halves of a pair must qualify — the
  // collabs row carries only the INITIATOR's session_id, so the responder is identified by
  // the note_published event, which is written for real pairs and never for filler.
  if (sess.arm !== "EXPT") return { instrument: want, showM5: false };
  const asInitiator = await DB.prepare(
    "SELECT id FROM collabs WHERE session_id=? AND is_live_paired=1").bind(sess.id).first();
  const asResponder = asInitiator ? null : await DB.prepare(
    "SELECT id FROM events WHERE session_id=? AND type='note_published' LIMIT 1").bind(sess.id).first();
  return { instrument: want, showM5: !!(asInitiator || asResponder) };
}

async function insertEvent(DB, sess, type, text, threadId, authorOverride, flairOverride) {
  const id = uid("ev");
  const t = String(text || "").slice(0, 2000);
  // The phase is stamped AT WRITE TIME. In the two-day design the feature fires inside Day 1,
  // so the treatment contrast is pre- vs post-task within that day (paper §3.6); a post's day
  // alone cannot express it. Older rows have phase NULL and are treated as pre-task.
  const args = [id, sess.id || null, sess.cohort_id, sess.cohort_day || sess.day, sess.arm,
    flairOverride || sess.flair, authorOverride || sess.handle, type, t,
    toxicity(t), countWords(t, WE), countWords(t, THEY), String(threadId || "seed"), Date.now()];
  const withPhase = DB.prepare(
    `INSERT INTO events (id,session_id,cohort_id,day,arm,flair,author,type,text_raw,toxicity,we,they,thread_id,created_at,phase)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(...args, sess.cohort_phase || "free");
  await withPhase.run().catch(async () => {
    await DB.prepare("ALTER TABLE events ADD COLUMN phase TEXT").run().catch(() => {});
    await withPhase.run().catch(() => DB.prepare(
      `INSERT INTO events (id,session_id,cohort_id,day,arm,flair,author,type,text_raw,toxicity,we,they,thread_id,created_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(...args).run());
  });
  return id;
}

async function seedDay(DB, cohort, day) {
  const lang = cohort.language === "zh" ? "zh" : "en";
  const seeds = (SEEDS[lang] || SEEDS.en)[day] || [];
  for (const arm of ARMS) {
    for (const s of seeds) {
      await insertEvent(DB, { id: null, cohort_id: cohort.id, cohort_day: day, arm,
        flair: s.flair, handle: s.author, cohort_phase: "free" },
        "post", s.text, "seed", s.author, s.flair);
    }
  }
}

export default {
  async fetch(request, env, ctx) {
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
          // Arm: a cohort pinned to EXPT/CTRL puts its whole group in one arm, so a 4v4
          // group is a true 4v4 feed and the group is one clean cluster (PLAN §17). Cohorts
          // left MIXED keep the alternating assignment (back-compat with earlier pilots);
          // an un-migrated DB has no arm column, which reads as MIXED.
          let arm = cohort.arm === "EXPT" || cohort.arm === "CTRL" ? cohort.arm : null;
          if (!arm) {
            const { n } = (await DB.prepare("SELECT COUNT(*) n FROM participants WHERE cohort_id=?").bind(code).first()) || { n: 0 };
            arm = ARMS[n % 2];
          }
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
          phase: cohort.phase || null,
          // The feature is delivered by /api/feed once the phase reaches "task"; these stay
          // for cohorts with no phase set (pre-phase databases keep the day-2 behaviour).
          note: !cohort.phase && part.arm === "EXPT" && cohort.day === 2 ? NOTE[lang] : null,
          poll: !cohort.phase && part.arm === "CTRL" && cohort.day === 2 ? POLL[lang] : null,
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
        // Phase drives the session: the task block opens only after Survey 1 is submitted
        // (Surveys_v3 §"Timing"), so the pinned feature is gated on phase, not on the day.
        // Cohorts with no phase set fall back to the old day-2 mounting.
        const lang = sess.language === "zh" ? "zh" : "en";
        const phase = sess.cohort_phase || null;
        const open = taskOpen(sess);
        const done = await surveysDone(DB, sess.id);
        return json({
          day: sess.cohort_day, posts: rows, phase,
          survey: phase ? await surveyDue(DB, sess, phase, done) : null,
          note: open && sess.arm === "EXPT" ? NOTE[lang] : null,
          poll: open && sess.arm === "CTRL" ? POLL[lang] : null,
        }, 200, origin);
      }

      // Records one completed instrument. Re-submitting the same instrument for the same
      // session is ignored rather than duplicated (a reload must not create a second row).
      if (path === "/api/survey/submit" && request.method === "POST") {
        const b = await request.json().catch(() => ({}));
        const sess = await getSession(DB, b.sessionId);
        if (!sess) return json({ error: "no_session" }, 400, origin);
        const instrument = ["survey1", "microcheck", "survey2"].includes(b.instrument) ? b.instrument : null;
        if (!instrument) return json({ error: "bad_instrument" }, 400, origin);
        const dup = await DB.prepare("SELECT id FROM survey_responses WHERE session_id=? AND instrument=?")
          .bind(sess.id, instrument).first();
        if (dup) return json({ ok: true, duplicate: true }, 200, origin);
        await DB.prepare(
          "INSERT INTO survey_responses (id,session_id,phase,instrument,payload_json,created_at) VALUES (?,?,?,?,?,?)"
        ).bind(uid("sr"), sess.id, "day" + sess.cohort_day, instrument,
          JSON.stringify(b.answers || {}), Date.now()).run();
        await insertEvent(DB, sess, "survey_submitted", instrument, "survey");
        return json({ ok: true }, 200, origin);
      }

      if (path === "/api/event" && request.method === "POST") {
        const b = await request.json().catch(() => ({}));
        const sess = await getSession(DB, b.sessionId);
        if (!sess) return json({ error: "no_session" }, 400, origin);
        const type = ["post", "comment", "like", "share", "cross"].includes(b.type) ? b.type : "post";
        const evId = await insertEvent(DB, sess, type, b.textRaw, b.threadId);
        // LLM-grade the score in the background — the response never waits on the model
        if ((type === "post" || type === "comment") && env.LLM_API_KEY && ctx) {
          const raw = String(b.textRaw || "").slice(0, 2000);
          ctx.waitUntil(llmToxicity(env, raw).then((v) => v == null ? null :
            DB.prepare("UPDATE events SET toxicity=? WHERE id=?").bind(v, evId).run()).catch(() => {}));
        }
        return json({ ok: true }, 200, origin);
      }

      if (path === "/api/collab/contribute" && request.method === "POST") {
        const b = await request.json().catch(() => ({}));
        const sess = await getSession(DB, b.sessionId);
        if (!sess) return json({ error: "no_session" }, 400, origin);
        if (sess.arm !== "EXPT" || !taskOpen(sess)) return json({ error: "not_available" }, 403, origin);
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
          // ai_merged distinguishes a synthesised note from the verbatim fallback that runs
          // when the model is unavailable. The fallback is a DIFFERENT manipulation, so it is
          // recorded rather than silent -- same treatment as is_live_paired / filler.
          await DB.prepare("ALTER TABLE collabs ADD COLUMN ai_merged INTEGER DEFAULT 0").run().catch(() => {});
          await DB.prepare("UPDATE collabs SET b_flair=?, b_text=?, b_handle=?, status='paired', is_live_paired=1, paired_at=?, artifact=?, ai_merged=? WHERE id=?")
            .bind(sess.flair, text, sess.handle, Date.now(), artifactLine, merged ? 1 : 0, match.id).run()
            .catch(() => DB.prepare("UPDATE collabs SET b_flair=?, b_text=?, b_handle=?, status='paired', is_live_paired=1, paired_at=?, artifact=? WHERE id=?")
              .bind(sess.flair, text, sess.handle, Date.now(), artifactLine, match.id).run());
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
        if (sess.arm !== "CTRL" || !taskOpen(sess)) return json({ error: "not_available" }, 403, origin);
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
          const arm = b.arm === "EXPT" || b.arm === "CTRL" ? b.arm : "MIXED";
          // Self-migrating: adds columns to a database created before whole-group arms and
          // before the phase stepper. Harmless no-ops once they exist, so no console step.
          await DB.prepare("ALTER TABLE cohorts ADD COLUMN arm TEXT DEFAULT 'MIXED'").run().catch(() => {});
          await DB.prepare("ALTER TABLE cohorts ADD COLUMN phase TEXT DEFAULT 'free'").run().catch(() => {});
          const cohort = { id: code, label: String(b.label || code).slice(0, 60), language: lang, arm, day: 1, status: "open", created_at: Date.now() };
          await DB.prepare("INSERT INTO cohorts (id,label,language,arm,day,status,created_at) VALUES (?,?,?,?,?,?,?)")
            .bind(cohort.id, cohort.label, cohort.language, cohort.arm, 1, "open", cohort.created_at).run();
          await seedDay(DB, cohort, 1);
          return json({ ok: true, cohort }, 200, origin);
        }
        if (path === "/api/dashboard/cohort/day" && request.method === "POST") {
          const b = await request.json().catch(() => ({}));
          const code = String(b.code || "").trim().toUpperCase();
          const day = Math.min(2, Math.max(1, Number(b.day) || 1));  // two-day protocol
          const cohort = await DB.prepare("SELECT * FROM cohorts WHERE id=?").bind(code).first();
          if (!cohort) return json({ error: "no_cohort" }, 404, origin);
          await DB.prepare("UPDATE cohorts SET day=? WHERE id=?").bind(day, code).run();
          if (day !== cohort.day) await seedDay(DB, { ...cohort, day }, day);
          return json({ ok: true, code, day }, 200, origin);
        }
        // Phase stepper. Day 1 runs free -> survey1 -> task -> microcheck -> done; Day 2
        // runs free -> survey2 -> done. The paper's automatic session-toxicity trigger will
        // eventually drive the same transition; this is the seam it plugs into.
        if (path === "/api/dashboard/cohort/phase" && request.method === "POST") {
          const b = await request.json().catch(() => ({}));
          const code = String(b.code || "").trim().toUpperCase();
          const phase = ["free", "survey1", "task", "microcheck", "survey2", "done"].includes(b.phase) ? b.phase : null;
          if (!phase) return json({ error: "bad_phase" }, 400, origin);
          await DB.prepare("ALTER TABLE cohorts ADD COLUMN phase TEXT DEFAULT 'free'").run().catch(() => {});
          const r = await DB.prepare("UPDATE cohorts SET phase=? WHERE id=?").bind(phase, code).run();
          if (!r.meta || r.meta.changes === 0) return json({ error: "no_cohort" }, 404, origin);
          return json({ ok: true, code, phase }, 200, origin);
        }
        if (path === "/api/dashboard/cohort/close" && request.method === "POST") {
          const b = await request.json().catch(() => ({}));
          await DB.prepare("UPDATE cohorts SET status='closed' WHERE id=?").bind(String(b.code || "").toUpperCase()).run();
          return json({ ok: true }, 200, origin);
        }

        // Backfill: rescore stored posts/comments from text_raw. With LLM_API_KEY the
        // batch is LLM-graded (the dashboard loops offset batches to stay under Workers
        // subrequest caps); otherwise — or per-row on LLM failure — wordlists apply.
        if (path === "/api/dashboard/rescore" && request.method === "POST") {
          const b = await request.json().catch(() => ({}));
          const offset = Math.max(0, Number(b.offset) || 0);
          const useLlm = !!env.LLM_API_KEY && b.mode !== "wordlist";
          const limit = useLlm ? 25 : 100000;
          const { n: total } = (await DB.prepare("SELECT COUNT(*) n FROM events WHERE type IN ('post','comment')").first()) || { n: 0 };
          const rows = (await DB.prepare("SELECT id, text_raw FROM events WHERE type IN ('post','comment') ORDER BY created_at ASC LIMIT ? OFFSET ?").bind(limit, offset).all()).results || [];
          const scored = [];
          for (let i = 0; i < rows.length; i += 5) {
            const chunk = rows.slice(i, i + 5);
            const vals = useLlm ? await Promise.all(chunk.map((r) => llmToxicity(env, r.text_raw))) : chunk.map(() => null);
            chunk.forEach((r, k) => scored.push([vals[k] != null ? vals[k] : toxicity(r.text_raw), r]));
          }
          const stmts = scored.map(([tox, r]) =>
            DB.prepare("UPDATE events SET toxicity=?, we=?, they=? WHERE id=?")
              .bind(tox, countWords(r.text_raw, WE), countWords(r.text_raw, THEY), r.id));
          for (let i = 0; i < stmts.length; i += 100) await DB.batch(stmts.slice(i, i + 100));
          const nextOffset = offset + rows.length;
          return json({ ok: true, mode: useLlm ? "llm" : "wordlist", total, processed: rows.length, nextOffset, done: nextOffset >= total || rows.length === 0 }, 200, origin);
        }

        if (path === "/api/dashboard/summary") {
          const cohorts = (await DB.prepare("SELECT * FROM cohorts ORDER BY created_at DESC").all()).results || [];
          const cell = () => ({ sessions: 0, msgs: 0, toxSum: 0, we: 0, they: 0, cross: 0, livePaired: 0, filler: 0, pollVotes: 0 });
          const byArmDay = { EXPT: { 1: cell(), 2: cell() }, CTRL: { 1: cell(), 2: cell() } };
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

          for (const a of ARMS) for (const d of [1, 2]) {
            const c = byArmDay[a][d];
            c.toxRate = c.msgs ? c.toxSum / c.msgs : null;
            const tot = c.we + c.they; c.weShare = tot ? c.we / tot : null;
          }
          // Day-1 arm × phase: the feature fires INSIDE Day 1, so the treatment contrast is
          // pre-task vs post-task (paper §3.6), not Day 1 vs Day 2. Rows written before the
          // phase column existed have phase NULL and count as pre-task.
          const byArmPhase = { EXPT: { pre: cell(), post: cell() }, CTRL: { pre: cell(), post: cell() } };
          const pc = (await DB.prepare(
            `SELECT arm, CASE WHEN phase IN ('task','microcheck') THEN 'post' ELSE 'pre' END slot,
                    COUNT(*) msgs, SUM(toxicity) toxSum, SUM(we) we, SUM(they) they
             FROM events WHERE type IN ('post','comment') AND session_id IS NOT NULL AND day=1
             GROUP BY arm, slot`).all().catch(() => ({ results: [] }))).results || [];
          pc.forEach((r) => { const c = byArmPhase[r.arm] && byArmPhase[r.arm][r.slot];
            if (c) { c.msgs = r.msgs; c.toxSum = r.toxSum || 0; c.we = r.we || 0; c.they = r.they || 0; } });
          for (const a of ARMS) for (const k of ["pre", "post"]) {
            const c = byArmPhase[a][k];
            c.toxRate = c.msgs ? c.toxSum / c.msgs : null;
            const tot = c.we + c.they; c.weShare = tot ? c.we / tot : null;
          }

          // Operational go/no-go gates, re-keyed to the two-day design. They decide whether a
          // session is ready to advance; they are NOT evidence for the hypothesis. G3 is the
          // condition-by-phase contrast in gate form (thresholds: high ≥.55 · stay ≥.50 · drop ≤.35).
          const ph = (a, k) => byArmPhase[a][k].toxRate;
          const R1 = ph("EXPT", "pre") == null || ph("CTRL", "pre") == null ? null
            : (ph("EXPT", "pre") >= 0.55 && ph("CTRL", "pre") >= 0.55);
          const R2 = ph("CTRL", "post") == null ? null : ph("CTRL", "post") >= 0.5;
          const R3 = ph("EXPT", "post") == null || ph("CTRL", "post") == null ? null
            : (ph("EXPT", "post") <= 0.35 && ph("CTRL", "post") >= 0.5);
          // Per-cohort × day toxicity. With whole-group arms each cohort IS the cluster, so
          // this — not the pooled arm×day cell — is the level the design actually varies at.
          const bcd = (await DB.prepare(
            "SELECT cohort_id, day, arm, COUNT(*) msgs, SUM(toxicity) toxSum FROM events WHERE type IN ('post','comment') AND session_id IS NOT NULL GROUP BY cohort_id, day, arm"
          ).all()).results || [];
          const byCohortDay = {};
          bcd.forEach((r) => {
            const k = r.cohort_id || "?";
            (byCohortDay[k] || (byCohortDay[k] = {}))[r.day] = {
              arm: r.arm, msgs: r.msgs, toxRate: r.msgs ? (r.toxSum || 0) / r.msgs : null,
            };
          });
          const { n: sessions } = (await DB.prepare("SELECT COUNT(*) n FROM sessions").first()) || { n: 0 };
          return json({ source: "backend", version: "v3.1", cohorts, byArmDay, byArmPhase, byCohortDay, checks: { R1, R2, R3 }, totals: { sessions } }, 200, origin);
        }

        if (path === "/api/dashboard/sessions") {
          const sessions = (await DB.prepare("SELECT * FROM sessions ORDER BY started_at DESC LIMIT 1000").all()).results || [];
          const evCols = "id,session_id,cohort_id,day,arm,flair,author,type,text_raw,toxicity,we,they,thread_id,created_at";
          const events = ((await DB.prepare(`SELECT ${evCols},phase FROM events ORDER BY created_at DESC LIMIT 5000`).all()
            .catch(() => DB.prepare(`SELECT ${evCols} FROM events ORDER BY created_at DESC LIMIT 5000`).all())).results) || [];
          const collabs = (await DB.prepare("SELECT * FROM collabs ORDER BY created_at DESC LIMIT 1000").all()).results || [];
          const participants = (await DB.prepare("SELECT id,cohort_id,handle,arm,flair,created_at FROM participants LIMIT 2000").all()).results || [];
          const surveys = (await DB.prepare("SELECT * FROM survey_responses ORDER BY created_at DESC LIMIT 5000")
            .all().catch(() => ({ results: [] }))).results || [];
          return json({ source: "backend", version: "v3", sessions, events, collabs, participants, surveys }, 200, origin);
        }
      }

      return json({ error: "not_found", path }, 404, origin);
    } catch (e) {
      return json({ error: "server_error", detail: String(e && e.message || e) }, 500, origin);
    }
  },
};
