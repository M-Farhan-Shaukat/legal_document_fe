"use client";

import { useState } from "react";
import { Button, Form } from "reactstrap";
import "../signin/Form.scss";
import * as Yup from "yup";
import { useFormik } from "formik";
import { LocalServer } from "@/app/utils";
// import "../../FormFields/sharedInput/Input.scss";
import ToastNotification from "@/app/utils/Toast";
import { getErrorMessage } from "@/app/utils/helper";
import GenericField from "@/app/FormFields/sharedInput";
import { useRouter, useSearchParams } from "next/navigation";

const { ToastComponent } = ToastNotification;

const Forget = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const initialValues = {
    email: "",
  };

  const validationSchema = Yup.object({
    email: Yup.string().email("Invalid email").required("Email is required"),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        const response = await LocalServer.post("/api/forget", values);
        ToastComponent("success", response?.data?.message);
        router.push("/admin/reset-password");
      } catch (error) {
        ToastComponent("error", getErrorMessage(error));
        setLoading(false);
      }
    },
  });

  return (
    <div className="signin_form">
      <div className="form_header mb-2">
        <h1>Reset password</h1>
      </div>
      <Form onSubmit={formik.handleSubmit} className="signin__form_inner">
        <div className="signin__fields">
          <GenericField
            // floating
            id="email"
            type="email"
            name="email"
            label="Email"
            placeholder="Email"
            className="form-floating"
            onBlur={formik.handleBlur}
            value={formik.values.email}
            onChange={formik.handleChange}
            error={formik.touched.email && formik.errors.email}
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

export default Forget;
