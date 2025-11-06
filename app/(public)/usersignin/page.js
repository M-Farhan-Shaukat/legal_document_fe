"use client";

import { useState, useEffect } from "react";
import { Button, Form } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import "./Form.scss";
import * as Yup from "yup";
import Link from "next/link";
import { useFormik } from "formik";
import { useRouter } from "next/navigation";
import "../../FormFields/sharedInput/Input.scss";
import GenericField from "@/app/FormFields/sharedInput";
import { loginUser } from "@/app/redux/slice/authSlice";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

const SignIn = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [show, setShow] = useState(false);

  const { user, loading, Tfa } = useSelector((state) => state.user);

  const initialValues = {
    email: "",
    password: "",
  };

  const validationSchema = Yup.object({
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string().required("Password is required"),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: (values) => {
      dispatch(loginUser(values))
        .then((res) => {
          localStorage.setItem("email", values?.email);
          localStorage.setItem(
            "verify_through",
            res?.payload?.verified_through
          );
        })
        .catch((err) => {
          console.error("Login error:", err);
        });
    },
  });

  useEffect(() => {
    if (user?.token) router.push("/");
    // localStorage.removeItem("registerFormData");
  }, [user]);

  useEffect(() => {
    if (Tfa) router.push("/twofactorauthentication");
  }, [user, Tfa]);

  return (
    <div className="signin_form">
      <div className="form_header">
        <h1>Sign in</h1>
        {/* <p>Please login to continue to your account.</p> */}
      </div>
      {/* <Link href="/register">Register</Link>
          <Link href="/forget">Forget Password</Link> */}
      <div className="authSwitch">
        <button onClick={() => router.push("/login")} className="active">
          Sign in
        </button>
        <button onClick={() => router.push("/register")}>Sign up</button>
      </div>
      <Form onSubmit={formik.handleSubmit} className="signin__form_inner">
        <div className="signin__fields">
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
            // floating
          />
          <GenericField
            className="password--field"
            label="*Password"
            type="password"
            name="password"
            placeholder="Password"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            maxLength={50}
            error={formik.touched.password && formik.errors.password}
            Icon={show ? AiOutlineEye : AiOutlineEyeInvisible}
            // floating
            show={show}
            setShow={setShow}
          />

          <div className="forgot--password">
            <Link href="/forget">Forget Password</Link>
          </div>
        </div>
        <Button
          className="signin_btn"
          type="submit"
          color="primary"
          block
          disabled={loading}
        >
          Log in
        </Button>
      </Form>
    </div>
  );
};

export default SignIn;
