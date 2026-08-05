/* DefuseLab — participant survey item bank (Surveys_v3_TwoDay_Protocol).
 *
 * Three instruments, administered inside KFeed at the moments the protocol requires:
 *   survey1     Day 1, after free interaction, BEFORE the task block (it gates the task)
 *   microcheck  Day 1, immediately after the task block  (M5 routed by live pairing)
 *   survey2     Day 2, after free interaction            (adds Looking back + suspicion probe)
 *
 * ITEM IDS ARE THE ANALYSIS COLUMN NAMES. They are stable: rename one and you break the
 * mapping between stored responses and the analysis. Add items, never rename them.
 *
 * {RIVAL} is substituted per participant from their own flair — an ARMY member sees the
 * BLINK label and vice versa. The protocol marks the exact rival wording as pending
 * ("[对家粉丝 — 措辞待Ray定]"), so it lives in RIVAL_LABEL below and nowhere else.
 *
 * TRANSLATION STATUS: the Chinese is a DRAFT for team review (see SURVEYS.md). The two
 * validated scales — IRI perspective-taking (Davis 1980) and trait reactance (Hong &
 * Faedda 1996) — should be replaced with their published Chinese versions before the real
 * run; an ad-hoc translation of a validated instrument is not comparable to the literature.
 * Those items carry zhDraft: true.
 */
(function () {
  // Rival-fandom label. ONE place — drop Ray's final wording here.
  const RIVAL_LABEL = {
    ARMY: { en: "BLACKPINK", zh: "BLACKPINK" },
    BLINK: { en: "BTS", zh: "BTS" },
  };

  // ---- shared scale anchors -------------------------------------------------
  const AGREE5 = {
    en: ["1 strongly disagree", "5 strongly agree"],
    zh: ["1 非常不同意", "5 非常同意"],
  };
  const NOTATALL5 = { en: ["1 not at all", "5 extremely"], zh: ["1 完全没有", "5 非常强烈"] };

  const likert5 = (id, en, zh, opts) => Object.assign(
    { id, type: "likert5", stem: { en, zh }, anchors: AGREE5, required: true }, opts || {});

  // ---- Blocks 1-6: the CORE BATTERY, identical in Survey 1 and Survey 2 -----
  // Repeated verbatim across days so the two administrations are directly comparable.
  const CORE = [
    {
      block: 1,
      title: { en: "Feeling thermometer", zh: "情感温度计" },
      stem: {
        en: "0 = very cold / unfavourable, 50 = neutral, 100 = very warm / favourable. Please rate each group.",
        zh: "0 = 非常冷淡／负面，50 = 中立，100 = 非常温暖／正面。请为每个群体评分。",
      },
      items: [
        { id: "therm_own", type: "slider0100", required: true,
          stem: { en: "Fans of the group you follow most closely", zh: "你主追团体的粉丝" } },
        { id: "therm_rival", type: "slider0100", required: true,
          stem: { en: "Fans of {RIVAL}", zh: "{RIVAL}的粉丝" } },
        { id: "therm_kpop", type: "slider0100", required: true,
          stem: { en: "K-pop fans in general", zh: "K-pop粉丝整体" } },
      ],
    },
    {
      block: 2,
      title: { en: "Out-group perception", zh: "对对方群体的看法" },
      stem: {
        en: "Thinking of fans of {RIVAL}, where would you place them?",
        zh: "想到{RIVAL}的粉丝，你会把他们放在哪个位置？",
      },
      items: [
        { id: "perc_moral", type: "semdiff7", required: true,
          stem: { en: "Immoral — Moral", zh: "不道德 — 有道德" },
          anchors: { en: ["1 immoral", "7 moral"], zh: ["1 不道德", "7 有道德"] } },
        { id: "perc_intelligent", type: "semdiff7", required: true,
          stem: { en: "Unintelligent — Intelligent", zh: "不聪明 — 聪明" },
          anchors: { en: ["1 unintelligent", "7 intelligent"], zh: ["1 不聪明", "7 聪明"] } },
      ],
    },
    {
      block: 3,
      title: { en: "Perceived legitimacy", zh: "正当性感知" },
      stem: { en: "Rate your agreement.", zh: "请评价你的同意程度。" },
      items: [
        likert5("legit_reasons",
          "Fans of {RIVAL} have legitimate reasons for loving their group.",
          "{RIVAL}粉丝喜爱他们团体的理由是正当的。"),
        likert5("legit_reasonable",
          "I think fans of {RIVAL} are reasonable people.",
          "我认为{RIVAL}粉丝是讲道理的人。"),
        likert5("legit_contribute",
          "Voices from {RIVAL} fans can contribute positively to the K-pop fan community.",
          "{RIVAL}粉丝的声音能为K-pop粉丝社区带来积极的贡献。"),
      ],
    },
    {
      block: 4,
      title: { en: "Perceived similarity", zh: "相似性感知" },
      stem: {
        en: "How similar or different are you and fans of {RIVAL}…",
        zh: "你和{RIVAL}的粉丝有多相似或多不同……",
      },
      anchors: { en: ["1 very different", "5 very similar"], zh: ["1 非常不同", "5 非常相似"] },
      items: [
        { id: "simil_general", type: "likert5", required: true, stem: { en: "…in general?", zh: "……总体而言？" } },
        { id: "simil_values", type: "likert5", required: true, stem: { en: "…in your values?", zh: "……在价值观上？" } },
        { id: "simil_care", type: "likert5", required: true,
          stem: { en: "…in what you care about as fans?", zh: "……在作为粉丝所在意的事情上？" } },
        { id: "simil_interests", type: "likert5", required: true, stem: { en: "…in your interests?", zh: "……在兴趣爱好上？" } },
      ],
    },
    {
      block: 5,
      title: { en: "Contact behavioral intentions", zh: "接触意愿" },
      stem: { en: "Rate your agreement.", zh: "请评价你的同意程度。" },
      items: [
        likert5("contact_discuss",
          "I would be willing to engage in discussion with fans of {RIVAL}.",
          "我愿意与{RIVAL}粉丝进行讨论。"),
        likert5("contact_work",
          "I would consider working together with fans of {RIVAL} on something.",
          "我愿意考虑与{RIVAL}粉丝合作完成一些事情。"),
        likert5("contact_share",
          "I would share or support posts made by fans of {RIVAL}.",
          "我愿意分享或支持{RIVAL}粉丝发布的帖子。"),
        likert5("contact_friends",
          "It would be acceptable if some of my friends were fans of {RIVAL}.",
          "如果我的朋友中有{RIVAL}粉丝，这对我来说是可以接受的。"),
      ],
    },
    {
      block: 6,
      title: { en: "This session", zh: "本次讨论" },
      items: [
        { id: "sess_heated", type: "likert5", required: true, anchors: NOTATALL5,
          stem: { en: "How heated or tense did the discussion just now feel?",
                  zh: "你觉得刚才的讨论有多激烈或紧张？" } },
        { id: "sess_attacked", type: "likert5", required: true, anchors: NOTATALL5,
          stem: { en: "How strongly did you feel your fandom was being criticised or attacked?",
                  zh: "你在多大程度上觉得自己的粉籍受到了批评或攻击？" } },
      ],
    },
  ];

  // Survey 2 must carry the SAME item ids as Survey 1 for the core battery, so responses
  // line up across days. The instrument prefix (s1_/s2_) is added at load time below.
  const clone = (o) => JSON.parse(JSON.stringify(o));

  // ---- Survey 1 only: Block 7, stable traits measured once ------------------
  const S1_TRAITS = {
    block: 7,
    title: { en: "About you in general", zh: "关于你（总体而言）" },
    stem: {
      en: "Rate how well each statement describes you in general.",
      zh: "请评价每句话在总体上有多符合你。",
    },
    items: [
      // Davis (1980) IRI — perspective-taking, short form. ZH = DRAFT, replace with the
      // published Chinese IRI before the real run.
      likert5("ipt_twosides",
        "I believe that there are two sides to every question and try to look at them both.",
        "我认为任何问题都存在不同的观点，因此我会尝试从双方的角度来看待问题。"),
      likert5("ipt_shoes",
        "When I'm upset at someone, I usually try to put myself in their shoes for a while.",
        "当我对某人感到不满时，我通常会尝试设身处地地为对方想一想。"),
      likert5("ipt_before_crit",
        "Before criticizing somebody, I try to imagine how I would feel if I were in their place.",
        "在批评别人之前，我会尝试想象如果我处在他们的位置会有什么感受。"),
      // Hong & Faedda (1996) trait reactance, short. ZH = UNREVIEWED DRAFT (no Chinese in
      // the protocol document) — replace with the published Chinese version.
      likert5("react_resist",
        "I resist attempts by others to influence me.",
        "我会抵制他人试图影响我的行为。", { zhDraft: true }),
      likert5("react_obvious",
        "It irritates me when someone points out things that are obvious to me.",
        "当别人指出我早已明白的事情时，我会感到恼火。", { zhDraft: true }),
      likert5("react_free",
        "I become frustrated when I am unable to make free and independent decisions.",
        "当我无法自由、独立地做决定时，我会感到沮丧。", { zhDraft: true }),
      likert5("react_opposite",
        "Advice and recommendations usually induce me to do just the opposite.",
        "别人的建议和劝告常常让我想做相反的事。", { zhDraft: true }),
    ],
  };

  // ---- Micro-check: IDENTICAL WORDING IN BOTH ARMS -------------------------
  // The protocol is explicit: do not write an intervention-specific version naming
  // co-authorship — that hands the manipulation to the participant. Only M5 is routed,
  // and only when the platform logged a live cross-fandom pair.
  const MICRO = {
    block: 1,
    title: { en: "Quick check", zh: "简短确认" },
    items: [
      { id: "m1_natural", type: "likert5", required: true,
        anchors: { en: ["1 completely natural", "5 completely forced"], zh: ["1 完全自然", "5 完全勉强"] },
        stem: { en: "How natural or forced did the activity you just completed feel?",
                zh: "你刚刚完成的活动，感觉有多自然或多勉强？" } },
      { id: "m2_effort", type: "likert5", required: true,
        anchors: { en: ["1 none at all", "5 a great deal"], zh: ["1 完全没有", "5 非常多"] },
        stem: { en: "How much effort did you put into what you just wrote?",
                zh: "你在刚才写的内容上投入了多少心力？" } },
      { id: "m3_shared", type: "likert5", required: true,
        anchors: { en: ["1 entirely mine", "5 equally shared"], zh: ["1 完全属于我自己", "5 平等共有"] },
        stem: { en: "When you look at what was published, how much does it feel like it belongs to you and someone else equally, rather than to you alone?",
                zh: "你觉得刚刚发布的内容，是完全属于你自己的，还是和另一个人平等共有的？" } },
      { id: "m4_better", type: "likert5", required: true,
        anchors: { en: ["1 not at all", "5 very much"], zh: ["1 完全不会", "5 非常会"] },
        stem: { en: "Do you think this feature will make discussions on this platform better?",
                zh: "你觉得这个功能会让这个平台上的讨论氛围变好吗？" } },
      // Dual-identity check. Routed: intervention arm, live pair only. Optional.
      { id: "m5_aware", type: "likert5", required: false, routed: "m5",
        anchors: { en: ["1 not at all aware", "5 constantly aware"], zh: ["1 完全没有意识到", "5 一直很清楚"] },
        stem: { en: "While doing the activity, how aware were you of which fandom the other contributor belonged to?",
                zh: "在参与这个活动时，你有多清楚另一位参与者属于哪个粉丝群体？" } },
    ],
  };

  // ---- Survey 2 only: Block 7 Looking back, Block 8 suspicion probe ---------
  const S2_LOOKBACK = {
    block: 7,
    title: { en: "Looking back", zh: "回顾这两天" },
    items: [
      // 7.1 and 7.2 JOINTLY operationalise dual identity. Never average them: high 7.1 with
      // low 7.2 is recategorization, which predicts backfire among high identifiers.
      { id: "back_shared_community", type: "likert5", required: true,
        anchors: { en: ["1 entirely separate", "5 one shared community"], zh: ["1 彼此完全分开", "5 一个共同的社区"] },
        stem: { en: "Over the two days, how much did you come to see people on this platform as one shared community rather than separate fan groups?",
                zh: "这两天下来，你在多大程度上把平台上的人看作一个共同的社区，而不是彼此分开的粉丝群体？" } },
      { id: "back_own_fandom", type: "likert5", required: true,
        anchors: { en: ["1 not at all", "5 very much"], zh: ["1 完全没有", "5 非常强烈"] },
        stem: { en: "And how much did you still see yourself as a member of your own fandom while on the platform?",
                zh: "在平台上时，你在多大程度上仍然把自己看作自己粉籍的一员？" } },
      { id: "back_keep_using", type: "likert5", required: true,
        anchors: { en: ["1 very unlikely", "5 very likely"], zh: ["1 非常不可能", "5 非常可能"] },
        stem: { en: "If this platform kept running, how likely would you be to keep using it?",
                zh: "如果这个平台继续运行，你有多大可能会继续使用它？" } },
    ],
  };

  // Block 8 is rendered in TWO steps: 8.1 alone, then 8.2 and 8.3. The protocol requires
  // 8.1 be asked first with nothing revealed beforehand.
  const S2_PROBE_A = {
    block: 8,
    title: { en: "Your thoughts on the study", zh: "你对这项研究的看法" },
    items: [
      { id: "probe_purpose", type: "text", required: true,
        stem: { en: "What do you think this study was trying to find out? Any guess is fine — there are no wrong answers, and your answer will not affect your payment.",
                zh: "你觉得这项研究想了解什么？随便猜就好，没有对错，你的回答不会影响报酬。" } },
    ],
  };
  const S2_PROBE_B = {
    block: 8,
    title: { en: "Your thoughts on the study", zh: "你对这项研究的看法" },
    items: [
      { id: "probe_changed", type: "text", required: false,
        stem: { en: "Did anything about the platform or these surveys change how you behaved? If so, what? (optional)",
                zh: "平台或这些问卷有没有改变你的行为方式？如果有，是什么？（选填）" } },
      { id: "probe_interview", type: "yesno", required: true,
        stem: { en: "Would you be willing to join a short online interview about your experience?",
                zh: "你是否愿意参加一次关于本次体验的简短线上访谈？" },
        options: { en: ["Yes", "No"], zh: ["愿意", "不愿意"] } },
    ],
  };

  const prefixed = (pages, prefix) => pages.map((pg) => {
    const p = clone(pg);
    p.items = p.items.map((it) => Object.assign({}, it, { id: prefix + it.id }));
    return p;
  });

  window.SURVEYS = {
    RIVAL_LABEL,
    // Each instrument is a list of PAGES; one page renders at a time.
    survey1: {
      id: "survey1",
      title: { en: "A few quick questions", zh: "几个简短问题" },
      intro: {
        en: "These questions ask about your honest impressions right now. There are no right or wrong answers.",
        zh: "以下问题想了解你此刻的真实感受。没有对错之分。",
      },
      pages: prefixed(CORE.concat([S1_TRAITS]), "s1_"),
    },
    microcheck: {
      id: "microcheck",
      title: { en: "Quick check", zh: "简短确认" },
      intro: { en: "Just a few questions about what you just did.", zh: "关于你刚刚完成的活动，几个简短问题。" },
      pages: prefixed([MICRO], "mc_"),
    },
    survey2: {
      id: "survey2",
      title: { en: "A few quick questions", zh: "几个简短问题" },
      intro: {
        en: "These questions ask about your honest impressions right now. There are no right or wrong answers.",
        zh: "以下问题想了解你此刻的真实感受。没有对错之分。",
      },
      pages: prefixed(CORE.concat([S2_LOOKBACK, S2_PROBE_A, S2_PROBE_B]), "s2_"),
    },
  };
})();
