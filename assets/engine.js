/* DefuseLab — shared study engine (used by app.html AND dashboard.html).
 *
 * Holds the things both the tester app and the researcher dashboard need:
 *   • DATA      — fictional fandoms, seeded rival threads, the Collab prompts per arm
 *   • SCORING   — the demo toxicity / we-they / common-identity heuristics
 *   • PROVENANCE— each metric mapped to its VALIDATED instrument + source paper (Ray's ask)
 *   • api       — a tiny client that talks to the Cloudflare Worker, with a localStorage
 *                 OFFLINE fallback so everything works on GitHub Pages with no backend.
 *
 * These meters are transparent demo heuristics, NOT the study's real instruments — see
 * PROVENANCE below and METRICS.md / MEASURES.md. Rival fandoms: ARMY (BTS) vs BLINK (BLACKPINK).
 */
(function (global) {
  "use strict";
  const CFG = global.STUDY_CONFIG || {};

  /* ------------------------------------------------------------------ DATA */
  // Real rival fandoms (locked pair — see FANDOM_SELECTION.md): ARMY (BTS) vs BLINK (BLACKPINK).
  // Handles are FICTIONAL — not real accounts.
  const FANDOMS = {
    ARMY:  { code: "ARMY",  name: "ARMY",  group: "BTS",       stans: ["army_borahae", "purplenight_", "jinnie_stan", "07dynamite"] },
    BLINK: { code: "BLINK", name: "BLINK", group: "BLACKPINK", stans: ["blink_inyourarea", "pinkvenom_", "ddu_du_stan", "bp_forever04"] },
  };
  const otherFandom = (f) => (f === "ARMY" ? "BLINK" : "ARMY");

  // Seeded rival-fandom thread (PLAN.md §12: seed from real, anonymized discourse).
  // ETHICS (per Ray + IRB): these posts are ANONYMIZED and PARAPHRASED — modelled on the
  // documented ARMY/BLINK fan-war register (live-vocals / "flop" / "overrated" / streaming &
  // records / "delusional" mockery), reworded so none is a traceable verbatim tweet (verbatim
  // quotes re-identify authors ~84% of the time), with fictional handles. Genuinely harmful
  // targeted content (attacks on members' bodies/families, slurs, threats) is deliberately
  // EXCLUDED — kept group-vs-group, not member-targeting. Not attributed to real individuals.
  const SEED_THREAD = {
    title: 'BTS vs BLACKPINK — who actually runs this gen?',
    posts: [
      { fan: "ARMY",  text: "BTS is the defining group of this generation, it's genuinely not close 🏆" },
      { fan: "BLINK", text: "lol right on cue. BLACKPINK outsold and outperformed, stay pressed" },
      { fan: "ARMY",  text: "that last BP comeback kinda flopped ngl, the live vocals were rough 💀" },
      { fan: "BLINK", text: "ratio. ARMYs really wake up and choose delusion every day huh, overrated faves" },
      { fan: "ARMY",  text: "cope, nobody's streaming it, one era and washed 🤡" },
      { fan: "BLINK", text: "imagine being this pressed lol, embarrassing fanbase fr" },
    ],
  };

  // Collab Spotlight content per arm (PLAN.md §4.2 / §5). C0 has no Collab.
  //   C2 = superordinate ("K-pop as a whole")  ·  C1 = neutral (comfort food)
  const COLLAB = {
    C2: {
      kind: "super",
      prompt: 'Add the song that made YOU fall for K-pop. (Publishes once a fan from another group adds one too.)',
      placeholder: "the song that got you into K-pop…",
      sampleSelf: { text: "adding 'Spring Day' — that bridge is the exact moment I fell for K-pop" },
      samplePartner: { text: "oh that's a real pick. throwing in 'As If It's Your Last' — the energy pulled me in" },
      artifact: '🎵 "The songs that made us fall for K-pop"',
      afterglow: [
        { fan: "ARMY",  text: "ngl we actually have similar taste… this playlist kinda goes hard" },
        { fan: "BLINK", text: "haha yeah. still rivals but we're both just here for the music tbh 🤝" },
        { fan: "ARMY",  text: "ok real talk, both groups ate on that stage" },
      ],
    },
    C1: {
      kind: "neutral",
      prompt: 'Add your top comfort food. (Publishes once a fan from another group adds one too.)',
      placeholder: "your comfort food…",
      sampleSelf: { text: "tteokbokki, no debate" },
      samplePartner: { text: "ok fair, adding ramen + extra cheese" },
      artifact: '🍜 "Comfort foods"',
      afterglow: [
        { fan: "ARMY",  text: "lol ok that was kinda fun ngl" },
        { fan: "BLINK", text: "anyway BTS still overrated, that won't change lol" },
      ],
    },
  };

  const CONDITIONS = {
    C0: { name: "C0 — Control", blurb: "Plain feed, no Collab feature. The untouched rival-fandom baseline." },
    C1: { name: "C1 — Active control", blurb: "Feed + a cross-fandom Collab on a NEUTRAL topic. Holds contact/novelty constant, drops the K-pop framing." },
    C2: { name: "C2 — Intervention", blurb: "Feed + the Collab framed around K-pop as a whole. Rival fans co-create as 'K-pop fans'." },
  };

  /* --------------------------------------------------------------- SCORING */
  // Demo lexicon (illustrative, fandom-flavored). The REAL study validates a K-pop
  // incivility lexicon against the Coe et al. 2014 codebook (PLAN.md §13.7) — jargon
  // like "flop"/"nugu" is NOT auto-counted as incivility there.
  const TOX = ["clown", "clowns", "trash", "delusional", "delulu", "ratio", "idiot", "stupid",
    "talentless", "untalented", "garbage", "cope", "copium", "washed", "fraud", "overrated",
    "embarrassing", "pathetic", "cringe", "mid", "flop", "flopped", "nugu", "industry plant",
    "mass-report", "mass report", "brainrot", "shut up", "🤡", "💀"];
  const WE = ["we", "us", "our", "ours", "we're", "weve", "both", "together"];
  const THEY = ["they", "them", "their", "theirs", "they're", "u", "you", "your", "yall", "y'all"];

  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));

  function toxicity(t) {
    const s = String(t).toLowerCase();
    let hits = 0;
    TOX.forEach((w) => { if (s.includes(w)) hits++; });
    if (/[A-Z]{4,}/.test(String(t))) hits++;      // shouting
    return clamp(hits / 3);
  }
  function countWords(t, list) {
    return String(t).toLowerCase().split(/[^a-z']+/).filter((x) => list.includes(x)).length;
  }
  function weTheyRatio(texts) {
    let we = 0, they = 0;
    texts.forEach((t) => { we += countWords(t, WE); they += countWords(t, THEY); });
    const total = we + they;
    return { we, they, share: total ? we / total : 0.4 };
  }
  // Demo proxy for the CIIM common in-group identity mediator.
  function commonIdentity(weShare, collabKind, crossNorm) {
    const boost = collabKind === "super" ? 0.55 : collabKind === "neutral" ? 0.20 : 0;
    return clamp(0.05 + 0.25 * weShare + boost + 0.12 * clamp(crossNorm));
  }

  /* ------------------------------------------------------------ PROVENANCE */
  // Every dashboard metric traced to its validated instrument + source paper.
  const MODEL_PAPER = {
    label: "GuesSync!",
    cite: "Rajadesingan, Choo, Zhang, Inakage, Budak & Resnick — CSCW 2023",
    doi: "https://doi.org/10.1145/3610190",
    note: "Model paper: a control-vs-intervention platform study that reduced affective polarization with feeling-thermometer + willingness-to-engage outcomes. We adopt its validated survey outcomes and extend to group-level enacted recategorization with behavioral toxicity as the primary DV.",
  };
  const PROVENANCE = [
    { key: "toxicity", metric: "Toxicity rate / message (PRIMARY DV)",
      instrument: "Perspective API + Coe et al. incivility codebook + validated K-pop lexicon",
      cite: "Lees et al. 2022; Coe, Kenski & Rains 2014", hypo: "H1" },
    { key: "wethey", metric: "we/they recategorization (during-session)",
      instrument: "LIWC pronoun categories", cite: "Tausczik & Pennebaker 2010", hypo: "H3b" },
    { key: "ci", metric: "Common in-group identity (mediator, T1)",
      instrument: "CIIM one-group / dual-identity scale", cite: "Gaertner & Dovidio 2000", hypo: "H3a" },
    { key: "ap", metric: "Affective polarization / IOS",
      instrument: "Feeling thermometer, social distance, IOS", cite: "Iyengar & Westwood 2015; Aron et al. 1992", hypo: "H2" },
    { key: "ident", metric: "Fandom identification (dual-identity guardrail)",
      instrument: "FISI + Leach multicomponent identification", cite: "Postmes et al. 2013; Leach et al. 2008", hypo: "H4 (TOST)" },
    { key: "reactance", metric: "Reactance guardrail",
      instrument: "Trait → state reactance", cite: "Hong & Faedda 1996; Dillard & Shen 2005", hypo: "H5 (TOST)" },
    { key: "cross", metric: "Cross-fandom engagement / Collab dose",
      instrument: "Behavioral observation coding", cite: "Coe et al. 2014 lineage", hypo: "RQ1/RQ2" },
  ];

  /* ---------------------------------------------------------------- STORE */
  // localStorage store for OFFLINE mode (and a client-side mirror in backend mode).
  const LS_KEY = "defuselab_store_v1";
  function loadStore() {
    try { return JSON.parse(global.localStorage.getItem(LS_KEY)) || null; } catch { return null; }
  }
  function blankStore() { return { armCursor: 0, sessions: [], events: [], collabs: [] }; }
  function saveStore(s) { try { global.localStorage.setItem(LS_KEY, JSON.stringify(s)); } catch {} }
  function store() { let s = loadStore(); if (!s) { s = blankStore(); saveStore(s); } return s; }
  const uid = (p) => p + "_" + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);

  const ARMS = ["C0", "C1", "C2"];

  /* ------------------------------------------------------------- BACKEND */
  const hasBackend = () => !!(CFG.BACKEND_URL && CFG.BACKEND_URL.trim());
  async function call(path, opts = {}) {
    const r = await fetch(CFG.BACKEND_URL.replace(/\/$/, "") + path, {
      method: opts.method || "GET",
      headers: Object.assign({ "content-type": "application/json" }, opts.headers || {}),
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw Object.assign(new Error(data.error || ("http " + r.status)), { status: r.status, data });
    return data;
  }

  /* ----- offline implementations (mirror the backend contract) ----- */
  const offline = {
    startSession(opts = {}) {
      const s = store();
      const arm = ARMS.includes(opts.arm) ? opts.arm : ARMS[s.armCursor % 3];
      if (!ARMS.includes(opts.arm)) s.armCursor++;
      const flair = (opts.flair === "ARMY" || opts.flair === "BLINK") ? opts.flair : (Math.random() < 0.5 ? "ARMY" : "BLINK");
      const sess = { id: uid("sess"), arm, flair, started_at: Date.now(), ended_at: null };
      s.sessions.push(sess); saveStore(s);
      return { sessionId: sess.id, arm, flair, seedThread: SEED_THREAD, offline: true };
    },
    logEvent(e) {
      const s = store();
      s.events.push({
        id: uid("ev"), session_id: e.sessionId, type: e.type,
        text_raw: e.textRaw || "", toxicity: toxicity(e.textRaw || ""),
        we: countWords(e.textRaw || "", WE), they: countWords(e.textRaw || "", THEY),
        thread_id: e.threadId || "seed", created_at: Date.now(),
      });
      saveStore(s);
      return { ok: true };
    },
    // Offline there is no real partner online, so we transparently return a DISCLOSED
    // system-generated sample (PLAN.md §4.3 — never imply a human). Real live pairing
    // requires the deployed backend + a second participant from the other fandom.
    collabContribute(c) {
      const s = store();
      const sess = s.sessions.find((x) => x.id === c.sessionId);
      const arm = sess ? sess.arm : "C2";
      const conf = COLLAB[arm] || COLLAB.C2;
      const col = {
        id: uid("col"), session_id: c.sessionId, arm, kind: conf.kind, prompt: conf.prompt,
        a_text: c.text, a_flair: sess ? sess.flair : "ARMY",
        b_text: conf.samplePartner.text, b_flair: sess ? otherFandom(sess.flair) : "BLINK",
        artifact: conf.artifact, status: "filler", is_live_paired: 0, filler: 1, created_at: Date.now(),
      };
      s.collabs.push(col); saveStore(s);
      return { collabId: col.id, status: "waiting" };
    },
    collabStatus(id) {
      const s = store();
      const col = s.collabs.find((x) => x.id === id);
      if (!col) return { status: "unknown" };
      return {
        status: "filler",           // offline: disclosed system-generated sample
        isLivePaired: false, filler: true,
        partner: { flair: col.b_flair, text: col.b_text },
        artifact: col.artifact,
        afterglow: (COLLAB[col.arm] || COLLAB.C2).afterglow,
      };
    },
    endSession(id) {
      const s = store();
      const sess = s.sessions.find((x) => x.id === id);
      if (sess) { sess.ended_at = Date.now(); saveStore(s); }
      return { ok: true };
    },
  };

  /* ---------- aggregation (offline dashboard, from the local store) ---------- */
  function aggregate(s) {
    const byArm = {};
    ARMS.forEach((a) => (byArm[a] = { arm: a, sessions: 0, msgs: 0, toxSum: 0, we: 0, they: 0, cross: 0, livePaired: 0, filler: 0 }));
    const sessArm = {};
    s.sessions.forEach((x) => { sessArm[x.id] = x.arm; if (byArm[x.arm]) byArm[x.arm].sessions++; });
    s.events.forEach((e) => {
      const a = sessArm[e.session_id]; if (!a || !byArm[a]) return;
      if (e.type === "post" || e.type === "comment") { byArm[a].msgs++; byArm[a].toxSum += e.toxicity; byArm[a].we += e.we; byArm[a].they += e.they; }
      if (e.type === "cross") byArm[a].cross++;
    });
    s.collabs.forEach((c) => {
      const a = sessArm[c.session_id]; if (!a || !byArm[a]) return;
      byArm[a].cross++;
      if (c.is_live_paired) byArm[a].livePaired++; else byArm[a].filler++;
    });
    ARMS.forEach((a) => {
      const b = byArm[a];
      b.toxRate = b.msgs ? b.toxSum / b.msgs : null;             // 0..1
      const tot = b.we + b.they; b.weShare = tot ? b.we / tot : null;
      const collabKind = a === "C2" ? "super" : a === "C1" ? "neutral" : null;
      b.ci = b.weShare == null ? null : commonIdentity(b.weShare, collabKind, b.cross / 6);
    });
    return { byArm, totals: { sessions: s.sessions.length, events: s.events.length, collabs: s.collabs.length } };
  }

  // Simulated demo cohort so the compare-arms view + provenance render for a walkthrough
  // even before any real testing. Clearly labelled "simulated" in the dashboard UI.
  function seedDemoCohort() {
    const s = store();
    const mk = (arm, flair, texts) => {
      const sid = uid("demo");
      s.sessions.push({ id: sid, arm, flair, started_at: Date.now(), ended_at: Date.now(), demo: true });
      texts.forEach((t) => s.events.push({ id: uid("ev"), session_id: sid, type: "post", text_raw: t, toxicity: toxicity(t), we: countWords(t, WE), they: countWords(t, THEY), thread_id: "seed", created_at: Date.now(), demo: true }));
      if (arm !== "C0") { s.collabs.push({ id: uid("col"), session_id: sid, arm, kind: arm === "C2" ? "super" : "neutral", is_live_paired: 1, filler: 0, created_at: Date.now(), demo: true }); }
    };
    // C0: stays hostile · C1: mild thaw then drifts back · C2: cools + "we" language
    mk("C0", "ARMY",  ["their comeback flopped lol 💀", "delusional fanbase as usual", "overrated group overrated stans", "nobody streams them, cope"]);
    mk("C0", "BLINK", ["ratio, stay pressed", "ARMYs are embarrassing 🤡", "washed and mid", "clown behavior"]);
    mk("C1", "ARMY",  ["ok the food collab was kinda fun", "anyway they're still overrated lol", "mid comeback tho"]);
    mk("C1", "BLINK", ["fine that was alright", "BLACKPINK still outsold, cope", "whatever, delulu"]);
    mk("C2", "ARMY",  ["ngl we actually have similar taste", "we can argue and still share a playlist", "both groups ate on that stage tbh"]);
    mk("C2", "BLINK", ["haha yeah we're both just here for the music 🤝", "our biases both went off fr", "this is the convo i come here for"]);
    saveStore(s);
  }

  function resetStore() { saveStore(blankStore()); }

  /* --------------------------------------------------------------- api ---- */
  const api = {
    offline: !hasBackend(),
    async startSession(opts = {}) {
      if (!hasBackend()) return offline.startSession(opts);
      try { return await call("/api/session/start", { method: "POST", body: opts }); }
      catch { return offline.startSession(opts); }
    },
    async logEvent(e) {
      offline.logEvent(e); // always mirror locally
      if (!hasBackend()) return { ok: true };
      try { return await call("/api/event", { method: "POST", body: e }); } catch { return { ok: true, offline: true }; }
    },
    async collabContribute(c) {
      if (!hasBackend()) return offline.collabContribute(c);
      try { return await call("/api/collab/contribute", { method: "POST", body: c }); }
      catch { return offline.collabContribute(c); }
    },
    async collabStatus(id) {
      if (!hasBackend()) return offline.collabStatus(id);
      try { return await call("/api/collab/status?id=" + encodeURIComponent(id)); }
      catch { return offline.collabStatus(id); }
    },
    async endSession(id) {
      offline.endSession(id);
      if (!hasBackend()) return { ok: true };
      try { return await call("/api/session/end", { method: "POST", body: { sessionId: id } }); } catch { return { ok: true }; }
    },
    async dashboardSummary(token) {
      if (hasBackend()) {
        try { return await call("/api/dashboard/summary", { headers: { authorization: "Bearer " + token } }); }
        catch (e) { if (e.status === 401 || e.status === 403) throw e; /* else fall through to offline */ }
      }
      return { source: "offline", ...aggregate(store()) };
    },
    async dashboardSessions(token) {
      if (hasBackend()) {
        try { return await call("/api/dashboard/sessions", { headers: { authorization: "Bearer " + token } }); }
        catch (e) { if (e.status === 401 || e.status === 403) throw e; }
      }
      return { source: "offline", sessions: store().sessions, events: store().events, collabs: store().collabs };
    },
    seedDemoCohort, resetStore,
  };

  /* --------------------------------------------------------------- export */
  global.STUDY = {
    FANDOMS, otherFandom, SEED_THREAD, COLLAB, CONDITIONS, ARMS,
    TOX, WE, THEY, toxicity, countWords, weTheyRatio, commonIdentity, clamp,
    MODEL_PAPER, PROVENANCE, aggregate, api,
    hasBackend, config: CFG,
  };
})(window);
