export const buildPayload = (answers, template) => {
  const getAllPages = () => {
    const pages = [];
    template.template.forEach((item) => {
      if (item.type === "page") {
        pages.push(item);
      } else if (
        item.type === "section" &&
        Array.isArray(item.admin_section_pages)
      ) {
        pages.push(...item.admin_section_pages);
      }
    });

    return pages;
  };
  const getAllQuestions = () => {
    const allPages = getAllPages(template.template);
    return allPages.flatMap((p) => p.questions || []);
  };
  const allQs = getAllQuestions();
  const extractAnswers = (questionList, ansObj) => {
    const payload = [];

    questionList.forEach((q) => {
      if (q.having_repeating_items && Array.isArray(ansObj[q.question_slug])) {
        const nestedQuestions = [];
        ansObj[q.question_slug].forEach((group) => {
          const groupAnswers = [];
          q.questions.forEach((subQ) => {
            const ans = group[subQ.variable];
            groupAnswers.push({
              question_id: subQ.id,
              question_title: subQ.title,
              required: subQ.required ? 1 : 0,
              variable: subQ.variable,
              question_type: subQ.question_type,
              answer: ans !== undefined ? ans : "",
            });
          });
          nestedQuestions.push(groupAnswers);
        });
        if (nestedQuestions.length > 0) {
          payload.push({
            question_id: q.id,
            question_title: q.title,
            required: q.required ? 1 : 0,
            variable: q.variable,
            question_type: q.question_type,
            having_repeating_items: true,
            questions: nestedQuestions,
          });
        }
      } else {
        const ans = ansObj[q.variable];
        if (ans !== undefined && ans !== null && ans !== "") {
          payload.push({
            question_id: q.id,
            question_title: q.title,
            required: q.required ? 1 : 0,
            variable: q.variable,
            question_type: q.question_type,
            having_repeating_items: !!q.having_repeating_items,
            answer: Array.isArray(ans) ? ans : ans,
          });
        }
      }
    });

    return payload;
  };
  return {
    name: "User Information",
    template_id: template.template_id,
    status: "in_progress",
    // document_id: Math.random().toString(36).substring(2, 15),//as per advise by backend team member (Ebrahim) to set null here
    document_id: null,
    answers: extractAnswers(allQs, answers),
  };
};
