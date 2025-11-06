"use client";

import React, { useState, useEffect } from "react";
import { Input, FormGroup, Label, Tooltip } from "reactstrap";
import "./_questions.scss";
import { FaInfoCircle } from "react-icons/fa";

const QuestionField = ({
  question,
  formik,
  replacePlaceholders,
  allAnswers,
}) => {
  const [comboValue, setComboValue] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(false);

  const toggle = () => setTooltipOpen(!tooltipOpen);
  const handleCheckboxChange = (value) => {
    const currentValues = formik.values[question.variable] || [];
    const updatedValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];
    formik.setFieldValue(question.variable, updatedValues); // Sync to allAnswers
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    formik.setFieldValue(question.variable, value); // Sync to allAnswers
  };

  const handleNumberChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      formik.setFieldValue(
        question.variable,
        value === "" ? "" : Number(value)
      );
      formik.setFieldValue(
        question.variable,
        value === "" ? "" : Number(value)
      ); // Sync to allAnswers
    }
  };

  const handleDecimalChange = (e) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      formik.setFieldValue(
        question.variable,
        value === "" ? "" : Number(value)
      );
      formik.setFieldValue(
        question.variable,
        value === "" ? "" : Number(value)
      ); // Sync to allAnswers
    }
  };

  const handleComboSelect = (selectedValue) => {
    const current = formik.values[question.variable] || [];
    if (!current.includes(selectedValue)) {
      formik.setFieldValue(question.variable, [...current, selectedValue]); // Sync to allAnswers
    }
    setComboValue("");
    setShowOptions(false);
  };

  const handleComboInputChange = (e) => {
    const val = e.target.value;
    setComboValue(val);
    setShowOptions(val.length > 0);
  };

  // Default values are now handled in getInitialValues() function in page.js
  // No need for useEffect to set defaults - they're set in initial values

  // Add useEffect for focusing on error
  useEffect(() => {
    const touched = formik.touched[question.variable];
    const error = formik.errors[question.variable];
    if (touched && error) {
      const input = document.querySelector(`[name="${question.variable}"]`);
      if (input) {
        input.focus();
      }
    }
  }, [
    formik.touched[question.variable],
    formik.errors[question.variable],
    question.variable,
  ]);

  const renderField = () => {
    switch (question.question_type) {
      case "text":
        return (
          <Input
            autoComplete="off"
            type="text"
            bsSize="lg"
            className="mb-3 text-field"
            name={question.variable}
            value={formik.values[question.variable] ?? ""}
            onChange={handleInputChange}
            onBlur={formik.handleBlur}
          />
        );

      case "combo_box":
        return (
          <div className="position-relative">
            <div className="d-flex flex-wrap align-items-center p-1 gap-1">
              {(formik.values[question.variable] || []).map((item, idx) => (
                <span
                  key={idx}
                  className="badge bg-black text-white d-flex align-items-center"
                >
                  {item}
                  <button
                    type="button"
                    className="btn-close btn-close-white btn-sm ms-2"
                    onClick={() => {
                      const updated = formik.values[question.variable].filter(
                        (val) => val !== item
                      );
                      formik.setFieldValue(question.variable, updated);
                    }}
                  ></button>
                </span>
              ))}
            </div>
            <div>
              <Input
                type="text"
                bsSize="lg"
                autoComplete="off"
                className="mb-3 select-field"
                name={question.variable}
                value={comboValue}
                onChange={handleComboInputChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && comboValue.trim()) {
                    e.preventDefault();
                    handleComboSelect(comboValue.trim());
                  }
                }}
                onFocus={() => {
                  if (question.question_options?.length > 0) {
                    setShowOptions(true);
                  }
                }}
                onBlur={() => setTimeout(() => setShowOptions(false), 200)}
              />
            </div>
            {showOptions && question.question_options?.length > 0 && (
              <div
                className="position-absolute w-100 bg-white z-3"
                style={{
                  // maxHeight: "200px",
                  overflowY: "auto",
                  // boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              >
                {question.question_options
                  .filter(
                    (opt) =>
                      opt.label
                        .toLowerCase()
                        .includes(comboValue.toLowerCase()) &&
                      !(formik.values[question.variable] || []).includes(
                        opt.value
                      )
                  )
                  .map((opt, idx) => (
                    <div
                      key={idx}
                      className="p-2 cursor-pointer hover-bg-light"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleComboSelect(opt.value)}
                    >
                      {opt.label}
                    </div>
                  ))}
              </div>
            )}
          </div>
        );

      case "number":
        return (
          <Input
            autoComplete="off"
            type="text"
            bsSize="lg"
            className="mb-3 text-field"
            name={question.variable}
            value={formik.values[question.variable] ?? ""}
            onChange={handleNumberChange}
            onBlur={formik.handleBlur}
          />
        );

      case "decimal_number":
        return (
          <Input
            type="number"
            autoComplete="off"
            placeholder=""
            step="any"
            bsSize="lg"
            className="mb-3 text-field"
            name={question.variable}
            value={formik.values[question.variable] ?? ""}
            onChange={handleDecimalChange}
            onBlur={formik.handleBlur}
          />
        );

      case "email":
        return (
          <Input
            autoComplete="off"
            type="email"
            bsSize="lg"
            className="mb-3 text-field"
            name={question.variable}
            value={formik.values[question.variable] ?? ""}
            onChange={handleInputChange}
            onBlur={formik.handleBlur}
          />
        );

      case "text_area":
        return (
          <Input
            type="textarea"
            bsSize="lg"
            className="mb-3 text-field"
            name={question.variable}
            value={formik.values[question.variable] ?? ""}
            onChange={handleInputChange}
            onBlur={formik.handleBlur}
            maxLength={255}
          />
        );

      case "date":
        return (
          <Input
            type="date"
            bsSize="lg"
            className="mb-3 text-field"
            name={question.variable}
            value={formik.values[question.variable] ?? ""}
            onChange={handleInputChange}
            onBlur={formik.handleBlur}
          />
        );

      case "dropdown":
        return (
          <Input
            type="select"
            name={question.variable}
            value={formik.values[question.variable] ?? ""}
            bsSize="lg"
            className="mb-3 select-field"
            onChange={handleInputChange}
            onBlur={formik.handleBlur}
          >
            <option value="">Select an option</option>
            {question.question_options?.map((opt, idx) => (
              <option key={idx} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Input>
        );

      case "yes_no":
        return (
          <Input
            type="select"
            bsSize="lg"
            className="mb-3 select-field"
            name={question.variable}
            value={formik.values[question.variable] ?? ""}
            onChange={handleInputChange}
            onBlur={formik.handleBlur}
          >
            <option value="">Select</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </Input>
        );

      case "checkboxes":
        return (
          <div className="ps-2">
            {question.question_options?.map((opt, idx) => (
              <FormGroup check key={idx}>
                <Input
                  type="checkbox"
                  id={`${question.variable}_${idx}`}
                  name={question.variable} // Use name for focus
                  value={opt.value}
                  checked={
                    formik.values[question.variable]?.includes(opt.value) ||
                    false
                  }
                  onChange={() => handleCheckboxChange(opt.value)}
                  className="custom-checkbox"
                  onBlur={formik.handleBlur}
                />
                <Label for={`${question.variable}_${idx}`} check>
                  {opt.label}
                </Label>
              </FormGroup>
            ))}
          </div>
        );

      case "radio_button":
        return (
          <div className="ps-2">
            {question.question_options?.map((opt, idx) => (
              <FormGroup check key={idx}>
                <Input
                  type="radio"
                  name={question.variable} // Use name for focus
                  value={opt.value}
                  checked={formik.values[question.variable] === opt.value}
                  onChange={handleInputChange}
                  onBlur={formik.handleBlur}
                  id={`${question.variable}_${idx}`}
                  className="custom-checkbox"
                />
                <Label
                  for={`${question.variable}_${idx}`}
                  check
                  className="cursor-pointer"
                >
                  {opt.label}
                </Label>
              </FormGroup>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <FormGroup>
      <Label size="lg" className="w-100 fw-bold mb-3">
        {replacePlaceholders(question.title, allAnswers)}
        {question.required ? <span className="text-danger">*</span> : null}
        {question.tool_tip && (
          <span style={{ position: "relative", marginLeft: "5px" }}>
            <FaInfoCircle id={`tooltip-${question.id}`} size={16} />
            <Tooltip
              placement="right"
              isOpen={tooltipOpen}
              autohide={false}
              target={`tooltip-${question.id}`}
              toggle={toggle}
            >
              {question.tool_tip}
            </Tooltip>
          </span>
        )}
      </Label>
      {renderField()}
      {formik.touched[question.variable] &&
        formik.errors[question.variable] && (
          <div className="text-danger mt-1">
            {formik.errors[question.variable]}
          </div>
        )}
    </FormGroup>
  );
};

export default QuestionField;
