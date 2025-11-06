import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Label,
  Input,
  Button,
  Offcanvas,
  FormGroup,
  OffcanvasBody,
  OffcanvasHeader,
  ButtonGroup,
} from "reactstrap";
import Select from "react-select";
import { useFormik, getIn } from "formik";
import * as Yup from "yup";
import { RiDeleteBin6Line } from "@/app/shared/Icons";
import { ConfirmationPopover } from "@/app/shared/DeleteConfirmation";

const conditionOptions = [
  { label: "equals", value: "equals" },
  { label: "does not equal", value: "not_equals" },
  { label: "is less than", value: "less_than" },
  { label: "is greater than", value: "greater_than" },
  { label: "is less than or equal to", value: "less_than_or_equal" },
  { label: "is greater than or equal to", value: "greater_than_or_equal" },
];

const conditionSchema = Yup.lazy(() =>
  Yup.object().shape({
    slug: Yup.string().when("children", {
      is: (children) => !children || children.length === 0,
      then: (schema) => schema.required("Field is required"),
      otherwise: (schema) => schema.nullable(),
    }),
    operator: Yup.string().when("children", {
      is: (children) => !children || children.length === 0,
      then: (schema) => schema.required("Operator is required"),
      otherwise: (schema) => schema.nullable(),
    }),
    value: Yup.string().when("children", {
      is: (children) => !children || children.length === 0,
      then: (schema) => schema.required("Value is required"),
      otherwise: (schema) => schema.nullable(),
    }),
    logical_connector: Yup.string().nullable(),
    parent_slug: Yup.string().nullable(),
    logic_group_id: Yup.string(),
    children: Yup.array().of(conditionSchema),
  })
);

export const ConditionalQuestions = ({
  data,
  isOpen,
  toggle,
  onSave,
  aboveQuestions,
}) => {
  const generateSlug = () => Math.random().toString(36).substring(2, 11);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const toggleModal = () => setIsModalOpen(!isModalOpen);

  const validationSchema = Yup.object().shape({
    condition_type: Yup.string().required("Action is required"),
    conditions: Yup.array().of(conditionSchema),
  });

  const initialValues = {
    condition_type: "show_question",
    conditions: [
      {
        slug: "",
        logic_group_id: generateSlug(),
        operator: "equals",
        value: "",
        logical_connector: null,
        parent_slug: null,
        children: [],
      },
    ],
  };

  const formik = useFormik({
    initialValues,
    validationSchema: validationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: (values) => {
      console.log({ values });
      onSave(values);
      toggle();
    },
  });

  const handleRemoveAllLogic = () => {
    formik.resetForm({ values: initialValues });
    onSave({ condition_type: "show_question", conditions: null });
    toggleModal();
  };

  console.log({ data });
  useEffect(() => {
    if (isOpen && data?.question_conditions?.condition) {
      formik.setValues({
        condition_type:
          data?.question_conditions?.condition_type || "show_question",
        conditions: data?.question_conditions?.condition,
      });
      formik.validateForm();
    } else if (isOpen) {
      formik.resetForm({ values: initialValues });
      formik.validateForm();
    }
  }, [isOpen, data?.question_conditions]);

  const buildErrorPath = (condPath, field) => {
    const path = ["conditions"];
    condPath.forEach((index, i) => {
      if (i > 0) path.push("children");
      path.push(index);
    });
    path.push(field);
    return path;
  };

  const buildFieldPath = (condPath, field) => {
    let pathStr = "conditions";
    if (condPath.length > 0) {
      pathStr += `[${condPath[0]}]`;
      for (let i = 1; i < condPath.length; i++) {
        pathStr += `.children[${condPath[i]}]`;
      }
    }
    pathStr += `.${field}`;
    return pathStr;
  };

  const handleConditionChange = (condPath, field, value) => {
    const updated = [...formik.values.conditions];
    let current = updated;
    for (let i = 0; i < condPath.length - 1; i++) {
      if (!current[condPath[i]]) return;
      current = current[condPath[i]].children;
    }
    const array = current;
    const idx = condPath[condPath.length - 1];
    if (field === "logical_connector") {
      for (let j = 1; j < array.length; j++) {
        array[j].logical_connector = value;
      }
    } else {
      if (array[idx]) {
        array[idx][field] = value;
      }
    }
    formik.setFieldValue("conditions", updated);
    const fieldPath = buildFieldPath(condPath, field);
    formik.setFieldTouched(fieldPath, true, false);
    formik.validateField(fieldPath);
  };

  const addCondition = (condPath) => {
    const updated = [...formik.values.conditions];

    // If it's the root level, add sibling condition below the first condition
    if (condPath.length === 1) {
      const firstCondition = updated[0];
      const newCondition = {
        slug: "",
        operator: "equals",
        value: "",
        logical_connector: "and",
        children: [],
        logic_group_id: firstCondition.logic_group_id,
        parent_slug: firstCondition.parent_slug,
      };
      // Insert after the first condition
      updated.splice(1, 0, newCondition);
    } else {
      // For nested conditions, maintain existing behavior
      let current = updated;
      for (let i = 0; i < condPath.length - 1; i++) {
        if (!current[condPath[i]]) return;
        current = current[condPath[i]].children;
      }
      const cond = current[condPath[condPath.length - 1]];
      if (!cond) return;
      const newCondition = {
        slug: "",
        operator: "equals",
        value: "",
        logical_connector: "and",
        children: [],
        logic_group_id: cond.logic_group_id,
        parent_slug: cond.parent_slug,
      };
      current.push(newCondition);
    }

    formik.setFieldValue("conditions", updated);
    formik.validateForm();
  };

  const addConditionToBlock = (condPath) => {
    const updated = [...formik.values.conditions];

    if (condPath.length === 1) {
      // For root level conditions, add to the same block
      const currentCondition = updated[condPath[0]];
      if (!currentCondition) return;

      const newCondition = {
        slug: "",
        operator: "equals",
        value: "",
        logical_connector: "and",
        children: [],
        logic_group_id: currentCondition.logic_group_id, // Same block
        parent_slug: currentCondition.parent_slug,
      };

      // Find the last condition with the same logic_group_id and add after it
      let insertIndex = condPath[0] + 1;
      for (let i = condPath[0] + 1; i < updated.length; i++) {
        if (updated[i].logic_group_id === currentCondition.logic_group_id) {
          insertIndex = i + 1;
        } else {
          break;
        }
      }

      updated.splice(insertIndex, 0, newCondition);
    } else {
      // For nested conditions, navigate to the parent array
      let current = updated;
      for (let i = 0; i < condPath.length - 1; i++) {
        if (!current[condPath[i]]) return;
        current = current[condPath[i]].children;
      }

      const currentCondition = current[condPath[condPath.length - 1]];
      if (!currentCondition) return;

      const newCondition = {
        slug: "",
        operator: "equals",
        value: "",
        logical_connector: "and",
        children: [],
        logic_group_id: currentCondition.logic_group_id,
        parent_slug: currentCondition.parent_slug,
      };

      current.push(newCondition);
    }

    formik.setFieldValue("conditions", updated);
    formik.validateForm();
  };

  const addConditionToSameBlock = (logicGroupId, parentPath = []) => {
    const updated = [...formik.values.conditions];

    // Function to recursively find and add condition to the correct nested level
    const findAndAddToBlock = (conditions, targetGroupId, currentPath = []) => {
      for (let i = 0; i < conditions.length; i++) {
        const cond = conditions[i];

        // Check if this condition belongs to the target group
        if (cond.logic_group_id === targetGroupId) {
          // Create a new condition in the same block
          const newCondition = {
            slug: "",
            operator: "equals",
            value: "",
            logical_connector: "and",
            children: [],
            logic_group_id: targetGroupId, // Same block
            parent_slug: cond.parent_slug,
          };

          // Add the new condition to the same array
          conditions.push(newCondition);
          return true;
        }

        // If this condition has children, search recursively
        if (cond.children && cond.children.length > 0) {
          if (
            findAndAddToBlock(cond.children, targetGroupId, [...currentPath, i])
          ) {
            return true;
          }
        }
      }
      return false;
    };

    // Start the search from the root
    findAndAddToBlock(updated, logicGroupId);

    formik.setFieldValue("conditions", updated);
    formik.validateForm();
  };

  const createNestedBlock = (condPath) => {
    const updated = [...formik.values.conditions];

    // Navigate to the current condition
    let current = updated;
    for (let i = 0; i < condPath.length - 1; i++) {
      if (!current[condPath[i]]) return;
      current = current[condPath[i]].children;
    }

    const currentCondition = current[condPath[condPath.length - 1]];
    if (!currentCondition) return;

    // Create nested block structure
    const newBlockId = generateSlug();
    const newConditionId = generateSlug();

    // Create the current condition as a nested block
    const nestedCurrentCondition = {
      slug: currentCondition.slug,
      operator: currentCondition.operator,
      value: currentCondition.value,
      logical_connector: null, // First condition in nested block
      children: [],
      logic_group_id: newBlockId,
      parent_slug: currentCondition.logic_group_id,
    };

    // Create a new condition in the same nested block
    const newNestedCondition = {
      slug: "",
      operator: "equals",
      value: "",
      logical_connector: "and",
      children: [],
      logic_group_id: newBlockId,
      parent_slug: currentCondition.logic_group_id,
    };

    // Update the current condition to become a container
    currentCondition.slug = "";
    currentCondition.operator = "equals";
    currentCondition.value = "";
    currentCondition.children = [nestedCurrentCondition, newNestedCondition];

    formik.setFieldValue("conditions", updated);
    formik.validateForm();
  };

  const removeCondition = (condPath) => {
    if (condPath.length === 0) return;

    // Create a deep copy of the conditions array to avoid direct state mutation
    const updated = JSON.parse(JSON.stringify(formik.values.conditions));
    
    // Helper function to recursively find and remove the condition
    const removeConditionRecursive = (conditions, path, currentDepth = 0) => {
      const currentIndex = path[currentDepth];
      
      // If we've reached the target depth
      if (currentDepth === path.length - 1) {
        // Remove the condition at the current index
        conditions.splice(currentIndex, 1);
        return true;
      }
      
      // If we can go deeper in the path
      if (conditions[currentIndex]?.children) {
        const wasRemoved = removeConditionRecursive(
          conditions[currentIndex].children,
          path,
          currentDepth + 1
        );
        
        // If the condition was removed and the parent is now empty, clean it up
        if (wasRemoved && conditions[currentIndex].children.length === 0) {
          conditions.splice(currentIndex, 1);
          return true;
        }
        return wasRemoved;
      }
      
      return false;
    };
    
    // Start the recursive removal
    removeConditionRecursive(updated, condPath);
    
    // Update the form state
    formik.setFieldValue("conditions", updated);
    formik.validateForm();
  };

  const variableOptions = aboveQuestions
    .filter((q) => q.title && q.title.trim() !== "")
    .map((q) => ({
      label: q.title,
      value: q.question_slug,
    }));

  const getAncestorSlugs = (conditions, path) => {
    const slugs = [];
    let current = conditions;
    for (let i = 0; i < path.length - 1; i++) {
      if (current[path[i]]?.slug) {
        slugs.push(current[path[i]].slug);
      }
      current = current[path[i]].children;
    }
    return slugs;
  };

  const countConditionsInBlock = (conditions, logicGroupId) => {
    return conditions.filter((c) => c.logic_group_id === logicGroupId).length;
  };

  const renderConditionGroup = (conditions, path = [], level = 0) => {
    // Group conditions by logic_group_id
    const groups = {};
    conditions.forEach((cond, index) => {
      if (!groups[cond.logic_group_id]) {
        groups[cond.logic_group_id] = [];
      }
      groups[cond.logic_group_id].push({ ...cond, originalIndex: index });
    });

    return Object.entries(groups).map(
      ([groupId, groupConditions], groupIdx) => {
        const hasMultipleConditions = groupConditions.length > 1;

        return (
          <div
            key={groupId}
            style={{
              border: "1px solid #dee2e6",
              borderRadius: "8px",
              padding: "16px",
              marginBottom: "16px",
              backgroundColor: level === 0 ? "#f8f9fa" : "#ffffff",
              marginLeft: `${level * 20}px`,
            }}
          >
            {/* Group connector for groups after the first */}
            {groupIdx > 0 && (
              <div
                style={{
                  marginBottom: "12px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <ButtonGroup size="sm">
                  <Button
                    color={
                      groupConditions[0].logical_connector === "and"
                        ? "primary"
                        : "outline-primary"
                    }
                    onClick={() => {
                      const updated = [...formik.values.conditions];
                      groupConditions.forEach((cond) => {
                        const condPath = [...path, cond.originalIndex];
                        handleConditionChange(
                          condPath,
                          "logical_connector",
                          "and"
                        );
                      });
                    }}
                  >
                    And
                  </Button>
                  <Button
                    color={
                      groupConditions[0].logical_connector === "or"
                        ? "primary"
                        : "outline-primary"
                    }
                    onClick={() => {
                      const updated = [...formik.values.conditions];
                      groupConditions.forEach((cond) => {
                        const condPath = [...path, cond.originalIndex];
                        handleConditionChange(
                          condPath,
                          "logical_connector",
                          "or"
                        );
                      });
                    }}
                  >
                    Or
                  </Button>
                </ButtonGroup>
              </div>
            )}

            {/* Render conditions in this group */}
            {groupConditions.map((cond, condIndex) => {
              const condPath = [...path, cond.originalIndex];
              const ancestorSlugs = getAncestorSlugs(
                formik.values.conditions,
                condPath
              );
              const filteredOptions = variableOptions.filter(
                (opt) => !ancestorSlugs.includes(opt.value)
              );

              return (
                <div key={`${cond.logic_group_id}-${condIndex}`}>
                  {/* Condition connector within group */}
                  {condIndex > 0 && (
                    <div
                      style={{
                        marginBottom: "8px",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <ButtonGroup size="sm">
                        <Button
                          color={
                            cond.logical_connector === "and"
                              ? "primary"
                              : "outline-primary"
                          }
                          onClick={() =>
                            handleConditionChange(
                              condPath,
                              "logical_connector",
                              "and"
                            )
                          }
                        >
                          And
                        </Button>
                        <Button
                          color={
                            cond.logical_connector === "or"
                              ? "primary"
                              : "outline-primary"
                          }
                          onClick={() =>
                            handleConditionChange(
                              condPath,
                              "logical_connector",
                              "or"
                            )
                          }
                        >
                          Or
                        </Button>
                      </ButtonGroup>
                    </div>
                  )}

                  {/* Condition row or nested block */}
                  {cond.children && cond.children.length > 0 ? (
                    <div style={{ marginBottom: "12px" }}>
                      {renderConditionGroup(cond.children, condPath, level + 1)}
                    </div>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        marginBottom: "12px",
                        padding: "12px",
                        backgroundColor: "white",
                        borderRadius: "6px",
                        border: "1px solid #e9ecef",
                      }}
                    >
                      <div
                        style={{
                          minWidth: "20px",
                          fontSize: "14px",
                          fontWeight: "500",
                        }}
                      >
                        If
                      </div>

                      <div style={{ flex: "1" }}>
                        <Select
                          options={filteredOptions}
                          value={
                            cond.slug
                              ? filteredOptions.find(
                                  (opt) => opt.value === cond.slug
                                )
                              : null
                          }
                          onChange={(selected) =>
                            handleConditionChange(
                              condPath,
                              "slug",
                              selected?.value || ""
                            )
                          }
                          placeholder="Select question..."
                          isSearchable
                          styles={{
                            control: (base) => ({
                              ...base,
                              minHeight: "32px",
                              fontSize: "14px",
                            }),
                          }}
                        />
                      </div>

                      <div style={{ minWidth: "100px" }}>
                        <Input
                          type="select"
                          value={cond.operator}
                          onChange={(e) =>
                            handleConditionChange(
                              condPath,
                              "operator",
                              e.target.value
                            )
                          }
                          style={{ fontSize: "14px", height: "32px" }}
                        >
                          {conditionOptions.map((op) => (
                            <option key={op.value} value={op.value}>
                              {op.label}
                            </option>
                          ))}
                        </Input>
                      </div>

                      <div style={{ flex: "1" }}>
                        <Input
                          type="text"
                          value={cond.value}
                          onChange={(e) =>
                            handleConditionChange(
                              condPath,
                              "value",
                              e.target.value
                            )
                          }
                          placeholder="Enter value..."
                          style={{ fontSize: "14px", height: "32px" }}
                        />
                      </div>

                      {/* Action buttons */}
                      <div style={{ display: "flex", gap: "4px" }}>
                        {/* Show delete button for all conditions except the root level ones */}
                        {(hasMultipleConditions || level > 0) && (
                          <Button
                            size="sm"
                            color="danger"
                            outline
                            onClick={() => removeCondition(condPath)}
                            style={{ padding: "4px 8px" }}
                            title="Remove condition"
                          >
                            <RiDeleteBin6Line size={14} />
                          </Button>
                        )}
                        {/* Show add nested block button for all conditions */}
                        <Button
                          size="sm"
                          color="primary"
                          outline
                          onClick={() => createNestedBlock(condPath)}
                          style={{ padding: "4px 8px" }}
                          title="Create nested block with this condition"
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Add Condition button at bottom of group */}
            <Button
              size="sm"
              color="primary"
              onClick={() =>
                addConditionToSameBlock(groupConditions[0].logic_group_id)
              }
              style={{ marginTop: "8px" }}
            >
              + Add Condition
            </Button>
          </div>
        );
      }
    );
  };

  const renderConditions = (conditions, path = [], level = 0) => {
    return renderConditionGroup(conditions, path, level);
  };

  return (
    <Offcanvas
      isOpen={isOpen}
      toggle={toggle}
      direction="end"
      trapFocus
      className="w-50"
    >
      <OffcanvasHeader toggle={toggle}>Question Logic</OffcanvasHeader>
      <OffcanvasBody style={{ width: "100%" }}>
        <form onSubmit={formik.handleSubmit}>
          <FormGroup>
            <Label>Action</Label>
            <ButtonGroup
              style={{
                padding: "0.5rem",
                marginRight: "5px",
              }}
            >
              <Button
                color={
                  formik.values.condition_type === "show_question"
                    ? "primary"
                    : "light"
                }
                onClick={() =>
                  formik.setFieldValue("condition_type", "show_question")
                }
                active={formik.values.condition_type === "show_question"}
              >
                Show This Question
              </Button>
              <Button
                color={
                  formik.values.condition_type === "hide_question"
                    ? "primary"
                    : "light"
                }
                onClick={() =>
                  formik.setFieldValue("condition_type", "hide_question")
                }
                active={formik.values.condition_type === "hide_question"}
              >
                Hide This Question
              </Button>
            </ButtonGroup>
            {formik.touched.condition_type && formik.errors.condition_type && (
              <div className="text-danger mt-1">
                {formik.errors.condition_type}
              </div>
            )}
          </FormGroup>
          {renderConditions(formik.values.conditions)}
          <div style={{ marginBottom: "15px", display: "flex", gap: "10px" }}>
            <Button color="danger" outline size="sm" onClick={toggleModal}>
              Remove All Logic
            </Button>
          </div>
          <br />
          <Button color="primary" type="submit" className="mt-4">
            Save Logic
          </Button>
        </form>
      </OffcanvasBody>
      <ConfirmationPopover
        popoverOpen={isModalOpen}
        title={`Delete Logic`}
        content={`Are you sure you want to remove all logic?`}
        togglePopover={toggleModal}
        handleConfirm={handleRemoveAllLogic}
      />
    </Offcanvas>
  );
};
