(function () {
  const { textRules } = window.MakeEyecatchPromptEngine;
  const { readCustomStyles, writeCustomStyles, rebuildStyleRules, readState, writeState } = window.MakeEyecatchStorage;
  const { buildPrompt, baseStyleRules } = window.MakeEyecatchPromptEngine;
  const { styleOrder, coverStyleRules } = window.MakeEyecatchConfig;

  const elements = {
    titleInput: document.getElementById("title-input"),
    styleSelect: document.getElementById("style-select"),
    generateButton: document.getElementById("generate-button"),
    copyButton: document.getElementById("copy-button"),
    chatgptButton: document.getElementById("chatgpt-button"),
    geminiButton: document.getElementById("gemini-button"),
    viewStyleButton: document.getElementById("view-style-button"),
    styleDetailPanel: document.getElementById("style-detail-panel"),
    styleDetailSource: document.getElementById("style-detail-source"),
    styleDetailLabel: document.getElementById("style-detail-label"),
    styleDetailLook: document.getElementById("style-detail-look"),
    styleDetailComposition: document.getElementById("style-detail-composition"),
    styleDetailTexture: document.getElementById("style-detail-texture"),
    styleDetailColor: document.getElementById("style-detail-color"),
    styleDetailMood: document.getElementById("style-detail-mood"),
    styleDetailNegative: document.getElementById("style-detail-negative"),
    saveCoverButton: document.getElementById("save-cover-button"),
    closeStyleDetailButton: document.getElementById("close-style-detail-button"),
    promptOutput: document.getElementById("prompt-output"),
    titleOutput: document.getElementById("title-output"),
    subjectOutput: document.getElementById("subject-output"),
    motifOutput: document.getElementById("motif-output"),
    moodOutput: document.getElementById("mood-output"),
    compositionOutput: document.getElementById("composition-output"),
    categoryOutput: document.getElementById("category-output"),
    metaBadges: document.getElementById("meta-badges"),
  };

  let styleRules = rebuildStyleRules();
  let detailOpen = false;

  function selectedValue(name) {
    return document.querySelector(`input[name="${name}"]:checked`)?.value;
  }

  function setCheckedValue(name, value) {
    const input = document.querySelector(`input[name="${name}"][value="${value}"]`);
    if (input) input.checked = true;
  }

  function getSelectedStyleKey() {
    return elements.styleSelect.value;
  }

  function getSelectedStyle() {
    return styleRules[getSelectedStyleKey()] || styleRules.ukiyoe;
  }

  function isEditableCover(styleKey = getSelectedStyleKey()) {
    return Boolean(coverStyleRules[styleKey]);
  }

  function populateStyleSelect() {
    const currentValue = getSelectedStyleKey();
    elements.styleSelect.innerHTML = "";

    styleOrder.forEach((key) => {
      const rule = styleRules[key];
      if (!rule) return;
      const option = document.createElement("option");
      option.value = key;
      option.textContent = rule.label;
      elements.styleSelect.appendChild(option);
    });

    elements.styleSelect.value = styleRules[currentValue] ? currentValue : "ukiyoe";
  }

  function renderBadges(items) {
    elements.metaBadges.innerHTML = "";
    items.forEach((item) => {
      const badge = document.createElement("span");
      badge.textContent = item;
      elements.metaBadges.appendChild(badge);
    });
  }

  function setDetailOpen(nextOpen) {
    detailOpen = nextOpen;
    elements.styleDetailPanel.hidden = !nextOpen;
    elements.viewStyleButton.textContent = nextOpen ? "閉じる" : "Styleの中身を見る";
  }

  function setDetailEditable(editable) {
    [
      elements.styleDetailLabel,
      elements.styleDetailLook,
      elements.styleDetailComposition,
      elements.styleDetailTexture,
      elements.styleDetailColor,
      elements.styleDetailMood,
      elements.styleDetailNegative,
    ].forEach((field) => {
      field.readOnly = !editable;
    });
    elements.saveCoverButton.hidden = !editable;
  }

  function renderStyleDetail() {
    const key = getSelectedStyleKey();
    const style = getSelectedStyle();
    const editable = isEditableCover(key);
    const coverEntry = Object.values(coverStyleRules).find((rule) => rule.baseKey === key);

    elements.styleDetailSource.textContent = editable
      ? `${style.label} を直接編集できます。`
      : `${style.label} は固定プリセットです。編集する場合は ${coverEntry ? coverEntry.label : "対応するカバー"} を選んでください。`;
    elements.styleDetailLabel.value = style.label || "";
    elements.styleDetailLook.value = style.look || "";
    elements.styleDetailComposition.value = style.composition || "";
    elements.styleDetailTexture.value = style.texture || "";
    elements.styleDetailColor.value = style.color || "";
    elements.styleDetailMood.value = style.mood || "";
    elements.styleDetailNegative.value = style.negative || "";
    setDetailEditable(editable);
  }

  function refreshStyles(preserveSelection = true) {
    const currentKey = getSelectedStyleKey();
    styleRules = rebuildStyleRules();
    populateStyleSelect();
    if (preserveSelection && styleRules[currentKey]) {
      elements.styleSelect.value = currentKey;
    }
    if (detailOpen) renderStyleDetail();
  }

  function readFormState() {
    return {
      selectedSize: selectedValue("size") ?? "wide",
      selectedStyle: getSelectedStyleKey(),
      textMode: selectedValue("textPolicy") ?? "noText",
      lastTitle: elements.titleInput.value.trim(),
    };
  }

  function saveState() {
    writeState(readFormState());
  }

  function restoreState() {
    refreshStyles(false);
    const saved = readState();
    if (!saved) return;
    setCheckedValue("size", saved.selectedSize ?? "wide");
    setCheckedValue("textPolicy", saved.textMode ?? "noText");
    elements.styleSelect.value = styleRules[saved.selectedStyle] ? saved.selectedStyle : "ukiyoe";
    elements.titleInput.value = saved.lastTitle ?? "";
  }

  function saveCoverStyle() {
    const styleKey = getSelectedStyleKey();
    if (!isEditableCover(styleKey)) return;

    const customStyles = readCustomStyles();
    const baseKey = coverStyleRules[styleKey].baseKey;
    customStyles[styleKey] = {
      label: elements.styleDetailLabel.value.trim() || coverStyleRules[styleKey].label,
      baseKey,
      look: elements.styleDetailLook.value.trim(),
      composition: elements.styleDetailComposition.value.trim(),
      texture: elements.styleDetailTexture.value.trim(),
      color: elements.styleDetailColor.value.trim(),
      mood: elements.styleDetailMood.value.trim(),
      negative: elements.styleDetailNegative.value.trim(),
    };

    writeCustomStyles(customStyles);
    refreshStyles(false);
    elements.styleSelect.value = styleKey;
    renderStyleDetail();
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
      style: getSelectedStyleKey(),
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
    elements.viewStyleButton.addEventListener("click", () => {
      const nextOpen = !detailOpen;
      setDetailOpen(nextOpen);
      if (nextOpen) renderStyleDetail();
    });
    elements.saveCoverButton.addEventListener("click", saveCoverStyle);
    elements.closeStyleDetailButton.addEventListener("click", () => setDetailOpen(false));
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
    elements.styleSelect.addEventListener("change", () => {
      if (detailOpen) renderStyleDetail();
      saveState();
    });
    elements.titleInput.addEventListener("input", saveState);
  }

  restoreState();
  setDetailOpen(false);
  bindEvents();
})();
