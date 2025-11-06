"use client";
import { useEffect } from "react";
import { LocalServer } from "@/app/utils";
import ToastNotification from "@/app/utils/Toast";
import { useSearchParams, useRouter } from "next/navigation";
import { getErrorMessage } from "@/app/utils/helper";
import { Spinner } from "reactstrap";

const { ToastComponent } = ToastNotification;

export default function ConfirmationEmail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const confirmationuser = async () => {
    try {
      const payload = {
        confirm_token: token,
      };
      const response = await LocalServer.post(
        "/api/confirmation-user/",
        payload
      );
      if (response?.data?.success) {
        ToastComponent("success", response?.data?.message);
        router.push("/login");
      }
    } catch (error) {
      ToastComponent("error", getErrorMessage(error));
    }
  };

  useEffect(() => {
    if (token) {
      confirmationuser();
    }
  }, [token]);

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Spinner color="primary" />
    </div>
  );
}
