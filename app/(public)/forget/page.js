"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Form,
  FormGroup,
  Input,
  Label,
  Button,
  FormFeedback,
  Spinner,
} from "reactstrap";
import { getErrorMessage } from "@/app/utils/helper";
import "./Reset.scss";
import { useFormik } from "formik";
import * as Yup from "yup";
import GenericField from "@/app/FormFields/sharedInput";
import { LocalServer } from "@/app/utils";
import ToastNotification from "@/app/utils/Toast";
import { useRouter } from "next/navigation";

const Reset = () => {
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { ToastComponent } = ToastNotification;

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
        router.push("/reset-password");
      } catch (error) {
        ToastComponent("error", getErrorMessage(error));
        setLoading(false);
      }
    },
  });
  return (
    <div className="reset-main">
      <div className="reset__container">
        <div className="heading">
          <h1 className="reset-heading generic-heading">
            Forgot your password?
          </h1>
          <p>
            No worries, just tell us your email address and we will send you a
            reset link.
          </p>
        </div>
        <div className="reset-form-container">
          <Form
            onSubmit={formik.handleSubmit}
            className="signin__form contact-form"
          >
            <div className="signin__form-floating-wrapper form-floating-wrapper">
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
            </div>
            <div className="reset-actions">
              <Button
                block
                type="submit"
                color="primary"
                disabled={loading}
                className="btn-submit btn-disabled btn-submit--default"
              >
                {loading ? <Spinner size="sm" color="light" /> : "Submit"}
              </Button>
            </div>
          </Form>
        </div>
        <div className="remember-password">
          <Link href="/login">I remember my password now</Link>
        </div>
      </div>
    </div>
  );
};

export default Reset;
