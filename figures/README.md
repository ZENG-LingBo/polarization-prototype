# Paper figures — the complete interaction

Three figures explaining the full interaction, built to CHI-figure conventions (numbered
stages, real content, actor color-coding **plus** text labels so identity is never
color-alone, ≥7 pt type at full-column width, self-contained captions, vector output).
Each figure ships as `svg` (source of truth), `pdf` (vector — use this in LaTeX), and
`png` (2× raster for slides/docs).

Include in LaTeX with, e.g.:
```latex
\begin{figure*}[t]
  \centering
  \includegraphics[width=\textwidth]{figures/fig1-interaction.pdf}
  \caption{...caption below...}
  \Description{...alt text below...}
  \label{fig:interaction}
\end{figure*}
```

---

## Figure 1 — `fig1-interaction` (the complete interaction; full-width teaser/walkthrough)

**Caption.**
*The complete interaction. (1) On Day 1, rival ARMY and BLINK members post in a plain
Reddit-style forum and hostility escalates (baseline toxicity 78/100 — requirement R1).
(2) On Day 2 a pinned Community Note appears in-feed: a task framed around K-pop as a
whole, telling participants only what to do. (3) A participant contributes, and the note
is held by a publication gate until (4) a member of the rival fandom completes it; the
merged playlist publishes co-credited under both fandom flairs and is shared as one joint
post. (5) Cross-fandom replies on the same thread turn warm, with rising "we/us" language.
(6) On Day 3 the feature is removed and the cooperative tone carries over (toxicity 8/100).
Bottom: end-of-day toxicity by arm in a demo run — the control arm, which receives an inert
solo poll instead, stays high (78→78→92), so the drop occurs only after the community note
(requirements R2, R3).*

**Alt text (`\Description`).**
Storyboard of six numbered stages across three days on a Reddit-style forum, showing posts
by ARMY and BLINK users. Day 1: two hostile posts with high measured toxicity. Day 2: a
pinned "Community Note" task card asks for one song from each fandom; a waiting state says
a fan from the other group must finish it; the published playlist card credits one ARMY and
one BLINK user, shared together with 231 upvotes. Warm replies follow. Day 3: with the
feature removed, a friendly post proposes a rematch playlist. A bar chart below shows
end-of-day toxicity: experiment arm 78, 6, 8; control arm 78, 78, 92; annotations mark
requirements R1–R3 as met.

---

## Figure 2 — `fig2-mechanism` (anatomy of the note, the LLM's role, and the evidence pair)

**Caption.**
*Why the Community Note depolarizes. Left: the note's anatomy — (A) a superordinate prompt
framed around K-pop as a whole, activating the shared category indirectly rather than
declaring it; (B) contributions keep their fandom flairs (dual identity); (C) a publication
gate that requires both fandoms (structural interdependence / common fate); (D) a jointly
credited, jointly shared artifact so public praise lands on a shared object; (E) no study
language anywhere participant-facing. Top right: the LLM is hidden, non-generative
infrastructure — it templates prompts, screens framing, routes cross-flair pairing, and
lays out contributions verbatim; it never poses as a fan, never rewrites user text, and is
disclosed as automated. Bottom right: the same two users one day apart — hostile exchanges
before co-authoring the note, warm exchanges after.*

**Alt text (`\Description`).**
Three-panel diagram. Left panel: a Community Note card annotated with five callouts A–E
mapping each interface element (prompt, flaired contribution slots, publication lock,
published playlist with both flairs, participant view) to a recategorization ingredient.
Top-right panel: a four-step pipeline — template bank, screen framing, pair across flairs,
verbatim layout — with checks and crosses listing what the LLM does and never does.
Bottom-right panel: quotes from the same ARMY and BLINK users, hostile on Day 1 (red)
and friendly on Day 2 after co-authoring the note (green).

---

## Figure 3 — `fig3-protocol` (study design)

**Caption.**
*Study protocol. Participants are recruited with a demographic pre-selection form outside
the app (no study-purpose disclosure anywhere) and randomly assigned to arms with matched
demographics; language cells run entirely in English or entirely in Chinese. Day 1: a
group session on the Reddit-style forum, identical in both arms, repeated with new prompts
until baseline toxicity is high (R1). Day 2: the experiment arm receives the Community
Note; the control arm receives an engagement-matched but inert, non-collaborative solo
feature (R2: control toxicity must stay high). Day 3: the feature is removed in both arms
to test carry-over (R3: the drop must appear only in the experiment arm). A short survey
follows every day; Day 3 adds a semi-structured exit interview. All posts are logged and
toxicity is scored per message.*

**Alt text (`\Description`).**
Vertical flow diagram. A recruitment box feeds a random-assignment box, which splits into
a blue Experiment arm (community note) and a green Control arm (inert solo poll). Both
arms pass through the same Day 1 baseline session with a repeat-until-high loop, Survey 1,
their respective Day 2 feature, Survey 2, a shared Day 3 session with the feature removed,
and Survey 3 plus an exit interview. Rotated margin labels mark requirements R1, R2 and R3.

---

### Regenerating the exports
The SVGs are the editable source. To re-export PNG (2×) and PDF after editing, render each
SVG in headless Chromium at its viewBox size (screenshot → png; print → pdf). The palette
uses the ARMY/BLINK brand-adjacent hues for actor chips (always paired with text labels)
and a colorblind-validated blue/green pair (#2a78d6 / #1baf7a, additionally distinguished
by fill vs. outline) for the Experiment/Control series.
