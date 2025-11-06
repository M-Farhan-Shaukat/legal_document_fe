export const validateTemplateData = (templateContent, sections, pages) => {
  // const validateIfConditions = (templateString) => {
  //   const regex = /{%\s*(if\s*\([^\)]+\)|endif)\s*%}/g;
  //   const stack = [];
  //   let match;

  //   while ((match = regex.exec(templateString)) !== null) {
  //     const tag = match[1].trim();

  //     if (tag.startsWith("if(")) {
  //       stack.push("if");
  //     } else if (tag === "endif") {
  //       if (stack.length === 0) {
  //         console.warn("Unexpected {% endif %} without matching {% if %}");
  //         return false;
  //       }
  //       stack.pop();
  //     }
  //   }

  //   if (stack.length > 0) {
  //     console.warn("Unclosed {% if %} block(s) detected.");
  //     return false;
  //   }

  //   return true;
  // };

  // const validateTemplate = (templateContent, pages) => {
  //   if (!validateIfConditions(templateContent)) {
  //     return {
  //       valid: false,
  //       message: "Unmatched {% if %} blocks in template content.",
  //     };
  //   }

  //   const allQuestionVariables = new Set();
  //   pages.forEach((page) => {
  //     page.questions?.forEach((question) => {
  //       if (question.variable) {
  //         allQuestionVariables.add(question.variable.trim());
  //       }
  //     });
  //   });

  //   return { valid: true };
  // };
  if (!templateContent.trim()) {
    return { valid: false, message: "Template content cannot be empty." };
  }

  const newSections = sections.map((section) => ({
    type: "section",
    ...section,
    pages: pages.filter((p) => p.section_slug === section.section_slug),
  }));

  const standalonePages = pages
    .filter((p) => !p.section_slug) // filter first
    .map((p) => ({
      type: "page",
      ...p,
    }));

  const allPages = [
    ...standalonePages,
    ...newSections.flatMap((s) => s.pages || []),
  ];

  // const templateValidation = validateTemplate(templateContent, pages);
  // if (!templateValidation.valid) {
  //   return { valid: false, message: templateValidation.message };
  // }

  for (const section of newSections) {
    if (!section.pages || section.pages.length === 0) {
      return {
        valid: false,
        message: `Section "${section.name}" must have at least one page.`,
      };
    }
  }

  for (const page of allPages) {
    if (!page.questions || page.questions.length === 0) {
      return {
        valid: false,
        message: `Page "${page.name}" must have at least one question.`,
      };
    }

    for (const question of page.questions) {
      const variable = question.variable?.trim();
      if (question.having_repeating_items) {
        if (
          !Array.isArray(question.questions) ||
          question.questions.length === 0
        ) {
          return {
            valid: false,
            message: `Repeating questions in page "${page.name}" must have at least one question.`,
          };
        }
        for (const subQ of question.questions) {
          const subVar = subQ.variable?.trim();

          if (!subQ.title?.trim() || !subVar || !subQ.question_type?.trim()) {
            return {
              valid: false,
              message: `Each sub-question in repeating group on page "${page.name}" must have a title, variable .`,
            };
          }

          if (/\s/.test(subVar)) {
            return {
              valid: false,
              message: `Sub-question variable "${subVar}" in page "${page.name}" should not contain spaces. Use underscores (_) instead.`,
            };
          }
        }
      } else if (!variable || !question.title) {
        return {
          valid: false,
          message: `Every question in page "${page.name}" must have a title and variable name.`,
        };
      }

      if (/\s/.test(variable)) {
        return {
          valid: false,
          message: `Variable name "${variable}" in page "${page.name}" should not contain spaces. Use underscores (_) instead.`,
        };
      }
    }
  }

  const variableMap = {};
  allPages.forEach((page) => {
    page.questions.forEach((q) => {
      const variable = q.variable?.trim();
      if (variable) {
        variableMap[variable] = (variableMap[variable] || 0) + 1;
      }
    });
  });

  const duplicates = Object.entries(variableMap)
    .filter(([_, count]) => count > 1)
    .map(([key]) => `"${key}"`);

  if (duplicates.length > 0) {
    return {
      valid: false,
      message: `Duplicate variable(s) found: ${duplicates.join(", ")}`,
    };
  }

  return {
    valid: true,
    newSections,
    standalonePages,
    allPages,
  };
};
