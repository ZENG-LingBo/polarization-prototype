# Outline — strengthened draft

Builds on the **6.19 outline** (which fixed Ray's June 11 comments ② and ①). This
version closes the two that 6.19 left open:

- **③ "describe the psychology concept"** → the Research Gap now *states the
  mechanism* (Social Identity Theory → Common In-group Identity Model →
  dual identity → in-group-messenger legitimacy), instead of resting novelty on
  "no prior work."
- **④ "clarify the specific setup"** → What We Do now names the case
  (Lakers vs. Celtics), what the agents concretely do, the conditions, and the
  validated measures.
- **① citations** → swaps the unverifiable "Walter" for **Argyle et al. 2023**
  and adds **Tessler et al. 2024** distinguished as an *outsider mediator*.

Purpose is carried over from 6.19 essentially unchanged (it was already good).

---

## Purpose
Affective polarization — animosity toward an out-group rooted in social identity
rather than substantive disagreement [Tajfel & Turner 1979; Iyengar et al. 2019] —
has become a defining feature of online discourse, and is increasingly visible in
online fan communities, where recommendation algorithms sort users into
homogeneous clusters and amplify intergroup friction, hardening shared devotion
into sustained hostility between rival fandoms. Because this hostility is anchored
in **group membership** rather than individual belief, it resists conventional
remedies: content moderation suppresses symptoms without touching the "us-vs-them"
categorization that produces them, and merely increasing exposure to the opposing
side can *entrench* rather than soften division [Bail et al. 2018]. Current
platforms offer no mechanism that engages polarization where it actually lives —
at the level of group identity itself.

## Research Gap
Two limitations leave this unaddressed. **First**, depolarization interventions —
including the most effective LLM-based ones — operate at the individual or dyadic
level and target individual cognition: one-on-one AI dialogue durably shifts
*beliefs* [Costello, Pennycook & Rand 2024], and dyadic AI chat assistants improve
conversational *tone* without changing attitudes [Argyle et al. 2023]; even AI that
scales to groups acts as an *external mediator* summarizing views toward consensus
[Tessler et al. 2024], not as a member reducing identity-based animosity.
**Second**, this individual/outsider framing is mismatched to the phenomenon.
Social Identity and Self-Categorization Theory hold that out-group animosity
follows from the salience of group membership, not private belief [Tajfel & Turner
1979; Turner et al. 1987] — so changing what one person thinks leaves the group
boundary, and the animosity it carries, intact. The psychological lever for
group-level animosity is **recategorization**: the Common In-group Identity Model
shows that bringing rival groups under a shared *superordinate* identity redirects
in-group favoritism and reduces bias [Gaertner & Dovidio 2000], most safely as a
**dual identity** that preserves the original group to avoid distinctiveness threat
[Crisp et al. 2006]. Critically, group norms can be redrawn only by recognized
**in-group members**; an outsider lacks the standing to recategorize and risks
reactance [Turner et al. 1987]. No prior work operationalizes
recategorization-*from-within* — embedded in-group agents introducing a
superordinate identity — to reduce affective polarization at the group level on a
social media platform.

## What We Do
Grounded in the Common In-group Identity Model, we (1) build a simulated
**Reddit-like platform** instantiating a *pure identity rivalry with no
substantive dispute* — **Lakers vs. Celtics** fans in an r/NBA-style thread — so
that any animosity is identity-driven; (2) embed **LLM agents as undisclosed
in-group members** of each fandom that introduce a superordinate "NBA fans"
identity from within, using structural low-reactance moves (seeding a shared
cooperative task, modeling a dual "team-fan-*and*-NBA-fan" identity,
acknowledge-then-redirect rather than argument); and (3) in a controlled
comparison **with vs. without agents**, measure **affective polarization** with
validated instruments (feeling-thermometer in-group/out-group difference, social
distance, IOS) and its hypothesized **mechanism** (common-in-group-identity
representation), alongside behavioral **cross-group engagement** and toxicity from
platform logs.

**RQ1.** How do participants in polarized fan groups interact with the embedded
in-group agents on the simulated platform?

**RQ2.** How do embedded in-group agents affect interaction patterns and
group-level affective polarization between opposing fan groups?

## Contribution
We extend depolarization interventions from the **individual to the group level**
within a social media environment, and from **outsider persuasion to in-group
recategorization** — operationalizing the Common In-group Identity Model through
embedded agents, and testing whether group-level affective polarization can be
reduced at a level that individual-belief interventions leave untouched.

---

## Paste-ready Related Work §2.3 (LLM agents as intervention agents)

> LLMs can intervene within a conversation: one-on-one dialogue durably reduces
> belief in conspiracy theories [Costello, Pennycook & Rand 2024], and real-time
> chat assistants improve the tone and perceived quality of contentious political
> conversations without shifting attitudes [Argyle et al. 2023]. **Limitation 1 —
> level.** These interventions operate at the individual or dyadic level, treating
> depolarization as changing what a single person thinks; tellingly, they move
> belief or tone while leaving the group relationship untouched — exactly as
> expected if animosity is rooted in group identity rather than individual belief.
> Even AI that scales to group deliberation positions the system as a neutral
> mediator summarizing competing views toward consensus [Tessler et al. 2024].
> **Limitation 2 — standing.** The agent is an *outsider* (an explicit AI or
> third-party mediator) and so cannot redefine who counts as "us." We instead
> embed multiple agents as *in-group members* and intervene at the level of group
> identity, introducing a superordinate identity from within — since group norms
> can be reshaped only by those recognized as members.

## References (verified)

- Argyle, L. P., Busby, E. C., Bail, C. A., Gubler, J. R., Howe, T., Rytting, C.,
  Sorensen, T., & Wingate, D. (2023). Leveraging artificial intelligence for
  democratic discourse: Chat interventions can improve online political
  conversations at scale. *PNAS*, 120(41), e2311627120.
- Bail, C. A., et al. (2018). Exposure to opposing views on social media can
  increase political polarization. *PNAS*, 115(37), 9216–9221.
- Costello, T. H., Pennycook, G., & Rand, D. G. (2024). Durably reducing
  conspiracy beliefs through dialogues with AI. *Science*, 385(6714), eadq1814.
- Crisp, R. J., Stone, C. H., & Hall, N. R. (2006). Recategorization and subgroup
  identification: Predicting and preventing threats from common ingroups. *Pers.
  Soc. Psychol. Bull.*, 32(2), 230–243.
- Gaertner, S. L., & Dovidio, J. F. (2000). *Reducing Intergroup Bias: The Common
  Ingroup Identity Model.* Psychology Press.
- Iyengar, S., Lelkes, Y., Levendusky, M., Malhotra, N., & Westwood, S. J. (2019).
  The origins and consequences of affective polarization in the United States.
  *Annual Review of Political Science*, 22, 129–146.
- Tajfel, H., & Turner, J. C. (1979). An integrative theory of intergroup
  conflict. In *The Social Psychology of Intergroup Relations*.
- Tessler, M. H., et al. (2024). AI can help humans find common ground in
  democratic deliberation. *Science*, 386(6719), eadq2852.
- Turner, J. C., Hogg, M. A., Oakes, P. J., Reicher, S. D., & Wetherell, M. S.
  (1987). *Rediscovering the Social Group: A Self-Categorization Theory.*
