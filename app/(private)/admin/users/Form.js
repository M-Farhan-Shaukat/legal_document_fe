"use client";

import { useState } from "react";
import { Form } from "reactstrap";
import * as Yup from "yup";
import { useFormik } from "formik";
import { ButtonX } from "@/app/shared";
import { LocalServer } from "@/app/utils";
import ToastNotification from "@/app/utils/Toast";
import GenericField from "@/app/FormFields/sharedInput";
import { getErrorMessage, passwordRules } from "@/app/utils/helper";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

const { ToastComponent } = ToastNotification;

const UserForm = ({ CloseModal, fetchUsers }) => {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showconfirm, setShowconfirm] = useState(false);

  const initialValues = {
    email: "",
    name: "",
    password: "",
    password_confirmation: "",
    send_email: "",
  };
  const getValidationSchema = () =>
    Yup.object({
      name: Yup.string().required("Name is required"),
      email: Yup.string().email("Invalid email").required("Email is required"),
      password: Yup.string()
        .matches(
          passwordRules,
          "Password must be at least 8 characters and include at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character"
        )
        .required("Password is required"),
      password_confirmation: Yup.string()
        .oneOf([Yup.ref("password"), null], "Password must match")
        .required("Password confirmation is required"),
    });

  const url = "/api/user/create";

  const formik = useFormik({
    initialValues,
    validationSchema: getValidationSchema(),
    onSubmit: async (values) => {
      try {
        setLoading(true);
        const payload = values;
        const response = await LocalServer.post(url, payload);
        ToastComponent("success", response?.data?.message);
        await fetchUsers();
        CloseModal();
      } catch (error) {
        ToastComponent("error", getErrorMessage(error));
        setLoading(false);
      }
    },
  });

  return (
    <div className="shadow-none ">
      <Form onSubmit={formik.handleSubmit} autoComplete="new-password">
        <div className="">
          <GenericField
            type="text"
            id="name"
            name="name"
            label={
              <div className="d-flex align-items-center">
                Name&nbsp;
                <span className="required">*</span>
                {/* <Image src={Alert} alt="alert-icon" className="ms-2" /> */}
              </div>
            }
            onBlur={formik.handleBlur}
            placeholder="Name"
            className="form-floating mb-1"
            onChange={formik.handleChange}
            value={formik.values.name}
            error={formik.touched.name && formik.errors.name}
          />

          <div className="notification--field">
            <GenericField
              id="email"
              type="email"
              name="email"
              label={
                <div className="d-flex align-items-center gap-2 alert--email">
                  <div className="email-left">
                    <span>Email</span>&nbsp;
                    <span className="required">*</span>
                  </div>
                  {/* <div className="d-flex email-right">
                    <Image
                      alt="exclamation-icon"
                      className="error-icon exclamaition"
                      src={ErrorIcon}
                      width={20}
                      height={20}
                    />
                    <p className="notification-desc">
                      {" "}
                      send email notification.
                    </p>
                    <GenericField
                      id="send_email"
                      type="switch"
                      name="send_email"
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      value={formik.values.send_email}
                    />
                  </div> */}
                </div>
              }
              placeholder=" Email"
              value={formik.values.email}
              onBlur={formik.handleBlur}
              className="form-floating mb-1 "
              onChange={formik.handleChange}
              error={formik.touched.email && formik.errors.email}
            />
          </div>
          <GenericField
            show={show}
            type="password"
            name="password"
            label={
              <div className="d-flex align-items-center">
                Password&nbsp;
                <span className="required">*</span>
              </div>
            }
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
            show={showconfirm}
            type="password"
            className="mb-1"
            label={
              <div className="d-flex align-items-center">
                Confirm Password&nbsp;
                <span className="required">*</span>
              </div>
            }
            setShow={setShowconfirm}
            onBlur={formik.handleBlur}
            name="password_confirmation"
            placeholder="Confirm Password"
            onChange={formik.handleChange}
            value={formik.values.password_confirmation}
            Icon={showconfirm ? AiOutlineEye : AiOutlineEyeInvisible}
            error={
              formik.touched.password_confirmation &&
              formik.errors.password_confirmation
            }
          />
        </div>
        <div className="popup--actions d-flex w-100 justify-content-end gap-3">
          <ButtonX size="sm" className="btn-cancel btn-default" color="danger" clickHandler={() => CloseModal()}>
            Cancel
          </ButtonX>
          <ButtonX
            size="sm"
            type="submit"
            disabled={loading}
            className="btn-quote btn-quote--hover d-flex align-items-center justify-content-center"
          >
            Submit
          </ButtonX>
        </div>
      </Form>
    </div>
  );
};

export default UserForm;
