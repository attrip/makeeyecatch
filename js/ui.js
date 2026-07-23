(function () {
  const { baseStyleRules, textRules, buildPrompt } = window.MakeEyecatchPromptEngine;
  const { readState, writeState } = window.MakeEyecatchStorage;
  const titleInput = document.getElementById("title-input");
  const charCount = document.getElementById("char-count");
  const styleCards = [...document.querySelectorAll(".style-card")];
  const selectedStyle = document.getElementById("selected-style");
  const referenceLink = document.getElementById("reference-link");
  const outputReferenceLink = document.getElementById("output-reference-link");
  const generateButton = document.getElementById("generate-button");
  const promptOutput = document.getElementById("prompt-output");
  const copyButton = document.getElementById("copy-button");
  const chatgptButton = document.getElementById("chatgpt-button");
  const copyStatus = document.getElementById("copy-status");
  let style = "ukiyoe";
  const referenceImages = {
    ukiyoe: "./assets/reference-ukiyoe.png",
    original: "./assets/reference-sharp.png",
    simple70s: "./assets/reference-paper.png",
    retro80s: "./assets/reference-poster.png",
  };

  function persist() {
    writeState({ selectedStyle: style, lastTitle: titleInput.value.slice(0, 400) });
  }

  function updateStyle() {
    styleCards.forEach((card) => {
      const isSelected = card.dataset.style === style;
      card.classList.toggle("is-selected", isSelected);
      card.setAttribute("aria-pressed", String(isSelected));
    });
    selectedStyle.textContent = `${baseStyleRules[style].label}を選択中`;
    referenceLink.href = referenceImages[style];
    outputReferenceLink.href = referenceImages[style];
    persist();
  }

  function updateCount() {
    if (titleInput.value.length > 400) titleInput.value = titleInput.value.slice(0, 400);
    charCount.textContent = `${titleInput.value.length} / 400`;
    persist();
  }

  function generate() {
    const title = titleInput.value.trim();
    if (!title) {
      promptOutput.textContent = "記事の核を400文字以内で書いてください。";
      return;
    }
    const result = buildPrompt({
      title,
      size: "wide",
      style,
      textPolicy: "noText",
      styleRules: baseStyleRules,
      referenceAttached: true,
    });
    promptOutput.textContent = result.prompt;
    persist();
  }

  async function copyPrompt() {
    const text = promptOutput.textContent;
    if (!text || text.includes("ここにプロンプト") || text.includes("400文字以内")) return;
    try {
      await navigator.clipboard.writeText(text);
      copyButton.textContent = "コピー済み";
      copyStatus.textContent = "コピー済み。ChatGPTの入力欄で ⌘V（Windowsは Ctrl+V）してください。";
    } catch {
      copyButton.textContent = "コピーできませんでした";
      copyStatus.textContent = "コピーできませんでした。もう一度コピーを押してください。";
    }
    window.setTimeout(() => { copyButton.textContent = "プロンプトをコピー"; }, 1300);
  }

  const saved = readState();
  if (saved) {
    style = baseStyleRules[saved.selectedStyle] ? saved.selectedStyle : style;
    titleInput.value = String(saved.lastTitle || "").slice(0, 400);
  }
  updateStyle();
  updateCount();
  styleCards.forEach((card) => card.addEventListener("click", () => { style = card.dataset.style; updateStyle(); }));
  titleInput.addEventListener("input", updateCount);
  titleInput.addEventListener("keydown", (event) => { if ((event.metaKey || event.ctrlKey) && event.key === "Enter") generate(); });
  generateButton.addEventListener("click", generate);
  copyButton.addEventListener("click", copyPrompt);
  chatgptButton.addEventListener("click", async () => { await copyPrompt(); chatgptButton.textContent = "コピー済み。ChatGPTで貼り付ける ↗"; window.open("https://chatgpt.com/", "_blank", "noopener,noreferrer"); });
})();
