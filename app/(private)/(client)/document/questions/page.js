"use client";
import { LocalServer } from "@/app/utils";
import { getErrorMessage } from "@/app/utils/helper";
import ToastNotification from "@/app/utils/Toast";
import { useFormik } from "formik";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { useSelector } from "react-redux";
import { Button, Label, Spinner } from "reactstrap";
import * as Yup from "yup";
import "./_questions.scss";
import QuestionField from "./questionFields";
import DynamicQuestionSets from "./repeatingQuestions";

const flattenConditions = (conditionArray) => {
  const flat = [];
  const recurse = (items, parentId = null) => {
    items.forEach((item) => {
      const { children, ...rest } = item;
      const cond = { ...rest, parent_slug: parentId };
      flat.push(cond);
      if (children && children.length) {
        recurse(children, item.logic_group_id);
      }
    });
  };
  recurse(conditionArray);
  return flat;
};

const evaluateConditionsRecursive = (
  conditions,
  parentSlug,
  evaluateSingleCondition
) => {
  const children = conditions.filter((c) => c.parent_slug === parentSlug);
  if (children.length === 0) return true;

  let finalResult = null;

  for (const cond of children) {
    const condResult = evaluateSingleCondition(cond);
    const nestedResult = evaluateConditionsRecursive(
      conditions,
      cond.logic_group_id,
      evaluateSingleCondition
    );
    let combinedResult;
    const nestedChildren = conditions.filter(
      (c) => c.parent_slug === cond.logic_group_id
    );
    let connector = "and";
    if (nestedChildren.length > 0 && nestedChildren[0].logical_connector) {
      connector = nestedChildren[0].logical_connector;
    }
    if (connector === "or") {
      combinedResult = condResult || nestedResult;
    } else {
      combinedResult = condResult && nestedResult;
    }
    const thisConnector = cond.logical_connector || "and";
    if (finalResult === null) {
      finalResult = combinedResult;
    } else if (thisConnector === "or") {
      finalResult = finalResult || combinedResult;
    } else {
      finalResult = finalResult && combinedResult;
    }
  }

  return finalResult ?? true;
};

const Questionnaire = ({ isAdmin = false }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const document_id = localStorage.getItem("document_id");
  const { user } = useSelector((state) => state.user);
  const { ToastComponent } = ToastNotification;

  const [loading, setLoading] = useState(true);
  const [btnloading, setBtnLoading] = useState(false);

  const [data, setdata] = useState([]);
  const [paymentStatus, setPaymentstatus] = useState({ status: "", price: 0 });
  const [allAnswers, setAllAnswers] = useState(
    JSON.parse(localStorage.getItem(`questionnaire_${id}`)) || {}
  );
  const [template, setTemplates] = useState([]);

  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [documentIDnextpage, setDocumentidNextPage] = useState();
  const getAllPages = () => {
    const pages = [];
    template.forEach((item) => {
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
    const allPages = getAllPages(template);
    return allPages.flatMap((p) => p.questions || []);
  };
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPageIndex]);

  const loadAnswersFromLocalStorage = () => {
    const storedAnswers = localStorage.getItem(`questionnaire_${id}`);
    return storedAnswers ? JSON.parse(storedAnswers) : {};
  };

  const saveAnswersToLocalStorage = (newAnswers) => {
    try {
      const key = `questionnaire_${id}`;
      const existing = localStorage.getItem(key);
      let mergedAnswers = {};

      if (existing) {
        mergedAnswers = { ...JSON.parse(existing), ...newAnswers };
      } else {
        mergedAnswers = newAnswers;
      }

      localStorage.setItem(key, JSON.stringify(mergedAnswers));
      return mergedAnswers;
    } catch (err) {
      console.error("Failed to save answers to localStorage", err);
      return newAnswers;
    }
  };
  const fetchAnswersFromBackend = async () => {
    try {
      const token = user?.user;
      if (!token) {
        return {};
      }

      const response = await LocalServer.get(
        isAdmin
          ? `/api/document/get-answers?document_id=${id}`
          : `/api/document/client/get-answers?document_id=${document_id}`
      );

      if (response?.data) {
        const formattedAnswers = {};
        const answers = response?.data?.document?.document_template?.answers;

        answers?.forEach((answer) => {
          if (answer.having_repeating_items && answer.questions) {
            formattedAnswers[answer.question_slug] = answer.questions.map(
              (group) => {
                const groupAnswers = {};
                group.forEach((q) => {
                  groupAnswers[q.variable] = q.answer;
                });
                return groupAnswers;
              }
            );
          } else if (answer.questions) {
            formattedAnswers[answer.question_slug] = answer.questions.map(
              (q) => ({
                [q.variable]: q.answer,
              })
            );
          } else {
            formattedAnswers[answer.variable] = answer.answer;
          }
        });
        return formattedAnswers;
      }
      return {};
    } catch (error) {
      ToastComponent("error", getErrorMessage(error));
      return {};
    }
  };
  const templateQuestion = async () => {
    const url = user?.user
      ? isAdmin
        ? `/api/document/get-answers?document_id=${id}`
        : `/api/template/clientquestions?id=${id}`
      : `/api/template/guestquestions?id=${id}`;
    try {
      const response = await LocalServer.get(url);

      if (response?.data) {
        setPaymentstatus({
          status: response.data.template_payment_status,
          price: response.data.template_price,
          name: response.data.template_name,
        });
        isAdmin && setdata(response.data.document || []);
        setTemplates(response.data.template || []);
      }
    } catch (error) {
      ToastComponent("error", getErrorMessage(error));
      router.back();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      await templateQuestion();
      const backendAnswers = document_id ? await fetchAnswersFromBackend() : {};

      const localAnswers = loadAnswersFromLocalStorage();
      setAllAnswers({ ...localAnswers, ...backendAnswers });
    };
    initialize();
  }, [document_id]);

  const flattenQuestions = (questions = []) => {
    return questions.flatMap((q) => {
      if (q.questions && q.questions.length) {
        return [q, ...flattenQuestions(q.questions)];
      }
      return [q];
    });
  };

  const evaluateSingleCondition = (cond, formValues) => {
    if (!cond.slug) {
      return true; // Group node: always true, proceed to nested eval
    }

    const questionMap = {};
    const indexQuestions = (questions, parentSlug = null) => {
      questions.forEach((q) => {
        questionMap[q.question_slug] = { ...q, parent_slug: parentSlug };
        if (q.having_repeating_items && q.questions?.length) {
          indexQuestions(q.questions, q.question_slug);
        }
      });
    };
    getAllQuestions().forEach((q) => {
      indexQuestions([q]);
    });

    const question = questionMap[cond.slug];
    if (!question) {
      console.warn(`Question with slug ${cond.slug} not found`);
      return false;
    }

    let answer;
    if (question.parent_slug) {
      const parentGroups = formValues?.[question.parent_slug] ?? [];
      const allGroupAnswers = parentGroups
        .map((g) => g?.[question.variable])
        .filter((v) => v !== undefined);
      answer = allGroupAnswers.length > 0 ? allGroupAnswers : [];
    } else {
      answer = formValues?.[question.variable] ?? "";
    }

    const value = cond.value;

    switch (cond.operator) {
      case "equals":
        return Array.isArray(answer)
          ? answer.some((v) => v == value)
          : answer == value;
      case "not_equals":
        return Array.isArray(answer)
          ? !answer.some((v) => v == value)
          : answer != value;
      case "less_than":
        return Array.isArray(answer)
          ? answer.some((v) => parseFloat(v) < parseFloat(value))
          : parseFloat(answer) < parseFloat(value);
      case "greater_than":
        return Array.isArray(answer)
          ? answer.some((v) => parseFloat(v) > parseFloat(value))
          : parseFloat(answer) > parseFloat(value);
      case "less_than_or_equal":
        return Array.isArray(answer)
          ? answer.some((v) => parseFloat(v) <= parseFloat(value))
          : parseFloat(answer) <= parseFloat(value);
      case "greater_than_or_equal":
        return Array.isArray(answer)
          ? answer.some((v) => parseFloat(v) >= parseFloat(value))
          : parseFloat(answer) >= parseFloat(value);
      case "contains":
        return Array.isArray(answer)
          ? answer.includes(value)
          : String(answer).includes(value);
      case "not_contains":
        return Array.isArray(answer)
          ? !answer.includes(value)
          : !String(answer).includes(value);
      case "in":
        return Array.isArray(answer)
          ? answer.includes(value)
          : String(answer).includes(value);
      case "not_in":
        return Array.isArray(answer)
          ? !answer.includes(value)
          : !String(answer).includes(value);
      default:
        console.warn(`Unknown operator ${cond.operator}`);
        return false;
    }
  };

  const getVisiblePages = (pages, currentAnswers) => {
    return pages.filter((page) => {
      const { condition, condition_type } = page;
      if (!condition || !Array.isArray(condition) || !condition.length) {
        return true;
      }
      const flatCondition = flattenConditions(condition);
      const result = evaluateConditionsRecursive(flatCondition, null, (cond) =>
        evaluateSingleCondition(cond, currentAnswers)
      );
      return condition_type === "show_page" ? result : !result;
    });
  };

  const getVisibleQuestions = (questionsList, formValues) => {
    return questionsList.filter((q) => {
      if (!q.question_conditions) return true;
      const { condition, condition_type } = q.question_conditions;
      if (!condition || !condition.length) return true;

      const flatCondition = flattenConditions(condition);
      const result = evaluateConditionsRecursive(flatCondition, null, (cond) =>
        evaluateSingleCondition(cond, formValues)
      );

      return condition_type === "show_question" ? result : !result;
    });
  };

  const visiblePages = useMemo(() => {
    const combined = getAllPages();
    return getVisiblePages(combined, allAnswers);
  }, [template, allAnswers]);

  const currentPage = visiblePages[currentPageIndex] || null;
  const allQuestionsOnPage = currentPage?.questions || [];

  // Helper function to get default value for a question
  const getDefaultValue = (question) => {
    const defaultOption = question.question_options?.find(
      (opt) => opt.default_selected
    );
    if (defaultOption) {
      switch (question.question_type) {
        case "dropdown":
        case "radio_button":
          return defaultOption.value;
        case "checkboxes":
        case "multi_select":
        case "combo_box":
          return [defaultOption.value];
        default:
          return defaultOption.value;
      }
    }
    // Return empty value based on question type
    switch (question.question_type) {
      case "checkboxes":
      case "multi_select":
      case "combo_box":
        return [];
      default:
        return "";
    }
  };

  const getInitialValues = () => {
    const initialValues = {};

    allQuestionsOnPage.forEach((q) => {
      if (q.having_repeating_items && q.questions?.length > 0) {
        if (Array.isArray(allAnswers[q.question_slug])) {
          initialValues[q.question_slug] = allAnswers[q.question_slug].map(
            (group) =>
              q.questions.reduce((acc, subQ) => {
                acc[subQ.variable] =
                  group[subQ.variable] ?? getDefaultValue(subQ);
                return acc;
              }, {})
          );
        } else {
          initialValues[q.question_slug] = [
            q.questions.reduce((acc, subQ) => {
              acc[subQ.variable] = getDefaultValue(subQ);
              return acc;
            }, {}),
          ];
        }
      } else {
        initialValues[q.variable] =
          allAnswers[q.variable] ?? getDefaultValue(q);
      }
    });

    return { ...initialValues };
  };

  const isQuestionVisible = (q, formValues) => {
    if (!q?.question_conditions) return true;

    const { condition, condition_type } = q.question_conditions;
    if (!condition || !condition.length) return true;

    const flatCondition = flattenConditions(condition);
    const result = evaluateConditionsRecursive(flatCondition, null, (cond) =>
      evaluateSingleCondition(cond, formValues)
    );

    return condition_type === "show_question" ? result : !result;
  };

  const getValidationSchema = (currentFormValues = {}) => {
    const shape = {};
    const formValues = { ...allAnswers, ...currentFormValues };

    allQuestionsOnPage.forEach((q) => {
      if (!isQuestionVisible(q, formValues)) return;

      if (q.having_repeating_items && q.questions?.length > 0) {
        const baseSubShape = {};
        q.questions.forEach((subQ) => {
          if (!isQuestionVisible(subQ, formValues)) return;

          const { variable, question_type, required, min, max } = subQ;
          let validator = getYupValidator(subQ);

          if (required) {
            validator = validator.test(
              `required-if-visible-${variable}`,
              "This field is required",
              function (value) {
                const groupItem = this.parent;
                const updatedFormValues = {
                  ...formValues,
                  [q.question_slug]: formik.values[q.question_slug] || [],
                };

                const groupForVisibility = {
                  ...groupItem,
                  [q.question_slug]: [groupItem],
                };
                const visibleForThisItem = isQuestionVisible(subQ, {
                  ...updatedFormValues,
                  ...groupForVisibility,
                });
                return visibleForThisItem
                  ? value !== undefined &&
                      value !== null &&
                      value !== "" &&
                      (Array.isArray(value) ? value.length > 0 : true)
                  : true;
              }
            );
          }

          if (min || max) {
            if (min) {
              validator = validator.test(
                `min-if-visible-${variable}`,
                `Minimum ${min}`,
                function (value) {
                  const groupItem = this.parent;
                  const updatedFormValues = {
                    ...formValues,
                    [q.question_slug]: formik.values[q.question_slug] || [],
                  };
                  const groupIndex = parseInt(
                    this.path.match(/\[(\d+)\]/)?.[1] || 0
                  );
                  const groupForVisibility = {
                    ...groupItem,
                    [q.question_slug]: [groupItem],
                  };
                  const visibleForThisItem = isQuestionVisible(subQ, {
                    ...updatedFormValues,
                    ...groupForVisibility,
                  });
                  return visibleForThisItem ? value >= min : true;
                }
              );
            }
            if (max) {
              validator = validator.test(
                `max-if-visible-${variable}`,
                `Maximum ${max}`,
                function (value) {
                  const groupItem = this.parent;
                  const updatedFormValues = {
                    ...formValues,
                    [q.question_slug]: formik.values[q.question_slug] || [],
                  };
                  const groupIndex = parseInt(
                    this.path.match(/\[(\d+)\]/)?.[1] || 0
                  );
                  const groupForVisibility = {
                    ...groupItem,
                    [q.question_slug]: [groupItem],
                  };
                  const visibleForThisItem = isQuestionVisible(subQ, {
                    ...updatedFormValues,
                    ...groupForVisibility,
                  });
                  return visibleForThisItem ? value <= max : true;
                }
              );
            }
          }

          baseSubShape[variable] = validator;
        });

        if (Object.keys(baseSubShape).length > 0) {
          shape[q.question_slug] = Yup.array().of(
            Yup.object()
              .shape(baseSubShape)
              .test(
                "repeating-group-visible-validation",
                "Invalid group data",
                function (groupItem) {
                  const hasVisibleData = Object.keys(groupItem).some((key) => {
                    const subQ = q.questions.find((sq) => sq.variable === key);
                    if (!subQ) return false;
                    const updatedFormValues = {
                      ...formValues,
                      [q.question_slug]: formik.values[q.question_slug] || [],
                    };
                    const groupForVisibility = {
                      ...groupItem,
                      [q.question_slug]: [groupItem],
                    };
                    const visible = isQuestionVisible(subQ, {
                      ...updatedFormValues,
                      ...groupForVisibility,
                    });
                    return (
                      visible &&
                      groupItem[key] !== undefined &&
                      groupItem[key] !== "" &&
                      (Array.isArray(groupItem[key])
                        ? groupItem[key].length > 0
                        : true)
                    );
                  });
                  return (
                    hasVisibleData ||
                    Object.keys(groupItem).every(
                      (key) =>
                        groupItem[key] === "" ||
                        (Array.isArray(groupItem[key]) &&
                          groupItem[key].length === 0)
                    )
                  );
                }
              )
          );
        }
      } else {
        const { variable, question_type, required, min, max } = q;
        let validator = getYupValidator(q);

        if (required) validator = validator.required("This field is required");

        shape[variable] = validator;
      }
    });

    return Yup.object().shape(shape);
  };

  const replacePlaceholders = (text, answers) => {
    return text?.replace(/\{\{(.*?)\}\}/g, (_, key) => {
      return answers[key] && answers[key].trim() !== ""
        ? answers[key] + " "
        : "";
    });
  };

  const getYupValidator = (q) => {
    const { question_type, min, max } = q;
    switch (question_type) {
      case "email":
        return Yup.string().nullable().email("Please enter a valid email");
      case "checkboxes":
      case "combo_box":
        let arrValidator = Yup.array().of(Yup.string()).nullable();
        if (min)
          arrValidator = arrValidator.min(min, `At least ${min} options`);
        if (max) arrValidator = arrValidator.max(max, `At most ${max} options`);
        return arrValidator;
      case "number":
      case "decimal_number":
        let numValidator = Yup.number()
          .nullable()
          .typeError("Must be a number");
        if (min !== undefined)
          numValidator = numValidator.min(min, `Minimum value is ${min}`);
        if (max !== undefined)
          numValidator = numValidator.max(max, `Maximum value is ${max}`);
        return numValidator;
      case "text":
      case "text_area":
        let textValidator = Yup.string().nullable().trim();
        if (min)
          textValidator = textValidator.min(min, `Minimum length is ${min}`);
        if (max)
          textValidator = textValidator.max(max, `Maximum length is ${max}`);
        return textValidator;
      case "date":
        return Yup.date().nullable().typeError("Invalid date format");
      case "dropdown":
      case "yes_no":
      case "radio_button":
        return Yup.string().nullable();
      default:
        return Yup.mixed().nullable();
    }
  };

  const formik = useFormik({
    initialValues: getInitialValues(),
    validationSchema: getValidationSchema(),
    enableReinitialize: true,
    onSubmit: (values) => {
      if (currentPageIndex + 1 < visiblePages.length) {
        handleNext(values);
      } else {
        handleSubmitAll(values);
      }
    },
  });

  useEffect(() => {
    if (allAnswers && allQuestionsOnPage.length) {
      const newInitials = getInitialValues();
      formik.setValues(newInitials);
    }
  }, [allAnswers, allQuestionsOnPage, currentPageIndex]);

  const prevVisibleQuestionsRef = useRef([]);
  const prevAllAnswersRef = useRef(allAnswers);

  const visibleQuestions = useMemo(() => {
    const questions = getVisibleQuestions(allQuestionsOnPage, {
      ...allAnswers,
      ...formik.values,
    });
    return questions;
  }, [allQuestionsOnPage, allAnswers, formik.values]);

  useEffect(() => {
    if (currentPageIndex >= visiblePages.length) {
      setCurrentPageIndex(0);
    }
  }, [visiblePages, currentPageIndex]);

  useEffect(() => {
    const prevVisibleIds = new Set(
      prevVisibleQuestionsRef.current.map((q) => q.id)
    );
    const currentVisibleIds = new Set(visibleQuestions.map((q) => q.id));
    const hiddenQuestions = allQuestionsOnPage.filter(
      (q) => !currentVisibleIds.has(q.id) && prevVisibleIds.has(q.id)
    );

    if (hiddenQuestions.length === 0) {
      prevVisibleQuestionsRef.current = visibleQuestions;
      prevAllAnswersRef.current = allAnswers;
      return;
    }

    let valuesChanged = false;
    const newAnswers = { ...allAnswers };
    const newValues = { ...formik.values };

    hiddenQuestions.forEach((q) => {
      if (q.having_repeating_items) {
        if (
          newValues[q.question_slug]?.length > 0 ||
          newAnswers[q.question_slug]?.length > 0
        ) {
          newValues[q.question_slug] = [];
          newAnswers[q.question_slug] = [];
          valuesChanged = true;
        }
      } else {
        const emptyValue =
          q.question_type === "checkboxes" || q.question_type === "combo_box"
            ? []
            : "";
        if (
          newValues[q.variable] !== emptyValue ||
          newAnswers[q.variable] !== emptyValue
        ) {
          newValues[q.variable] = emptyValue;
          newAnswers[q.variable] = emptyValue;
          valuesChanged = true;
        }
      }
    });

    if (valuesChanged) {
      formik.setValues(newValues, false);
      setAllAnswers(newAnswers);
      saveAnswersToLocalStorage(newAnswers);
    }

    prevVisibleQuestionsRef.current = visibleQuestions;
    prevAllAnswersRef.current = allAnswers;
  }, [visibleQuestions, allQuestionsOnPage, allAnswers]);

  const handleAnswerChange = (field, value, formValues) => {
    setAllAnswers((prevAnswers) => ({
      ...prevAnswers,
      ...formValues,
      [field]: value,
    }));
  };
  const saveDocument = async () => {
    const finalAnswers =
      JSON.parse(localStorage.getItem(`questionnaire_${id}`)) || {};

    const payload = buildPayload(finalAnswers);
    try {
      const res = await LocalServer.post(
        `/api/document/client/document`,
        payload
      );
      setDocumentidNextPage(res?.data?.template?.document?.id);
      typeof window !== "undefined" &&
        localStorage.setItem("document_id", res?.data?.template?.document?.id);
      return true;
    } catch (error) {
      ToastComponent("error", getErrorMessage(error));
      return false;
    }
  };

  const handleNext = async (values) => {
    const finalAnswers = { ...allAnswers, ...values };
    setAllAnswers(finalAnswers);
    saveAnswersToLocalStorage(values);
    let canProceed = true;
    if (user && !isAdmin) canProceed = await saveDocument();
    if (canProceed && currentPageIndex + 1 < visiblePages.length) {
      setCurrentPageIndex(currentPageIndex + 1);
    }
  };
  const buildPayload = (answers) => {
    const allQs = getAllQuestions();

    const extractAnswers = (questionList, ansObj) => {
      const payload = [];
      questionList.forEach((q) => {
        if (
          q.having_repeating_items &&
          Array.isArray(ansObj[q.question_slug])
        ) {
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
              question_slug: q.question_slug,
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
      template_id: isAdmin ? data.document_template.admin_template_id : id,
      status: "in_progress",
      document_id: documentIDnextpage || document_id || null,
      answers: extractAnswers(allQs, answers),
    };
  };

  const handleSubmitAll = async (values) => {
    const finalAnswers = { ...allAnswers, ...values };
    setAllAnswers(finalAnswers);
    saveAnswersToLocalStorage(finalAnswers);
    if (user) {
      setBtnLoading(true);

      const payload = buildPayload(finalAnswers);
      try {
        const response = await LocalServer.post(
          isAdmin ? `/api/document/post` : `/api/document/client/document`,
          {
            ...payload,

            status: "complete",
          }
        );
        localStorage.removeItem(`questionnaire_${id}`);
        localStorage.removeItem("document_id");
        if (isAdmin) {
          router.push(`/admin/document/view/${id}`);
          ToastComponent("success", "Document submitted successfully");
          return;
        }
        if (response.data?.success) {
          if (response?.data?.template?.payment_details) {
            window.location.href =
              response?.data?.template?.payment_details.url;
            localStorage.setItem(
              "payment_token",
              response?.data?.template?.payment_details.system_token
            );
          } else {
            router.push("/document/view");
            ToastComponent("success", "Document submitted successfully");
          }
        }
      } catch (error) {
        setBtnLoading(false);
        ToastComponent("error", getErrorMessage(error));
      }
    } else {
      const payment_due = {
        template_id: id,
        template,
        template_price: paymentStatus.price,
        template_name: paymentStatus.name,
      };

      localStorage.setItem("payment_proceed", JSON.stringify(payment_due));
      localStorage.setItem("payment_due", true);

      if (paymentStatus.status === "paid") {
        router.push("/document-price");
      } else {
        router.push("/register");
      }
    }
  };

  if (!id)
    return (
      <div className="error-wrapper">
        <h2>Error: Invalid Template ID</h2>
        <Button color="primary" outline onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );

  if (!currentPage)
    return (
      <div
        className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
        style={{ background: "rgba(255,255,255,0.6)", zIndex: 10 }}>
        <Spinner type="grow" color="primary" />
      </div>
    );
  return (
    <div className={isAdmin ? "main-wrapper-admin" : "main-wrapper"}>
      <Button
        color="secondary"
        type="button"
        className="steps-btn back-btn"
        onClick={() => {
          localStorage.removeItem("document_id");
          router.push(
            isAdmin ? `/admin/document/view/${id}` : "/document/view"
          );
        }}>
        <FaArrowLeft className="me-2" />
        {isAdmin ? "Back" : "Back to Listing"}
      </Button>

      {!loading ? (
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPageIndex}
            className="p-4 question-wrapper"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4 }}>
            {currentPage?.section_id && (
              <h4 className="w-100 text-center fw-bold">
                {replacePlaceholders(
                  template?.find(
                    (item) =>
                      item.type === "section" &&
                      item.id === currentPage?.section_id
                  )?.name ?? "",
                  allAnswers
                )}
              </h4>
            )}
            <h4 className="w-100 text-center fw-bold">
              {replacePlaceholders(currentPage?.name, allAnswers)}
            </h4>
            <form onSubmit={formik.handleSubmit}>
              {visibleQuestions.map((question) => {
                if (
                  question.having_repeating_items &&
                  question.questions?.length > 0
                ) {
                  return (
                    <React.Fragment key={question.id}>
                      <Label
                        size="lg"
                        className="w-100 text-center fw-bold"
                        style={{ marginBottom: "25px" }}>
                        {question.title}
                      </Label>
                      <DynamicQuestionSets
                        otherQuestions={question.questions}
                        visibleQuestions={getVisibleQuestions(
                          question.questions,
                          {
                            ...allAnswers,
                            ...formik.values,
                          }
                        )}
                        slug={question.question_slug}
                        formik={formik}
                      />
                    </React.Fragment>
                  );
                }
                return (
                  <QuestionField
                    key={question.id}
                    question={question}
                    replacePlaceholders={replacePlaceholders}
                    allAnswers={allAnswers}
                    formik={{
                      ...formik,
                      setFieldValue: (field, value) => {
                        formik.setFieldValue(field, value);
                        handleAnswerChange(field, value, formik.values);
                      },
                    }}
                  />
                );
              })}

              <div className="btn-wrapper d-flex justify-content-between">
                <Button
                  color="secondary"
                  type="button"
                  className="steps-btn"
                  disabled={currentPageIndex === 0}
                  onClick={() => {
                    setAllAnswers((prev) => ({
                      ...prev,
                      ...formik.values,
                    }));
                    setCurrentPageIndex((prev) => Math.max(prev - 1, 0));
                  }}>
                  Back
                </Button>
                <Button
                  color="primary"
                  type="submit"
                  className="steps-btn"
                  disabled={btnloading}>
                  {currentPageIndex + 1 < visiblePages.length
                    ? "Next"
                    : "Submit"}
                </Button>
              </div>
            </form>
          </motion.div>
        </AnimatePresence>
      ) : (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "70vh",
          }}>
          <Spinner type="grow" />
        </div>
      )}
    </div>
  );
};

export default Questionnaire;
