(function () {
  const { textRules } = window.MakeEyecatchPromptEngine;
  const { writeCustomStyles, readCustomStyles, rebuildStyleRules, readState, writeState } = window.MakeEyecatchStorage;
  const { buildPrompt } = window.MakeEyecatchPromptEngine;

  const elements = {
    titleInput: document.getElementById("title-input"),
    styleSelect: document.getElementById("style-select"),
    generateButton: document.getElementById("generate-button"),
    copyButton: document.getElementById("copy-button"),
    chatgptButton: document.getElementById("chatgpt-button"),
    geminiButton: document.getElementById("gemini-button"),
    addStyleButton: document.getElementById("add-style-button"),
    saveStyleButton: document.getElementById("save-style-button"),
    customStylePanel: document.getElementById("custom-style-panel"),
    customStyleList: document.getElementById("custom-style-list"),
    promptOutput: document.getElementById("prompt-output"),
    titleOutput: document.getElementById("title-output"),
    subjectOutput: document.getElementById("subject-output"),
    motifOutput: document.getElementById("motif-output"),
    moodOutput: document.getElementById("mood-output"),
    compositionOutput: document.getElementById("composition-output"),
    categoryOutput: document.getElementById("category-output"),
    metaBadges: document.getElementById("meta-badges"),
    customStyleLabelInput: document.getElementById("custom-style-label"),
    customStyleBaseSelect: document.getElementById("custom-style-base"),
    customStyleNoteInput: document.getElementById("custom-style-note"),
  };

  let styleRules = rebuildStyleRules();

  function selectedValue(name) {
    return document.querySelector(`input[name="${name}"]:checked`)?.value;
  }

  function setCheckedValue(name, value) {
    const element = document.querySelector(`input[name="${name}"][value="${value}"]`);
    if (element) element.checked = true;
  }

  function slugifyStyleLabel(label) {
    return label
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || `custom-${Date.now()}`;
  }

  function renderBadges(items) {
    elements.metaBadges.innerHTML = "";
    items.forEach((item) => {
      const badge = document.createElement("span");
      badge.textContent = item;
      elements.metaBadges.appendChild(badge);
    });
  }

  function populateStyleSelect() {
    const currentValue = elements.styleSelect.value;
    elements.styleSelect.innerHTML = "";
    Object.entries(styleRules).forEach(([key, rule]) => {
      const option = document.createElement("option");
      option.value = key;
      option.textContent = rule.label;
      elements.styleSelect.appendChild(option);
    });
    elements.styleSelect.value = styleRules[currentValue] ? currentValue : "ukiyoe";
  }

  function renderCustomStyleList() {
    const customStyles = readCustomStyles();
    elements.customStyleList.innerHTML = "";
    Object.entries(customStyles).forEach(([key, rule]) => {
      const chip = document.createElement("div");
      chip.className = "saved-style-chip";
      const detail = rule.baseStyleKey && styleRules[rule.baseStyleKey]
        ? `${rule.label} / ${styleRules[rule.baseStyleKey].label}`
        : rule.label;
      chip.innerHTML = `<span>${detail}</span><button type="button" data-style-key="${key}">削除</button>`;
      elements.customStyleList.appendChild(chip);
    });
  }

  function clearCustomStyleForm() {
    elements.customStyleLabelInput.value = "";
    elements.customStyleBaseSelect.value = "ukiyoe";
    elements.customStyleNoteInput.value = "";
  }

  function readFormState() {
    return {
      selectedSize: selectedValue("size") ?? "square",
      selectedStyle: elements.styleSelect.value,
      textMode: selectedValue("textPolicy") ?? "noText",
      lastTitle: elements.titleInput.value.trim(),
    };
  }

  function saveState() {
    writeState(readFormState());
  }

  function restoreState() {
    styleRules = rebuildStyleRules();
    populateStyleSelect();
    renderCustomStyleList();

    const saved = readState();
    if (!saved) return;
    setCheckedValue("size", saved.selectedSize ?? "square");
    setCheckedValue("textPolicy", saved.textMode ?? "noText");
    elements.styleSelect.value = styleRules[saved.selectedStyle] ? saved.selectedStyle : "ukiyoe";
    elements.titleInput.value = saved.lastTitle ?? "";
  }

  function toggleCustomStylePanel() {
    elements.customStylePanel.hidden = !elements.customStylePanel.hidden;
  }

  function saveCustomStyle() {
    const label = elements.customStyleLabelInput.value.trim();
    const baseStyleKey = elements.customStyleBaseSelect.value;
    const note = elements.customStyleNoteInput.value.trim();

    if (!label) {
      window.alert("Style名を入れてください。");
      return;
    }

    const key = `custom-${slugifyStyleLabel(label)}`;
    const customStyles = readCustomStyles();
    const baseStyle = styleRules[baseStyleKey];
    customStyles[key] = {
      label,
      baseStyleKey,
      note,
      look: baseStyle.look,
      texture: note ? `${baseStyle.texture}, ${note}` : baseStyle.texture,
      color: baseStyle.color,
      mood: note ? `${baseStyle.mood}, ${note}` : baseStyle.mood,
      negative: baseStyle.negative,
    };
    writeCustomStyles(customStyles);
    styleRules = rebuildStyleRules();
    populateStyleSelect();
    renderCustomStyleList();
    elements.styleSelect.value = key;
    elements.customStylePanel.hidden = true;
    clearCustomStyleForm();
    saveState();
  }

  function deleteCustomStyle(key) {
    const customStyles = readCustomStyles();
    delete customStyles[key];
    writeCustomStyles(customStyles);
    styleRules = rebuildStyleRules();
    populateStyleSelect();
    renderCustomStyleList();
    saveState();
  }

  function generate() {
    const title = elements.titleInput.value.trim();
    if (!title) {
      elements.promptOutput.textContent = "ブログタイトルを入力してください。";
      return;
    }

    const result = buildPrompt({
      title,
      size: selectedValue("size"),
      style: elements.styleSelect.value,
      textPolicy: selectedValue("textPolicy"),
      styleRules,
    });

    elements.promptOutput.textContent = result.prompt;
    elements.titleOutput.textContent = result.interpretation.originalTitle;
    elements.subjectOutput.textContent = result.interpretation.subject;
    elements.motifOutput.textContent = result.interpretation.visualSubject;
    elements.moodOutput.textContent = result.interpretation.mood;
    elements.compositionOutput.textContent = `${result.interpretation.composition} / ${result.sizeRule.compositionJa}`;
    elements.categoryOutput.textContent = `${result.interpretation.category} / ${result.interpretation.isAbstract ? "abstract" : "concrete"}`;

    renderBadges([
      `${result.styleRule.label}`,
      `${result.sizeRule.label} ${result.sizeRule.ratio}`,
      `${textRules[selectedValue("textPolicy")].label}`,
    ]);

    saveState();
  }

  async function copyPrompt() {
    const text = elements.promptOutput.textContent;
    if (!text || text === "タイトルを入れて生成してください。" || text === "ブログタイトルを入力してください。") {
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      elements.copyButton.textContent = "コピー済み";
      window.setTimeout(() => {
        elements.copyButton.textContent = "コピー";
      }, 1200);
    } catch {
      elements.copyButton.textContent = "失敗";
      window.setTimeout(() => {
        elements.copyButton.textContent = "コピー";
      }, 1200);
    }
  }

  async function copyAndOpen(url) {
    await copyPrompt();
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function bindEvents() {
    elements.addStyleButton.addEventListener("click", toggleCustomStylePanel);
    elements.saveStyleButton.addEventListener("click", saveCustomStyle);
    elements.customStyleList.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-style-key]");
      if (!button) return;
      deleteCustomStyle(button.dataset.styleKey);
    });
    elements.generateButton.addEventListener("click", generate);
    elements.copyButton.addEventListener("click", copyPrompt);
    elements.chatgptButton.addEventListener("click", () => copyAndOpen("https://chatgpt.com/"));
    elements.geminiButton.addEventListener("click", () => copyAndOpen("https://gemini.google.com/app"));
    elements.titleInput.addEventListener("keydown", (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "Enter") generate();
    });
    document.querySelectorAll('input[name="size"], input[name="textPolicy"]').forEach((input) => {
      input.addEventListener("change", saveState);
    });
    elements.styleSelect.addEventListener("change", saveState);
    elements.titleInput.addEventListener("input", saveState);
  }

  restoreState();
  bindEvents();
})();
