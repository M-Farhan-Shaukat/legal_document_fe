"use client";

import "./Twofactor.scss";
import { Base64 } from "js-base64";
import { LocalServer } from "@/app/utils";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Container,
  Card,
  Input,
  Button,
  Alert,
  Collapse,
  FormGroup,
  Spinner,
} from "reactstrap";
import ToastNotification from "@/app/utils/Toast";
import { getErrorMessage } from "@/app/utils/helper";
import { logoutUser, updateUserLocally } from "@/app/redux/slice/authSlice";

const { ToastComponent } = ToastNotification;

const OTPVerification = () => {
  const router = useRouter();
  const { user, message, auth_type, available_channels, try_another_way } =
    useSelector((state) => state.user);
  const [otp, setOtp] = useState(
    auth_type === "phone" ? ["", "", "", ""] : ["", "", "", "", "", ""]
  );
  const [timeLeft, setTimeLeft] = useState(3 * 60 + 38); // 3 minutes 38 seconds
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setloading] = useState(false);
  const dispatch = useDispatch();
  const [selected, setSelected] = useState("");

  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => setIsOpen(!isOpen);

  // Countdown Timer
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // Format Timer Display (MM:SS)
  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? `0${sec}` : sec}`;
  };

  const handleChange = (e, index) => {
    const value = e.target.value.substring(0, 1);
    let newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (e.target.nextSibling && value) {
      e.target.nextSibling.focus();
    }

    if (newOtp.every((digit) => digit !== "")) {
      submitOTP(newOtp.join(""));
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData =
      auth_type === "phone"
        ? e.clipboardData.getData("text").trim().slice(0, 4)
        : e.clipboardData.getData("text").trim().slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    let newOtp = [...otp];
    pastedData.split("").forEach((char, index) => {
      if (index < newOtp.length) {
        newOtp[index] = char;
      }
    });

    setOtp(newOtp);

    const lastIndex =
      pastedData.length >= otp.length ? otp.length - 1 : pastedData.length;
    document.querySelectorAll(".otp-input")[lastIndex]?.focus();

    if (newOtp.every((digit) => digit !== "")) {
      submitOTP(newOtp.join(""));
    }
  };

  const submitOTP = async (enteredOtp) => {
    try {
      setIsSubmitting(true);
      const response = await LocalServer.post(`/api/authentication/confirm`, {
        email: localStorage.getItem("email"),
        verify_through: localStorage.getItem("verify_through"),
        code: enteredOtp,
        from: localStorage.getItem("from"),
      });

      const data = response?.data;
      if (data?.success) {
        ToastComponent("success", data?.message);
        dispatch(
          updateUserLocally({
            user: {
              ...data?.user,
              token: data?.token,
            },
            loading: false,
            error: null,
            Tfa: false,
          })
        );
        router.push("/");
      }
    } catch (error) {
      ToastComponent("error", getErrorMessage(error));
      setIsSubmitting(false);
      setOtp(
        auth_type === "phone" ? ["", "", "", ""] : ["", "", "", "", "", ""]
      );
    }

    // setIsSubmitting(false);
  };

  // Encode the email
  function encodeEmail(email) {
    return Base64.encode(email);
  }

  // Decode the email
  function decodeEmail(encodedEmail) {
    return Base64.decode(encodedEmail);
  }

  const handleChannelChange = async (e) => {
    setloading(true);
    setSelected(e.target.value);
    if (e.target.value === "google_authenticato") {
      dispatch(
        updateUserLocally({
          user: {
            ...user,
          },
          message:
            e.target.value === "email"
              ? "Enter the 6-digit code from your Email"
              : "Enter the 6-digit code from your Google Authenticator",
        })
      );
      setloading(false);
      ToastComponent(
        "success",
        "Enter the 6-digit code from your Google Authenticator"
      );
    } else {
      const email = localStorage.getItem("email");
      const paload = {
        verify_through: e.target.value,
        verify_channel: encodeEmail(email),
      };
      try {
        const response = await LocalServer.post(
          `/api/authentication/try`,
          paload
        );
        if (response?.data?.success) {
          localStorage.setItem("verify_through", e.target.value);
          ToastComponent("success", response?.data?.message);
          setloading(false);
          dispatch(
            updateUserLocally({
              user: {
                ...user,
              },
              message:
                e.target.value === "email"
                  ? "Enter the 6-digit code from your Email"
                  : "Enter the 6-digit code from your Google Authenticator",
            })
          );
        }
      } catch (error) {
        setloading(false);
        ToastComponent("error", getErrorMessage(error));
      }
    }
  };

  return (
    <Container
      style={{ height: "56vh" }}
      className="d-flex justify-content-center align-items-center"
    >
      {loading ? (
        <Spinner type="grow" color="primary" />
      ) : (
        <Card className="p-4 text-center shadow-lg otp-card">
          {/* <img src="/email-icon.png" alt="email" className="otp-icon" /> */}
          <div>📩</div>
          <h5>{message}</h5>
          <p className="text-muted">{localStorage.getItem("email")}</p>

          <div className="otp-input-container">
            {otp.map((digit, index) => (
              <Input
                key={index}
                type="text"
                className="otp-input"
                value={digit}
                onChange={(e) => handleChange(e, index)}
                onPaste={handlePaste} // Add this event
                maxLength="1"
                disabled={isSubmitting}
              />
              // <Input
              //   key={index}
              //   type="text"
              //   className="otp-input"
              //   value={digit}
              //   onChange={(e) => handleChange(e, index)}
              //   maxLength="1"
              //   disabled={isSubmitting}
              // />
            ))}
          </div>

          <p className="text-muted mt-2">
            Code expires in {formatTime(timeLeft)}
          </p>
          {try_another_way && (
            <p
              onClick={toggle}
              style={{
                marginBottom: "1rem",
              }}
            >
              {" "}
              Try another way{" "}
            </p>
          )}

          <Collapse isOpen={isOpen} horizontal>
            <Alert
              style={{
                width: "350px",
              }}
            >
              {available_channels?.map((opt, index) => (
                <FormGroup key={index}>
                  <Input
                    type="radio"
                    name={opt?.verify_through}
                    value={opt?.verify_through}
                    onChange={handleChannelChange}
                    defaultChecked={
                      opt?.verify_through === "email" &&
                      message === "Enter the 6-digit code from your Email"
                        ? true
                        : opt?.verify_through === "google_authenticator" &&
                          message ===
                            "Enter the 6-digit code from your Google Authenticato"
                        ? true
                        : false
                    }
                  />
                  &nbsp; &nbsp;{" "}
                  {opt?.verify_through === "google_authenticator"
                    ? "Google Authenticator"
                    : opt?.verify_through === "email"
                    ? "Email Authenticator"
                    : null}
                </FormGroup>
              ))}
            </Alert>
          </Collapse>

          <Button
            outline
            color="primary"
            className="mt-3"
            onClick={() => {
              dispatch(logoutUser());
              router.push("/login");
            }}
          >
            Back to Login
          </Button>
        </Card>
      )}
    </Container>
  );
};

export default OTPVerification;
