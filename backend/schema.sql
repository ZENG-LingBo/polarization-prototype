-- DefuseLab Study 1 — D1 schema.
-- Apply from the Cloudflare dashboard (D1 -> your database -> Console -> paste + run)
-- or: npx wrangler d1 execute defuselab-study --file=backend/schema.sql

CREATE TABLE IF NOT EXISTS participants (
  id          TEXT PRIMARY KEY,
  arm         TEXT,               -- C0 | C1 | C2
  flair       TEXT,               -- AUR | NOV
  created_at  INTEGER
);

CREATE TABLE IF NOT EXISTS sessions (
  id             TEXT PRIMARY KEY,
  participant_id TEXT,
  arm            TEXT,
  flair          TEXT,
  started_at     INTEGER,
  ended_at       INTEGER
);

-- Behavioral log. text_raw is the PRE-MODERATION wording (PLAN.md §10) — the toxicity
-- column here is the demo heuristic; the real study rescores text_raw with Perspective API.
CREATE TABLE IF NOT EXISTS events (
  id          TEXT PRIMARY KEY,
  session_id  TEXT,
  type        TEXT,               -- post | comment | like | share | cross
  text_raw    TEXT,
  toxicity    REAL,
  we          INTEGER,
  they        INTEGER,
  thread_id   TEXT,
  created_at  INTEGER
);
CREATE INDEX IF NOT EXISTS idx_events_session ON events(session_id);

-- Collab Spotlight pairing. is_live_paired distinguishes a real cross-fandom pair from a
-- disclosed system-generated filler (PLAN.md §4.3) for per-protocol / dose accounting.
CREATE TABLE IF NOT EXISTS collabs (
  id             TEXT PRIMARY KEY,
  session_id     TEXT,
  arm            TEXT,
  kind           TEXT,            -- super | neutral
  a_flair        TEXT,
  a_text         TEXT,
  b_flair        TEXT,
  b_text         TEXT,
  status         TEXT,            -- waiting | paired | filler
  is_live_paired INTEGER DEFAULT 0,
  filler         INTEGER DEFAULT 0,
  artifact       TEXT,
  created_at     INTEGER,
  paired_at      INTEGER
);
CREATE INDEX IF NOT EXISTS idx_collabs_wait ON collabs(arm, status, a_flair);

-- Scaffold for the T0/T1 survey batteries (instruments per MEASURES.md); not populated yet.
CREATE TABLE IF NOT EXISTS survey_responses (
  id           TEXT PRIMARY KEY,
  session_id   TEXT,
  phase        TEXT,              -- T0 | T1
  instrument   TEXT,
  payload_json TEXT,
  created_at   INTEGER
);
