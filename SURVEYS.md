# Embedded surveys — item bank for review

Generated from [`assets/surveys.js`](assets/surveys.js), which is the single source of truth
for what participants see. Regenerate after any edit rather than hand-editing this file.

**Item ids are the analysis column names** (they head the columns in ⇩ Surveys CSV). They are
stable — add items, never rename them.

**`{RIVAL}`** is substituted per participant from their own flair: an ARMY member sees the
BLINK label and vice versa. The protocol marks the exact rival wording as pending
("[对家粉丝 — 措辞待Ray定]"); it lives in `RIVAL_LABEL` at the top of `assets/surveys.js` and
nowhere else, so Ray's final phrasing is a one-line change.

## ⚠️ Chinese needs review

All Chinese below is an **unreviewed draft** written for this build, because the protocol
document leaves it out for many items. Two blocks matter more than the rest:

- **`s1_ipt_*` — IRI perspective-taking (Davis 1980)**
- **`s1_react_*` — trait reactance (Hong & Faedda 1996)** *(no Chinese at all in the protocol)*

These are **validated instruments**. Published Chinese versions exist, and using an ad-hoc
translation instead breaks comparability with the literature the paper cites — a reviewer can
fairly challenge a translated scale that was never validated. Replace both with the published
Chinese versions (or a documented forward/back-translation) before the real run. Items marked
🚩 below carry `zhDraft: true` in the source.


## `survey1`

Day 1 — END of the day, after free interaction and the task block. Submitting it finishes the day (v3.2: post-only; the pre-task baseline and the micro-check were dropped by team decision).

_7 page(s), 25 items._


### Block 1 — Feeling thermometer / 情感温度计

> 0 = very cold / unfavourable, 50 = neutral, 100 = very warm / favourable. Please rate each group.
>
> 0 = 非常冷淡／负面，50 = 中立，100 = 非常温暖／正面。请为每个群体评分。

| id | scale | English | 中文 |
|---|---|---|---|
| `s1_therm_own` | 0–100 slider | Fans of the group you follow most closely | 你主追团体的粉丝 |
| `s1_therm_rival` | 0–100 slider | Fans of {RIVAL} | {RIVAL}的粉丝 |
| `s1_therm_kpop` | 0–100 slider | K-pop fans in general | K-pop粉丝整体 |


### Block 2 — Out-group perception / 对对方群体的看法

> Thinking of fans of {RIVAL}, where would you place them?
>
> 想到{RIVAL}的粉丝，你会把他们放在哪个位置？

| id | scale | English | 中文 |
|---|---|---|---|
| `s1_perc_moral` | 1–7<br><span title="anchors">1 immoral … 7 moral</span> | Immoral — Moral | 不道德 — 有道德 |
| `s1_perc_intelligent` | 1–7<br><span title="anchors">1 unintelligent … 7 intelligent</span> | Unintelligent — Intelligent | 不聪明 — 聪明 |


### Block 3 — Perceived legitimacy / 正当性感知

> Rate your agreement.
>
> 请评价你的同意程度。

| id | scale | English | 中文 |
|---|---|---|---|
| `s1_legit_reasons` | 1–5<br><span title="anchors">1 strongly disagree … 5 strongly agree</span> | Fans of {RIVAL} have legitimate reasons for loving their group. | {RIVAL}粉丝喜爱他们团体的理由是正当的。 |
| `s1_legit_reasonable` | 1–5<br><span title="anchors">1 strongly disagree … 5 strongly agree</span> | I think fans of {RIVAL} are reasonable people. | 我认为{RIVAL}粉丝是讲道理的人。 |
| `s1_legit_contribute` | 1–5<br><span title="anchors">1 strongly disagree … 5 strongly agree</span> | Voices from {RIVAL} fans can contribute positively to the K-pop fan community. | {RIVAL}粉丝的声音能为K-pop粉丝社区带来积极的贡献。 |


### Block 4 — Perceived similarity / 相似性感知

> How similar or different are you and fans of {RIVAL}…
>
> 你和{RIVAL}的粉丝有多相似或多不同……

| id | scale | English | 中文 |
|---|---|---|---|
| `s1_simil_general` | 1–5<br><span title="anchors">1 very different … 5 very similar</span> | …in general? | ……总体而言？ |
| `s1_simil_values` | 1–5<br><span title="anchors">1 very different … 5 very similar</span> | …in your values? | ……在价值观上？ |
| `s1_simil_care` | 1–5<br><span title="anchors">1 very different … 5 very similar</span> | …in what you care about as fans? | ……在作为粉丝所在意的事情上？ |
| `s1_simil_interests` | 1–5<br><span title="anchors">1 very different … 5 very similar</span> | …in your interests? | ……在兴趣爱好上？ |


### Block 5 — Contact behavioral intentions / 接触意愿

> Rate your agreement.
>
> 请评价你的同意程度。

| id | scale | English | 中文 |
|---|---|---|---|
| `s1_contact_discuss` | 1–5<br><span title="anchors">1 strongly disagree … 5 strongly agree</span> | I would be willing to engage in discussion with fans of {RIVAL}. | 我愿意与{RIVAL}粉丝进行讨论。 |
| `s1_contact_work` | 1–5<br><span title="anchors">1 strongly disagree … 5 strongly agree</span> | I would consider working together with fans of {RIVAL} on something. | 我愿意考虑与{RIVAL}粉丝合作完成一些事情。 |
| `s1_contact_share` | 1–5<br><span title="anchors">1 strongly disagree … 5 strongly agree</span> | I would share or support posts made by fans of {RIVAL}. | 我愿意分享或支持{RIVAL}粉丝发布的帖子。 |
| `s1_contact_friends` | 1–5<br><span title="anchors">1 strongly disagree … 5 strongly agree</span> | It would be acceptable if some of my friends were fans of {RIVAL}. | 如果我的朋友中有{RIVAL}粉丝，这对我来说是可以接受的。 |


### Block 6 — This session / 本次讨论

| id | scale | English | 中文 |
|---|---|---|---|
| `s1_sess_heated` | 1–5<br><span title="anchors">1 not at all … 5 extremely</span> | How heated or tense did the discussion just now feel? | 你觉得刚才的讨论有多激烈或紧张？ |
| `s1_sess_attacked` | 1–5<br><span title="anchors">1 not at all … 5 extremely</span> | How strongly did you feel your fandom was being criticised or attacked? | 你在多大程度上觉得自己的粉籍受到了批评或攻击？ |


### Block 7 — About you in general / 关于你（总体而言）

> Rate how well each statement describes you in general.
>
> 请评价每句话在总体上有多符合你。

| id | scale | English | 中文 |
|---|---|---|---|
| `s1_ipt_twosides` | 1–5<br><span title="anchors">1 strongly disagree … 5 strongly agree</span> | I believe that there are two sides to every question and try to look at them both. | 我认为任何问题都存在不同的观点，因此我会尝试从双方的角度来看待问题。 |
| `s1_ipt_shoes` | 1–5<br><span title="anchors">1 strongly disagree … 5 strongly agree</span> | When I'm upset at someone, I usually try to put myself in their shoes for a while. | 当我对某人感到不满时，我通常会尝试设身处地地为对方想一想。 |
| `s1_ipt_before_crit` | 1–5<br><span title="anchors">1 strongly disagree … 5 strongly agree</span> | Before criticizing somebody, I try to imagine how I would feel if I were in their place. | 在批评别人之前，我会尝试想象如果我处在他们的位置会有什么感受。 |
| `s1_react_resist` 🚩 | 1–5<br><span title="anchors">1 strongly disagree … 5 strongly agree</span> | I resist attempts by others to influence me. | 我会抵制他人试图影响我的行为。 |
| `s1_react_obvious` 🚩 | 1–5<br><span title="anchors">1 strongly disagree … 5 strongly agree</span> | It irritates me when someone points out things that are obvious to me. | 当别人指出我早已明白的事情时，我会感到恼火。 |
| `s1_react_free` 🚩 | 1–5<br><span title="anchors">1 strongly disagree … 5 strongly agree</span> | I become frustrated when I am unable to make free and independent decisions. | 当我无法自由、独立地做决定时，我会感到沮丧。 |
| `s1_react_opposite` 🚩 | 1–5<br><span title="anchors">1 strongly disagree … 5 strongly agree</span> | Advice and recommendations usually induce me to do just the opposite. | 别人的建议和劝告常常让我想做相反的事。 |


## `survey2`

Day 2 — END of the day, after free interaction. Block 8 renders in two steps so 8.1 is asked before 8.2.

_9 page(s), 24 items._


### Block 1 — Feeling thermometer / 情感温度计

> 0 = very cold / unfavourable, 50 = neutral, 100 = very warm / favourable. Please rate each group.
>
> 0 = 非常冷淡／负面，50 = 中立，100 = 非常温暖／正面。请为每个群体评分。

| id | scale | English | 中文 |
|---|---|---|---|
| `s2_therm_own` | 0–100 slider | Fans of the group you follow most closely | 你主追团体的粉丝 |
| `s2_therm_rival` | 0–100 slider | Fans of {RIVAL} | {RIVAL}的粉丝 |
| `s2_therm_kpop` | 0–100 slider | K-pop fans in general | K-pop粉丝整体 |


### Block 2 — Out-group perception / 对对方群体的看法

> Thinking of fans of {RIVAL}, where would you place them?
>
> 想到{RIVAL}的粉丝，你会把他们放在哪个位置？

| id | scale | English | 中文 |
|---|---|---|---|
| `s2_perc_moral` | 1–7<br><span title="anchors">1 immoral … 7 moral</span> | Immoral — Moral | 不道德 — 有道德 |
| `s2_perc_intelligent` | 1–7<br><span title="anchors">1 unintelligent … 7 intelligent</span> | Unintelligent — Intelligent | 不聪明 — 聪明 |


### Block 3 — Perceived legitimacy / 正当性感知

> Rate your agreement.
>
> 请评价你的同意程度。

| id | scale | English | 中文 |
|---|---|---|---|
| `s2_legit_reasons` | 1–5<br><span title="anchors">1 strongly disagree … 5 strongly agree</span> | Fans of {RIVAL} have legitimate reasons for loving their group. | {RIVAL}粉丝喜爱他们团体的理由是正当的。 |
| `s2_legit_reasonable` | 1–5<br><span title="anchors">1 strongly disagree … 5 strongly agree</span> | I think fans of {RIVAL} are reasonable people. | 我认为{RIVAL}粉丝是讲道理的人。 |
| `s2_legit_contribute` | 1–5<br><span title="anchors">1 strongly disagree … 5 strongly agree</span> | Voices from {RIVAL} fans can contribute positively to the K-pop fan community. | {RIVAL}粉丝的声音能为K-pop粉丝社区带来积极的贡献。 |


### Block 4 — Perceived similarity / 相似性感知

> How similar or different are you and fans of {RIVAL}…
>
> 你和{RIVAL}的粉丝有多相似或多不同……

| id | scale | English | 中文 |
|---|---|---|---|
| `s2_simil_general` | 1–5<br><span title="anchors">1 very different … 5 very similar</span> | …in general? | ……总体而言？ |
| `s2_simil_values` | 1–5<br><span title="anchors">1 very different … 5 very similar</span> | …in your values? | ……在价值观上？ |
| `s2_simil_care` | 1–5<br><span title="anchors">1 very different … 5 very similar</span> | …in what you care about as fans? | ……在作为粉丝所在意的事情上？ |
| `s2_simil_interests` | 1–5<br><span title="anchors">1 very different … 5 very similar</span> | …in your interests? | ……在兴趣爱好上？ |


### Block 5 — Contact behavioral intentions / 接触意愿

> Rate your agreement.
>
> 请评价你的同意程度。

| id | scale | English | 中文 |
|---|---|---|---|
| `s2_contact_discuss` | 1–5<br><span title="anchors">1 strongly disagree … 5 strongly agree</span> | I would be willing to engage in discussion with fans of {RIVAL}. | 我愿意与{RIVAL}粉丝进行讨论。 |
| `s2_contact_work` | 1–5<br><span title="anchors">1 strongly disagree … 5 strongly agree</span> | I would consider working together with fans of {RIVAL} on something. | 我愿意考虑与{RIVAL}粉丝合作完成一些事情。 |
| `s2_contact_share` | 1–5<br><span title="anchors">1 strongly disagree … 5 strongly agree</span> | I would share or support posts made by fans of {RIVAL}. | 我愿意分享或支持{RIVAL}粉丝发布的帖子。 |
| `s2_contact_friends` | 1–5<br><span title="anchors">1 strongly disagree … 5 strongly agree</span> | It would be acceptable if some of my friends were fans of {RIVAL}. | 如果我的朋友中有{RIVAL}粉丝，这对我来说是可以接受的。 |


### Block 6 — This session / 本次讨论

| id | scale | English | 中文 |
|---|---|---|---|
| `s2_sess_heated` | 1–5<br><span title="anchors">1 not at all … 5 extremely</span> | How heated or tense did the discussion just now feel? | 你觉得刚才的讨论有多激烈或紧张？ |
| `s2_sess_attacked` | 1–5<br><span title="anchors">1 not at all … 5 extremely</span> | How strongly did you feel your fandom was being criticised or attacked? | 你在多大程度上觉得自己的粉籍受到了批评或攻击？ |


### Block 7 — Looking back / 回顾这两天

| id | scale | English | 中文 |
|---|---|---|---|
| `s2_back_shared_community` | 1–5<br><span title="anchors">1 entirely separate … 5 one shared community</span> | Over the two days, how much did you come to see people on this platform as one shared community rather than separate fan groups? | 这两天下来，你在多大程度上把平台上的人看作一个共同的社区，而不是彼此分开的粉丝群体？ |
| `s2_back_own_fandom` | 1–5<br><span title="anchors">1 not at all … 5 very much</span> | And how much did you still see yourself as a member of your own fandom while on the platform? | 在平台上时，你在多大程度上仍然把自己看作自己粉籍的一员？ |
| `s2_back_keep_using` | 1–5<br><span title="anchors">1 very unlikely … 5 very likely</span> | If this platform kept running, how likely would you be to keep using it? | 如果这个平台继续运行，你有多大可能会继续使用它？ |


### Block 8 — Your thoughts on the study / 你对这项研究的看法

| id | scale | English | 中文 |
|---|---|---|---|
| `s2_probe_purpose` | open text | What do you think this study was trying to find out? Any guess is fine — there are no wrong answers, and your answer will not affect your payment. | 你觉得这项研究想了解什么？随便猜就好，没有对错，你的回答不会影响报酬。 |


### Block 8 — Your thoughts on the study / 你对这项研究的看法

| id | scale | English | 中文 |
|---|---|---|---|
| `s2_probe_changed` | open text | Did anything about the platform or these surveys change how you behaved? If so, what? (optional) _(optional)_ | 平台或这些问卷有没有改变你的行为方式？如果有，是什么？（选填） |
| `s2_probe_interview` | yes / no | Would you be willing to join a short online interview about your experience? | 你是否愿意参加一次关于本次体验的简短线上访谈？ |


## Counts

- 49 items across the three instruments
- 4 flagged 🚩 as validated-scale Chinese needing replacement
