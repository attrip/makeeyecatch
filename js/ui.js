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
    deleteStyleButton: document.getElementById("delete-style-button"),
    closeStyleButton: document.getElementById("close-style-button"),
    customStylePanel: document.getElementById("custom-style-panel"),
    customStyleList: document.getElementById("custom-style-list"),
    customStyleStatus: document.getElementById("custom-style-status"),
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
  let editorOpen = false;

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

  function currentStyleRecord() {
    const customStyles = readCustomStyles();
    const currentStyle = styleRules[elements.styleSelect.value] || styleRules.ukiyoe;
    const isCustomSelected = Boolean(customStyles[elements.styleSelect.value]);

    return {
      currentStyle,
      isCustomSelected,
    };
  }

  function setEditorOpen(nextOpen) {
    editorOpen = nextOpen;
    elements.customStylePanel.hidden = !nextOpen;
    elements.addStyleButton.textContent = nextOpen ? "閉じる" : "中身を見る / My Style を作る";
  }

  function fillCustomStyleFormFromCurrent() {
    const { currentStyle, isCustomSelected } = currentStyleRecord();
    elements.customStyleSource.textContent = isCustomSelected
      ? `いまは My Style「${currentStyle.label}」を編集中です。`
      : `いまの標準Style「${currentStyle.label}」をベースに My Style を作れます。`;
    elements.customStyleLabelInput.value = isCustomSelected ? currentStyle.label || "" : "";
    elements.customStyleLookInput.value = currentStyle.look || "";
    elements.customStyleCompositionInput.value = currentStyle.composition || "";
    elements.customStyleTextureInput.value = currentStyle.texture || "";
    elements.customStyleColorInput.value = currentStyle.color || "";
    elements.customStyleMoodInput.value = currentStyle.mood || "";
    elements.customStyleNegativeInput.value = currentStyle.negative || "";
  }

  function renderStyleEditorState() {
    const { isCustomSelected } = currentStyleRecord();
    elements.saveStyleButton.textContent = isCustomSelected ? "このStyleを更新" : "My Style を作る";
    elements.deleteStyleButton.hidden = !isCustomSelected;
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
    setEditorOpen(false);

    const saved = readState();
    if (!saved) return;
    setCheckedValue("size", saved.selectedSize ?? "wide");
    setCheckedValue("textPolicy", saved.textMode ?? "noText");
    elements.styleSelect.value = styleRules[saved.selectedStyle] ? saved.selectedStyle : "ukiyoe";
    elements.titleInput.value = saved.lastTitle ?? "";
    fillCustomStyleFormFromCurrent();
    renderStyleEditorState();
    renderCustomStyleStatus();
  }

  function toggleCustomStylePanel() {
    const nextOpen = !editorOpen;
    setEditorOpen(nextOpen);
    if (nextOpen) {
      fillCustomStyleFormFromCurrent();
      renderStyleEditorState();
    }
  }

  function saveCustomStyle() {
    const label = elements.customStyleLabelInput.value.trim();

    if (!label) {
      window.alert("Style名を入れてください。");
      return;
    }

    const customStyles = readCustomStyles();
    const currentKey = elements.styleSelect.value;
    const isCustomSelected = Boolean(customStyles[currentKey]);
    const key = isCustomSelected ? currentKey : `custom-${slugifyStyleLabel(label)}`;
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
    fillCustomStyleFormFromCurrent();
    renderStyleEditorState();
    renderCustomStyleStatus();
    setEditorOpen(true);
    saveState();
  }

  function deleteCustomStyle(key = elements.styleSelect.value) {
    const customStyles = readCustomStyles();
    if (!customStyles[key]) return;
    const deletedSelected = key === elements.styleSelect.value;
    delete customStyles[key];
    writeCustomStyles(customStyles);
    styleRules = rebuildStyleRules();
    populateStyleSelect();
    renderCustomStyleList();
    if (deletedSelected) {
      elements.styleSelect.value = "ukiyoe";
    }
    fillCustomStyleFormFromCurrent();
    renderStyleEditorState();
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
    elements.deleteStyleButton.addEventListener("click", () => deleteCustomStyle());
    elements.closeStyleButton.addEventListener("click", () => setEditorOpen(false));
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
      if (editorOpen) {
        fillCustomStyleFormFromCurrent();
        renderStyleEditorState();
      }
      renderCustomStyleStatus();
      saveState();
    });
    elements.titleInput.addEventListener("input", saveState);
  }

  restoreState();
  fillCustomStyleFormFromCurrent();
  renderStyleEditorState();
  renderCustomStyleStatus();
  bindEvents();
})();
