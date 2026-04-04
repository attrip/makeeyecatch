const sizeRules = {
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
};

const baseStyleRules = {
  ukiyoe: {
    label: "浮世絵",
    look: "ukiyo-e woodblock print style, flat perspective, strong ink outlines, poetic Japanese storytelling",
    texture: "washi paper texture, slight print misalignment, traditional ink feel",
    color: "muted traditional Japanese colors, restrained contrast, poetic and timeless mood",
    mood: "calm intensity, symbolic expression, handcrafted presence",
    negative: "no photorealism, no glossy 3D rendering, no modern objects, no complex background, no multiple subjects",
  },
  simple70s: {
    label: "70sシンプル",
    look: "simple 1970s editorial illustration, bold flat shapes, minimal poster design, iconic silhouette-driven composition",
    texture: "subtle paper grain, light vintage print texture, clean analog imperfection",
    color: "warm retro palette, burnt orange, mustard, olive, cream, restrained contrast",
    mood: "graphic clarity, quiet confidence, simple but memorable presence",
    negative: "no photorealism, no glossy 3D rendering, no anime style, no excessive detail, no multiple subjects",
  },
};
let styleRules = { ...baseStyleRules };

const textRules = {
  noText: {
    label: "文字なし",
    prompt: "no text, no typography, no letters, no words, no captions, purely visual storytelling",
  },
  unspecified: {
    label: "未指定",
    prompt: "",
  },
};

const commonRules = [
  "convert the blog title into a strong visual concept rather than literal text rendering",
  "high visual clarity",
  "strong focal point",
  "iconic single subject",
  "visually cohesive",
  "clean composition",
];

const titleMappings = [
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
];

const abstractPeopleMap = [
  { test: /(利他|やさしさ|思いやり)/i, subject: "a single human figure with a calm and compassionate expression, symbolizing altruism" },
  { test: /(正義|信念|理念)/i, subject: "a single upright human figure with a steady and unwavering expression, symbolizing justice" },
  { test: /(不安|迷い|悩み)/i, subject: "a single human figure with a hesitant and uneasy expression, symbolizing anxiety" },
  { test: /(戦略|設計|戦術)/i, subject: "a single human figure with an intentional gaze and poised posture, symbolizing strategy" },
  { test: /(孤独|ひとり|孤立)/i, subject: "a single human figure in quiet isolation with a reflective expression, symbolizing solitude" },
  { test: /(危険|危ない|注意)/i, subject: "a single human figure with a guarded expression, symbolizing caution and risk" },
];

const concreteMotifs = [
  { test: /(桜)/i, motif: "a single cherry blossom branch" },
  { test: /(雨|梅雨)/i, motif: "a single rain-soaked scene element" },
  { test: /(手相|手)/i, motif: "a single hand with visible palm lines" },
  { test: /(サウナ)/i, motif: "a single sauna stone stack with rising steam" },
  { test: /(森)/i, motif: "a single forest silhouette with strong atmosphere" },
  { test: /(ai|chatgpt|gemini)/i, motif: "a single symbolic human figure shaped by abstract intelligence motifs" },
];

function inferCategory(title) {
  return titleMappings.find((mapping) => mapping.test.test(title)) ?? titleMappings[4];
}

function analyzeTitle(title) {
  const category = inferCategory(title);
  const concrete = concreteMotifs.find((item) => item.test.test(title));
  const abstract = abstractPeopleMap.find((item) => item.test.test(title));
  const isAbstract = !concrete || /(とは|考え方|整理|役割|運用|利他|正義|不安|危険)/i.test(title);

  return {
    isAbstract,
    category: category.category,
    mood: category.mood,
    mainConcept: concrete?.motif ?? abstract?.subject ?? "a single symbolic human figure",
    subjectType: concrete ? "concrete" : "abstract",
    expression: category.expression,
  };
}

function convertToSingleMotif(analysis, title) {
  if (analysis.isAbstract) {
    const abstract = abstractPeopleMap.find((item) => item.test.test(title));
    if (abstract) {
      return abstract.subject;
    }
    if (analysis.category === "roles") {
      return "a single symbolic human figure whose clothing or posture hints at multiple roles";
    }
    if (analysis.category === "compare") {
      return "a single human figure expressing contrast through split lighting or posture";
    }
    return "a single human figure with a clear emotional expression, symbolizing the main idea of the title";
  }

  const concrete = concreteMotifs.find((item) => item.test.test(title));
  if (concrete) {
    return concrete.motif;
  }

  return "a single symbolic object representing the main idea of the title";
}

function buildInterpretation(title) {
  const analysis = analyzeTitle(title);
  const visualSubject = convertToSingleMotif(analysis, title);
  const decomposition = `Interpret the original blog title "${title}" as one clear visual idea, reduce it to a single iconic motif, and express the emotional meaning through one subject rather than multiple elements`;

  return {
    originalTitle: title,
    category: analysis.category,
    subject: analysis.mainConcept,
    mood: analysis.mood,
    visualSubject,
    composition: analysis.expression,
    isAbstract: analysis.isAbstract,
    decomposition,
  };
}

function buildPrompt({ title, size, style, textPolicy }) {
  const sizeRule = sizeRules[size];
  const styleRule = styleRules[style];
  const textRule = textRules[textPolicy];
  const interpretation = buildInterpretation(title);

  const parts = [
    `Original blog title: "${title}"`,
    interpretation.decomposition,
    interpretation.visualSubject,
    interpretation.composition,
    interpretation.mood,
    styleRule.look,
    sizeRule.prompt,
    styleRule.texture,
    styleRule.color,
    styleRule.mood,
    ...commonRules,
    textRule.prompt,
    styleRule.negative,
  ].filter(Boolean);

  return {
    prompt: `${parts.join(", ")}.`,
    interpretation,
    sizeRule,
    styleRule,
    textRule,
  };
}

const titleInput = document.getElementById("title-input");
const styleSelect = document.getElementById("style-select");
const generateButton = document.getElementById("generate-button");
const copyButton = document.getElementById("copy-button");
const chatgptButton = document.getElementById("chatgpt-button");
const geminiButton = document.getElementById("gemini-button");
const promptOutput = document.getElementById("prompt-output");
const titleOutput = document.getElementById("title-output");
const subjectOutput = document.getElementById("subject-output");
const motifOutput = document.getElementById("motif-output");
const moodOutput = document.getElementById("mood-output");
const compositionOutput = document.getElementById("composition-output");
const categoryOutput = document.getElementById("category-output");
const metaBadges = document.getElementById("meta-badges");
const storageKey = "makeeyecatch.settings.v1";
const customStylesCookieKey = "makeeyecatch_custom_styles";
const addStyleButton = document.getElementById("add-style-button");
const customStylePanel = document.getElementById("custom-style-panel");
const saveStyleButton = document.getElementById("save-style-button");
const customStyleList = document.getElementById("custom-style-list");
const customStyleLabelInput = document.getElementById("custom-style-label");
const customStyleLookInput = document.getElementById("custom-style-look");
const customStyleTextureInput = document.getElementById("custom-style-texture");
const customStyleColorInput = document.getElementById("custom-style-color");
const customStyleMoodInput = document.getElementById("custom-style-mood");
const customStyleNegativeInput = document.getElementById("custom-style-negative");

function selectedValue(name) {
  return document.querySelector(`input[name="${name}"]:checked`)?.value;
}

function setCheckedValue(name, value) {
  const element = document.querySelector(`input[name="${name}"][value="${value}"]`);
  if (element) {
    element.checked = true;
  }
}

function renderBadges(items) {
  metaBadges.innerHTML = "";
  items.forEach((item) => {
    const badge = document.createElement("span");
    badge.textContent = item;
    metaBadges.appendChild(badge);
  });
}

function slugifyStyleLabel(label) {
  return label
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || `custom-${Date.now()}`;
}

function setCookie(name, value, days = 365) {
  const expires = new Date(Date.now() + days * 86400000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function getCookie(name) {
  const prefix = `${name}=`;
  const row = document.cookie.split("; ").find((entry) => entry.startsWith(prefix));
  return row ? decodeURIComponent(row.slice(prefix.length)) : "";
}

function readCustomStyles() {
  const raw = getCookie(customStylesCookieKey);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeCustomStyles(customStyles) {
  setCookie(customStylesCookieKey, JSON.stringify(customStyles));
}

function rebuildStyleRules() {
  styleRules = { ...baseStyleRules, ...readCustomStyles() };
}

function populateStyleSelect() {
  const currentValue = styleSelect.value;
  styleSelect.innerHTML = "";
  Object.entries(styleRules).forEach(([key, rule]) => {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = rule.label;
    styleSelect.appendChild(option);
  });
  styleSelect.value = styleRules[currentValue] ? currentValue : "ukiyoe";
}

function renderCustomStyleList() {
  const customStyles = readCustomStyles();
  customStyleList.innerHTML = "";
  Object.entries(customStyles).forEach(([key, rule]) => {
    const chip = document.createElement("div");
    chip.className = "saved-style-chip";
    chip.innerHTML = `<span>${rule.label}</span><button type="button" data-style-key="${key}">削除</button>`;
    customStyleList.appendChild(chip);
  });
}

function clearCustomStyleForm() {
  customStyleLabelInput.value = "";
  customStyleLookInput.value = "";
  customStyleTextureInput.value = "";
  customStyleColorInput.value = "";
  customStyleMoodInput.value = "";
  customStyleNegativeInput.value = "";
}

function toggleCustomStylePanel() {
  customStylePanel.hidden = !customStylePanel.hidden;
}

function saveCustomStyle() {
  const label = customStyleLabelInput.value.trim();
  const look = customStyleLookInput.value.trim();
  const texture = customStyleTextureInput.value.trim();
  const color = customStyleColorInput.value.trim();
  const mood = customStyleMoodInput.value.trim();
  const negative = customStyleNegativeInput.value.trim();

  if (!label || !look || !texture || !color || !mood || !negative) {
    window.alert("Style名と各ルールをすべて入れてください。");
    return;
  }

  const key = `custom-${slugifyStyleLabel(label)}`;
  const customStyles = readCustomStyles();
  customStyles[key] = { label, look, texture, color, mood, negative };
  writeCustomStyles(customStyles);
  rebuildStyleRules();
  populateStyleSelect();
  renderCustomStyleList();
  styleSelect.value = key;
  customStylePanel.hidden = true;
  clearCustomStyleForm();
  saveState();
}

function deleteCustomStyle(key) {
  const customStyles = readCustomStyles();
  delete customStyles[key];
  writeCustomStyles(customStyles);
  rebuildStyleRules();
  populateStyleSelect();
  renderCustomStyleList();
  saveState();
}

function readFormState() {
  return {
    selectedSize: selectedValue("size") ?? "square",
    selectedStyle: styleSelect.value,
    textMode: selectedValue("textPolicy") ?? "noText",
    lastTitle: titleInput.value.trim(),
  };
}

function saveState() {
  const state = readFormState();
  window.localStorage.setItem(storageKey, JSON.stringify(state));
}

function restoreState() {
  rebuildStyleRules();
  populateStyleSelect();
  renderCustomStyleList();
  const raw = window.localStorage.getItem(storageKey);
  if (!raw) return;
  try {
    const saved = JSON.parse(raw);
    setCheckedValue("size", saved.selectedSize ?? "square");
    setCheckedValue("textPolicy", saved.textMode ?? "noText");
    styleSelect.value = styleRules[saved.selectedStyle] ? saved.selectedStyle : "ukiyoe";
    titleInput.value = saved.lastTitle ?? "";
  } catch {
    window.localStorage.removeItem(storageKey);
  }
}

function generate() {
  const title = titleInput.value.trim();
  if (!title) {
    promptOutput.textContent = "ブログタイトルを入力してください。";
    return;
  }

  const result = buildPrompt({
    title,
    size: selectedValue("size"),
    style: styleSelect.value,
    textPolicy: selectedValue("textPolicy"),
  });

  promptOutput.textContent = result.prompt;
  titleOutput.textContent = result.interpretation.originalTitle;
  subjectOutput.textContent = result.interpretation.subject;
  motifOutput.textContent = result.interpretation.visualSubject;
  moodOutput.textContent = result.interpretation.mood;
  compositionOutput.textContent = `${result.interpretation.composition} / ${result.sizeRule.compositionJa}`;
  categoryOutput.textContent = `${result.interpretation.category} / ${result.interpretation.isAbstract ? "abstract" : "concrete"}`;

  renderBadges([
    `${result.styleRule.label}`,
    `${result.sizeRule.label} ${result.sizeRule.ratio}`,
    `${result.textRule.label}`,
  ]);

  saveState();
}

async function copyPrompt() {
  const text = promptOutput.textContent;
  if (!text || text === "タイトルを入れて生成してください。" || text === "ブログタイトルを入力してください。") {
    return;
  }

  try {
    await navigator.clipboard.writeText(text);
    copyButton.textContent = "コピー済み";
    window.setTimeout(() => {
      copyButton.textContent = "コピー";
    }, 1200);
  } catch {
    copyButton.textContent = "失敗";
    window.setTimeout(() => {
      copyButton.textContent = "コピー";
    }, 1200);
  }
}

async function copyAndOpen(url) {
  await copyPrompt();
  window.open(url, "_blank", "noopener,noreferrer");
}

restoreState();

addStyleButton.addEventListener("click", toggleCustomStylePanel);
saveStyleButton.addEventListener("click", saveCustomStyle);
customStyleList.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-style-key]");
  if (!button) return;
  deleteCustomStyle(button.dataset.styleKey);
});
generateButton.addEventListener("click", generate);
copyButton.addEventListener("click", copyPrompt);
chatgptButton.addEventListener("click", () => copyAndOpen("https://chatgpt.com/"));
geminiButton.addEventListener("click", () => copyAndOpen("https://gemini.google.com/app"));
titleInput.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
    generate();
  }
});

document.querySelectorAll('input[name="size"], input[name="textPolicy"]').forEach((input) => {
  input.addEventListener("change", saveState);
});

styleSelect.addEventListener("change", saveState);
titleInput.addEventListener("input", saveState);
