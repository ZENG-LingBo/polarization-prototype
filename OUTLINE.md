# Outline — K-pop toxicity / social-media-feature direction

> **Post-pivot draft.** Supersedes the Lakers/Celtics + embedded-agent version. The
> mechanism is now a single, generalizable **social-media feature** that activates a shared
> superordinate identity **indirectly** (rival fans co-create and co-share content, so they
> *enact* the common identity rather than being told it). The LLM is **hidden
> implementation**, disclosed as automated — there is no human-impersonating agent. Domain:
> **K-pop fandom toxicity** (a setting with genuinely harmful hostility). The conceptual
> spine — CIIM, dual identity, recategorization, the GuesSync anchor, the validated measures
> — carries over. See [`PLAN.md`](PLAN.md) (protocol) and [`MEASURES.md`](MEASURES.md).

---

## Purpose
Affective polarization — animosity toward an out-group rooted in social identity rather than
substantive disagreement [Tajfel & Turner 1979; Iyengar et al. 2019] — has become a defining
feature of online discourse, and is acutely visible in **online fan communities**, where
platform dynamics — including engagement-driven recommendation that can cluster users into
homogeneous spaces — may amplify intergroup friction, hardening shared devotion into
**sustained, toxic hostility** between rival fandoms. K-pop fandom "wars" are a stark case: rival fanbases direct real harassment,
slurs, and coordinated hostility at one another despite no substantive dispute. Because this
hostility is anchored in **group membership** rather than individual belief, it resists
conventional remedies: content moderation suppresses symptoms without touching the
"us-vs-them" categorization that produces them, and merely increasing exposure to the
opposing side can *entrench* rather than soften division [Bail et al. 2018]. Current
platforms offer no mechanism that engages polarization where it actually lives — at the
level of group identity itself.

## Research Gap
Two limitations leave this unaddressed. **First**, depolarization interventions — including
the most effective LLM-based ones — operate at the **individual or dyadic** level and target
individual cognition: one-on-one AI dialogue durably shifts *beliefs* [Costello, Pennycook &
Rand 2024], and dyadic AI chat assistants improve conversational *tone* without changing
attitudes [Argyle et al. 2023]; even AI that scales to groups acts as an *external mediator*
summarizing views toward consensus [Tessler et al. 2024], not as a means of reducing
identity-based animosity between groups. **Second**, the way these interventions try to shift
identity is mismatched to how identity works. Social Identity and Self-Categorization Theory
hold that out-group animosity follows from the **salience of group membership**, and that
identity is **activated by context and behavior, not by assertion** [Tajfel & Turner 1979;
Turner et al. 1987]. Yet existing approaches either **declare** a shared identity (telling
people "you are one group," which invites reactance) or route it through a **messenger** (an
AI agent or third-party mediator) that has no standing within the group. The psychological
lever for group-level animosity is **recategorization** under a shared *superordinate*
identity, which redirects in-group favoritism and reduces bias [Gaertner & Dovidio 2000] —
most safely as a **dual identity** that preserves the subgroup to avoid distinctiveness
threat [Crisp et al. 2006]. **No prior work operationalizes recategorization through a
generalizable *social-media feature* that activates the superordinate identity
*indirectly*** — by having rival members co-create and co-share content about the
superordinate category, so they *enact* the common identity rather than being told it.

## What We Do
Grounded in the Common In-group Identity Model, we (1) build a plain **K-pop social-media
platform** as a **toxicity testbed**, where rival-fandom users post, comment, like, and
share; (2) introduce a single, generalizable **social-media feature — the "Collab
Spotlight"** — a cross-fandom **co-creation / shared-share** unit that can only be completed
when members of two rival fandoms jointly produce and then co-share content framed around
**K-pop as a whole**, so the superordinate "K-pop fan" identity is **activated indirectly** —
cued contextually rather than predicated of the participant (the LLM that templates prompts,
routes pairing, and assembles contributions *verbatim* is hidden, non-generative
implementation, openly disclosed as automated — **no agent, no human impersonation, and no
rewriting of user text**); and
(3) in a controlled comparison **with vs. without the feature**, measure **toxicity** as the
primary outcome (Perspective API + incivility coding) alongside **affective polarization**
(feeling-thermometer difference, social distance) and its hypothesized **mechanism**
(common-in-group-identity representation), plus cross-fandom engagement and a reactance
guardrail.

**RQ1.** In a plain K-pop social platform, what is the nature and level of toxicity /
incivility in rival-fandom interaction (the control baseline)?

**RQ2.** Does a cross-fandom co-creation / shared-share feature that *indirectly* activates
the superordinate "K-pop fan" identity reduce toxicity and affective polarization between
rival fandoms, and is the effect linked to an increased common-in-group representation,
without eroding subgroup identification?

## Contribution
We extend depolarization interventions from the **individual to the group level** within a
social-media environment, and from a **messenger** (persuasion by an agent or mediator) to a
**generalizable social-media feature** that operationalizes the Common In-group Identity
Model through **indirect, *enacted* recategorization** — rival members co-create and
co-share, and the shared identity follows from what they do rather than from anything they
are told. The LLM is **implementation, not interlocutor** (no agents, no deception), and we
validate the feature against **real, measurable toxicity** in a K-pop testbed, with the
mechanic defined abstractly so it is a *candidate* to transfer to other polarized groups. We
**test that boundary directly**: a primary study in a clean identity testbed (K-pop), then an
adversarial **boundary-condition study in political polarization** (abortion / trans rights),
where we expect the mechanism to weaken or backfire because no non-contested superordinate
exists — turning *generalizability* from an asserted property into a **tested scope condition**
(indirect recategorization needs a non-contested superordinate, and a common-fate rather than
co-create mechanism, to have any chance in politics).

---

## Paste-ready Related Work §2.3 (intervention agents → intervention *features*)
> LLMs can intervene within a conversation: one-on-one dialogue durably reduces belief in
> conspiracy theories [Costello, Pennycook & Rand 2024], and real-time chat assistants
> improve the tone of contentious political conversations without shifting attitudes [Argyle
> et al. 2023]; AI that scales to group deliberation positions the system as a neutral
> mediator summarizing competing views toward consensus [Tessler et al. 2024]. **Limitation
> 1 — level.** These interventions operate at the individual or dyadic level, treating
> depolarization as changing what a single person thinks; they move belief or tone while
> leaving the group relationship untouched — exactly as expected if animosity is rooted in
> group identity rather than individual belief. **Limitation 2 — assertion vs. activation.**
> They either route the intervention through a *messenger* (an AI or third-party mediator
> with no in-group standing) or *declare* a shared identity, whereas identity is activated by
> behavior and context, not assertion [Turner et al. 1987]. We instead deliver
> recategorization through a **social-media feature** that makes rival members co-create and
> co-share content about the superordinate category, activating the common identity
> *indirectly* — no messenger, no declaration, and no human-impersonating agent.

## References (verified)
- Argyle, L. P., Busby, E. C., Bail, C. A., Gubler, J. R., Howe, T., Rytting, C., Sorensen,
  T., & Wingate, D. (2023). Leveraging artificial intelligence for democratic discourse:
  Chat interventions can improve online political conversations at scale. *PNAS*, 120(41),
  e2311627120.
- Bail, C. A., et al. (2018). Exposure to opposing views on social media can increase
  political polarization. *PNAS*, 115(37), 9216–9221.
- Costello, T. H., Pennycook, G., & Rand, D. G. (2024). Durably reducing conspiracy beliefs
  through dialogues with AI. *Science*, 385(6714), eadq1814.
- Crisp, R. J., Stone, C. H., & Hall, N. R. (2006). Recategorization and subgroup
  identification: Predicting and preventing threats from common ingroups. *Pers. Soc.
  Psychol. Bull.*, 32(2), 230–243.
- Gaertner, S. L., & Dovidio, J. F. (2000). *Reducing Intergroup Bias: The Common Ingroup
  Identity Model.* Psychology Press.
- Iyengar, S., Lelkes, Y., Levendusky, M., Malhotra, N., & Westwood, S. J. (2019). The
  origins and consequences of affective polarization in the United States. *Annual Review of
  Political Science*, 22, 129–146.
- Postmes, T., Haslam, S. A., & Jans, L. (2013). A single-item measure of social
  identification: Reliability, validity, and utility. *British Journal of Social
  Psychology*, 52(4), 597–617.
- Rajadesingan, A., Choo, D., Zhang, J., Inakage, M., Budak, C., & Resnick, P. (2023).
  GuesSync!: An online casual game to reduce affective polarization. *Proc. ACM Hum.-Comput.
  Interact.*, 7(CSCW2), Article 341. https://doi.org/10.1145/3610190
- Tajfel, H., & Turner, J. C. (1979). An integrative theory of intergroup conflict. In *The
  Social Psychology of Intergroup Relations*.
- Tessler, M. H., et al. (2024). AI can help humans find common ground in democratic
  deliberation. *Science*, 386(6719), eadq2852.
- Turner, J. C., Hogg, M. A., Oakes, P. J., Reicher, S. D., & Wetherell, M. S. (1987).
  *Rediscovering the Social Group: A Self-Categorization Theory.*
