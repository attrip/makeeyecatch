(function () {
  const { textRules, baseStyleRules } = window.MakeEyecatchPromptEngine;
  const { readState, writeState } = window.MakeEyecatchStorage;
  const { buildPrompt } = window.MakeEyecatchPromptEngine;

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
    return baseStyleRules[getSelectedStyleKey()] || baseStyleRules.ukiyoe;
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

  function renderStyleDetail() {
    const style = getSelectedStyle();
    elements.styleDetailSource.textContent = `選択中Style「${style.label}」の中身です。`;
    elements.styleDetailLabel.textContent = style.label || "-";
    elements.styleDetailLook.textContent = style.look || "-";
    elements.styleDetailComposition.textContent = style.composition || "-";
    elements.styleDetailTexture.textContent = style.texture || "-";
    elements.styleDetailColor.textContent = style.color || "-";
    elements.styleDetailMood.textContent = style.mood || "-";
    elements.styleDetailNegative.textContent = style.negative || "-";
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
    const saved = readState();
    if (!saved) return;
    setCheckedValue("size", saved.selectedSize ?? "wide");
    setCheckedValue("textPolicy", saved.textMode ?? "noText");
    elements.styleSelect.value = baseStyleRules[saved.selectedStyle] ? saved.selectedStyle : "ukiyoe";
    elements.titleInput.value = saved.lastTitle ?? "";
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
      styleRules: baseStyleRules,
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
