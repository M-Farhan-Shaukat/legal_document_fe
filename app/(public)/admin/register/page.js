"use client";

import { useEffect, useState } from "react";
import { Button, Form } from "reactstrap";
import "../signin/Form.scss";
import * as Yup from "yup";
import Link from "next/link";
import { useFormik } from "formik";
import { useRouter } from "next/navigation";
// import "../../FormFields/sharedInput/Input.scss";
import GenericField from "@/app/FormFields/sharedInput";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { LocalServer } from "@/app/utils";
import ToastNotification from "@/app/utils/Toast";
import { getErrorMessage, passwordRules } from "@/app/utils/helper";

const { ToastComponent } = ToastNotification;

const Register = () => {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [initialValues, setInitialValues] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  // ✅ Load saved values on first mount
  useEffect(() => {
    const stored = localStorage.getItem("registerFormData");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setInitialValues({
          name: parsed.name || "",
          email: parsed.email || "",
          password: parsed.password || "",
          password_confirmation: parsed.password_confirmation || "",
        });
      } catch (err) {
        console.warn("Error parsing stored registerFormData", err);
      }
    }
  }, []);

  const validationSchema = Yup.object({
    name: Yup.string()
      .required("Name is required")
      .matches(/^[a-zA-Z\s]+$/, "Only letters and spaces are allowed in name")
      .test(
        "not-only-spaces",
        "Name cannot be only spaces",
        (val) => val?.trim().length > 0
      )
      .max(50, "Name must be at most 50 characters"),

    email: Yup.string().email("Invalid email").required("Email is required"),

    password: Yup.string()
      .matches(
        passwordRules,
        "Password must be at least 8 characters and include at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character"
      )
      .max(50, "Password must be at most 50 characters")
      .required("Password is required"),

    password_confirmation: Yup.string()
      .oneOf([Yup.ref("password"), null], "Passwords must match")
      .required("Password confirmation is required"),
  });

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        const response = await LocalServer.post("/api/register", values);
        ToastComponent("success", response?.data?.message);
        localStorage.removeItem("registerFormData");
        router.push("/admin/signin");
      } catch (error) {
        setLoading(false);
        ToastComponent("error", getErrorMessage(error));
      }
    },
  });

  // Save form values when user switches to sign-in
  const handleSwitchToSignIn = () => {
    localStorage.setItem("registerFormData", JSON.stringify(formik.values));
    router.push("/admin/signin");
  };

  return (
    <div className="signin_form">
      <div className="form_header">
        <h1>Register</h1>
      </div>
      <div className="authSwitch">
        <button onClick={handleSwitchToSignIn}>Sign in</button>
        <button className="active">Sign up</button>
      </div>
      <Form onSubmit={formik.handleSubmit} className="signin__form_inner">
        <div className="signin__fields">
          <GenericField
            label="*Name"
            type="text"
            name="name"
            id="name"
            placeholder="Name"
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.name && formik.errors.name}
            maxLength={50}
          />
          <GenericField
            label="*Email"
            type="email"
            name="email"
            id="email"
            placeholder="Email"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.email && formik.errors.email}
          />
          <GenericField
            label="*Password"
            type="password"
            name="password"
            id="password"
            placeholder="Password"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.password && formik.errors.password}
            Icon={show ? AiOutlineEye : AiOutlineEyeInvisible}
            show={show}
            setShow={setShow}
            maxLength={50}
          />
          <GenericField
            label="*Confirm Password"
            type="password"
            name="password_confirmation"
            id="password_confirmation"
            placeholder="Confirm Password"
            value={formik.values.password_confirmation}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={
              formik.touched.password_confirmation &&
              formik.errors.password_confirmation
            }
            Icon={showConfirm ? AiOutlineEye : AiOutlineEyeInvisible}
            show={showConfirm}
            setShow={setShowConfirm}
            maxLength={50}
          />
        </div>
        <Button
          className="signin_btn"
          type="submit"
          color="primary"
          block
          disabled={loading}
        >
          Register
        </Button>

        <Link className="btn-forgot" href="/admin/signin">
          Already have an account? <span>Sign in</span>
        </Link>
      </Form>
    </div>
  );
};

export default Register;
