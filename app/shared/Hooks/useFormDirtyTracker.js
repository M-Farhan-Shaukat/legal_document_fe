import { useRef, useEffect, useState } from "react";

export const useFormTemplate = ({
  formikValues,
  initialQuestions,
  questions,
  templateContent,
}) => {
  const [isDirty, setIsDirty] = useState(false);

  const initialCompareQuestions = initialQuestions.map((q) => ({
    process_key: q.process_key,
    question_type: q.question_type,
    required: q.required,
    title: q.title,
    variable: q.variable,
  }));

  const CompareQuestions = questions.map((q) => ({
    process_key: q.process_key,
    question_type: q.question_type,
    required: q.required,
    title: q.title,
    variable: q.variable,
  }));

  const initialValuesRef = useRef(JSON.stringify(formikValues));
  const initialQuestionsRef = useRef(JSON.stringify(initialCompareQuestions));
  const initialContentRef = useRef(templateContent.trim());

  useEffect(() => {
    const formChanged =
      JSON.stringify(formikValues) !== initialValuesRef.current;
    const questionsChanged =
      JSON.stringify(CompareQuestions) !== initialQuestionsRef.current;
    const contentChanged = templateContent.trim() !== initialContentRef.current;

    setIsDirty(formChanged || questionsChanged || contentChanged);
  }, [formikValues, CompareQuestions, templateContent]);

  return isDirty;
};
