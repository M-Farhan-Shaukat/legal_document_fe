"use client";

import { useState } from "react";
import { Button, Form } from "reactstrap";
import * as Yup from "yup";
import "../signin/Form.scss";
import { useFormik } from "formik";
import { LocalServer } from "@/app/utils";
import ToastNotification from "@/app/utils/Toast";
import GenericField from "@/app/FormFields/sharedInput";
import { useRouter, useSearchParams } from "next/navigation";
import { getErrorMessage, passwordRules } from "@/app/utils/helper";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

const { ToastComponent } = ToastNotification;

const ResetPassword = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const initialValues = {
    password: "",
    confirmation_code: "",
    password_confirmation: "",
  };

  const validationSchema = Yup.object({
    confirmation_code: Yup.string().required("Confirmation code is required"),
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
          router.push("/admin/signin");
        }
      } catch (error) {
        ToastComponent("error", getErrorMessage(error));
        setLoading(false);
      }
    },
  });

  return (
    <div className="signin_form">
      <div className="form_header mb-5">
        <h1>Change your password</h1>
      </div>
      <Form onSubmit={formik.handleSubmit} className="signin__form_inner">
        <div className="signin__fields">
          <GenericField
            type="text"
            id="confirmation_code"
            name="confirmation_code"
            label="Confirmation Code"
            onBlur={formik.handleBlur}
            className="form-floating mb-1"
            onChange={formik.handleChange}
            placeholder="Confirmation Code"
            value={formik.values.confirmation_code}
            error={
              formik.touched.confirmation_code &&
              formik.errors.confirmation_code
            }
          />
          <GenericField
            show={show}
            type="password"
            name="password"
            label="Password"
            className="mb-1"
            setShow={setShow}
            placeholder="Password"
            onBlur={formik.handleBlur}
            value={formik.values.password}
            onChange={formik.handleChange}
            Icon={show ? AiOutlineEye : AiOutlineEyeInvisible}
            error={formik.touched.password && formik.errors.password}
          />
          <GenericField
            Icon={showConfirm ? AiOutlineEye : AiOutlineEyeInvisible}
            show={showConfirm}
            setShow={setShowConfirm}
            type="password"
            className="mb-1"
            // Icon={HideView}
            label="Confirm Password"
            onBlur={formik.handleBlur}
            name="password_confirmation"
            placeholder="Confirm Password"
            onChange={formik.handleChange}
            value={formik.values.password_confirmation}
            error={
              formik.touched.password_confirmation &&
              formik.errors.password_confirmation
            }
          />
        </div>
        <Button
          block
          type="submit"
          color="primary"
          disabled={loading}
          className="signin_btn"
        >
          Submit
        </Button>
      </Form>
    </div>
  );
};

export default ResetPassword;
