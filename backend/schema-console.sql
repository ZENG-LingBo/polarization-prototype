CREATE TABLE IF NOT EXISTS cohorts (
  id          TEXT PRIMARY KEY,   
  label       TEXT,
  language    TEXT DEFAULT 'en',  
  day         INTEGER DEFAULT 1,  
  status      TEXT DEFAULT 'open',
  created_at  INTEGER
);
CREATE TABLE IF NOT EXISTS participants (
  id          TEXT PRIMARY KEY,
  cohort_id   TEXT,
  rejoin_code TEXT,               
  handle      TEXT,               
  arm         TEXT,               
  flair       TEXT,               
  created_at  INTEGER
);
CREATE INDEX IF NOT EXISTS idx_participants_rejoin ON participants(cohort_id, rejoin_code);
CREATE TABLE IF NOT EXISTS sessions (
  id             TEXT PRIMARY KEY,
  participant_id TEXT,
  cohort_id      TEXT,
  day            INTEGER,         
  arm            TEXT,
  flair          TEXT,
  started_at     INTEGER,
  ended_at       INTEGER
);
CREATE INDEX IF NOT EXISTS idx_sessions_cohort ON sessions(cohort_id, day);
CREATE TABLE IF NOT EXISTS events (
  id          TEXT PRIMARY KEY,
  session_id  TEXT,
  cohort_id   TEXT,
  day         INTEGER,
  arm         TEXT,
  flair       TEXT,               
  author      TEXT,               
  type        TEXT,               
  text_raw    TEXT,
  toxicity    REAL,
  we          INTEGER,
  they        INTEGER,
  thread_id   TEXT,               
  created_at  INTEGER
);
CREATE INDEX IF NOT EXISTS idx_events_session ON events(session_id);
CREATE INDEX IF NOT EXISTS idx_events_feed ON events(cohort_id, arm, created_at);
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
  status         TEXT,            
  is_live_paired INTEGER DEFAULT 0,
  filler         INTEGER DEFAULT 0,
  artifact       TEXT,
  created_at     INTEGER,
  paired_at      INTEGER
);
CREATE INDEX IF NOT EXISTS idx_collabs_wait ON collabs(cohort_id, arm, status, a_flair);
CREATE TABLE IF NOT EXISTS poll_votes (
  id          TEXT PRIMARY KEY,
  session_id  TEXT,
  cohort_id   TEXT,
  day         INTEGER,
  option_idx  INTEGER,
  created_at  INTEGER
);
CREATE INDEX IF NOT EXISTS idx_poll_cohort ON poll_votes(cohort_id, day);
CREATE TABLE IF NOT EXISTS survey_responses (
  id           TEXT PRIMARY KEY,
  session_id   TEXT,
  phase        TEXT,
  instrument   TEXT,
  payload_json TEXT,
  created_at   INTEGER
);
