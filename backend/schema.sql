-- DefuseLab Study 1 — D1 schema (protocol v3: 2 arms × 3 days, cohort group sessions).
-- Apply from the Cloudflare dashboard (D1 -> your database -> Console -> paste + run)
-- or: npx wrangler d1 execute defuselab-study --file=backend/schema.sql
--
-- v3 model: a COHORT is one recruited group (e.g. "PILOT1"), run over Day 1/2/3.
-- Participants join a cohort with its join code, get a REJOIN CODE on Day 1, and use it
-- on Days 2–3 so the same person is linked across days. Arms are EXPT | CTRL; each
-- cohort×arm is its own shared live feed (participants in the same cohort+arm see each
-- other's posts).

CREATE TABLE IF NOT EXISTS cohorts (
  id          TEXT PRIMARY KEY,   -- join code, e.g. PILOT1 (uppercased)
  label       TEXT,
  language    TEXT DEFAULT 'en',  -- en | zh  (each cell runs entirely in one language)
  day         INTEGER DEFAULT 1,  -- 1 | 2 | 3 (advanced by the researcher)
  status      TEXT DEFAULT 'open',-- open | closed
  created_at  INTEGER
);

CREATE TABLE IF NOT EXISTS participants (
  id          TEXT PRIMARY KEY,
  cohort_id   TEXT,
  rejoin_code TEXT,               -- shown to the participant on Day 1; links Days 2-3
  handle      TEXT,               -- anonymous display handle, e.g. army_x7k2
  arm         TEXT,               -- EXPT | CTRL
  flair       TEXT,               -- ARMY | BLINK
  created_at  INTEGER
);
CREATE INDEX IF NOT EXISTS idx_participants_rejoin ON participants(cohort_id, rejoin_code);

CREATE TABLE IF NOT EXISTS sessions (
  id             TEXT PRIMARY KEY,
  participant_id TEXT,
  cohort_id      TEXT,
  day            INTEGER,         -- cohort day when the session started
  arm            TEXT,
  flair          TEXT,
  started_at     INTEGER,
  ended_at       INTEGER
);
CREATE INDEX IF NOT EXISTS idx_sessions_cohort ON sessions(cohort_id, day);

-- Behavioral log AND the shared feed. text_raw is the PRE-MODERATION wording (PLAN.md
-- §10) — the toxicity column is the demo heuristic; the real study rescores text_raw
-- with Perspective API + the validated K-pop lexicon. Feed reads select type IN
-- ('post','comment','note_published') for the participant's cohort+arm.
CREATE TABLE IF NOT EXISTS events (
  id          TEXT PRIMARY KEY,
  session_id  TEXT,
  cohort_id   TEXT,
  day         INTEGER,
  arm         TEXT,
  flair       TEXT,               -- author's fandom (or SYS for seeded/system posts)
  author      TEXT,               -- anonymous handle (or the seed handle)
  type        TEXT,               -- post | comment | like | share | cross | note_published | poll_vote | survey_opened | seed
  text_raw    TEXT,
  toxicity    REAL,
  we          INTEGER,
  they        INTEGER,
  thread_id   TEXT,               -- parent event id for comments; 'seed' for top-level
  created_at  INTEGER
);
CREATE INDEX IF NOT EXISTS idx_events_session ON events(session_id);
CREATE INDEX IF NOT EXISTS idx_events_feed ON events(cohort_id, arm, created_at);

-- Community Note pairing (EXPT, Day 2). is_live_paired distinguishes a real cross-fandom
-- pair from a disclosed system-generated filler (PLAN.md §4.3) for per-protocol / dose.
CREATE TABLE IF NOT EXISTS collabs (
  id             TEXT PRIMARY KEY,
  session_id     TEXT,
  cohort_id      TEXT,
  day            INTEGER,
  arm            TEXT,
  a_flair        TEXT,
  a_text         TEXT,
  a_handle       TEXT,
  b_flair        TEXT,
  b_text         TEXT,
  b_handle       TEXT,
  status         TEXT,            -- waiting | paired | filler
  is_live_paired INTEGER DEFAULT 0,
  filler         INTEGER DEFAULT 0,
  artifact       TEXT,
  created_at     INTEGER,
  paired_at      INTEGER
);
CREATE INDEX IF NOT EXISTS idx_collabs_wait ON collabs(cohort_id, arm, status, a_flair);

-- Inert daily poll votes (CTRL, Day 2).
CREATE TABLE IF NOT EXISTS poll_votes (
  id          TEXT PRIMARY KEY,
  session_id  TEXT,
  cohort_id   TEXT,
  day         INTEGER,
  option_idx  INTEGER,
  created_at  INTEGER
);
CREATE INDEX IF NOT EXISTS idx_poll_cohort ON poll_votes(cohort_id, day);

-- Scaffold for optional in-app survey storage (current design uses external survey links
-- via SURVEY_URL_D1..D3 vars; survey_opened events log the handoff).
CREATE TABLE IF NOT EXISTS survey_responses (
  id           TEXT PRIMARY KEY,
  session_id   TEXT,
  phase        TEXT,
  instrument   TEXT,
  payload_json TEXT,
  created_at   INTEGER
);
