#!/usr/bin/env python3
"""Pull the study database and run the Day-1 analysis.

    export RESEARCHER_TOKEN=...           # never hardcode it
    python3 analysis/analyze_pilot.py --cohort AUG16
    python3 analysis/analyze_pilot.py --cohort AUG16 --json out.json

Reads GET /api/dashboard/sessions (the same export the dashboard's "Export JSON"
button produces) and reports the free-vs-task contrast plus the robustness checks
that decide whether that contrast means anything.

The confirmatory contrast is phase (free vs task) within Day 1. Everything under
"exploratory" is cut after seeing the data and must be reported as descriptive.

Requires numpy + scipy:  python3 -m pip install numpy scipy
"""
import argparse
import collections
import datetime
import json
import os
import sys
import urllib.request

import numpy as np
from scipy import stats

DEFAULT_BASE = "https://kpop.lbzeng.com"
SEED_AUTHORS = ("seed_mod_a", "seed_mod_b")


# --------------------------------------------------------------------------- io
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


def load(args):
    if args.input:
        return json.load(open(args.input))
    token = os.environ.get("RESEARCHER_TOKEN", "").strip()
    if not token:
        sys.exit("set RESEARCHER_TOKEN (the Worker secret), or pass --input dump.json")
    return fetch(args.base, token)


def hhmm(ms):
    return datetime.datetime.utcfromtimestamp(ms / 1000).strftime("%H:%M")


def rule(title):
    print("\n" + "=" * 78)
    print(title)
    print("=" * 78)


# ----------------------------------------------------------------------- shaping
def messages(data, cohort):
    """Real participant posts/comments — seeds and reactions excluded."""
    sess = {s["id"]: s for s in data["sessions"]}
    out = []
    for e in data["events"]:
        if e["cohort_id"] != cohort or e["type"] not in ("post", "comment"):
            continue
        if not e["session_id"] or e["author"] in SEED_AUTHORS:
            continue
        s = sess.get(e["session_id"])
        if not s:
            continue
        out.append({
            **e,
            "pid": s["participant_id"],
            "tox": float(e["toxicity"] or 0),
            "post": 1 if e["phase"] == "task" else 0,
        })
    out.sort(key=lambda m: m["created_at"])
    return out


# ------------------------------------------------------------------- clustering
def cluster_ols(msgs, cols):
    """OLS with CR1 cluster-robust SEs, clustered on participant.

    With single-digit cluster counts this is anti-conservative; the p-values are
    reported as description, not inference.
    """
    y = np.array([m["tox"] for m in msgs])
    X = np.column_stack([np.ones(len(msgs))] + [c(msgs) for _, c in cols])
    beta, *_ = np.linalg.lstsq(X, y, rcond=None)
    resid = y - X @ beta
    n, k = X.shape
    pids = sorted({m["pid"] for m in msgs})
    XtX_inv = np.linalg.inv(X.T @ X)
    meat = np.zeros((k, k))
    for p in pids:
        idx = [i for i, m in enumerate(msgs) if m["pid"] == p]
        s = X[idx].T @ resid[idx]
        meat += np.outer(s, s)
    G = len(pids)
    adj = (G / (G - 1)) * ((n - 1) / (n - k))
    se = np.sqrt(np.diag(XtX_inv @ (adj * meat) @ XtX_inv))
    names = ["intercept"] + [nm for nm, _ in cols]
    for i, nm in enumerate(names):
        t = beta[i] / se[i]
        p = 2 * (1 - stats.t.cdf(abs(t), G - 1))
        print(f"    {nm:<14} b={beta[i]:+.5f}  se={se[i]:.5f}  t={t:+.3f}  p={p:.4f}")
    print(f"  {G} participant clusters, {n} messages.")


def perm_within_participant(msgs, iters, seed):
    """Shuffle phase labels within each participant, preserving each one's mix."""
    rng = np.random.default_rng(seed)
    free = [m["tox"] for m in msgs if not m["post"]]
    task = [m["tox"] for m in msgs if m["post"]]
    obs = np.mean(free) - np.mean(task)
    pool = collections.defaultdict(list)
    for m in msgs:
        pool[m["pid"]].append(m)
    null = np.empty(iters)
    for i in range(iters):
        f, t = [], []
        for ms in pool.values():
            nf = sum(1 for m in ms if not m["post"])
            for j, k in enumerate(rng.permutation(len(ms))):
                (f if j < nf else t).append(ms[k]["tox"])
        null[i] = np.mean(f) - np.mean(t) if f and t else 0.0
    return obs, (np.sum(np.abs(null) >= abs(obs)) + 1) / (iters + 1)


# -------------------------------------------------------------------- reporting
def report(data, cohort, iters, seed):
    msgs = messages(data, cohort)
    if not msgs:
        sys.exit(f"no participant messages for cohort {cohort}")
    free = [m for m in msgs if not m["post"]]
    task = [m for m in msgs if m["post"]]

    rule(f"COHORT {cohort} — what is in the database")
    days = sorted({e["day"] for e in data["events"] if e["cohort_id"] == cohort})
    arms = sorted({str(m["arm"]) for m in msgs})
    regd = [p for p in data["participants"] if p["cohort_id"] == cohort]
    sess = {s["id"]: s for s in data["sessions"]}
    surv = [s for s in data["surveys"]
            if sess.get(s["session_id"], {}).get("cohort_id") == cohort]
    cols = [c for c in data["collabs"] if c["cohort_id"] == cohort]
    print(f"  days present ............. {days}")
    print(f"  arms among real messages . {arms}")
    print(f"  registered participants .. {len(regd)}")
    print(f"  participants who posted .. {len({m['pid'] for m in msgs})}")
    print(f"  participant messages ..... {len(msgs)}  (free {len(free)} / task {len(task)})")
    print(f"  surveys .................. {collections.Counter(s['instrument'] for s in surv)}")
    print(f"  collabs .................. {len(cols)} total, "
          f"{sum(1 for c in cols if c['is_live_paired'])} live-paired, "
          f"{sum(1 for c in cols if c['filler'])} filler")

    if not (free and task):
        print("\n  Only one phase present — the free-vs-task contrast needs both.")
        return

    # ------------------------------------------------------------ confirmatory
    rule("CONFIRMATORY — toxicity by phase, within Day 1")
    for nm, g in (("free", free), ("task", task)):
        t = [m["tox"] for m in g]
        print(f"  {nm:<5} n={len(t):>3}  mean={np.mean(t):.4f}  sd={np.std(t, ddof=1):.4f}  "
              f"{hhmm(g[0]['created_at'])}–{hhmm(g[-1]['created_at'])}")

    byp = collections.defaultdict(lambda: {"free": [], "task": []})
    for m in msgs:
        byp[m["pid"]]["task" if m["post"] else "free"].append(m["tox"])
    both = {p: v for p, v in byp.items() if v["free"] and v["task"]}
    print(f"\n  participants contributing to BOTH phases: {len(both)} of {len(byp)}")
    if len(both) >= 3:
        a = np.array([np.mean(v["free"]) for v in both.values()])
        b = np.array([np.mean(v["task"]) for v in both.values()])
        w = stats.wilcoxon(a, b)
        t = stats.ttest_rel(a, b)
        print(f"  participant means  free={a.mean():.4f}  task={b.mean():.4f}  "
              f"delta={np.mean(a - b):+.4f}")
        print(f"  Wilcoxon  W={w.statistic:.1f}  p={w.pvalue:.4f}")
        print(f"  paired t  t({len(a) - 1})={t.statistic:.3f}  p={t.pvalue:.4f}  "
              f"dz={np.mean(a - b) / np.std(a - b, ddof=1):.3f}")
    obs, p = perm_within_participant(msgs, iters, seed)
    print(f"  within-participant permutation ({iters:,})  diff={obs:+.4f}  p={p:.4f}")

    # -------------------------------------------------------------- confounds
    rule("CONFOUND — phase vs the passage of time")
    t0 = msgs[0]["created_at"]
    for m in msgs:
        m["min"] = (m["created_at"] - t0) / 60000.0
    print(f"  last free message  {hhmm(free[-1]['created_at'])}")
    print(f"  first task message {hhmm(task[0]['created_at'])}")
    print("  Phase flips at one instant and no arm is un-treated at that instant,")
    print("  so 'the notes' and 'an hour passed' are not separately identified.\n")

    sl = stats.linregress([m["min"] for m in free], [m["tox"] for m in free])
    print(f"  free-phase trend  slope={sl.slope:+.5f}/min  p={sl.pvalue:.4f}  r={sl.rvalue:.3f}"
          f"  ({'rising' if sl.slope > 0 else 'falling'})")
    pred = sl.intercept + sl.slope * float(np.mean([m["min"] for m in task]))
    print(f"  extrapolated into the task window: {pred:.4f} predicted vs "
          f"{np.mean([m['tox'] for m in task]):.4f} observed "
          f"({np.mean([m['tox'] for m in task]) - pred:+.4f})")

    print("\n  phase effect adjusted for a linear time trend:")
    cluster_ols(msgs, [("minutes", lambda ms: np.array([m["min"] for m in ms])),
                       ("phase(task)", lambda ms: np.array([m["post"] for m in ms]))])

    # ------------------------------------------------------------- attrition
    rule("ATTRITION — did the calm participants simply stop posting?")
    stayed = [p for p, v in byp.items() if v["free"] and v["task"]]
    leftt = [p for p, v in byp.items() if v["free"] and not v["task"]]
    sf = np.mean([t for p in stayed for t in byp[p]["free"]])
    lf = np.mean([t for p in leftt for t in byp[p]["free"]]) if leftt else float("nan")
    print(f"  posted in both phases  {len(stayed):>2}   free-phase mean {sf:.4f}")
    print(f"  posted in free only    {len(leftt):>2}   free-phase mean {lf:.4f}")
    if leftt:
        d = "against" if lf < sf else "toward"
        print(f"  Leavers were {'less' if lf < sf else 'more'} toxic, so attrition pushes "
              f"the task mean {'up' if lf < sf else 'down'} — {d} the observed drop.")

    rule("LEAVE-ONE-PARTICIPANT-OUT")
    print(f"  {'dropped':<16} {'free':>7} {'task':>7} {'delta':>8}")
    print(f"  {'(none)':<16} {np.mean([m['tox'] for m in free]):>7.4f} "
          f"{np.mean([m['tox'] for m in task]):>7.4f} "
          f"{np.mean([m['tox'] for m in free]) - np.mean([m['tox'] for m in task]):>+8.4f}")
    for p in sorted({m["pid"] for m in msgs}):
        f = [m["tox"] for m in free if m["pid"] != p]
        t = [m["tox"] for m in task if m["pid"] != p]
        if f and t:
            print(f"  {p[:14]:<16} {np.mean(f):>7.4f} {np.mean(t):>7.4f} "
                  f"{np.mean(f) - np.mean(t):>+8.4f}")

    # ------------------------------------------------------------- exploratory
    rule("EXPLORATORY — time course and checkpoints (cut after seeing the data)")
    bins = collections.defaultdict(list)
    for m in msgs:
        bins[int(m["min"] // 10)].append(m)
    print(f"  {'window':<14} {'n':>4} {'mean':>8} {'nPart':>6}  phase")
    for k in sorted(bins):
        g = bins[k]
        t = [m["tox"] for m in g]
        ph = collections.Counter(m["phase"] for m in g).most_common(1)[0][0]
        print(f"  {hhmm(g[0]['created_at'])}–{hhmm(g[-1]['created_at'])} {len(g):>4} "
              f"{np.mean(t):>8.4f} {len({m['pid'] for m in g}):>6}  {ph:<5} "
              f"{'#' * int(round(np.mean(t) * 40))}")

    notes = sorted(e["created_at"] for e in data["events"]
                   if e["cohort_id"] == cohort and e["type"] == "note_published")
    if notes:
        print(f"\n  notes published: {', '.join(hhmm(t) for t in notes)}")
        after = [m for m in msgs if m["created_at"] >= notes[-1]]
        before = [m for m in msgs if m["created_at"] < notes[0]]
        for nm, g in (("before first note", before), ("after last note", after)):
            if g:
                print(f"  {nm:<20} n={len(g):>3}  mean={np.mean([m['tox'] for m in g]):.4f}")

    # ---------------------------------------------------------------- we/they
    rule("SECONDARY — we/they language")
    for nm, g in (("free", free), ("task", task)):
        we = sum(m["we"] or 0 for m in g)
        th = sum(m["they"] or 0 for m in g)
        print(f"  {nm:<5} n={len(g):>3}  we={we:>3} ({we / len(g):.2f}/msg)  "
              f"they={th:>3} ({th / len(g):.2f}/msg)  "
              f"they-share={th / max(1, we + th):.3f}")

    # ----------------------------------------------------------------- surveys
    if surv:
        rule("SURVEYS — attitudes at end of Day 1")
        pl = [json.loads(s["payload_json"]) for s in surv]
        keys = sorted({k for p in pl for k in p})
        for pref, label in (("s1_legit", "note seen as legitimate"),
                            ("s1_react", "reactance (high = resisted)"),
                            ("s1_simil", "outgroup similarity"),
                            ("s1_ipt", "perspective-taking"),
                            ("s1_sess", "session felt heated/attacked")):
            ks = [k for k in keys if k.startswith(pref)]
            v = [float(p[k]) for p in pl for k in ks if k in p]
            if v:
                print(f"  {label:<32} {np.mean(v):.2f} / 5   (n={len(surv)})")
        for a, b in (("s1_therm_own", "s1_therm_rival"),):
            if a in keys and b in keys:
                o = np.mean([float(p[a]) for p in pl if a in p])
                r = np.mean([float(p[b]) for p in pl if b in p])
                print(f"  {'thermometer own / rival / gap':<32} {o:.0f} / {r:.0f} / {o - r:.0f}")

    # ----------------------------------------------------------------- network
    rule("NETWORK — who replies to whom")
    ev = {e["id"]: e for e in data["events"]}
    sess_all = {s["id"]: s for s in data["sessions"]}

    def flair_of(e):
        s = sess_all.get(e.get("session_id"))
        return s["flair"] if s else "SEED"

    def pid_of(e):
        s = sess_all.get(e.get("session_id"))
        return s["participant_id"] if s else None

    edges, dyads, root = collections.Counter(), collections.Counter(), 0
    edge_tox = collections.defaultdict(list)
    for m in msgs:
        parent = ev.get(m["thread_id"]) if m["thread_id"] else None
        if not parent:
            root += 1
            continue
        pf = flair_of(parent)
        edges[(m["flair"], pf)] += 1
        if pf in ("ARMY", "BLINK"):
            edge_tox["cross" if pf != m["flair"] else "within"].append(m["tox"])
        pp = pid_of(parent)
        if pp:
            dyads[(m["pid"], pp)] += 1
    cross, within = len(edge_tox["cross"]), len(edge_tox["within"])
    tot_e = cross + within
    print(f"  resolvable reply edges {tot_e}  (root/seed replies {root})")
    if tot_e:
        print(f"  cross-fandom  {cross:>3}  ({100 * cross / tot_e:.0f}%)  "
              f"mean tox {np.mean(edge_tox['cross']):.4f}")
        print(f"  within-fandom {within:>3}  ({100 * within / tot_e:.0f}%)  "
              f"mean tox {np.mean(edge_tox['within']):.4f}")
    print(f"  distinct directed dyads {len(dyads)}, {sum(dyads.values())} replies")
    if dyads:
        top = dyads.most_common(5)
        print("  busiest dyads (replier -> target):")
        for (a, b), n in top:
            print(f"    {a[:12]:<13} -> {b[:12]:<13} {n:>3}  "
                  f"({100 * n / sum(dyads.values()):.0f}% of replies)")
        pair = collections.Counter()
        for (a, b), n in dyads.items():
            pair[tuple(sorted((a, b)))] += n
        (x, y), n = pair.most_common(1)[0]
        print(f"  busiest undirected pair: {x[:12]} <-> {y[:12]}  {n} replies "
              f"({100 * n / sum(dyads.values()):.0f}% of all replies)")

    # -------------------------------------------------------------- resolution
    rule("MEASUREMENT — scorer resolution")
    c = collections.Counter(m["tox"] for m in msgs)
    tot = sum(c.values())
    for v, n in sorted(c.items()):
        print(f"  {v:<5} {n:>4}  {100 * n / tot:>5.1f}%  {'#' * int(50 * n / tot)}")
    top, ntop = c.most_common(1)[0]
    print(f"  {len(c)} distinct values; modal score {top} covers {100 * ntop / tot:.0f}% "
          f"of messages.")


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--cohort", default="AUG16")
    ap.add_argument("--base", default=DEFAULT_BASE)
    ap.add_argument("--input", help="analyse a saved dump instead of fetching")
    ap.add_argument("--json", help="write the raw dump here after fetching")
    ap.add_argument("--iters", type=int, default=20000)
    ap.add_argument("--seed", type=int, default=20260816)
    args = ap.parse_args()

    data = load(args)
    if args.json:
        json.dump(data, open(args.json, "w"), ensure_ascii=False)
        print(f"raw dump written to {args.json}")
    report(data, args.cohort, args.iters, args.seed)


if __name__ == "__main__":
    main()
