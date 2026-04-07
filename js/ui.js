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
    customStyleStatus: document.getElementById("custom-style-status"),
    stylePreviewLabel: document.getElementById("style-preview-label"),
    stylePreviewKind: document.getElementById("style-preview-kind"),
    stylePreviewLook: document.getElementById("style-preview-look"),
    stylePreviewComposition: document.getElementById("style-preview-composition"),
    stylePreviewTexture: document.getElementById("style-preview-texture"),
    stylePreviewColor: document.getElementById("style-preview-color"),
    stylePreviewMood: document.getElementById("style-preview-mood"),
    stylePreviewNegative: document.getElementById("style-preview-negative"),
    customStyleSource: document.getElementById("custom-style-source"),
    promptOutput: document.getElementById("prompt-output"),
    titleOutput: document.getElementById("title-output"),
    subjectOutput: document.getElementById("subject-output"),
    motifOutput: document.getElementById("motif-output"),
    moodOutput: document.getElementById("mood-output"),
    compositionOutput: document.getElementById("composition-output"),
    categoryOutput: document.getElementById("category-output"),
    metaBadges: document.getElementById("meta-badges"),
    customStyleLabelInput: document.getElementById("custom-style-label"),
    customStyleLookInput: document.getElementById("custom-style-look"),
    customStyleCompositionInput: document.getElementById("custom-style-composition"),
    customStyleTextureInput: document.getElementById("custom-style-texture"),
    customStyleColorInput: document.getElementById("custom-style-color"),
    customStyleMoodInput: document.getElementById("custom-style-mood"),
    customStyleNegativeInput: document.getElementById("custom-style-negative"),
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
      chip.innerHTML = `<span>${rule.label}</span><button type="button" data-style-key="${key}">削除</button>`;
      elements.customStyleList.appendChild(chip);
    });
  }

  function renderCustomStyleStatus() {
    const customStyles = readCustomStyles();
    const count = Object.keys(customStyles).length;
    const currentStyle = styleRules[elements.styleSelect.value];
    const isCustomSelected = Boolean(customStyles[elements.styleSelect.value]);

    if (!count) {
      elements.customStyleStatus.hidden = true;
      elements.customStyleStatus.textContent = "";
      return;
    }

    const summary = isCustomSelected
      ? `保存済みのMy Style ${count}件。いまは「${currentStyle.label}」を使用中。`
      : `保存済みのMy Style ${count}件。いつでも切り替えできます。`;

    elements.customStyleStatus.hidden = false;
    elements.customStyleStatus.textContent = summary;
  }

  function renderStylePreview() {
    const customStyles = readCustomStyles();
    const currentStyle = styleRules[elements.styleSelect.value] || styleRules.ukiyoe;
    const isCustomSelected = Boolean(customStyles[elements.styleSelect.value]);

    elements.stylePreviewLabel.textContent = currentStyle.label;
    elements.stylePreviewKind.textContent = isCustomSelected ? "My Style" : "Default Style";
    elements.stylePreviewLook.textContent = currentStyle.look || "-";
    elements.stylePreviewComposition.textContent = currentStyle.composition || "-";
    elements.stylePreviewTexture.textContent = currentStyle.texture || "-";
    elements.stylePreviewColor.textContent = currentStyle.color || "-";
    elements.stylePreviewMood.textContent = currentStyle.mood || "-";
    elements.stylePreviewNegative.textContent = currentStyle.negative || "-";
  }

  function clearCustomStyleForm() {
    elements.customStyleLabelInput.value = "";
    elements.customStyleLookInput.value = "";
    elements.customStyleCompositionInput.value = "";
    elements.customStyleTextureInput.value = "";
    elements.customStyleColorInput.value = "";
    elements.customStyleMoodInput.value = "";
    elements.customStyleNegativeInput.value = "";
    elements.customStyleSource.textContent = "";
  }

  function readFormState() {
    return {
      selectedSize: selectedValue("size") ?? "wide",
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
    setCheckedValue("size", saved.selectedSize ?? "wide");
    setCheckedValue("textPolicy", saved.textMode ?? "noText");
    elements.styleSelect.value = styleRules[saved.selectedStyle] ? saved.selectedStyle : "ukiyoe";
    elements.titleInput.value = saved.lastTitle ?? "";
    renderStylePreview();
    renderCustomStyleStatus();
  }

  function fillCustomStyleFormFromCurrent() {
    const currentStyle = styleRules[elements.styleSelect.value] || styleRules.ukiyoe;
    elements.customStyleSource.textContent = `いまのStyle「${currentStyle.label}」を複製して編集します。`;
    elements.customStyleLookInput.value = currentStyle.look || "";
    elements.customStyleCompositionInput.value = currentStyle.composition || "";
    elements.customStyleTextureInput.value = currentStyle.texture || "";
    elements.customStyleColorInput.value = currentStyle.color || "";
    elements.customStyleMoodInput.value = currentStyle.mood || "";
    elements.customStyleNegativeInput.value = currentStyle.negative || "";
  }

  function toggleCustomStylePanel() {
    const willOpen = elements.customStylePanel.hidden;
    elements.customStylePanel.hidden = !willOpen;
    if (willOpen) fillCustomStyleFormFromCurrent();
  }

  function saveCustomStyle() {
    const label = elements.customStyleLabelInput.value.trim();

    if (!label) {
      window.alert("Style名を入れてください。");
      return;
    }

    const key = `custom-${slugifyStyleLabel(label)}`;
    const customStyles = readCustomStyles();
    customStyles[key] = {
      label,
      look: elements.customStyleLookInput.value.trim(),
      composition: elements.customStyleCompositionInput.value.trim(),
      texture: elements.customStyleTextureInput.value.trim(),
      color: elements.customStyleColorInput.value.trim(),
      mood: elements.customStyleMoodInput.value.trim(),
      negative: elements.customStyleNegativeInput.value.trim(),
    };
    writeCustomStyles(customStyles);
    styleRules = rebuildStyleRules();
    populateStyleSelect();
    renderCustomStyleList();
    elements.styleSelect.value = key;
    renderStylePreview();
    renderCustomStyleStatus();
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
    renderStylePreview();
    renderCustomStyleStatus();
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
    elements.styleSelect.addEventListener("change", () => {
      renderStylePreview();
      renderCustomStyleStatus();
      saveState();
    });
    elements.titleInput.addEventListener("input", saveState);
  }

  restoreState();
  renderStylePreview();
  renderCustomStyleStatus();
  bindEvents();
})();
