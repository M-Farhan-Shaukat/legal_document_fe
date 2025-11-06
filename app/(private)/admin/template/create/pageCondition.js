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
import { useFormik } from "formik";
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

export const ConditionalPage = ({
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
    condition_type: "show_page",
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
    initialValues: initialValues,
    validationSchema: validationSchema,
    onSubmit: (values) => {
      onSave(values);
      toggle();
    },
  });

  console.log(data);

  useEffect(() => {
    if (isOpen && data?.condition) {
      formik.setValues({
        condition_type: data?.condition_type || "show_page",
        conditions: data?.condition,
      });
      formik.validateForm();
    } else if (isOpen) {
      formik.resetForm({ values: initialValues });
      formik.validateForm();
    }
  }, [isOpen, data?.condition]);

  const handleConditionChange = (condPath, field, value) => {
    const updated = [...formik.values.conditions];

    // Navigate to the condition using the path
    let current = updated;
    for (let i = 0; i < condPath.length - 1; i++) {
      if (!current[condPath[i]]) return;
      current = current[condPath[i]].children;
    }

    if (current[condPath[condPath.length - 1]]) {
      current[condPath[condPath.length - 1]][field] = value;
    }

    formik.setFieldValue("conditions", updated);
    formik.validateForm();
  };
  const variableOptions = aboveQuestions
    .filter((q) => q.title && q.title.trim() !== "")
    .map((q) => ({
      label: q.title,
      value: q.question_slug,
    }));

  const addConditionToSameBlock = (logicGroupId) => {
    const updated = [...formik.values.conditions];

    // Find a condition with the same logic_group_id to get the structure
    const findAndAddToBlock = (conditions, targetGroupId) => {
      for (let i = 0; i < conditions.length; i++) {
        const cond = conditions[i];

        if (cond.logic_group_id === targetGroupId) {
          const newCondition = {
            slug: "",
            operator: "equals",
            value: "",
            logical_connector: "and",
            children: [],
            logic_group_id: targetGroupId,
            parent_slug: cond.parent_slug,
          };

          conditions.push(newCondition);
          return true;
        }

        if (cond.children && cond.children.length > 0) {
          if (findAndAddToBlock(cond.children, targetGroupId)) {
            return true;
          }
        }
      }
      return false;
    };

    findAndAddToBlock(updated, logicGroupId);
    formik.setFieldValue("conditions", updated);
    formik.validateForm();
  };

  const createNestedBlock = (condPath) => {
    const updated = [...formik.values.conditions];

    let current = updated;
    for (let i = 0; i < condPath.length - 1; i++) {
      if (!current[condPath[i]]) return;
      current = current[condPath[i]].children;
    }

    const currentCondition = current[condPath[condPath.length - 1]];
    if (!currentCondition) return;

    const newBlockId = generateSlug();

    const nestedCurrentCondition = {
      slug: currentCondition.slug,
      operator: currentCondition.operator,
      value: currentCondition.value,
      logical_connector: null,
      children: [],
      logic_group_id: newBlockId,
      parent_slug: currentCondition.logic_group_id,
    };

    const newNestedCondition = {
      slug: "",
      operator: "equals",
      value: "",
      logical_connector: "and",
      children: [],
      logic_group_id: newBlockId,
      parent_slug: currentCondition.logic_group_id,
    };

    currentCondition.slug = "";
    currentCondition.operator = "equals";
    currentCondition.value = "";
    currentCondition.children = [nestedCurrentCondition, newNestedCondition];

    formik.setFieldValue("conditions", updated);
    formik.validateForm();
  };

  const removeCondition = (condPath) => {
    if (condPath.length === 0) return;
    const updated = [...formik.values.conditions];
    let current = updated;
    for (let i = 0; i < condPath.length - 1; i++) {
      if (!current[condPath[i]]) return;
      current = current[condPath[i]].children;
    }
    current.splice(condPath[condPath.length - 1], 1);
    formik.setFieldValue("conditions", updated);
    formik.validateForm();
  };

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
  const handleRemoveAllLogic = () => {
    formik.resetForm({ values: initialValues });
    onSave({ condition_type: "show_page", conditions: null });
    toggleModal();
  };

  const countConditionsInBlock = (conditions, logicGroupId) => {
    return conditions.filter((c) => c.logic_group_id === logicGroupId).length;
  };

  const renderConditionGroup = (conditions, path = [], level = 0) => {
    const groups = {};
    conditions?.forEach((cond, index) => {
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
      <OffcanvasHeader toggle={toggle}>Page Logic</OffcanvasHeader>
      <OffcanvasBody style={{ width: "100%" }}>
        <form onSubmit={formik.handleSubmit}>
          <FormGroup>
            <Label>Action</Label>
            <ButtonGroup
              style={{
                borderRadius: "15px",
                padding: "0.5rem ",
                marginRight: "5px",
              }}
            >
              <Button
                color={
                  formik.values.condition_type === "show_page"
                    ? "primary"
                    : "light"
                }
                onClick={() =>
                  formik.setFieldValue("condition_type", "show_page")
                }
                active={formik.values.condition_type === "show_page"}
              >
                Show This Page
              </Button>
              <Button
                color={
                  formik.values.condition_type === "hide_page"
                    ? "primary"
                    : "light"
                }
                onClick={() =>
                  formik.setFieldValue("condition_type", "hide_page")
                }
                active={formik.values.condition_type === "hide_page"}
              >
                Hide This Page
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
        content={`Are you sure to want remove all logics?`}
        togglePopover={toggleModal}
        handleConfirm={handleRemoveAllLogic}
      />
    </Offcanvas>
  );
};
