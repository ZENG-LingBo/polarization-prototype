# Paper edits — reconciling the draft with LLM-merged notes

The decision is to **keep the LLM merge**: the published Community Note is composed by the
model from both fans' contributions, not concatenated verbatim. The implementation has always
worked this way (`llmMerge` in [`backend/worker.js`](backend/worker.js)); the draft
`sns25_polarization_defusing_chi27` says the opposite in four places, so the paper is what
changes.

These are ready-to-paste replacements. **They change what the paper claims the system does,
so Ray should sign off before they go in.**

---

## 1 · §1 Introduction

**Current**

> A pinned prompt offers one slot per group; the note publishes only when both sides have
> written their part, *each entry verbatim under its author's badge*. Neither side can
> complete a note alone, and neither has to stop being itself. The LLM behind the feature
> stays out of sight: it monitors the discussion and publishes the finished note.

**Replace with**

> A pinned prompt offers one slot per group; the note publishes only when both sides have
> written their part, and the published note carries both fandoms' badges. Neither side can
> complete a note alone, and neither has to stop being itself. The LLM behind the feature
> stays out of sight: it monitors the discussion and composes the two contributions into the
> note it publishes. It never joins the conversation and never addresses participants.

---

## 2 · §3, condition (1) Community Notes treatment

**Current**

> The note published only when both sides had written their part, *each entry preserved
> verbatim under its author's badge*.

**Replace with**

> The note published only when both sides had written their part; the system then composed
> the two contributions into a single note carrying both fandoms' badges. Participants were
> told at onboarding that publication is automatic.

---

## 3 · §3.1, third interface rule

This is the load-bearing one — it is the bullet that carries requirement 3 from §2.2, and it
currently rests on the verbatim property. The replacement re-makes the argument on the parts
that remain true.

**Current**

> **Nothing is said about shared identity.** Prompts address K-pop fans at large, but no
> instruction tells participants to identify as one group, and *entries are published verbatim
> rather than merged*.

**Replace with**

> **Nothing is said about shared identity.** Prompts address K-pop fans at large, and no
> instruction tells participants to identify as one group. The published note carries both
> fandoms' badges rather than dissolving them into an unmarked whole, so the subgroups remain
> visible in the artifact the participants produce together — the dual identity the design
> requires is preserved in what is published, not asserted to anyone.

---

## 4 · §3.2 Configuring the backstage LLM

**Current**

> Second, it publishes the Community Note: once both fandom slots are filled, it verifies that
> the note contains one entry per fandom and *assembles the two entries verbatim into the
> pinned format. The model does not write or rewrite anyone's words*, does not converse with
> participants, and claims no identity.

**Replace with**

> Second, it publishes the Community Note: once both fandom slots are filled, it verifies that
> the note contains one entry per fandom and composes the two contributions into a single
> published note carrying both badges. The model therefore authors the wording of the
> artifact, drawing only on what the two participants wrote; it introduces no content of its
> own, does not converse with participants, does not address them, and claims no identity.
> Participants are told at onboarding, and again at debrief, that the published note is
> composed automatically from both entries.

---

## 5 · One paragraph to add (§3.5 Measures, or §3.2)

The merge has to be visibly quarantined from the outcome, or a reviewer will assume it
contaminates it:

> Because the model composes the published note, note text is excluded from the dependent
> variable: toxicity is scored only on participants' own posts and replies, and published
> notes are stored under a separate type that no toxicity aggregate reads. The intervention is
> accordingly the bundle of *structural cross-fandom pairing and automatic synthesis*, and we
> do not attribute the effect to either component alone; isolating them requires a further
> condition and is left to future work. When the language model is unavailable the system
> falls back to a mechanical assembly of the two entries, which is recorded per note, and a
> per-protocol analysis excludes the affected sessions.

---

## What does **not** need changing

**§2.3 survives as written.** It already says the LLM "shapes when cooperation becomes
possible and *how a joint product takes form*", and that "what participants encounter,
throughout, is each other". Both remain true with merging: the model composes the artifact but
never enters the discussion. The distinction from prior work — where the LLM holds a seat in
the conversation and users are acted upon by the machine — is unaffected.

**§2.2's three requirements survive**, but requirement 3 is now carried by the badges and the
absence of any identity instruction (edit 3 above), not by verbatim publication.

## Honest cost, for the limitations section

The strongest version of the reviewer's objection is: *the co-created artifact was written by
a model, so what was jointly produced?* The answer the paper can defend is that the
interdependence is structural and real — neither side can publish alone, each contributes
content the other cannot supply, and both are credited — while the synthesis is a presentation
step applied to their contributions. What the paper cannot claim is that participants co-wrote
the published sentence. Say so plainly rather than letting a reviewer discover it.

The micro-check gives empirical purchase on exactly this: M3 asks how much the published note
feels like it belongs to the participant and someone else *equally*. If synthesis erased their
voice, M3 will show it.
