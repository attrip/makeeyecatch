window.MakeEyecatchConfig = {
  sizeRules: {
    square: {
      label: "正方形",
      ratio: "1:1",
      prompt: "centered composition, iconic single subject, balanced negative space, optimized for square format",
      compositionJa: "中央配置を基調にした単焦点構図",
    },
    wide: {
      label: "16:9",
      ratio: "16:9",
      prompt: "wide cinematic composition, one dominant subject, room for subtle background storytelling, optimized for 16:9 frame",
      compositionJa: "主役を1つに絞った横長構図",
    },
  },
  baseStyleRules: {
    ukiyoe: {
      label: "浮世絵",
      look: "ukiyo-e woodblock print style, flat perspective, strong ink outlines, poetic Japanese storytelling",
      composition: "subject positioned slightly right of center, wide empty space on the left side, clear clean margin on all edges, leave visible breathing room around the entire artwork, keep all elements fully inside the canvas, no visible outer border, no frame lines near the edges, no rectangular print frame, no border, no frame, no cropping, no cut edges, balanced composition with safe padding",
      texture: "washi paper texture, slight print misalignment, traditional ink feel",
      color: "muted traditional Japanese colors, restrained contrast, poetic and timeless mood",
      mood: "calm intensity, symbolic expression, handcrafted presence",
      negative: "no photorealism, no glossy 3D rendering, no modern objects, no complex background, no multiple subjects",
    },
    simple70s: {
      label: "70sシンプル",
      look: "simple 1970s editorial illustration, bold flat shapes, minimal poster design, iconic silhouette-driven composition",
      composition: "",
      texture: "subtle paper grain, light vintage print texture, clean analog imperfection",
      color: "warm retro palette, burnt orange, mustard, olive, cream, restrained contrast",
      mood: "graphic clarity, quiet confidence, simple but memorable presence",
      negative: "no photorealism, no glossy 3D rendering, no anime style, no excessive detail, no multiple subjects",
    },
  },
  textRules: {
    noText: {
      label: "文字なし",
      prompt: "no text, no typography, no letters, no words, no captions, purely visual storytelling",
    },
    unspecified: {
      label: "未指定",
      prompt: "",
    },
  },
  commonRules: [
    "convert the blog title into a strong visual concept rather than literal text rendering",
    "high visual clarity",
    "strong focal point",
    "iconic single subject",
    "visually cohesive",
    "clean composition",
  ],
  titleMappings: [
    {
      category: "danger",
      test: /(危ない|危険|注意|ヤバい|罠|失敗|やめたほうが|怖い)/i,
      mood: "cautionary, uneasy, subtle editorial tension",
      expression: "a guarded facial expression with visible caution",
    },
    {
      category: "compare",
      test: /(比較|違い|vs|対決|どっち|選び方|before|after|ビフォー|アフター)/i,
      mood: "clear contrast, analytical, structured clarity",
      expression: "a thoughtful person signaling contrast through posture or gaze",
    },
    {
      category: "roles",
      test: /(役割|人|チーム|体制|運用|整理|分担|担当|4人|３人|3人|5人)/i,
      mood: "thoughtful, structured, editorial clarity",
      expression: "a composed person embodying structure and responsibility",
    },
    {
      category: "season",
      test: /(桜|梅雨|雨|春|夏|秋|冬|紅葉|雪|季節|森|海|空|旅)/i,
      mood: "atmospheric, seasonal, emotionally calm, immersive",
      expression: "an emotionally resonant single motif shaped by weather and light",
    },
    {
      category: "explain",
      test: /(方法|使い方|とは|整理|まとめ|入門|初心者|完全ガイド|コツ|考え方)/i,
      mood: "informative, clear, confident, approachable",
      expression: "a clear symbolic figure or object with approachable presence",
    },
  ],
  abstractPeopleMap: [
    { test: /(利他|やさしさ|思いやり)/i, subject: "a single human figure with a calm and compassionate expression, symbolizing altruism" },
    { test: /(正義|信念|理念)/i, subject: "a single upright human figure with a steady and unwavering expression, symbolizing justice" },
    { test: /(不安|迷い|悩み)/i, subject: "a single human figure with a hesitant and uneasy expression, symbolizing anxiety" },
    { test: /(戦略|設計|戦術)/i, subject: "a single human figure with an intentional gaze and poised posture, symbolizing strategy" },
    { test: /(孤独|ひとり|孤立)/i, subject: "a single human figure in quiet isolation with a reflective expression, symbolizing solitude" },
    { test: /(危険|危ない|注意)/i, subject: "a single human figure with a guarded expression, symbolizing caution and risk" },
  ],
  compactSemanticRules: {
    subjects: [
      {
        words: ["江戸美人", "美人", "女人"],
        subject: "a single elegant Edo-period woman standing calmly in profile",
      },
      {
        words: ["女性", "女"],
        subject: "a single elegant woman presented as the dominant subject",
      },
      {
        words: ["男性", "男"],
        subject: "a single composed man presented as the dominant subject",
      },
      {
        words: ["旅人", "旅"],
        subject: "a single traveler shown as a calm symbolic figure",
      },
    ],
    emotions: [
      {
        words: ["喜ぶ", "うれしい", "嬉しい", "満足", "納得"],
        mood: "quiet satisfaction, internal recognition, refined joy",
        expression: "subtle restrained joy, calm and intelligent emotional tone",
      },
      {
        words: ["不安", "危険", "危ない", "警戒"],
        mood: "uneasy caution, restrained tension",
        expression: "a guarded expression with visible caution",
      },
      {
        words: ["静か", "静けさ", "穏やか"],
        mood: "calm, still, emotionally quiet",
        expression: "a restrained and peaceful expression",
      },
    ],
    transformations: [
      {
        words: ["切り替わった", "切り替え", "更新", "改善", "進化", "向上", "整った"],
        symbol: "layered patterns transitioning from rough, slightly misaligned details into refined and harmonious details, symbolizing structural improvement",
        mood: "structural improvement, refined output, internal upgrade",
      },
      {
        words: ["比較", "違い", "before", "after", "ビフォー", "アフター"],
        symbol: "a visible contrast between rough and refined qualities within one subject",
        mood: "clear contrast, analytical improvement",
      },
    ],
    props: [
      {
        words: ["きれいな画像", "綺麗な画像", "美しい画像", "画像が作られている"],
        prop: "holding a small paper or silk sheet and gently observing its refined image quality",
      },
      {
        words: ["モデル", "AI", "ChatGPT", "Gemini"],
        prop: "a subtle sign of crafted output or refined generated work, without modern devices in view",
        mood: "quiet awareness of technical refinement and improved generation quality",
      },
      {
        words: ["紙", "原稿", "作品"],
        prop: "holding or facing a single crafted sheet or finished work",
      },
    ],
  },
  concreteMotifs: [
    { test: /(桜)/i, motif: "a single cherry blossom branch" },
    { test: /(雨|梅雨)/i, motif: "a single rain-soaked scene element" },
    { test: /(手相|手)/i, motif: "a single hand with visible palm lines" },
    { test: /(サウナ)/i, motif: "a single sauna stone stack with rising steam" },
    { test: /(森)/i, motif: "a single forest silhouette with strong atmosphere" },
    { test: /(ai|chatgpt|gemini)/i, motif: "a single symbolic human figure shaped by abstract intelligence motifs" },
  ],
  storageKey: "makeeyecatch.settings.v1",
  customStylesCookieKey: "makeeyecatch_custom_styles",
};
