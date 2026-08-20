#!/usr/bin/env python3
"""Export the full study database as tab-separated text, minus participant message text.

    export RESEARCHER_TOKEN=...
    python3 analysis/export_no_text.py -o study_data.txt

Everything is included — participant ids, handles, arms, flairs, sessions, phases,
toxicity scores, we/they counts, thread ids, timestamps, collab metadata and all survey
responses — except the text participants wrote. Each withheld field is replaced by a
character count, so message length stays analysable.

Withheld:
  * events.text_raw where the author is a participant (post, comment, like, cross,
    share, note_published) -> events.text_chars
  * collabs.a_text / b_text (the note contributions) -> a_text_chars / b_text_chars
  * collabs.artifact — the published note. Despite the template headline it carries
    the merged participant contributions verbatim. -> artifact_chars

Kept:
  * seed prompt text (seed_mod_a / seed_mod_b) — researcher-written stimuli, not
    participant content
  * survey responses in full — every item is numeric, there are no free-text answers
  * survey_submitted events, whose text_raw is an instrument label ("survey1")

Output is TSV with one section per table, so it opens in Excel and greps cleanly.
"""
import argparse
import collections
import datetime
import json
import os
import sys
import urllib.request

DEFAULT_BASE = "https://kpop.lbzeng.com"
SEED_AUTHORS = ("seed_mod_a", "seed_mod_b")
# Types whose text_raw is, or quotes, something a participant wrote. A `like` stores
# "like:<the liked message>", so it carries the other participant's words too.
PARTICIPANT_TEXT_TYPES = ("post", "comment", "like", "cross", "note_published", "share")


def fetch(base, token):
    # Cloudflare 403s the default Python-urllib user agent before the request ever
    # reaches the Worker, so send a real one.
    req = urllib.request.Request(
        base.rstrip("/") + "/api/dashboard/sessions",
        headers={"authorization": "Bearer " + token,
                 "user-agent": "defuselab-analysis/1.0"},
    )
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.load(r)


def iso(ms):
    if ms in (None, ""):
        return ""
    return datetime.datetime.utcfromtimestamp(int(ms) / 1000).strftime("%Y-%m-%d %H:%M:%S")


def cell(v):
    """One TSV cell: no tabs or newlines may survive into the field."""
    if v is None:
        return ""
    return str(v).replace("\t", " ").replace("\r", " ").replace("\n", " ")


def section(out, title, note, cols, rows):
    out.append("")
    out.append("=" * 100)
    out.append(title)
    if note:
        out.append(note)
    out.append("=" * 100)
    out.append("\t".join(cols))
    for r in rows:
        out.append("\t".join(cell(x) for x in r))
    out.append(f"[{len(rows)} rows]")


def build(data):
    sess = {s["id"]: s for s in data["sessions"]}
    out = []

    # ------------------------------------------------------------------ header
    ev = data["events"]
    withheld = sum(1 for e in ev
                   if e["type"] in PARTICIPANT_TEXT_TYPES
                   and e.get("author") not in SEED_AUTHORS)
    out += [
        "DefuseLab / KFeed — study database export",
        f"Generated {datetime.datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC",
        "",
        "Participant-written message text is WITHHELD from this file.",
        f"  {withheld} event rows have text_raw removed; text_chars gives the length.",
        "  collabs.a_text / b_text / artifact removed; *_chars give the lengths.",
        "  Seed prompt text is kept — it is researcher-written stimulus, not participant text.",
        "  Survey responses are kept in full — every item is numeric.",
        "",
        "Timestamps are UTC. *_ms columns keep the original epoch milliseconds.",
        "Tab-separated. Empty cell = null.",
    ]

    counts = collections.Counter(
        (e["cohort_id"], e["day"]) for e in ev if e["type"] in ("post", "comment"))
    section(out, "COHORT SUMMARY", "message counts include seed posts", [
        "cohort_id", "day", "messages", "participants_posted"
    ], [
        [c, d, n, len({sess[e["session_id"]]["participant_id"]
                       for e in ev
                       if e["cohort_id"] == c and e["day"] == d
                       and e["type"] in ("post", "comment") and e["session_id"] in sess})]
        for (c, d), n in sorted(counts.items())
    ])

    # ------------------------------------------------------------ participants
    section(out, "PARTICIPANTS", "", [
        "participant_id", "cohort_id", "handle", "arm", "flair", "created_at", "created_at_ms"
    ], [
        [p["id"], p["cohort_id"], p["handle"], p["arm"], p["flair"],
         iso(p["created_at"]), p["created_at"]]
        for p in sorted(data["participants"], key=lambda p: (p["cohort_id"], p["created_at"]))
    ])

    # ---------------------------------------------------------------- sessions
    section(out, "SESSIONS", "one row per join; a reload mints a new session id", [
        "session_id", "participant_id", "cohort_id", "day", "arm", "flair",
        "started_at", "started_at_ms", "ended_at", "ended_at_ms"
    ], [
        [s["id"], s["participant_id"], s["cohort_id"], s["day"], s["arm"], s["flair"],
         iso(s["started_at"]), s["started_at"], iso(s["ended_at"]), s["ended_at"]]
        for s in sorted(data["sessions"], key=lambda s: (s["cohort_id"], s["started_at"]))
    ])

    # ------------------------------------------------------------------ events
    rows = []
    for e in sorted(ev, key=lambda e: (e["cohort_id"], e["created_at"])):
        is_seed = e.get("author") in SEED_AUTHORS
        raw = e.get("text_raw") or ""
        hide = e["type"] in PARTICIPANT_TEXT_TYPES and not is_seed
        rows.append([
            e["id"],
            e["session_id"] or "",
            sess[e["session_id"]]["participant_id"] if e["session_id"] in sess else "",
            e["cohort_id"], e["day"], e["arm"], e["flair"], e["author"], e["type"],
            e["phase"] or "",
            "seed" if is_seed else ("withheld" if hide else "kept"),
            len(raw),
            "" if hide else raw,
            e["toxicity"], e["we"], e["they"], e["thread_id"] or "",
            iso(e["created_at"]), e["created_at"],
        ])
    section(out, "EVENTS",
            "text_raw is blank where withheld=='withheld'; text_chars is the original length",
            ["event_id", "session_id", "participant_id", "cohort_id", "day", "arm",
             "flair", "author", "type", "phase", "text_status", "text_chars", "text_raw",
             "toxicity", "we", "they", "thread_id", "created_at", "created_at_ms"],
            rows)

    # ----------------------------------------------------------------- collabs
    # artifact is withheld too: the template headline is followed by the merged
    # participant contributions verbatim, so it is participant text.
    section(out, "COLLABS",
            "a_text / b_text / artifact withheld — all three carry participant writing",
            ["collab_id", "session_id", "participant_id", "b_session_id", "cohort_id",
             "day", "arm", "a_flair", "a_handle", "a_text_chars", "b_flair", "b_handle",
             "b_text_chars", "status", "is_live_paired", "filler", "ai_merged",
             "artifact_chars", "created_at", "created_at_ms", "paired_at", "paired_at_ms"],
            [[c["id"], c["session_id"] or "",
              sess[c["session_id"]]["participant_id"] if c["session_id"] in sess else "",
              c.get("b_session_id") or "", c["cohort_id"], c["day"], c["arm"],
              c["a_flair"], c["a_handle"], len(c.get("a_text") or ""),
              c["b_flair"], c["b_handle"], len(c.get("b_text") or ""),
              c["status"], c["is_live_paired"], c["filler"], c.get("ai_merged"),
              len(c.get("artifact") or ""), iso(c["created_at"]), c["created_at"],
              iso(c.get("paired_at")), c.get("paired_at") or ""]
             for c in sorted(data["collabs"], key=lambda c: (c["cohort_id"], c["created_at"]))])

    # ----------------------------------------------------------------- surveys
    payloads = [(s, json.loads(s["payload_json"])) for s in data["surveys"]]
    items = sorted({k for _, p in payloads for k in p})
    section(out, "SURVEYS",
            "wide format, one column per item id; all responses are numeric",
            ["survey_id", "session_id", "participant_id", "cohort_id", "day", "arm",
             "flair", "instrument", "phase", "created_at", "created_at_ms"] + items,
            [[s["id"], s["session_id"],
              sess[s["session_id"]]["participant_id"] if s["session_id"] in sess else "",
              sess[s["session_id"]]["cohort_id"] if s["session_id"] in sess else "",
              sess[s["session_id"]]["day"] if s["session_id"] in sess else "",
              sess[s["session_id"]]["arm"] if s["session_id"] in sess else "",
              sess[s["session_id"]]["flair"] if s["session_id"] in sess else "",
              s["instrument"], s["phase"] or "", iso(s["created_at"]), s["created_at"]]
             + [p.get(k, "") for k in items]
             for s, p in sorted(payloads, key=lambda sp: sp[0]["created_at"])])

    out.append("")
    return "\n".join(out) + "\n"


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("-o", "--out", default="study_data.txt")
    ap.add_argument("--base", default=DEFAULT_BASE)
    ap.add_argument("--input", help="use a saved JSON dump instead of fetching")
    args = ap.parse_args()

    if args.input:
        data = json.load(open(args.input))
    else:
        token = os.environ.get("RESEARCHER_TOKEN", "").strip()
        if not token:
            sys.exit("set RESEARCHER_TOKEN, or pass --input dump.json")
        data = fetch(args.base, token)

    text = build(data)
    with open(args.out, "w", encoding="utf-8") as f:
        f.write(text)
    print(f"wrote {args.out}  ({len(text.encode('utf-8')):,} bytes, "
          f"{text.count(chr(10)):,} lines)")


if __name__ == "__main__":
    main()
