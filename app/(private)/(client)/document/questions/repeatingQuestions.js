import React, { useEffect, useMemo } from "react";
import { Button, Container, Row, Col } from "reactstrap";
import { RiDeleteBin6Line } from "react-icons/ri";
import QuestionFieldNested from "./questionFieldNested";

// Build a fresh empty group each time with default values
const makeEmptyGroup = (questions) =>
  questions.reduce((acc, q) => {
    const defaultOption = q.question_options?.find(
      (opt) => opt.default_selected
    );
    if (defaultOption) {
      switch (q.question_type) {
        case "dropdown":
        case "radio_button":
          acc[q.variable] = defaultOption.value;
          break;
        case "checkboxes":
        case "multi_select":
        case "combo_box":
          acc[q.variable] = [defaultOption.value];
          break;
        default:
          acc[q.variable] = defaultOption.value;
          break;
      }
    } else {
      switch (q.question_type) {
        case "checkboxes":
        case "multi_select":
        case "combo_box":
          acc[q.variable] = [];
          break;
        default:
          acc[q.variable] = "";
          break;
      }
    }
    return acc;
  }, {});

// Flatten hierarchical conditions
const flattenConditions = (conditionArray, parentId = null) => {
  const flat = [];
  const recurse = (items, parentId) => {
    items.forEach((item) => {
      const { children, ...rest } = item;
      const cond = { ...rest, parent_slug: parentId };
      flat.push(cond);
      if (children && children.length) {
        recurse(children, item.logic_group_id);
      }
    });
  };
  recurse(conditionArray, parentId);
  return flat;
};

export default function DynamicQuestionSets({
  otherQuestions, // all sub-questions in the repeating section
  formik,
  slug, // e.g. "u40ouzxeq" -> the repeating array key
}) {
  // Map question_slug -> variable
  const slugToVar = useMemo(() => {
    const map = {};
    otherQuestions.forEach((q) => {
      if (q.question_slug) map[q.question_slug] = q.variable;
    });
    return map;
  }, [otherQuestions]);

  // Recursive condition evaluation
  const evaluateConditionsRecursive = (
    conditions,
    parentSlug,
    evaluateSingleCondition,
    groupValues
  ) => {
    const children = conditions.filter((c) => c.parent_slug === parentSlug);
    if (children.length === 0) return true;

    let finalResult = null;

    for (const cond of children) {
      const condResult = evaluateSingleCondition(cond, groupValues);
      const nestedResult = evaluateConditionsRecursive(
        conditions,
        cond.logic_group_id,
        evaluateSingleCondition,
        groupValues
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

  // Single condition evaluation
  const evaluateSingleCondition = (cond, groupValues) => {
    if (!cond.slug) return true; // Group node: always true

    const varKey = slugToVar[cond.slug] ?? cond.slug;
    const question = otherQuestions.find((q) => q.question_slug === cond.slug);
    if (!question) {
      console.warn(
        `Question with slug ${cond.slug} not found`,
        otherQuestions.map((q) => q.question_slug)
      );
      return false;
    }

    let answer = groupValues?.[varKey];
    if (answer === undefined) {
      answer = ["checkboxes", "combo_box", "multi_select"].includes(
        question.question_type
      )
        ? []
        : "";
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

  const isQuestionVisible = (q, groupValues) => {
    const qc = q?.question_conditions;
    if (!qc || !Array.isArray(qc.condition) || qc.condition.length === 0) {
      return true;
    }

    const flatConditions = flattenConditions(qc.condition);

    const result = evaluateConditionsRecursive(
      flatConditions,
      null,
      evaluateSingleCondition,
      groupValues
    );
    return qc.condition_type === "show_question" ? result : !result;
  };

  // Ensure at least one group on mount
  useEffect(() => {
    const arr = formik.values[slug];
    if (!Array.isArray(arr) || arr.length === 0) {
      formik.setFieldValue(slug, [makeEmptyGroup(otherQuestions)], false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, otherQuestions]);

  // Clear values for hidden questions
  useEffect(() => {
    const groups = formik.values[slug] || [];
    let changed = false;

    groups.forEach((group, groupIndex) => {
      const visibleForGroup = otherQuestions.filter((q) =>
        isQuestionVisible(q, group)
      );
      const visibleSet = new Set(visibleForGroup.map((q) => q.variable));

      Object.keys(group || {}).forEach((variable) => {
        if (!visibleSet.has(variable) && group?.[variable] !== undefined) {
          const q = otherQuestions.find((qq) => qq.variable === variable);
          const empty =
            q &&
            ["checkboxes", "combo_box", "multi_select"].includes(
              q.question_type
            )
              ? []
              : "";
          formik.setFieldValue(
            `${slug}.${groupIndex}.${variable}`,
            empty,
            false
          );
          changed = true;
        }
      });
    });

    if (changed) formik.setTouched({}, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values, slug, otherQuestions]);

  const addGroup = () => {
    const current = formik.values[slug] || [];
    formik.setFieldValue(
      slug,
      [...current, makeEmptyGroup(otherQuestions)],
      false
    );
  };

  const removeGroup = (indexToRemove) => {
    const current = formik.values[slug] || [];
    const next = current.filter((_, i) => i !== indexToRemove);
    formik.setFieldValue(slug, next, false);
  };

  const groups = formik.values[slug] || [];

  return (
    <Container>
      {groups.map((group, groupIndex) => {
        const visibleForGroup = otherQuestions.filter((q) =>
          isQuestionVisible(q, group)
        );

        return (
          <div
            key={`${slug}-group-${groupIndex}`}
            className="mb-4"
            style={{
              borderTop: "2px solid #ccc",
              padding: "25px",
              width: "90%",
            }}
          >
            <Row>
              <Col xs="auto">
                {groupIndex > 0 && (
                  <Button
                    color="danger"
                    size="sm"
                    type="button"
                    outline
                    onClick={() => removeGroup(groupIndex)}
                  >
                    <RiDeleteBin6Line />
                  </Button>
                )}
              </Col>
            </Row>

            {visibleForGroup.map((question) => (
              <QuestionFieldNested
                key={`${slug}-${groupIndex}-${question.id}`}
                question={question}
                formik={formik}
                index={groupIndex}
                parentSlug={slug}
              />
            ))}
          </div>
        );
      })}

      <Button
        type="button"
        color="success"
        size="sm"
        outline
        onClick={addGroup}
      >
        + Add More
      </Button>
    </Container>
  );
}
