"use client";

import { useFormik } from "formik";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Button,
  Form,
  FormFeedback,
  FormGroup,
  Input,
  Label,
  Spinner,
} from "reactstrap";
import { useEffect, useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./Form.scss";

import { loginUser } from "@/app/redux/slice/authSlice";
import { useDispatch } from "react-redux";
import * as Yup from "yup";
// import { useSelector } from "react-redux";
import ToastNotification from "@/app/utils/Toast";
import { useSelector } from "react-redux";

const Signin = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { ToastComponent } = ToastNotification;

  const initialValues = {
    email: "",
    password: "",
  };
  const { user } = useSelector((state) => state.user);
  useEffect(() => {
    if (user?.user?.role_id) {
      router.replace("/dashboard");
    }
  }, [user?.user?.role_id, router]);
  const isAuthenticated = !!user?.user?.role_id;

  // if (user?.user?.role_id) {
  //   return null;
  // }
  const validationSchema = Yup.object({
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string().required("Password is required"),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const res = await dispatch(
          loginUser({ userData: values, isAdmin: false })
        );
        return;
        if (res?.payload?.success) {
          ToastComponent("success", "Login successful");
          router.push("/dashboard");
          setLoading(false);
        }
      } catch (err) {
        ToastComponent("error", err.payload);
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <>
      {isAuthenticated ? null : (
        <div className="signin">
          <div className="signin__container">
            <div className="heading">
              <h1 className="generic-heading">Log In</h1>
            </div>
            <div className="form-container">
              <Form
                noValidate
                className="signin__form contact-form"
                onSubmit={formik.handleSubmit}
              >
                <div className="signin__form-floating-wrapper form-floating-wrapper">
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
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </span>
                    {formik.touched.password && formik.errors.password && (
                      <FormFeedback>{formik.errors.password}</FormFeedback>
                    )}
                  </FormGroup>
                </div>

                <div className="form-action">
                  <button
                    className="btn-login"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? <Spinner size="sm" color="light" /> : "Log In"}
                  </button>
                </div>
              </Form>
            </div>

            <div className="forgot-password">
              <Link href="/forget">Forgot your password?</Link>
            </div>
            <div className="get-started d-flex align-items-center justify-content-center">
              <div className="get-started__text">
                <span>Don't have an account?</span>
              </div>
              <div className="get-started__button">
                <Button
                  className="get-started__btn"
                  onClick={() => router.push("/register")}
                >
                  Get Started Now
                </Button>
              </div>
            </div>
          </div>

          {/* Styling for icon */}
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
      )}
    </>
  );
};

export default Signin;
