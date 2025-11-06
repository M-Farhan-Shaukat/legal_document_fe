"use client";
import "./Input.scss";
import Image from "next/image";
import { ErrorIcon } from "@/public/icons";
import { FormGroup, Label, Input, FormFeedback } from "reactstrap";
import { FaCamera } from "react-icons/fa";
const GenericField = ({
  prefix,
  label,
  type,
  name,
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  options,
  min,
  max,
  step,
  rows,
  id,
  Icon,
  floating,
  className,
  setShow,
  show,
  disabled = false,
  maxLength,
  insuranceClass,
}) => {
  switch (type) {
    case "select":
      return (
        <FormGroup className="form-group form-row d-flex align-items-start flex-column position-relative">
          <Label htmlFor={id || name} className="form-label">
            {label}
          </Label>
          <Input
            type="select"
            disabled={disabled}
            name={name}
            className="form-input"
            id={name}
            value={value || ""}
            onChange={onChange}
            onBlur={onBlur}
            invalid={!!error}
          >
            {options &&
              options.map((option, idx) => (
                <option key={idx} value={option.id}>
                  {option.title}
                </option>
              ))}
          </Input>
          {error && (
            <FormFeedback>
              <span className="exclamation-icon">
                <Image
                  alt="exclamation-icon"
                  className="error-icon"
                  src={ErrorIcon}
                  width={20}
                  height={20}
                />
              </span>
              {error}
            </FormFeedback>
          )}
        </FormGroup>
      );
    case "number":
    case "range":
      return (
        <FormGroup className="form-row d-flex align-items-start flex-column position-relative">
          <Label htmlFor={id || name} className="form-label">
            {label}
          </Label>
          <div className="input-group">
            {prefix && <span className="input-group-text">{prefix}</span>}
            <Input
              type={type}
              name={name}
              id={name}
              placeholder={placeholder}
              disabled={disabled}
              // className={`input-control y ${className}`}
              className={`${
                prefix
                  ? " form-input input-control prefix-input"
                  : "form-input input-control"
              } ${error ? "is-invalid" : ""} ${className}`}
              value={value}
              onChange={onChange}
              onBlur={onBlur}
              invalid={!!error}
              min={min}
              max={max}
              step={step}
            />
          </div>
          {error && (
            <FormFeedback>
              <span className="exclamation-icon">
                <Image
                  alt="exclamation-icon"
                  className="error-icon"
                  src={ErrorIcon}
                  width={20}
                  height={20}
                />
              </span>
              {error}
            </FormFeedback>
          )}
        </FormGroup>
      );
    case "file":
      return (
        <FormGroup className="form-row d-flex align-items-start flex-column position-relative">
          <div className="upload-box">
            <Label
              htmlFor={name}
              className="form-label"
              style={{ fontSize: 26, cursor: "pointer" }}
            >
              <FaCamera />
            </Label>
            <Input
              type="file"
              name={name}
              id={name}
              className="file-input camera-field d-none"
              onChange={onChange}
              onBlur={onBlur}
              invalid={!!error}
              accept="image/*"
              disabled={disabled}
            />
          </div>
          {error && <FormFeedback>{error}</FormFeedback>}
        </FormGroup>
      );
    case "textarea":
      return (
        <FormGroup className="form-row d-flex align-items-start flex-column position-relative">
          <Label htmlFor={id || name} className="form-label">
            {label}
          </Label>
          <Input
            type="textarea"
            name={name}
            id={name}
            disabled={disabled}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            rows={rows}
            invalid={!!error}
          />
          {error && (
            <FormFeedback>
              <span className="exclamation-icon">
                <Image
                  alt="exclamation-icon"
                  className="error-icon"
                  src={ErrorIcon}
                  width={20}
                  height={20}
                />
              </span>
              {error}
            </FormFeedback>
          )}
        </FormGroup>
      );
    case "switch":
      return (
        <div className="d-flex justify-content-start marklab--switch">
          <FormGroup
            switch
            // className="form-row d-flex align-items-start flex-column position-relative marklab--switch"
          >
            <Label className="form-label me-2" htmlFor={id || name}>
              {label}
            </Label>
            <Input
              type="switch"
              name={name}
              id={id || name}
              disabled={disabled}
              onBlur={onBlur}
              checked={!!value}
              className="form-switch"
              onChange={(e) =>
                onChange({ target: { name, value: e.target.checked } })
              }
            />

            {error && (
              <FormFeedback>
                <span className="exclamation-icon">
                  <Image
                    alt="exclamation-icon"
                    className="error-icon"
                    src={ErrorIcon}
                    width={20}
                    height={20}
                  />
                </span>
                {error}
              </FormFeedback>
            )}
          </FormGroup>
        </div>
      );
    case "date":
      return (
        <FormGroup className="form-row d-flex align-items-start flex-column position-relative">
          <Label htmlFor={id || name} className="form-label">
            {label}
          </Label>
          <Input
            type="date"
            name={name}
            id={name}
            disabled={disabled}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            invalid={!!error}
            className="form-input"
          />
          {error && (
            <FormFeedback>
              <span className="exclamation-icon">
                <Image
                  alt="exclamation-icon"
                  className="error-icon"
                  src={ErrorIcon}
                  width={20}
                  height={20}
                />
              </span>
              {error}
            </FormFeedback>
          )}
        </FormGroup>
      );
    case "time":
      return (
        <FormGroup className="form-row d-flex align-items-start flex-column position-relative">
          <Label htmlFor={id || name} className="form-label">
            {label}
          </Label>
          <Input
            type="time"
            name={name}
            id={name}
            disabled={disabled}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            invalid={!!error}
          />
          {error && (
            <FormFeedback>
              <span className="exclamation-icon">
                <Image
                  alt="exclamation-icon"
                  className="error-icon"
                  src={ErrorIcon}
                  width={20}
                  height={20}
                />
              </span>
              {error}
            </FormFeedback>
          )}
        </FormGroup>
      );
    case "password":
      return (
        <FormGroup
          className={`${
            floating
              ? `form-floating  mb-3`
              : `form-row d-flex align-items-start flex-column position-relative`
          }`}
        >
          {!floating && (
            <Label htmlFor={id || name} className="form-label">
              {label}
            </Label>
          )}
          <div className={`icon--main w-100 ${error ? "icon-error--set" : ""}`}>
            {Icon && typeof Icon === "function" && (
              <Icon
                onClick={() => setShow(!show)} // Toggle password visibility
                className="cursor-pointer" // Ensure it's clickable
                size={20} // Optional: Adjust icon size
              />
            )}
          </div>
          <Input
            type={!show ? "password" : "text"}
            name={name}
            id={name}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            disabled={disabled}
            maxLength={maxLength}
            invalid={!!error}
            className={`form-input ${error ? "is-invalid" : ""} ${className}`}
          />
          {floating && <Label htmlFor={id || name}>{label}</Label>}
          {error && (
            <FormFeedback>
              <span className="exclamation-icon">
                <Image
                  alt="exclamation-icon"
                  className="error-icon"
                  src={ErrorIcon}
                  width={20}
                  height={20}
                />
              </span>
              {error}
            </FormFeedback>
          )}
        </FormGroup>
      );
    case "email":
      return (
        <FormGroup
          className={`${
            floating
              ? `form-floating`
              : `form-group form-row d-flex align-items-start flex-column position-relative`
          }`}
        >
          {!floating && (
            <Label htmlFor={id || name} className="form-label">
              {label}
            </Label>
          )}
          <Input
            type="email"
            name={name}
            disabled={disabled}
            id={name}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            invalid={!!error}
            className={`${floating ? `form-control` : `form-input`} ${
              error ? "is-invalid" : ""
            } ${className}`}
          />
          {floating && <Label htmlFor={id || name}>{label}</Label>}
          {error && (
            <FormFeedback>
              <span className="exclamation-icon">
                <Image
                  alt="exclamation-icon"
                  className="error-icon"
                  src={ErrorIcon}
                  width={20}
                  height={20}
                />
              </span>
              {error}
            </FormFeedback>
          )}
        </FormGroup>
      );
    default:
      return (
        <FormGroup
          className={`form-row d-flex align-items-start flex-column position-relative ${
            insuranceClass ? insuranceClass : ""
          }`}
        >
          <Label htmlFor={id || name} className="form-label">
            {label}
          </Label>
          {/* <div className="icon--main w-100"> */}
          <Input
            type="text"
            name={name}
            id={name}
            disabled={disabled}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            maxLength={maxLength}
            onBlur={onBlur}
            invalid={!!error}
            className={`${floating ? `form-control` : `form-input`} ${
              error ? "is-invalid" : ""
            } ${className}`}
          />
          
          {Icon && (
            <Icon
              className="cursor-pointer" // Ensure it's clickable
              size={20} // Optional: Adjust icon size
            />
          )}
          {/* </div> */}
          {error && (
            <FormFeedback>
              <span className="exclamation-icon">
                <Image
                  alt="exclamation-icon"
                  className="error-icon"
                  src={ErrorIcon}
                  width={20}
                  height={20}
                />
              </span>
              {error}
            </FormFeedback>
          )}
        </FormGroup>
      );
  }
};

export default GenericField;
