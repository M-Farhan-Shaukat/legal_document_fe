"use client";

import { processLoginData } from "@/app/redux/slice/authSlice";
import { LocalServer } from "@/app/utils";
import ToastNotification from "@/app/utils/Toast";
import { useFormik } from "formik";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useDispatch } from "react-redux";
import {
  Form,
  FormFeedback,
  FormGroup,
  Input,
  Label,
  Spinner,
} from "reactstrap";
import * as Yup from "yup";
import "../login/Form.scss";

const Register = () => {
  const router = useRouter();
  const { ToastComponent } = ToastNotification;
  const dispatch = useDispatch();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const initialValues = {
    name: "",
    password: "",
    email: "",
    password_confirmation: "",
  };

  const validationSchema = Yup.object({
    name: Yup.string()
      .required("Name is required")
      .test(
        "not-only-spaces",
        "Name cannot be only spaces",
        (value) => !!value && value.replace(/\s/g, "").length > 0
      )
      .matches(/^[A-Za-z\s]+$/, "Name must only contain letters and spaces")
      .min(3, "Name cannot less 3 characters")
      .max(20, "Name cannot exceed 20 characters"),
    email: Yup.string()
      .trim()
      .email("Enter a valid email address")
      .matches(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, "Enter a valid email address")
      .required("Email is required"),
    password: Yup.string()
      .required("Password is required")
      .test(
        "no-leading-space",
        "Password cannot start with a space",
        (value) => value !== undefined && !/^\s/.test(value)
      )
      .min(8, "Password must be at least 8 characters")
      .max(16, "Password must be at most 16 characters")
      .matches(/[a-z]/, "Password must contain at least one lowercase letter")
      .matches(
        /[A-Z]/,
        "Password must contain at least one capital letter and one number"
      )
      .matches(/\d/, "Password must contain at least one number")
      .matches(
        /[@$!%*?&]/,
        "Password must contain at least one special character (@$!%*?&)"
      ),
    password_confirmation: Yup.string()
      .oneOf([Yup.ref("password"), undefined], "Passwords must match")
      .required("Confirm your password"),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      const paymentDue = localStorage.getItem("payment_due");
      try {
        if (paymentDue == "true") {
          // Handle both boolean and string
          const updatedValues = {
            ...values,
            is_document_filled: true,
          };

          dispatch(processLoginData({ userData: updatedValues })).then(() => {
            router.push("/dashboard");
          });
        } else {
          const response = await LocalServer.post("/api/register", values);

          if (response?.data?.success) {
            ToastComponent(
              "success",
              response.data.message || "Registration successful"
            );
            router.push("/login");
          } else {
            ToastComponent(
              "error",
              response?.data?.message?.email || "Registration failed"
            );
          }
        }
      } catch (err) {
        console.error("Registration error:", err); // Log full error for debugging
        const errorMessage =
          err?.message?.email[0] || err?.message || "Registration failed";
        ToastComponent("error", errorMessage);
      } finally {
        setLoading(false); // Always reset loading state
      }
    },
  });

  return (
    <div className="signin">
      <div className="signin__container">
        <div className="heading">
          <h1 className="generic-heading">Register</h1>
        </div>
        <div className="form-container">
          <Form
            className="signin__form contact-form"
            noValidate
            onSubmit={formik.handleSubmit}>
            <div className="signin__form-floating-wrapper form-floating-wrapper">
              {/* Name */}
              <FormGroup className="form-floating">
                <Input
                  type="text"
                  id="name"
                  name="name"
                  placeholder=" "
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                <Label for="name">*Name</Label>
                {formik.touched.name && formik.errors.name && (
                  <FormFeedback>{formik.errors.name}</FormFeedback>
                )}
              </FormGroup>

              {/* Email */}
              <FormGroup className="form-floating">
                <Input
                  type="email"
                  id="email"
                  name="email"
                  placeholder=" "
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                <Label for="email">*Email</Label>
                {formik.touched.email && formik.errors.email && (
                  <FormFeedback>{formik.errors.email}</FormFeedback>
                )}
              </FormGroup>

              {/* Password */}
              <FormGroup className="form-floating password-wrapper">
                <Input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  placeholder=" "
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                <Label for="password">*Password</Label>
                <span
                  className="password-toggle-icon"
                  onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
                {formik.touched.password && formik.errors.password && (
                  <FormFeedback>{formik.errors.password}</FormFeedback>
                )}
              </FormGroup>

              {/* Confirm Password */}
              <FormGroup className="form-floating password-wrapper">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  id="password_confirmation"
                  name="password_confirmation"
                  placeholder=" "
                  value={formik.values.password_confirmation}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                <Label for="password_confirmation">*Confirm Password</Label>
                <span
                  className="password-toggle-icon"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
                {formik.touched.password_confirmation &&
                  formik.errors.password_confirmation && (
                    <FormFeedback>
                      {formik.errors.password_confirmation}
                    </FormFeedback>
                  )}
              </FormGroup>
            </div>

            <div className="form-action">
              <button className="btn-login" type="submit" disabled={loading}>
                {loading ? <Spinner size="sm" color="light" /> : "Register"}
              </button>
            </div>
          </Form>
        </div>

        <div className="forgot-password">
          <Link href="/login"> Already have an account? Login</Link>
        </div>
      </div>

      {/* Icon Styling */}
      <style jsx>{`
        .password-wrapper {
          position: relative;
        }
        .password-toggle-icon {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          cursor: pointer;
          font-size: 1.2rem;
          color: #666;
        }
      `}</style>
    </div>
  );
};

export default Register;
