"use client";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Form, FormGroup, Input, Label, Spinner } from "reactstrap";
import * as Yup from "yup";
import Image from "next/image";
import { Alert } from "@/public/images";
import "../user-data.scss";
import { useFormik } from "formik";
import ToastNotification from "@/app/utils/Toast";
import { ButtonX } from "@/app/shared";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { getErrorMessage, passwordRules } from "@/app/utils/helper";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { CloseButton } from "@/public/icons";
import GenericField from "@/app/FormFields/sharedInput";
import { LocalServer, LocalServerFD } from "@/app/utils";
import { FaTrash } from "react-icons/fa";
import { updateUserInfo } from "@/app/redux/slice/authSlice";
import { FocusError } from "focus-formik-error";

const { ToastComponent } = ToastNotification;

export default function UserData() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { userid } = useParams();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");
  const [show, setShow] = useState(false);
  const [loader, setloader] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [changePassword, setChangePassword] = useState(false);
  const [data, setData] = useState();
  const { user } = useSelector((state) => state.user);
  const fetchUser = async () => {
    setloader(true);
    try {
      const response = await LocalServer.get(
        `/api/user/edit?user_id=${userid}`
      );
      const data = response?.data;
      setData(data);
      formik.setValues({
        password: "",
        image: data?.image,
        email: data?.email,
        current_password: "",
        change_password: false,
        name: data?.name || "",
        password_confirmation: "",
      });
      setloader(false);
    } catch (error) {
      ToastComponent("error", getErrorMessage(error));
      setloader(false);
    }
  };
  useEffect(() => {
    if (userid) fetchUser();
  }, [userid]);

  const initialValues = {
    name: "",
    email: "",
    password: "",
    current_password: "",
    change_password: false,
    password_confirmation: "",
  };

  const validationSchema = Yup.object().shape({
    name: Yup.string().required("Name is required"),
    email: Yup.string()
      .nullable()
      .test("is-valid-email", "Invalid email format", (value) => {
        if (!value) return true;
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      }),
    // current_password: changePassword
    //   ? Yup.string()
    //       // .matches(
    //       //   passwordRules,
    //       //   "Current Password must be at least 8 characters and include at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character"
    //       // )
    //       .required("Current Password is required")
    //   : Yup.string().nullable(),
    password: changePassword
      ? Yup.string()
          .matches(
            passwordRules,
            "Password must be at least 8 characters and include at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character"
          )
          .required("Password is required")
      : Yup.string().nullable(),
    password_confirmation: changePassword
      ? Yup.string()
          .oneOf([Yup.ref("password"), null], "Passwords must match")
          .required("Password confirmation is required")
      : Yup.string().nullable(),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        setloader(true);
        const formData = new FormData();
        for (const key in values) {
          if (key !== "change_password") {
            if (values[key]) {
              formData.append(key, values[key]);
            }
          }
        }
        formData.append("user_id", userid);
        formData.append("change_password", values.change_password ? "1" : "0");
        formData.append("is_user_image_updated", values.image !== data.image);

        const response = await LocalServerFD.post(
          `/api/user/update?user_id=${userid}`,
          formData
        );
        ToastComponent("success", response?.data?.message);
        if (response?.data?.data) {
          if (user?.user?.id == userid) {
            dispatch(
              updateUserInfo({
                provider: {
                  name: response?.data?.data?.name,
                  image: response?.data?.data?.image,
                },
              })
            );
          }
          if (tab === "profile") {
            router.back();
          } else {
            router.push("/admin/users");
          }
        }
      } catch (error) {
        ToastComponent("error", getErrorMessage(error));
        setloader(false);
      } finally {
        setloader(false);
      }
    },
  });
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    e.target.value = "";

    if (file) {
      const allowedExtensions = ["jpg", "jpeg", "png"];
      const fileExtension = file.name.split(".").pop().toLowerCase();

      if (!allowedExtensions.includes(fileExtension)) {
        ToastComponent("error", "Only JPG, JPEG and PNG files are allowed");
        return;
      }

      if (file.size > 1024 * 1024) {
        ToastComponent("error", "File size must be less than or equal to 1MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        formik.setFieldValue("image", reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="provider-data-form--outer">
      <div className="sub-header--main"></div>
      {loader ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "70vh",
          }}
        >
          <Spinner type="grow" color="primary" />
        </div>
      ) : (
        <div className="provider-form--main d-flex align-items-center justify-content-center">
          <div className="row m-0">
            <div className="col-md-12 col-lg-12 provider-form-scroll-container d-flex justify-content-center">
              <div className="provider-data-form--main">
                <div className="provider-data-form--inner">
                  <div className="provider-data-form--header d-flex justify-content-between">
                    <h5 className="w-100">Update User</h5>
                  </div>
                  <div className="provider-data-form--inner">
                    <Form
                      onSubmit={formik.handleSubmit}
                      autoComplete="off"
                      className="bg-white p-4 rounded"
                      style={{
                        boxShadow: "4px 4px 10px rgba(69, 65, 78, .06)",
                      }}
                    >
                      <FocusError formik={formik} />
                      <div className="d-flex flex-wrap mb-4">
                        <div
                          id="logoPreview"
                          className="flex-fill d-flex mb-40 relative d-flex justify-content-center align-items-center"
                        >
                          {!formik.values?.image ? (
                            <GenericField
                              disabled={
                                !(tab === "profile" && user?.user?.id == userid)
                              }
                              type="file"
                              name="image"
                              label="Logo Upload"
                              onChange={handleLogoChange}
                              className={`custom-input `}
                            />
                          ) : (
                            <>
                              {tab === "profile" &&
                                user?.user?.id == userid && (
                                  <div className="cross-button" role="button">
                                    <FaTrash
                                      onClick={() =>
                                        formik.setFieldValue("image", "")
                                      }
                                      className="del delete_icon"
                                    />
                                  </div>
                                )}
                              <Image
                                src={
                                  typeof formik.values?.image === "string"
                                    ? formik.values.image.includes("base64")
                                      ? formik.values.image
                                      : `${process.env.NEXT_PUBLIC_AWS_S3_BUCKET_URL}${formik.values.image}`
                                    : undefined
                                }
                                alt="Uploaded Image"
                                width={120}
                                height={120}
                                className="uploaded-image mb-3"
                                style={{
                                  height: 120,
                                  width: 120,
                                  borderRadius: "50%",
                                }}
                              />
                            </>
                          )}
                        </div>

                        <div className="flex-fill w-100">
                          <GenericField
                            type="text"
                            name="name"
                            className={`custom-input`}
                            label={
                              <div className="d-flex align-items-center">
                                Name
                                <Image
                                  src={Alert}
                                  alt="alert-icon"
                                  className="ms-2"
                                />
                              </div>
                            }
                            value={formik.values.name}
                            onChange={formik.handleChange}
                            error={formik.touched.name && formik.errors.name}
                            maxLength={50}
                          />
                        </div>
                        <div className="flex-fill w-100">
                          <GenericField
                            type="email"
                            name="email"
                            label="Email"
                            disabled
                            value={formik.values.email}
                            onChange={(event) => handleCheckEmail(event)}
                            error={formik.touched.email && formik.errors.email}
                          />
                        </div>
                      </div>
                      {true && (
                        <>
                          {/* Toggle Checkbox */}
                          <FormGroup
                            check
                            style={{
                              marginBottom: "20px",
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <Input
                              id="change_password"
                              name="change_password"
                              type="checkbox"
                              checked={changePassword}
                              onChange={(e) => {
                                const isChecked = e.target.checked;
                                setChangePassword(isChecked);
                                formik.setFieldValue(
                                  "change_password",
                                  isChecked
                                );

                                if (!isChecked) {
                                  formik.setFieldValue("current_password", "");
                                  formik.setFieldValue("password", "");
                                  formik.setFieldValue(
                                    "password_confirmation",
                                    ""
                                  );
                                }
                              }}
                            />
                            <Label
                              check
                              style={{ marginLeft: "8px", cursor: "default" }}
                            >
                              Change Password
                            </Label>
                          </FormGroup>

                          {/* Conditionally Render Password Fields */}
                          {changePassword && (
                            <>
                              {user?.user?.id == userid && (
                                <GenericField
                                  show={showCurrent}
                                  type="password"
                                  name="current_password"
                                  id="current_password"
                                  label="Current Password"
                                  setShow={setShowCurrent}
                                  value={formik.values.current_password}
                                  onChange={formik.handleChange}
                                  onBlur={formik.handleBlur}
                                  error={
                                    formik.touched.current_password &&
                                    formik.errors.current_password
                                  }
                                  Icon={
                                    showCurrent
                                      ? AiOutlineEye
                                      : AiOutlineEyeInvisible
                                  }
                                  maxLength={50}
                                />
                              )}

                              <GenericField
                                show={show}
                                type="password"
                                name="password"
                                label="New Password"
                                setShow={setShow}
                                value={formik.values.password}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={
                                  formik.touched.password &&
                                  formik.errors.password
                                }
                                Icon={
                                  show ? AiOutlineEye : AiOutlineEyeInvisible
                                }
                                maxLength={50}
                              />
                              <GenericField
                                show={showConfirm}
                                type="password"
                                name="password_confirmation"
                                label="Confirm Password"
                                setShow={setShowConfirm}
                                value={formik.values.password_confirmation}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={
                                  formik.touched.password_confirmation &&
                                  formik.errors.password_confirmation
                                }
                                Icon={
                                  showConfirm
                                    ? AiOutlineEye
                                    : AiOutlineEyeInvisible
                                }
                                maxLength={50}
                              />
                            </>
                          )}
                        </>
                      )}

                      <div className="provider-data-form--actions d-flex justify-content-center align-items-center">
                        <ButtonX
                          className=" btn-default btn-outline"
                          clickHandler={() => history.back()}
                        >
                          Cancel
                        </ButtonX>
                        <ButtonX
                          type="submit"
                          disabled={loader}
                          className=" btn-default btn-quote btn-quote--hover"
                        >
                          Submit
                        </ButtonX>
                      </div>
                    </Form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
