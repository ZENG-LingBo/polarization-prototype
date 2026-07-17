# Paper figures — the complete interaction

**Each figure ships in two labeled variants** (same content, different density):

| Variant suffix | Style | Use for |
|---|---|---|
| `-detailed` | fuller text annotations | advisor review, appendix, anyone reading without the paper |
| `-diagram` | icon-driven, minimal text, day colors & 🔥/🧊 temperature glyphs | the paper body and slides |

Files: `fig1-interaction-{detailed,diagram}` · `fig2-mechanism-{detailed,diagram}` ·
`fig3-protocol-{detailed,diagram}`, each as `.png` (2×) + `.pdf` (vector). Editable sources:
`fig1-compose-detailed.html`, `fig1-compose-diagram.html`, `fig2-mechanism-detailed.svg`,
`fig2-compose-diagram.html`, `fig3-protocol-detailed.svg`, `fig3-protocol-diagram.svg`.
The captions below apply to both variants of each figure.

Three figures explaining the full interaction, built to CHI-figure conventions (numbered
stages, real content, actor color-coding **plus** text labels so identity is never
color-alone, ≥7 pt type at full-column width, self-contained captions, vector output).
Each figure ships as `svg` (source of truth), `pdf` (vector — use this in LaTeX), and
`png` (2× raster for slides/docs).

Include in LaTeX with, e.g.:
```latex
\begin{figure*}[t]
  \centering
  \includegraphics[width=\textwidth]{figures/fig1-interaction-diagram.pdf}
  \caption{...caption below...}
  \Description{...alt text below...}
  \label{fig:interaction}
\end{figure*}
```

---

## Figure 1 — `fig1-interaction` (the complete interaction; annotated prototype screenshots)

Built from **real screenshots of the working prototype** (`demo.html`, participant view),
arranged as six numbered steps with labeled callouts — the walkthrough style of the
`interaction_01`/`interaction_03` exemplars.

**Caption.**
*The complete interaction, shown as screenshots of the working prototype (participant
view). (1) Day 1, baseline: rival ARMY and BLINK members post in a plain Reddit-style
forum and hostility escalates in the replies; every post carries the poster's fandom
flair. (2) Day 2: a pinned Community Note appears in the normal feed — a task framed
around K-pop as a whole that tells participants only what to do. (3) A participant's post
fills their fandom's slot, and a publication gate holds the note while it waits for a fan
from the rival fandom. (4) When both sides are in, the playlist publishes co-credited
under both fandom flairs and is shared as one joint post, so upvotes land on a shared
object. (5) On the same thread, the tone flips: the same rivals praise each other's picks
and "we/us" language rises. (6) Day 3, feature removed: the cooperative tone carries over,
with fans proposing a rematch playlist on their own.*

**Alt text (`\Description`).**
Six annotated screenshots from a Reddit-style prototype, arranged in two rows with arrows
showing the interaction order. Step 1: a hostile thread between ARMY- and BLINK-flaired
users. Step 2: a pinned Community Note post asking for one song from each fandom, with two
empty contribution slots. Step 3: the ARMY slot is filled and the BLINK slot shows
"waiting for a fan from the other group to finish this with you." Step 4: the note shows
both slots filled and a published Community Playlist co-credited to one ARMY and one BLINK
user, with a shared upvote count. Step 5: warm replies in which the same rival users
praise each other's picks. Step 6: a Day-3 thread where fans propose a rematch playlist.
Dashed amber callout labels point at the flairs, the task framing, the slots, the
publication gate, the co-credit line, and the joint upvotes.

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
Flow diagram (the `-detailed` variant is vertical; the `-diagram` variant is a horizontal
icon swimlane with fire/ice glyphs for expected toxicity). A recruitment box feeds a
random-assignment box, which splits into
a blue Experiment arm (community note) and a green Control arm (inert solo poll). Both
arms pass through the same Day 1 baseline session with a repeat-until-high loop, Survey 1,
their respective Day 2 feature, Survey 2, a shared Day 3 session with the feature removed,
and Survey 3 plus an exit interview. Rotated margin labels mark requirements R1, R2 and R3.

---

### Regenerating the exports
- `tools/capture-steps.mjs` drives `demo.html` in headless Chromium and saves the six
  step screenshots to `shots/` (both Figure-1 variants and the fig2 diagram embed them).
  Re-run after any prototype UI change.
- `tools/compose-all.mjs` renders **all six outputs** (both variants of all three
  figures) from their sources to `.png` (2×) + `.pdf` in one command (needs
  `playwright-core`; run from a directory where it is installed).
- Palette: ARMY/BLINK brand-adjacent hues for actor chips (always paired with text
  labels); the Experiment/Control series in fig3 uses a colorblind-validated blue/green
  pair (#2a78d6 / #1baf7a), additionally distinguished by fill vs. outline.
