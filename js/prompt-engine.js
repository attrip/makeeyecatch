(function () {
  const {
    sizeRules,
    baseStyleRules,
    textRules,
    commonRules,
    titleMappings,
    abstractPeopleMap,
    concreteMotifs,
  } = window.MakeEyecatchConfig;

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
      if (abstract) return abstract.subject;
      if (analysis.category === "roles") {
        return "a single symbolic human figure whose clothing or posture hints at multiple roles";
      }
      if (analysis.category === "compare") {
        return "a single human figure expressing contrast through split lighting or posture";
      }
      return "a single human figure with a clear emotional expression, symbolizing the main idea of the title";
    }

    const concrete = concreteMotifs.find((item) => item.test.test(title));
    if (concrete) return concrete.motif;

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

  function buildPrompt({ title, size, style, textPolicy, styleRules }) {
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
      styleRule.composition || sizeRule.prompt,
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

  window.MakeEyecatchPromptEngine = {
    sizeRules,
    baseStyleRules,
    textRules,
    buildPrompt,
  };
})();
