import { ConfirmationPopover } from "@/app/shared/DeleteConfirmation";
import TooltipX from "@/app/shared/TooltipX";
import { useEffect, useRef, useState } from "react";
import { FiCopy, FiPlus } from "react-icons/fi";
import { ImTree } from "react-icons/im";
import { RiDeleteBin6Line } from "react-icons/ri";
import { TiDeleteOutline } from "react-icons/ti";
import { Button, Col, FormGroup, Input, Label, Row } from "reactstrap";
import { ConditionalQuestions } from "./conditions";
import { FaPlus } from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";
import { sortData } from "@/app/utils";

// Validation function
const validateVariableName = (variable) => {
  if (!variable) return true;
  return /^[A-Za-z][A-Za-z0-9_]*$/.test(variable);
};

export const Questions = ({
  allpages,
  page,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  sections,
}) => {
  const [touchedQuestions, setTouchedQuestions] = useState({});
  const [confirmDelete, setConfirmDelete] = useState({
    open: false,
    questionId: null,
  });
  const [showTooltipMap, setShowTooltipMap] = useState({});
  const [logicOpen, setLogicOpen] = useState(false);
  const [activeQuestionId, setActiveQuestionId] = useState(null);
  const [touchedSubQuestions, setTouchedSubQuestions] = useState({});
  const [nested, setNested] = useState(false);
  const inputRefs = useRef({});
  const prevLength = useRef(page.questions.length);

  const handleSaveLogic = (data) => {
    if (nested) {
      // Handle sub-question logic
      const parentQuestion = page.questions.find((q) =>
        q.questions?.some((subQ) => subQ.question_slug === activeQuestionId)
      );
      if (parentQuestion) {
        const updatedSubQuestions = parentQuestion.questions.map((subQ) =>
          subQ.question_slug === activeQuestionId
            ? {
                ...subQ,
                process_key: data.conditions ? "conditional" : "normal",
                question_conditions: data.conditions
                  ? {
                      condition_type: data.condition_type,
                      condition: data.conditions, // Updated to match nested conditions structure
                    }
                  : {},
              }
            : subQ
        );
        updateQuestion(
          page.page_slug,
          parentQuestion.question_slug,
          "questions",
          updatedSubQuestions
        );
      }
    } else {
      // Handle parent question logic
      if (!data.conditions) {
        updateQuestion(
          page.page_slug,
          activeQuestionId,
          "process_key",
          "normal"
        );
        updateQuestion(
          page.page_slug,
          activeQuestionId,
          "question_conditions",
          {}
        );
        return;
      }
      updateQuestion(
        page.page_slug,
        activeQuestionId,
        "process_key",
        "conditional"
      );
      updateQuestion(page.page_slug, activeQuestionId, "question_conditions", {
        condition_type: data.condition_type,
        condition: data.conditions, // Updated to match nested conditions structure
      });
    }
  };

  // Initialize tooltip switches for all sub-questions
  useEffect(() => {
    const initialTooltipStates = {};

    page.questions.forEach((q) => {
      // Handle main question tooltip
      if (q.id) {
        initialTooltipStates[q.id] = !!q.tool_tip && q.tool_tip.trim() !== "";
      } else if (!q.id) {
        q.id = Date.now() + Math.random();
        initialTooltipStates[q.id] = !!q.tool_tip && q.tool_tip.trim() !== "";
      }

      // Handle sub-questions
      if (q.having_repeating_items && q.questions) {
        q.questions.forEach((subQ) => {
          if (!subQ.id) {
            subQ.id = Date.now() + Math.random();
          }
          initialTooltipStates[subQ.id] =
            !!subQ.tool_tip && subQ.tool_tip.trim() !== "";
        });
      }
    });

    setShowTooltipMap(initialTooltipStates);
  }, []);

  // Toggle tooltip switch for a specific sub-question
  const toggleTooltipSwitch = (id, checked) => {
    setShowTooltipMap((prev) => ({
      ...prev,
      [id]: checked,
    }));
  };

  // Handle tooltip input change for sub-questions
  const handleSubQTooltipChange = (id, value) => {
    // Update the tooltip value in the sub-question
    page.questions.forEach((q) => {
      if (q.having_repeating_items && q.questions) {
        const subQuestion = q.questions.find((subQ) => subQ.id === id);
        if (subQuestion) {
          const updatedSubQuestions = q.questions.map((subQ) =>
            subQ.id === id ? { ...subQ, tool_tip: value } : subQ
          );
          updateQuestion(
            page.page_slug,
            q.question_slug,
            "questions",
            updatedSubQuestions
          );
        }
      }
    });
  };

  useEffect(() => {
    // Auto-generate variable for repeating items if missing (only on load)
    page.questions.forEach((q) => {
      if (q.having_repeating_items) {
        // Only populate if variable is missing at initial load
        if (!q.variable && q.title) {
          const variableName = q.title
            .trim()
            .toLowerCase()
            .replace(/\s+/g, "_")
            .replace(/[^a-z0-9_]/g, "");
          updateQuestion(
            page.page_slug,
            q.question_slug,
            "variable",
            variableName
          );
        }
      }
    });
    // ⚠️ only run once when page is first mounted
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Run only if a new question was added (length increased)
    if (page.questions.length > prevLength.current) {
      const last = page.questions[page.questions.length - 1];
      if (last && inputRefs.current[last.question_slug]) {
        inputRefs.current[last.question_slug].focus();
      }
    }
    prevLength.current = page.questions.length;
  }, [page.questions.length]);

  const togglePopover = (question_slug = null) => {
    setConfirmDelete((prev) => ({
      open: !prev.open,
      questionId: question_slug,
    }));
  };

  const handleConfirm = () => {
    if (confirmDelete.questionId) {
      deleteQuestion(page.page_slug, confirmDelete.questionId);
      setConfirmDelete({ open: false, questionId: null });
    }
  };

  const getSubQuestionErrors = (subQ) => {
    return {
      title: !subQ.title ? "Title is required" : null,
      variable: !subQ.variable ? "Variable is required" : null,
    };
  };
  const aboveQuestion = () => {
    // Use the same ordering logic as drag and drop system
    const orderedPages = getLatestOrderedPages();

    // Flatten all questions from ordered pages
    const allQuestions = orderedPages.flatMap((page) => page.questions || []);

    const prevQuestions = allQuestions?.slice(
      0,
      allQuestions?.findIndex((q) => q.question_slug === activeQuestionId)
    );

    return prevQuestions?.filter((q) => !q.having_repeating_items) || [];
  };

  const getLatestOrderedPages = () => {
    if (!allpages) return [];

    const standalonePages = allpages
      .filter((p) => !p.section_slug)
      .map((p) => ({
        id: p.page_slug,
        type: "page",
        data: p,
        root_order: p.root_order || 0,
      }));

    const sectionRoots = (sections || []).map((s) => ({
      id: s.section_slug,
      type: "section",
      data: s,
      root_order: s.root_order || s.section_order || 0,
    }));

    const combined = [...standalonePages, ...sectionRoots].sort(
      (a, b) => (a.root_order || 0) - (b.root_order || 0)
    );

    const orderedPages = [];
    combined.forEach((item) => {
      if (item.type === "page") {
        orderedPages.push(item.data);
      } else {
        const sectionPages = allpages
          .filter((p) => p.section_slug === item.id)
          .sort((a, b) => (a.page_order || 0) - (b.page_order || 0));
        orderedPages.push(...sectionPages);
      }
    });

    return orderedPages;
  };

  const checkEnableLogic = (pageIndex, questionIndex) => {
    if (pageIndex === 0 && questionIndex === 0) return false;
    return true;
  };

  return (
    <Col md={12}>
      <div>
        {page.questions.map((q, index) => {
          const sortedPages = getLatestOrderedPages();
          const actualPageIndex = sortedPages.findIndex(
            (p) => p.page_slug === page.page_slug
          );
          const enableLogic = checkEnableLogic(actualPageIndex, index);
          const errors = {
            title: !q.title ? "Title is required" : null,
            variable: !q.variable ? "Variable is required" : null,
          };

          const handleChange = (field, value) => {
            updateQuestion(page.page_slug, q.question_slug, field, value);
            setTouchedQuestions((prev) => ({
              ...prev,
              [q.question_slug]: {
                ...(prev[q.question_slug] || {}),
                [field]: true,
              },
            }));
          };

          return (
            <div key={q.question_slug} className="border p-3 mb-3 rounded">
              {!q.having_repeating_items ? (
                q.question_type === "instruction" ? (
                  <>
                    <div className="d-flex justify-content-end gap-2">
                      <TooltipX
                        text={"Delete Question"}
                        id={`delete-${q.question_slug}`}
                      >
                        <Button
                          id={`tooltip-delete-${q.question_slug}`}
                          color="danger"
                          size="sm"
                          outline
                          disabled={page.questions.length === 1 && index === 0}
                          onClick={() => togglePopover(q.question_slug)}
                        >
                          <RiDeleteBin6Line />
                        </Button>
                      </TooltipX>
                    </div>

                    <Row>
                      <div className="d-flex justify-content-between gap-3">
                        <FormGroup className="mb-0 w-100">
                          <Label className="fw-semibold">Question Title</Label>
                          <Input
                            value={q.title}
                            onChange={(e) =>
                              handleChange("title", e.target.value)
                            }
                            onBlur={() =>
                              setTouchedQuestions((prev) => ({
                                ...prev,
                                [q.question_slug]: {
                                  ...(prev[q.question_slug] || {}),
                                  title: true,
                                },
                              }))
                            }
                            placeholder="Add question title"
                            innerRef={(ref) =>
                              (inputRefs.current[q.question_slug] = ref)
                            }
                            className="form-input"
                          />
                          {touchedQuestions[q.question_slug]?.title &&
                            errors.title && (
                              <div className="text-danger">{errors.title}</div>
                            )}
                        </FormGroup>
                      </div>
                    </Row>
                    <Row>
                      <Col md={6}>
                        <FormGroup className="mb-0">
                          <Label className="fw-semibold">Question Type</Label>
                          <Input
                            type="select"
                            className="form-input"
                            value={q.question_type}
                            onChange={(e) => {
                              const newType = e.target.value;
                              handleChange("question_type", newType);
                              if (
                                ![
                                  "dropdown",
                                  "radio_button",
                                  "checkboxes",
                                  "multi_select",
                                  "combo_box",
                                ].includes(newType)
                              ) {
                                handleChange("question_options", []);
                              }
                            }}
                          >
                            <option value="text">Text</option>
                            <option value="instruction">Instruction</option>
                            <option value="text_area">Text Area</option>
                            <option value="email">Email</option>
                            <option value="date">Date</option>
                            <option value="decimal_number">
                              Decimal Number
                            </option>
                            <option value="combo_box">Combo Box</option>
                            <option value="number">Number</option>
                            <option value="yes_no">Yes / No</option>
                            <option value="dropdown">Dropdown</option>
                            <option value="radio_button">Radio Button</option>
                            <option value="checkboxes">Checkboxes</option>
                          </Input>
                        </FormGroup>
                      </Col>
                    </Row>
                    <Row>
                      <Col md={6}>
                        <FormGroup switch>
                          <Input
                            type="switch"
                            checked={
                              q.tool_tip !== null && q.tool_tip !== undefined
                            }
                            onChange={(e) =>
                              handleChange(
                                "tool_tip",
                                e.target.checked ? "" : null
                              )
                            }
                          />
                          <Label className="fw-semibold">Tooltip text</Label>
                        </FormGroup>
                        {q.tool_tip !== null && q.tool_tip !== undefined && (
                          <AnimatePresence>
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <FormGroup className="mb-0">
                                <Input
                                  value={q.tool_tip}
                                  onChange={(e) =>
                                    handleChange("tool_tip", e.target.value)
                                  }
                                  onBlur={() =>
                                    setTouchedQuestions((prev) => ({
                                      ...prev,
                                      [q.question_slug]: {
                                        ...(prev[q.question_slug] || {}),
                                        tool_tip: true,
                                      },
                                    }))
                                  }
                                  placeholder="Add question tooltip"
                                  innerRef={(ref) =>
                                    (inputRefs.current[q.question_slug] = ref)
                                  }
                                  className="form-input"
                                />
                                {touchedQuestions[q.question_slug]?.tool_tip &&
                                  errors.tool_tip && (
                                    <div className="text-danger">
                                      {errors.tool_tip}
                                    </div>
                                  )}
                              </FormGroup>
                            </motion.div>
                          </AnimatePresence>
                        )}
                      </Col>
                    </Row>
                  </>
                ) : (
                  <>
                    <div className="d-flex justify-content-end gap-2">
                      {page?.page_order > 0 && page?.page_order != null && (
                        <TooltipX
                          text={
                            q.process_key === "conditional"
                              ? "Update Logic"
                              : "Add Logic"
                          }
                          id={`logic-${q.question_slug}`}
                        >
                          <ImTree
                            size={30}
                            id={`tooltip-logic-${q.question_slug}`}
                            className={`icon-hover ${
                              enableLogic ? "" : "disabled-icon"
                            }`}
                            style={{
                              pointerEvents: enableLogic ? "auto" : "none",
                              color:
                                q.process_key === "conditional"
                                  ? "green"
                                  : undefined,
                            }}
                            onClick={() => {
                              setActiveQuestionId(q.question_slug);
                              setLogicOpen(true);
                              setNested(false);
                            }}
                          />
                        </TooltipX>
                      )}

                      <TooltipX
                        text={"Clone Question"}
                        id={`clone-${q.question_slug}`}
                      >
                        <Button
                          id={`tooltip-clone-${q.question_slug}`}
                          color="primary"
                          size="sm"
                          outline
                          onClick={() =>
                            addQuestion(page.page_slug, {
                              title: q.title ? `${q.title}(Copy)` : q.title,
                              variable: q.variable
                                ? `${q.variable}_Copy`
                                : q.variable,
                              question_type: q.question_type,
                              required: q.required,
                              process_key: "normal",
                              ...(q.question_options
                                ? { question_options: q.question_options }
                                : {}),
                              question_slug: Math.random()
                                .toString(36)
                                .substring(2, 11),
                            })
                          }
                        >
                          <FiCopy />
                        </Button>
                      </TooltipX>

                      <TooltipX
                        text={"Delete Question"}
                        id={`delete-${q.question_slug}`}
                      >
                        <Button
                          id={`tooltip-delete-${q.question_slug}`}
                          color="danger"
                          size="sm"
                          outline
                          disabled={page.questions.length === 1 && index === 0}
                          onClick={() => togglePopover(q.question_slug)}
                        >
                          <RiDeleteBin6Line />
                        </Button>
                      </TooltipX>
                    </div>

                    <Row>
                      <div className="d-flex justify-content-between gap-3">
                        <FormGroup className="mb-0 w-100">
                          <Label className="fw-semibold">Question Title</Label>
                          <Input
                            value={q.title}
                            onChange={(e) =>
                              handleChange("title", e.target.value)
                            }
                            onBlur={() =>
                              setTouchedQuestions((prev) => ({
                                ...prev,
                                [q.question_slug]: {
                                  ...(prev[q.question_slug] || {}),
                                  title: true,
                                },
                              }))
                            }
                            placeholder="Add question title"
                            innerRef={(ref) =>
                              (inputRefs.current[q.question_slug] = ref)
                            }
                            className="form-input"
                          />
                          {touchedQuestions[q.question_slug]?.title &&
                            errors.title && (
                              <div className="text-danger">{errors.title}</div>
                            )}
                        </FormGroup>
                        <div
                          className="d-flex"
                          style={{ paddingBlockStart: "40px" }}
                        >
                          <FormGroup check className="m-0">
                            <Label className="fw-semibold">Required</Label>
                            <Input
                              className="align-self-start "
                              type="checkbox"
                              checked={q.required}
                              onChange={(e) =>
                                handleChange("required", e.target.checked)
                              }
                            />
                          </FormGroup>
                        </div>
                      </div>
                    </Row>
                    <Row>
                      <Col md={6}>
                        <FormGroup className="mb-0">
                          <Label className="fw-semibold">Variable Name</Label>
                          <Input
                            value={q.variable}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (validateVariableName(value) || value === "") {
                                handleChange("variable", value);
                              }
                            }}
                            onBlur={() =>
                              setTouchedQuestions((prev) => ({
                                ...prev,
                                [q.question_slug]: {
                                  ...(prev[q.question_slug] || {}),
                                  variable: true,
                                },
                              }))
                            }
                            placeholder="Add variable (letters, numbers, underscore only)"
                            className="form-input"
                          />
                          {touchedQuestions[q.question_slug]?.variable &&
                            errors.variable && (
                              <div className="text-danger">
                                {errors.variable}
                              </div>
                            )}
                          {!validateVariableName(q.variable) && q.variable && (
                            <div className="text-danger">
                              Only letters, numbers, and underscores are allowed
                            </div>
                          )}
                        </FormGroup>
                      </Col>

                      <Col md={6}>
                        <FormGroup className="mb-0">
                          <Label className="fw-semibold">Question Type</Label>
                          <Input
                            type="select"
                            className="form-input"
                            value={q.question_type}
                            onChange={(e) => {
                              const newType = e.target.value;
                              handleChange("question_type", newType);
                              if (
                                ![
                                  "dropdown",
                                  "radio_button",
                                  "checkboxes",
                                  "multi_select",
                                  "combo_box",
                                ].includes(newType)
                              ) {
                                handleChange("question_options", []);
                              }
                            }}
                          >
                            <option value="text">Text</option>
                            <option value="instruction">Instruction</option>
                            <option value="text_area">Text Area</option>
                            <option value="email">Email</option>
                            <option value="date">Date</option>
                            <option value="decimal_number">
                              Decimal Number
                            </option>
                            <option value="combo_box">Combo Box</option>
                            <option value="number">Number</option>
                            <option value="yes_no">Yes / No</option>
                            <option value="dropdown">Dropdown</option>
                            <option value="radio_button">Radio Button</option>
                            <option value="checkboxes">Checkboxes</option>
                          </Input>
                        </FormGroup>
                      </Col>
                    </Row>
                    <Row>
                      <Col md={6}>
                        <FormGroup switch>
                          <Input
                            type="switch"
                            checked={
                              q.tool_tip !== null && q.tool_tip !== undefined
                            }
                            onChange={(e) =>
                              handleChange(
                                "tool_tip",
                                e.target.checked ? "" : null
                              )
                            }
                          />
                          <Label className="fw-semibold">Tooltip text</Label>
                        </FormGroup>
                        {q.tool_tip !== null && q.tool_tip !== undefined && (
                          <AnimatePresence>
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <FormGroup className="mb-0">
                                <Input
                                  value={q.tool_tip}
                                  onChange={(e) =>
                                    handleChange("tool_tip", e.target.value)
                                  }
                                  onBlur={() =>
                                    setTouchedQuestions((prev) => ({
                                      ...prev,
                                      [q.question_slug]: {
                                        ...(prev[q.question_slug] || {}),
                                        tool_tip: true,
                                      },
                                    }))
                                  }
                                  placeholder="Add question tooltip"
                                  innerRef={(ref) =>
                                    (inputRefs.current[q.question_slug] = ref)
                                  }
                                  className="form-input"
                                />
                                {touchedQuestions[q.question_slug]?.tool_tip &&
                                  errors.tool_tip && (
                                    <div className="text-danger">
                                      {errors.tool_tip}
                                    </div>
                                  )}
                              </FormGroup>
                            </motion.div>
                          </AnimatePresence>
                        )}
                      </Col>
                    </Row>

                    {[
                      "dropdown",
                      "radio_button",
                      "checkboxes",
                      "multi_select",
                      "combo_box",
                    ].includes(q.question_type) && (
                      <FormGroup className="mb-2 option-box">
                        {q.question_options?.map((opt, idx) => (
                          <div
                            key={idx}
                            className="d-flex gap-2 mb-3 align-items-center"
                          >
                            <Input
                              value={opt.value}
                              onChange={(e) => {
                                const newOptions = [...q.question_options];
                                newOptions[idx] = {
                                  ...newOptions[idx],
                                  value: e.target.value,
                                  label: e.target.value,
                                };
                                handleChange("question_options", newOptions);
                              }}
                              placeholder={`Option ${idx + 1}`}
                              className="form-input"
                            />
                            <div className="d-flex align-items-center gap-2">
                              <Input
                                type="checkbox"
                                checked={opt.default_selected || false}
                                onChange={(e) => {
                                  const newOptions = [...q.question_options];
                                  if (e.target.checked) {
                                    // Set all options to false first, then set selected one to true
                                    newOptions.forEach((option, i) => {
                                      newOptions[i] = {
                                        ...option,
                                        default_selected: i === idx,
                                      };
                                    });
                                  } else {
                                    // Uncheck this option
                                    newOptions[idx] = {
                                      ...newOptions[idx],
                                      default_selected: false,
                                    };
                                  }
                                  handleChange("question_options", newOptions);
                                }}
                                className="me-1"
                              />
                              <small className="text-muted">Default</small>
                            </div>
                            <TiDeleteOutline
                              size={30}
                              color="red"
                              style={{ cursor: "pointer" }}
                              onClick={() => {
                                const newOptions = q.question_options.filter(
                                  (_, i) => i !== idx
                                );
                                handleChange("question_options", newOptions);
                              }}
                            />
                          </div>
                        ))}
                        <Button
                          size="sm"
                          className="btn-default btn-outline d-flex align-items-center justify-content-center gap-1"
                          outline
                          onClick={() => {
                            const newOptions = [
                              ...(q.question_options || []),
                              { label: "", value: "", default_selected: false },
                            ];
                            handleChange("question_options", newOptions);
                          }}
                        >
                          <FaPlus /> Add Option
                        </Button>
                      </FormGroup>
                    )}
                    <Button
                      outline
                      size="sm"
                      color="warning"
                      className="btn-default btn-outline"
                      onClick={() => {
                        updateQuestion(
                          page.page_slug,
                          q.question_slug,
                          "having_repeating_items",
                          true
                        );

                        updateQuestion(
                          page.page_slug,
                          q.question_slug,
                          "questions",
                          []
                        );
                      }}
                    >
                      Convert to Repeating Item
                    </Button>
                  </>
                )
              ) : (
                <>
                  <div className="d-flex justify-content-end gap-2">
                    <TooltipX
                      text={
                        q.process_key === "conditional"
                          ? "Update Logic"
                          : "Add Logic"
                      }
                      id={`logic-${q.question_slug}`}
                    >
                      <ImTree
                        size={30}
                        id={`tooltip-logic-${q.question_slug}`}
                        className={`icon-hover ${
                          enableLogic ? "" : "disabled-icon"
                        }`}
                        style={{
                          pointerEvents: enableLogic ? "auto" : "none",
                          color: q.process_key === "conditional" && "green",
                        }}
                        onClick={() => {
                          setActiveQuestionId(q.question_slug);
                          setLogicOpen(true);
                          setNested(false);
                        }}
                      />
                    </TooltipX>
                    <TooltipX
                      text={"Delete Question"}
                      id={`delete-${q.question_slug}`}
                    >
                      <Button
                        id={`tooltip-delete-${q.question_slug}`}
                        color="danger"
                        size="sm"
                        outline
                        style={{ float: "right" }}
                        disabled={page.questions.length === 1 && index === 0}
                        onClick={() => togglePopover(q.question_slug)}
                      >
                        <RiDeleteBin6Line />
                      </Button>
                    </TooltipX>
                  </div>
                  <Row>
                    <FormGroup className="mt-3">
                      <Label className="fw-semibold">Repeating item name</Label>
                      <Input
                        placeholder="Enter item name"
                        value={q.title}
                        className="form-input"
                        onChange={(e) => {
                          const newValue = e.target.value;
                          updateQuestion(
                            page.page_slug,
                            q.question_slug,
                            "title",
                            newValue
                          );

                          // Auto-generate variable if user hasn't changed it manually
                          if (
                            !q.variable ||
                            q.variable ===
                              q.title.trim().toLowerCase().replace(/\s+/g, "_")
                          ) {
                            const variableName = newValue
                              .trim()
                              .toLowerCase()
                              .replace(/\s+/g, "_")
                              .replace(/[^a-z0-9_]/g, "");
                            updateQuestion(
                              page.page_slug,
                              q.question_slug,
                              "variable",
                              variableName
                            );
                          }
                        }}
                      />
                    </FormGroup>
                  </Row>

                  {/* Variable name field */}
                  <Row>
                    <FormGroup className="mt-3">
                      <Label className="fw-semibold">Variable name</Label>
                      <Input
                        value={q.variable || ""}
                        className="form-input"
                        onChange={(e) => {
                          const value = e.target.value;
                          if (validateVariableName(value) || value === "") {
                            updateQuestion(
                              page.page_slug,
                              q.question_slug,
                              "variable",
                              value
                            );
                          }
                        }}
                        placeholder="Letters, numbers, underscore only"
                      />
                      {!validateVariableName(q.variable) && q.variable && (
                        <div className="text-danger">
                          Only letters, numbers, and underscores are allowed
                        </div>
                      )}
                    </FormGroup>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <FormGroup switch>
                        <Input
                          type="switch"
                          checked={showTooltipMap[q.id] || false}
                          onChange={(e) =>
                            toggleTooltipSwitch(q.id, e.target.checked)
                          }
                        />
                        <Label className="fw-semibold">Tooltip text</Label>
                      </FormGroup>
                      {showTooltipMap[q.id] && (
                        <AnimatePresence>
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <FormGroup className="mb-0">
                              <Input
                                value={q.tool_tip}
                                onChange={(e) =>
                                  handleChange("tool_tip", e.target.value)
                                }
                                onBlur={() =>
                                  setTouchedQuestions((prev) => ({
                                    ...prev,
                                    [q.question_slug]: {
                                      ...(prev[q.question_slug] || {}),
                                      tool_tip: true,
                                    },
                                  }))
                                }
                                placeholder="Add question tooltip"
                                innerRef={(ref) =>
                                  (inputRefs.current[q.question_slug] = ref)
                                }
                                className="form-input"
                              />
                              {touchedQuestions[q.question_slug]?.tool_tip &&
                                errors.tool_tip && (
                                  <div className="text-danger">
                                    {errors.tool_tip}
                                  </div>
                                )}
                            </FormGroup>
                          </motion.div>
                        </AnimatePresence>
                      )}
                    </Col>
                  </Row>

                  {(q.questions || []).map((subQ, subIdx) => {
                    const handleSubChange = (field, value) => {
                      const updated = [...q.questions];
                      updated[subIdx] = {
                        ...updated[subIdx],
                        [field]: value,
                      };
                      updateQuestion(
                        page.page_slug,
                        q.question_slug,
                        "questions",
                        updated
                      );
                    };

                    const handleOptionChange = (optIdx, value) => {
                      const updatedOptions = [...(subQ.question_options || [])];
                      updatedOptions[optIdx] = {
                        ...updatedOptions[optIdx],
                        label: value,
                        value,
                        default_selected:
                          updatedOptions[optIdx]?.default_selected || false,
                      };
                      handleSubChange("question_options", updatedOptions);
                    };

                    const handleDefaultChange = (optIdx) => {
                      const updatedOptions = [...(subQ.question_options || [])];
                      const currentOption = updatedOptions[optIdx];

                      if (currentOption.default_selected) {
                        // If already selected, uncheck it
                        updatedOptions[optIdx] = {
                          ...currentOption,
                          default_selected: false,
                        };
                      } else {
                        // Set all options to false first, then set selected one to true
                        updatedOptions.forEach((option, i) => {
                          updatedOptions[i] = {
                            ...option,
                            default_selected: i === optIdx,
                          };
                        });
                      }
                      handleSubChange("question_options", updatedOptions);
                    };

                    const addOption = () => {
                      const updatedOptions = [
                        ...(subQ.question_options || []),
                        { label: "", value: "", default_selected: false },
                      ];
                      handleSubChange("question_options", updatedOptions);
                    };

                    const deleteOption = (optIdx) => {
                      const updatedOptions = subQ.question_options.filter(
                        (_, i) => i !== optIdx
                      );
                      handleSubChange("question_options", updatedOptions);
                    };

                    const subErrors = getSubQuestionErrors(subQ);

                    // Ensure subQ has an ID
                    if (!subQ.id) {
                      subQ.id = Date.now() + Math.random();
                    }

                    return (
                      <div
                        key={subQ.question_slug}
                        className="border p-3 rounded mb-3"
                      >
                        <div className="d-flex justify-content-end gap-2">
                          {subIdx !== 0 && (
                            <TooltipX
                              text={
                                subQ.process_key === "conditional"
                                  ? "Update Logic"
                                  : "Add Logic"
                              }
                              id={`logic-${subQ.question_slug}`}
                            >
                              <ImTree
                                size={24}
                                id={`tooltip-logic-${subQ.question_slug}`}
                                className={`icon-hover ${
                                  subIdx === 0 ? "disabled-icon" : ""
                                }`}
                                style={{
                                  pointerEvents: subIdx === 0 ? "none" : "auto",
                                  color:
                                    subQ.process_key === "conditional" &&
                                    "green",
                                }}
                                onClick={() => {
                                  setActiveQuestionId(subQ.question_slug);
                                  setLogicOpen(true);
                                  setNested(true);
                                }}
                              />
                            </TooltipX>
                          )}
                          <RiDeleteBin6Line
                            size={26}
                            className="icon-hover"
                            onClick={() => {
                              const updatedSubs = q?.questions?.filter(
                                (_, i) => i !== subIdx
                              );
                              updateQuestion(
                                page.page_slug,
                                q.question_slug,
                                "questions",
                                updatedSubs
                              );
                            }}
                          />
                        </div>

                        <Row className="mb-2">
                          <Col md={4}>
                            <Label className="fw-semibold">
                              Question Title
                            </Label>
                            <Input
                              value={subQ.title}
                              placeholder="Add question title"
                              onChange={(e) =>
                                handleSubChange("title", e.target.value)
                              }
                              className={`form-input ${
                                touchedSubQuestions[subQ.question_slug]
                                  ?.title && subErrors.title
                                  ? "is-invalid"
                                  : ""
                              }`}
                              onBlur={() =>
                                setTouchedSubQuestions((prev) => ({
                                  ...prev,
                                  [subQ.question_slug]: {
                                    ...(prev[subQ.question_slug] || {}),
                                    title: true,
                                  },
                                }))
                              }
                            />
                            {subErrors.title &&
                              touchedSubQuestions[subQ.question_slug]
                                ?.title && (
                                <div className="text-danger">
                                  {subErrors.title}
                                </div>
                              )}
                          </Col>
                          <Col md={4}>
                            <Label className="fw-semibold">Variable Name</Label>
                            <Input
                              value={subQ.variable}
                              placeholder="Add variable (letters, numbers, underscore only)"
                              onChange={(e) => {
                                const value = e.target.value;
                                if (
                                  validateVariableName(value) ||
                                  value === ""
                                ) {
                                  handleSubChange("variable", value);
                                }
                              }}
                              onBlur={() =>
                                setTouchedSubQuestions((prev) => ({
                                  ...prev,
                                  [subQ.question_slug]: {
                                    ...(prev[subQ.question_slug] || {}),
                                    variable: true,
                                  },
                                }))
                              }
                              className={`form-input ${
                                touchedSubQuestions[subQ.question_slug]
                                  ?.variable && subErrors.variable
                                  ? "is-invalid"
                                  : ""
                              }`}
                            />
                            {subErrors.variable &&
                              touchedSubQuestions[subQ.question_slug]
                                ?.variable && (
                                <div className="text-danger">
                                  {subErrors.variable}
                                </div>
                              )}
                            {!validateVariableName(subQ.variable) &&
                              subQ.variable && (
                                <div className="text-danger">
                                  Only letters, numbers, and underscores are
                                  allowed
                                </div>
                              )}
                          </Col>
                          <Col md={4}>
                            <Label className="fw-semibold">Question Type</Label>
                            <Input
                              type="select"
                              value={subQ.question_type}
                              onChange={(e) => {
                                const newType = e.target.value;
                                handleSubChange("question_type", newType);
                                if (
                                  ![
                                    "dropdown",
                                    "radio_button",
                                    "checkboxes",
                                    "multi_select",
                                    "combo_box",
                                  ].includes(newType) &&
                                  subQ.question_options?.length > 0
                                ) {
                                  handleSubChange("question_options", []);
                                }
                              }}
                              className="form-input"
                            >
                              <option value="text">Text</option>
                              <option value="instruction">Instruction</option>
                              <option value="text_area">Text Area</option>
                              <option value="email">Email</option>
                              <option value="date">Date</option>
                              <option value="decimal_number">
                                Decimal Number
                              </option>
                              <option value="combo_box">Combo Box</option>

                              <option value="number">Number</option>
                              <option value="yes_no">Yes / No</option>
                              <option value="dropdown">Dropdown</option>
                              <option value="radio_button">Radio Button</option>
                              <option value="checkboxes">Checkboxes</option>
                            </Input>
                          </Col>
                          <Col
                            md={4}
                            className="d-flex align-items-center gap-1 mt-2"
                          >
                            <Input
                              className=" mt-0"
                              type="checkbox"
                              checked={subQ.required}
                              onChange={(e) =>
                                handleSubChange("required", e.target.checked)
                              }
                            />
                            <Label className="fs fw-medium mb-0">
                              Required
                            </Label>
                          </Col>

                          {/* Tooltip Switch and Input for Sub-Questions */}
                          <Col md={4} className="mt-2">
                            <FormGroup switch>
                              <Input
                                type="switch"
                                checked={showTooltipMap[subQ.id] || false}
                                onChange={(e) =>
                                  toggleTooltipSwitch(subQ.id, e.target.checked)
                                }
                              />
                              <Label className="fw-semibold">
                                Tooltip Text
                              </Label>
                            </FormGroup>

                            {showTooltipMap[subQ.id] && (
                              <AnimatePresence>
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.3 }}
                                >
                                  <Input
                                    type="text"
                                    value={subQ.tool_tip || ""}
                                    placeholder="Enter tooltip text"
                                    onChange={(e) =>
                                      handleSubQTooltipChange(
                                        subQ.id,
                                        e.target.value
                                      )
                                    }
                                    className="mt-1"
                                  />
                                </motion.div>
                              </AnimatePresence>
                            )}
                          </Col>
                        </Row>

                        {[
                          "dropdown",
                          "radio_button",
                          "checkboxes",
                          "multi_select",
                          "combo_box",
                        ].includes(subQ.question_type) && (
                          <FormGroup className="mb-2">
                            <Label className="fw-semibold">Options</Label>
                            {(subQ.question_options || []).map(
                              (opt, optIdx) => (
                                <div
                                  key={optIdx}
                                  className="d-flex gap-2 mb-2 align-items-center"
                                >
                                  <Input
                                    value={opt.value}
                                    onChange={(e) =>
                                      handleOptionChange(optIdx, e.target.value)
                                    }
                                    placeholder={`Option ${optIdx + 1}`}
                                  />
                                  <div className="d-flex align-items-center gap-2">
                                    <Input
                                      type="checkbox"
                                      checked={opt.default_selected || false}
                                      onChange={(e) => {
                                        const updatedOptions = [
                                          ...(subQ.question_options || []),
                                        ];
                                        if (e.target.checked) {
                                          // Set all options to false first, then set selected one to true
                                          updatedOptions.forEach(
                                            (option, i) => {
                                              updatedOptions[i] = {
                                                ...option,
                                                default_selected: i === optIdx,
                                              };
                                            }
                                          );
                                        } else {
                                          // Uncheck this option
                                          updatedOptions[optIdx] = {
                                            ...updatedOptions[optIdx],
                                            default_selected: false,
                                          };
                                        }
                                        handleSubChange(
                                          "question_options",
                                          updatedOptions
                                        );
                                      }}
                                      className="me-1"
                                    />
                                    <small className="text-muted">
                                      Default
                                    </small>
                                  </div>
                                  <TiDeleteOutline
                                    size={28}
                                    color="red"
                                    style={{ cursor: "pointer" }}
                                    onClick={() => deleteOption(optIdx)}
                                  />
                                </div>
                              )
                            )}
                            <Button
                              size="sm"
                              color="primary"
                              outline
                              onClick={addOption}
                            >
                              + Add Option
                            </Button>
                          </FormGroup>
                        )}
                      </div>
                    );
                  })}

                  {/* Add New Sub-question */}
                  <Button
                    outline
                    size="sm"
                    className="btn-default btn-outline"
                    onClick={() => {
                      const newSub = {
                        title: "",
                        variable: "",
                        question_type: "text",
                        required: false,
                        question_slug: Math.random()
                          .toString(36)
                          .substring(2, 11),
                        question_options: [],
                        process_key: "normal",
                        question_conditions: {},
                        id: Date.now() + Math.random(), // Add unique ID
                      };
                      const updated = [...(q.questions || []), newSub];
                      updateQuestion(
                        page.page_slug,
                        q.question_slug,
                        "questions",
                        updated
                      );

                      // Initialize tooltip switch state for new sub-question
                      setShowTooltipMap((prev) => ({
                        ...prev,
                        [newSub.id]: false,
                      }));
                    }}
                  >
                    + Add Repeating Question
                  </Button>
                </>
              )}
            </div>
          );
        })}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            outline
            onClick={(e) => {
              e.preventDefault();
              addQuestion(page.page_slug, {
                title: "",
                variable: "",
                question_type: "text",
                required: false,
                process_key: "normal",
                question_slug: Math.random().toString(36).substring(2, 11),
              });
            }}
            className="mb-3 btn-outline d-flex align-items-center btn-outline-blue"
          >
            <span className="me-1">Add Question</span>
            <FiPlus />
          </Button>
        </div>
      </div>

      <ConfirmationPopover
        title="Delete Question"
        content="Are you sure you want to delete this question? Conditions referencing the deleted question have been set to null."
        popoverOpen={confirmDelete.open}
        togglePopover={() =>
          setConfirmDelete({ open: false, questionId: null })
        }
        handleConfirm={handleConfirm}
      />
      <ConditionalQuestions
        isOpen={logicOpen}
        onSave={handleSaveLogic}
        toggle={() => setLogicOpen(!logicOpen)}
        data={
          nested
            ? page.questions
                .find((q) =>
                  q.questions?.some(
                    (subQ) => subQ.question_slug === activeQuestionId
                  )
                )
                ?.questions.find(
                  (subQ) => subQ.question_slug === activeQuestionId
                ) || {}
            : page.questions.find(
                (x) => x.question_slug === activeQuestionId
              ) || {}
        }
        aboveQuestions={
          !nested
            ? aboveQuestion()
            : (() => {
                const parentQuestion = page.questions.find((q) =>
                  q.questions?.some(
                    (subQ) => subQ.question_slug === activeQuestionId
                  )
                );
                if (!parentQuestion || !parentQuestion.questions) return [];
                const subQuestionIndex = parentQuestion.questions.findIndex(
                  (subQ) => subQ.question_slug === activeQuestionId
                );
                return subQuestionIndex >= 0
                  ? parentQuestion.questions.slice(0, subQuestionIndex)
                  : [];
              })()
        }
      />
    </Col>
  );
};

export const validateTemplateData = (sections = [], pages = []) => {
  // Utility to safely handle numeric sorting
  const getOrder = (item) => {
    const n = Number(item?.root_order);
    return Number.isFinite(n) ? n : 0;
  };

  // 🔹 Map sections with their pages (sorted by root_order)
  const newSections = sections
    .map((section) => {
      const sectionPages = pages
        .filter((p) => p.section_slug === section.section_slug)
        .map((p) => ({
          type: "page",
          ...p,
          questions: (p.questions || []).sort(
            (a, b) => getOrder(a) - getOrder(b)
          ),
        }))
        .sort((a, b) => getOrder(a) - getOrder(b));

      return {
        type: "section",
        ...section,
        pages: sectionPages,
      };
    })
    .sort((a, b) => getOrder(a) - getOrder(b));

  // 🔹 Standalone pages (without section_slug)
  const standalonePages = pages
    .filter((p) => !p.section_slug)
    .map((p) => ({
      type: "page",
      ...p,
      questions: (p.questions || []).sort((a, b) => getOrder(a) - getOrder(b)),
    }))
    .sort((a, b) => getOrder(a) - getOrder(b));

  // 🔹 Combine everything into one sorted list
  const allPages = [
    ...standalonePages,
    ...newSections.flatMap((s) => s.pages || []),
  ];

  // ✅ Return only the final pages array
  return allPages;
};
