"use client";
import { useEffect } from "react";
import { LocalServer } from "@/app/utils";
import ToastNotification from "@/app/utils/Toast";
import { useSearchParams, useRouter } from "next/navigation";

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
        router.push("/admin/signin");
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
        height: "67vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <h4>Loading.........</h4>
    </div>
  );
}
