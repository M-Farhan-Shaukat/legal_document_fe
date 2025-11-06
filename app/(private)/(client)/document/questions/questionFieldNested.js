"use client";

import React, { useEffect, useState } from "react";
import { Input, FormGroup, Label } from "reactstrap";
import "./_questions.scss";

const QuestionFieldNested = ({ question, formik, index, parentSlug }) => {
  const fieldPath = `${parentSlug}.${index}.${question.variable}`;
  const value = formik.values[parentSlug]?.[index]?.[question.variable] ?? "";
  const touched = formik.touched[parentSlug]?.[index]?.[question.variable];
  const error = formik.errors[parentSlug]?.[index]?.[question.variable];
  
  // Default values are now handled in makeEmptyGroup() function in repeatingQuestions.js
  // No need for useEffect to set defaults - they're set in initial values

  useEffect(() => {
    if (touched && error) {
      const input = document.querySelector(`[name="${fieldPath}"]`);
      if (input) {
        input.focus();
      }
    }
  }, [touched, error, fieldPath]);
  const [comboValue, setComboValue] = useState("");
  const [showOptions, setShowOptions] = useState(false);

  const handleCheckboxChange = (optValue) => {
    const prev = Array.isArray(value) ? value : [];
    const updated = prev.includes(optValue)
      ? prev.filter((v) => v !== optValue)
      : [...prev, optValue];

    formik.setFieldValue(fieldPath, updated);
    formik.setFieldTouched(fieldPath, true, true);
  };
  const handleComboSelect = (selectedValue) => {
    if (!selectedValue?.trim()) return; // Prevent empty values
    const currentValues = Array.isArray(value) ? value : [];
    if (!currentValues.includes(selectedValue)) {
      formik.setFieldValue(fieldPath, [...currentValues, selectedValue]);
      formik.setFieldTouched(fieldPath, true, true);
    }
    setComboValue("");
    setShowOptions(false);
  };

  const handleComboInputChange = (e) => {
    const inputValue = e.target.value;
    setComboValue(inputValue);
    setShowOptions(
      inputValue.trim().length > 0 && question.question_options?.length > 0
    );
  };
  const renderField = () => {
    switch (question.question_type) {
      case "text":
        return (
          <Input
            autoComplete="off"
            type="text"
            bsSize="lg"
            className="mb-3 text-field"
            name={fieldPath}
            value={value}
            onChange={(e) => {
              formik.setFieldValue(fieldPath, e.target.value);
              formik.setFieldTouched(fieldPath, true, true);
            }}
            onBlur={formik.handleBlur}
            // Removed required to prevent HTML5 validation
          />
        );

      case "number":
        return (
          <Input
            autoComplete="off"
            type="text"
            bsSize="lg"
            className="mb-3 text-field"
            name={fieldPath}
            value={value}
            onChange={(e) => {
              const val = e.target.value;
              if (val === "" || /^\d+$/.test(val)) {
                formik.setFieldValue(fieldPath, val);
                formik.setFieldTouched(fieldPath, true, true);
              }
            }}
            onBlur={formik.handleBlur}
          />
        );

      case "decimal_number":
        return (
          <Input
            type="text"
            autoComplete="off"
            bsSize="lg"
            className="mb-3 text-field"
            name={fieldPath}
            value={value}
            onChange={(e) => {
              const val = e.target.value;
              if (val === "" || /^\d*\.?\d*$/.test(val)) {
                formik.setFieldValue(fieldPath, val);
                formik.setFieldTouched(fieldPath, true, true);
              }
            }}
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
            name={fieldPath}
            value={value}
            onChange={(e) => {
              formik.setFieldValue(fieldPath, e.target.value);
              formik.setFieldTouched(fieldPath, true, true);
            }}
            onBlur={formik.handleBlur}
          />
        );

      case "text_area":
        return (
          <Input
            type="textarea"
            bsSize="lg"
            className="mb-3 text-field"
            name={fieldPath}
            value={value}
            onChange={(e) => {
              formik.setFieldValue(fieldPath, e.target.value);
              formik.setFieldTouched(fieldPath, true, true);
            }}
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
            name={fieldPath}
            value={value}
            onChange={(e) => {
              formik.setFieldValue(fieldPath, e.target.value);
              formik.setFieldTouched(fieldPath, true, true);
            }}
            onBlur={formik.handleBlur}
          />
        );

      case "dropdown":
        return (
          <Input
            type="select"
            bsSize="lg"
            name={fieldPath}
            value={value}
            onChange={(e) => {
              formik.setFieldValue(fieldPath, e.target.value);
              formik.setFieldTouched(fieldPath, true, true);
            }}
            className="mb-3 select-field"
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
            name={fieldPath}
            value={value}
            onChange={(e) => {
              formik.setFieldValue(fieldPath, e.target.value);
              formik.setFieldTouched(fieldPath, true, true);
            }}
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
            {question.question_options?.map((opt, idx) => {
              const id = `${parentSlug}-${index}-${question.variable}_${idx}`;
              const arr = Array.isArray(value) ? value : [];
              const checked = arr.includes(opt.value);
              return (
                <FormGroup check key={idx}>
                  <Input
                    type="checkbox"
                    id={id}
                    name={fieldPath}
                    checked={checked}
                    onChange={() => handleCheckboxChange(opt.value)}
                    className="custom-checkbox"
                    onBlur={formik.handleBlur}
                  />
                  <Label htmlFor={id} check>
                    {opt.label}
                  </Label>
                </FormGroup>
              );
            })}
          </div>
        );

      case "radio_button":
        return (
          <div className="ps-2">
            {question.question_options?.map((opt, idx) => {
              const id = `${parentSlug}-${index}-${question.variable}_r_${idx}`;
              return (
                <FormGroup check key={idx}>
                  <Input
                    type="radio"
                    id={id}
                    name={fieldPath}
                    value={opt.value}
                    checked={value === opt.value}
                    onChange={() => {
                      formik.setFieldValue(fieldPath, opt.value);
                      formik.setFieldTouched(fieldPath, true, true);
                    }}
                    onBlur={formik.handleBlur}
                    className="custom-checkbox"
                  />
                  <Label htmlFor={id} check className="cursor-pointer">
                    {opt.label}
                  </Label>
                </FormGroup>
              );
            })}
          </div>
        );
      case "combo_box":
        return (
          <div className="position-relative">
            <div className="d-flex flex-wrap align-items-center p-1 gap-1">
              {(Array.isArray(value) ? value : []).map((item, idx) => (
                <span
                  key={idx}
                  className="badge bg-black text-white d-flex align-items-center"
                >
                  {item}
                  <button
                    type="button"
                    className="btn-close btn-close-white btn-sm ms-2"
                    onClick={() => {
                      const updated = value.filter((val) => val !== item);
                      formik.setFieldValue(fieldPath, updated);
                      formik.setFieldTouched(fieldPath, true, true);
                    }}
                  />
                </span>
              ))}
            </div>
            <div>
              <Input
                type="text"
                bsSize="lg"
                autoComplete="off"
                className="mb-3 select-field"
                name={fieldPath} // Use fieldPath for formik consistency
                value={comboValue}
                onChange={handleComboInputChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && comboValue.trim()) {
                    e.preventDefault(); // Prevent form submission
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
                  overflowY: "auto",
                }}
              >
                {question.question_options
                  .filter(
                    (opt) =>
                      opt.label
                        .toLowerCase()
                        .includes(comboValue.toLowerCase()) &&
                      !value.includes(opt.value)
                  )
                  .map((opt, idx) => (
                    <div
                      key={idx}
                      className="p-2 cursor-pointer hover-bg-light"
                      onMouseDown={(e) => e.preventDefault()} // Prevent blur before click
                      onClick={() => handleComboSelect(opt.value)}
                    >
                      {opt.label}
                    </div>
                  ))}
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <FormGroup>
      <Label size="lg" className="w-100 fw-bold">
        {question.title}
        {question.required ? <span className="text-danger">*</span> : null}
      </Label>

      {renderField()}

      {touched && error && <div className="text-danger mt-1">{error}</div>}
    </FormGroup>
  );
};

export default QuestionFieldNested;
