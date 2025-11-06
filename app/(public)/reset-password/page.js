"use client";

import { LocalServer } from "@/app/utils";
import { getErrorMessage, passwordRules } from "@/app/utils/helper";
import ToastNotification from "@/app/utils/Toast";
import { useFormik } from "formik";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button, Spinner } from "reactstrap";
import { Form, FormFeedback, FormGroup, Input, Label } from "reactstrap";
import * as Yup from "yup";
import "../login/Form.scss";
import { FaEye, FaEyeSlash } from "react-icons/fa";
const { ToastComponent } = ToastNotification;

const ResetPassword = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [loading, setLoading] = useState(false);
  // const [show, setShow] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const initialValues = {
    password: "",
    confirmation_code: "",
    password_confirmation: "",
  };

  const validationSchema = Yup.object({
    confirmation_code: Yup.string()
      .required("Confirmation code is required")
      .matches(
        /^[A-Za-z0-9]{1,6}$/,
        "Confirmation code must be up to 6 letters"
      ),
    password: Yup.string()
      .matches(
        passwordRules,
        "Password must be at least 8 characters and include at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character"
      )
      .required("Password is required"),
    password_confirmation: Yup.string()
      .oneOf([Yup.ref("password"), null], "Passwords must match")
      .required("Password confirmation is required"),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values) => {
      try {
        const payload = {
          ...values,
          // confirm_token: token,
        };
        setLoading(true);
        const response = await LocalServer.post("/api/resetPassword", payload);
        if (response?.data?.success) {
          ToastComponent("success", response?.data?.message);
          router.push("/login");
        }
      } catch (error) {
        ToastComponent("error", getErrorMessage(error));
        setLoading(false);
      }
    },
  });

  return (
    <div className="signin">
      <div className="signin__container">
        <div className="heading">
          <h1 className="generic-heading">Change your password</h1>
        </div>
        <div className="form-container">
          <Form
            className="signin__form contact-form"
            noValidate
            onSubmit={formik.handleSubmit}
          >
            <div className="signin__form-floating-wrapper form-floating-wrapper">
              <FormGroup className="form-floating">
                <Input
                  type="text"
                  id="confirmation_code"
                  name="confirmation_code"
                  placeholder=" "
                  autocomplete="off"
                  value={formik.values.confirmation_code}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur} // important
                />
                <Label for="confirmation_code">Confirmation Code</Label>
                {formik.touched.confirmation_code &&
                  formik.errors.confirmation_code && (
                    <FormFeedback>
                      {formik.errors.confirmation_code}
                    </FormFeedback>
                  )}
              </FormGroup>

              <FormGroup className="form-floating password-wrapper">
                <Input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  placeholder=" "
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur} // important
                />
                <Label for="password">Password</Label>
                <span
                  className="password-toggle-icon"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
                {formik.touched.password && formik.errors.password && (
                  <FormFeedback>{formik.errors.password}</FormFeedback>
                )}
              </FormGroup>
              <FormGroup className="form-floating password-wrapper">
                <Input
                  type={showConfirm ? "text" : "password"}
                  id="password_confirmation"
                  name="password_confirmation"
                  placeholder=" "
                  value={formik.values.password_confirmation}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur} // important
                />
                <Label for="password_confirmation">Confirm Password</Label>
                <span
                  className="password-toggle-icon"
                  onClick={() => setShowConfirm(!showConfirm)}
                >
                  {showConfirm ? <FaEyeSlash /> : <FaEye />}
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
              <button className="btn-login">
                {" "}
                {loading ? <Spinner size="sm" color="light" /> : "Submit"}
              </button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
